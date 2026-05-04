/**
 * Listing reports & admin moderation.
 *
 * - reportListingFn:    any signed-in user can flag a listing.
 * - listReportsFn:      admin only.
 * - moderateListingFn:  admin sets moderation_status / status / note.
 * - banUserFn:          admin sets `banned_at` on a user_profile.
 */
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import { listings, listingReports, userProfiles } from '@/shared/lib/db/schema'
import { requireAdmin, requireUser } from '@/shared/lib/auth/guards'
import { consumeRateLimit } from '@/shared/lib/auth/rate-limit'
import { sendListingFlaggedEmail } from '@/shared/lib/notifications/mailer'

const REASONS = ['spam', 'fraud', 'illegal', 'duplicate', 'wrong_category', 'inappropriate', 'other'] as const

export const reportListingFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      listingId: z.string().uuid(),
      reason: z.enum(REASONS),
      details: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser()
    await consumeRateLimit({
      key: `user:${user.userId}:report`,
      limit: 10,
      windowSec: 24 * 60 * 60,
    })
    const db = await loadDb()
    await db.insert(listingReports).values({
      listingId: data.listingId,
      reporterId: user.userId,
      reason: data.reason,
      details: data.details ?? null,
    })
    // Auto-flag once reports cross a low threshold; keeps the queue manageable.
    const [{ count } = { count: 0 }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listingReports)
      .where(and(eq(listingReports.listingId, data.listingId), isNull(listingReports.resolvedAt)))
    if (count >= 3) {
      await db
        .update(listings)
        .set({ moderationStatus: 'flagged', updatedAt: new Date() })
        .where(eq(listings.id, data.listingId))
    }
    return { ok: true }
  })

export const listReportsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ resolved: z.boolean().optional().default(false) }).optional())
  .handler(async ({ data }) => {
    await requireAdmin()
    const db = await loadDb()
    const rows = await db
      .select({
        id: listingReports.id,
        listingId: listingReports.listingId,
        reporterId: listingReports.reporterId,
        reason: listingReports.reason,
        details: listingReports.details,
        resolvedAt: listingReports.resolvedAt,
        createdAt: listingReports.createdAt,
        listingSlug: listings.slug,
        listingStatus: listings.status,
        listingModerationStatus: listings.moderationStatus,
        listingOwnerId: listings.ownerId,
      })
      .from(listingReports)
      .leftJoin(listings, eq(listingReports.listingId, listings.id))
      .where(data?.resolved ? sql`true` : isNull(listingReports.resolvedAt))
      .orderBy(desc(listingReports.createdAt))
      .limit(200)
    return rows
  })

export const moderateListingFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      moderationStatus: z.enum(['ok', 'flagged', 'hidden', 'banned']),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      note: z.string().max(2000).optional(),
      resolveReports: z.boolean().optional().default(true),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    const db = await loadDb()
    const [target] = await db
      .select({ ownerId: listings.ownerId })
      .from(listings)
      .where(eq(listings.id, data.id))
      .limit(1)
    if (!target) throw Object.assign(new Error('NOT_FOUND'), { status: 404 })

    await db.transaction(async (tx) => {
      const update: Record<string, unknown> = {
        moderationStatus: data.moderationStatus,
        moderationNote: data.note ?? null,
        updatedAt: new Date(),
      }
      if (data.status) update.status = data.status
      if (data.moderationStatus === 'hidden' || data.moderationStatus === 'banned') {
        update.status = 'archived'
        update.visibility = 'private'
      }
      await tx.update(listings).set(update).where(eq(listings.id, data.id))
      if (data.resolveReports) {
        await tx
          .update(listingReports)
          .set({ resolvedAt: new Date(), resolvedBy: admin.userId })
          .where(and(eq(listingReports.listingId, data.id), isNull(listingReports.resolvedAt)))
      }
    })

    if (target.ownerId && data.moderationStatus !== 'ok') {
      void sendListingFlaggedEmail({
        recipientUserId: target.ownerId,
        listingId: data.id,
        reason: data.note ?? data.moderationStatus,
      })
    }
    return { ok: true }
  })

export const banUserFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ userId: z.string(), reason: z.string().max(500), banned: z.boolean() }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const db = await loadDb()
    await db
      .insert(userProfiles)
      .values({
        userId: data.userId,
        bannedAt: data.banned ? new Date() : null,
        bannedReason: data.banned ? data.reason : null,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          bannedAt: data.banned ? new Date() : null,
          bannedReason: data.banned ? data.reason : null,
          updatedAt: new Date(),
        },
      })
    if (data.banned) {
      // Hide their published listings so the catalog stays clean.
      await db
        .update(listings)
        .set({ moderationStatus: 'banned', status: 'archived', visibility: 'private', updatedAt: new Date() })
        .where(eq(listings.ownerId, data.userId))
    }
    return { ok: true }
  })
