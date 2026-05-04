/**
 * DB-backed rate limiter.
 *
 * - Window is fixed (UTC, rounded down) to keep coordination simple.
 * - One row per (key, window_start) — UPSERT increments atomically.
 * - Caller passes a deterministic `key` (e.g. `user:abc:create_listing`) and
 *   the budget (`limit` requests per `windowSec` seconds).
 * - On limit exceeded throws an `Error` with `status = 429` so the server
 *   function layer can surface a sensible response.
 */
import { sql } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import { rateLimitBuckets } from '@/shared/lib/db/schema'

export type RateLimitOptions = {
  key: string
  limit: number
  windowSec: number
}

class RateLimitError extends Error {
  constructor(public retryAfterSec: number) {
    super('RATE_LIMIT')
    this.name = 'RateLimitError'
    ;(this as unknown as { status: number }).status = 429
  }
}

/** Round a Date down to the start of the active window. */
function windowStart(now: Date, windowSec: number): Date {
  const ms = windowSec * 1000
  return new Date(Math.floor(now.getTime() / ms) * ms)
}

export async function consumeRateLimit({ key, limit, windowSec }: RateLimitOptions) {
  const db = await loadDb()
  const now = new Date()
  const start = windowStart(now, windowSec)

  // UPSERT then read back the current count atomically.
  const rows = await db
    .insert(rateLimitBuckets)
    .values({ bucketKey: key, windowStart: start, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimitBuckets.bucketKey, rateLimitBuckets.windowStart],
      set: { count: sql`${rateLimitBuckets.count} + 1` },
    })
    .returning({ count: rateLimitBuckets.count })

  const count = rows[0]?.count ?? 1
  if (count > limit) {
    const retryAfter = Math.max(1, windowSec - Math.floor((now.getTime() - start.getTime()) / 1000))
    throw new RateLimitError(retryAfter)
  }
}

/**
 * Best-effort cleanup of expired buckets — call periodically or on quiet
 * server functions. Keeps the table small. Safe to ignore failures.
 */
export async function cleanupExpiredBuckets(olderThanSec = 24 * 60 * 60) {
  try {
    const db = await loadDb()
    await db.execute(
      sql`DELETE FROM rate_limit_buckets WHERE window_start < now() - (${olderThanSec} || ' seconds')::interval`,
    )
  } catch {
    // swallow — never block real requests on housekeeping
  }
}

export { RateLimitError }
