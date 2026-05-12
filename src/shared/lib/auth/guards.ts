/**
 * Server-side auth guards used by every mutating server function.
 *
 * Identity is owned by Better Auth; marketplace-domain extras live in
 * `user_profiles` keyed by the same userId from the `users` table.
 *
 * SECURITY: every authz decision happens here — never trust the client. All
 * server functions that mutate domain data MUST go through one of these
 * helpers before touching the DB.
 */
import { getRequestHeaders } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import { listings, userProfiles } from '@/shared/lib/db/schema'

export type SessionUser = {
  userId: string
  role: 'user' | 'admin'
}

class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Resolve the current Better Auth user id or throw 401.
 * Loads the matching `user_profiles` row, creating one on first sight, and
 * blocks banned accounts with a 403.
 */
export async function requireUser(): Promise<SessionUser> {
  const { auth } = await import('./better-auth')
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  if (!session?.user?.id) throw new AuthError('UNAUTHENTICATED', 401)
  const userId = session.user.id
  const db = await loadDb()

  const existing = await db
    .select({
      userId: userProfiles.userId,
      role: userProfiles.role,
      bannedAt: userProfiles.bannedAt,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1)

  if (existing.length === 0) {
    // Lazy-create profile on first authenticated touch.
    await db
      .insert(userProfiles)
      .values({ userId, role: 'user' })
      .onConflictDoNothing({ target: userProfiles.userId })
    return { userId, role: 'user' }
  }

  const row = existing[0]
  if (row.bannedAt) throw new AuthError('BANNED', 403)
  return { userId, role: (row.role === 'admin' ? 'admin' : 'user') }
}

/** Require admin role. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== 'admin') throw new AuthError('FORBIDDEN', 403)
  return user
}

/**
 * Require the caller owns the listing, or is an admin.
 * Returns the (light) listing row alongside the resolved user.
 */
export async function requireListingOwner(listingId: string) {
  const user = await requireUser()
  const db = await loadDb()
  const rows = await db
    .select({
      id: listings.id,
      ownerId: listings.ownerId,
      status: listings.status,
      sourceKind: listings.sourceKind,
      moderationStatus: listings.moderationStatus,
    })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1)

  if (rows.length === 0) throw new AuthError('NOT_FOUND', 404)
  const row = rows[0]
  if (row.ownerId !== user.userId && user.role !== 'admin') {
    throw new AuthError('FORBIDDEN', 403)
  }
  return { user, listing: row }
}

/** Optional auth — returns the session user or null. */
export async function getOptionalUser(): Promise<SessionUser | null> {
  try {
    return await requireUser()
  } catch {
    return null
  }
}
