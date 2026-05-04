/**
 * User profile management.
 *
 * - getMyProfileFn:    self.
 * - updateMyProfileFn: self.
 * - getPublicProfileByHandleFn: public, scoped to safe fields.
 * - listPublicListingsByHandleFn: public — only published, public-visibility,
 *   non-moderated listings owned by that handle.
 */
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import { listings, userProfiles } from '@/shared/lib/db/schema'
import { requireUser } from '@/shared/lib/auth/guards'

const HANDLE_RX = /^[a-z0-9](?:[a-z0-9_-]{1,38}[a-z0-9])?$/

export const getMyProfileFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({}).optional().default({}))
  .handler(async () => {
    const user = await requireUser()
    const db = await loadDb()
    const [row] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.userId))
      .limit(1)
    return row ?? null
  })

export const updateMyProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      handle: z
        .string()
        .toLowerCase()
        .regex(HANDLE_RX, 'Handle must be 2–40 chars, lowercase letters, digits, -, _')
        .optional(),
      displayName: z.string().max(120).optional(),
      bio: z.string().max(2000).optional(),
      avatarUrl: z.string().url().optional().nullable(),
      email: z.string().email().optional(),
      phone: z.string().max(40).optional(),
      preferredLocale: z.string().min(2).max(5).optional(),
      notificationsEmail: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser()
    const db = await loadDb()
    const set = {
      ...data,
      updatedAt: new Date(),
    } as Record<string, unknown>
    for (const k of Object.keys(set)) if (set[k] === undefined) delete set[k]

    await db
      .insert(userProfiles)
      .values({ userId: user.userId, ...set })
      .onConflictDoUpdate({ target: userProfiles.userId, set })
    return { ok: true }
  })

export const getPublicProfileByHandleFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ handle: z.string().toLowerCase().regex(HANDLE_RX) }))
  .handler(async ({ data }) => {
    const db = await loadDb()
    const [row] = await db
      .select({
        userId: userProfiles.userId,
        handle: userProfiles.handle,
        displayName: userProfiles.displayName,
        bio: userProfiles.bio,
        avatarUrl: userProfiles.avatarUrl,
        bannedAt: userProfiles.bannedAt,
      })
      .from(userProfiles)
      .where(eq(userProfiles.handle, data.handle))
      .limit(1)
    if (!row || row.bannedAt) return null
    // Strip banned signal before returning to client.
    const { bannedAt: _b, ...safe } = row
    return safe
  })

export const listPublicListingsByHandleFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ handle: z.string().toLowerCase().regex(HANDLE_RX) }))
  .handler(async ({ data }) => {
    const db = await loadDb()
    const [profile] = await db
      .select({ userId: userProfiles.userId, bannedAt: userProfiles.bannedAt })
      .from(userProfiles)
      .where(eq(userProfiles.handle, data.handle))
      .limit(1)
    if (!profile || profile.bannedAt) return []
    return db
      .select({
        id: listings.id,
        slug: listings.slug,
        category: listings.category,
        subCategory: listings.subCategory,
        transactionType: listings.transactionType,
        price: listings.price,
        currency: listings.currency,
        city: listings.city,
        country: listings.country,
        publishedAt: listings.publishedAt,
      })
      .from(listings)
      .where(
        and(
          eq(listings.ownerId, profile.userId),
          eq(listings.status, 'published'),
          eq(listings.visibility, 'public'),
          eq(listings.moderationStatus, 'ok'),
        ),
      )
      .orderBy(desc(listings.publishedAt))
      .limit(50)
  })
