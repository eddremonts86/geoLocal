/**
 * Messaging server functions.
 *
 * Authz: only `thread_participants` can read/write a thread. Listing owners
 * are added automatically; inquirers join when they call `startThreadFn`.
 *
 * Side effects: each new message inserts an in-app `notifications.new` row
 * for every other participant and (best-effort) triggers an email for
 * recipients who opted in (`user_profiles.notifications_email = true`).
 */
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, asc, desc, eq, inArray, isNull, ne, sql } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import {
  listings,
  threads,
  threadParticipants,
  messages,
  notifications,
  userProfiles,
} from '@/shared/lib/db/schema'
import { requireUser } from '@/shared/lib/auth/guards'
import { consumeRateLimit } from '@/shared/lib/auth/rate-limit'
import { sendNewMessageEmail } from '@/shared/lib/notifications/mailer'

const MAX_BODY = 4000

const sanitizeBody = (raw: string): string =>
  raw
    .replace(/\s+/g, (s) => (s.includes('\n') ? '\n' : ' '))
    .trim()
    .slice(0, MAX_BODY)

async function ensureParticipant(threadId: string, userId: string) {
  const db = await loadDb()
  const rows = await db
    .select({ threadId: threadParticipants.threadId })
    .from(threadParticipants)
    .where(and(eq(threadParticipants.threadId, threadId), eq(threadParticipants.userId, userId)))
    .limit(1)
  if (rows.length === 0) {
    const err = new Error('FORBIDDEN') as Error & { status: number }
    err.status = 403
    throw err
  }
}

export const startThreadFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ listingId: z.string().uuid(), body: z.string().min(1).max(MAX_BODY) }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    await consumeRateLimit({
      key: `user:${user.userId}:start_thread`,
      limit: 20,
      windowSec: 60 * 60,
    })

    const db = await loadDb()
    const listingRows = await db
      .select({ id: listings.id, ownerId: listings.ownerId, status: listings.status, contactMethod: listings.contactMethod })
      .from(listings)
      .where(eq(listings.id, data.listingId))
      .limit(1)
    const listing = listingRows[0]
    if (!listing) throw Object.assign(new Error('NOT_FOUND'), { status: 404 })
    if (listing.status !== 'published') throw Object.assign(new Error('NOT_PUBLISHED'), { status: 400 })
    if (!listing.ownerId) throw Object.assign(new Error('NO_OWNER'), { status: 400 })
    if (listing.ownerId === user.userId) throw Object.assign(new Error('SELF_CONTACT'), { status: 400 })
    if (listing.contactMethod !== 'in_app') {
      throw Object.assign(new Error('CONTACT_METHOD_DISABLED'), { status: 400 })
    }

    const body = sanitizeBody(data.body)

    const result = await db.transaction(async (tx) => {
      const [thread] = await tx
        .insert(threads)
        .values({ listingId: listing.id })
        .returning({ id: threads.id })
      await tx.insert(threadParticipants).values([
        { threadId: thread.id, userId: listing.ownerId!, role: 'owner' },
        { threadId: thread.id, userId: user.userId, role: 'inquirer' },
      ])
      const [msg] = await tx
        .insert(messages)
        .values({ threadId: thread.id, senderId: user.userId, body })
        .returning({ id: messages.id })
      await tx
        .update(listings)
        .set({ contactCount: sql`${listings.contactCount} + 1` })
        .where(eq(listings.id, listing.id))
      await tx.insert(notifications).values({
        userId: listing.ownerId!,
        kind: 'message.new',
        payload: { threadId: thread.id, messageId: msg.id, listingId: listing.id, fromUserId: user.userId },
      })
      return { threadId: thread.id, messageId: msg.id, recipientId: listing.ownerId! }
    })

    // best-effort email notification
    void sendNewMessageEmail({ recipientUserId: result.recipientId, threadId: result.threadId, body })
    return { threadId: result.threadId }
  })

export const sendMessageFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ threadId: z.string().uuid(), body: z.string().min(1).max(MAX_BODY) }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    await consumeRateLimit({
      key: `user:${user.userId}:send_message`,
      limit: 60,
      windowSec: 5 * 60,
    })
    await ensureParticipant(data.threadId, user.userId)
    const db = await loadDb()
    const body = sanitizeBody(data.body)

    const recipients: { userId: string }[] = await db
      .select({ userId: threadParticipants.userId })
      .from(threadParticipants)
      .where(and(eq(threadParticipants.threadId, data.threadId), ne(threadParticipants.userId, user.userId)))

    const result = await db.transaction(async (tx) => {
      const [msg] = await tx
        .insert(messages)
        .values({ threadId: data.threadId, senderId: user.userId, body })
        .returning({ id: messages.id, createdAt: messages.createdAt })
      await tx
        .update(threads)
        .set({ lastMessageAt: msg.createdAt })
        .where(eq(threads.id, data.threadId))
      if (recipients.length) {
        await tx.insert(notifications).values(
          recipients.map((r) => ({
            userId: r.userId,
            kind: 'message.new' as const,
            payload: { threadId: data.threadId, messageId: msg.id, fromUserId: user.userId },
          })),
        )
      }
      return msg
    })

    for (const r of recipients) {
      void sendNewMessageEmail({ recipientUserId: r.userId, threadId: data.threadId, body })
    }
    return { id: result.id }
  })

export const listThreadsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({}).optional().default({}))
  .handler(async () => {
    const user = await requireUser()
    const db = await loadDb()
    const rows = await db
      .select({
        threadId: threads.id,
        listingId: threads.listingId,
        status: threads.status,
        lastMessageAt: threads.lastMessageAt,
        lastReadAt: threadParticipants.lastReadAt,
      })
      .from(threadParticipants)
      .innerJoin(threads, eq(threads.id, threadParticipants.threadId))
      .where(eq(threadParticipants.userId, user.userId))
      .orderBy(desc(threads.lastMessageAt))
      .limit(200)

    if (rows.length === 0) return []

    const threadIds = rows.map((r) => r.threadId)
    const lastMessages = await db
      .select({
        threadId: messages.threadId,
        senderId: messages.senderId,
        body: messages.body,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(inArray(messages.threadId, threadIds))
      .orderBy(desc(messages.createdAt))

    const lastByThread = new Map<string, (typeof lastMessages)[number]>()
    for (const m of lastMessages) if (!lastByThread.has(m.threadId)) lastByThread.set(m.threadId, m)

    return rows.map((r) => {
      const lastMsg = lastByThread.get(r.threadId)
      const unread = lastMsg ? (!r.lastReadAt || r.lastReadAt < lastMsg.createdAt) && lastMsg.senderId !== user.userId : false
      return {
        threadId: r.threadId,
        listingId: r.listingId,
        status: r.status,
        lastMessageAt: r.lastMessageAt,
        lastMessagePreview: lastMsg?.body.slice(0, 200) ?? null,
        lastSenderId: lastMsg?.senderId ?? null,
        unread,
      }
    })
  })

export const getThreadFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ threadId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    await ensureParticipant(data.threadId, user.userId)
    const db = await loadDb()

    const [thread] = await db.select().from(threads).where(eq(threads.id, data.threadId)).limit(1)
    if (!thread) throw Object.assign(new Error('NOT_FOUND'), { status: 404 })
    const msgs = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        body: messages.body,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(and(eq(messages.threadId, data.threadId), isNull(messages.deletedAt)))
      .orderBy(asc(messages.createdAt))
      .limit(500)
    return { thread, messages: msgs }
  })

export const markThreadReadFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ threadId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    await ensureParticipant(data.threadId, user.userId)
    const db = await loadDb()
    await db
      .update(threadParticipants)
      .set({ lastReadAt: new Date() })
      .where(and(eq(threadParticipants.threadId, data.threadId), eq(threadParticipants.userId, user.userId)))
    // Mark related notifications read.
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, user.userId), eq(notifications.kind, 'message.new'), isNull(notifications.readAt)))
    return { ok: true }
  })

export const listNotificationsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({}).optional())
  .handler(async () => {
    const user = await requireUser()
    const db = await loadDb()
    const rows = (await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        kind: notifications.kind,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(eq(notifications.userId, user.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50)) as Array<{
        id: string
        userId: string
        kind: string
        readAt: Date | null
        createdAt: Date
      }>
    return rows
  })

export const unreadNotificationsCountFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({}).optional())
  .handler(async () => {
    const user = await requireUser()
    const db = await loadDb()
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, user.userId), isNull(notifications.readAt)))
    return row?.count ?? 0
  })

// Used by the profile editor to opt in/out of email notifications
export const updateNotificationPrefsFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ notificationsEmail: z.boolean() }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    const db = await loadDb()
    await db
      .update(userProfiles)
      .set({ notificationsEmail: data.notificationsEmail, updatedAt: new Date() })
      .where(eq(userProfiles.userId, user.userId))
    return { ok: true }
  })
