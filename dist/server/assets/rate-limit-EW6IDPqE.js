import { t as loadDb } from "./load-gagVjFt5.js";
import { m as rateLimitBuckets } from "./schema-Bm7YGE-a.js";
import { sql } from "drizzle-orm";
//#region src/shared/lib/auth/rate-limit.ts
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
var RateLimitError = class extends Error {
	constructor(retryAfterSec) {
		super("RATE_LIMIT");
		this.retryAfterSec = retryAfterSec;
		this.name = "RateLimitError";
		this.status = 429;
	}
};
/** Round a Date down to the start of the active window. */
function windowStart(now, windowSec) {
	const ms = windowSec * 1e3;
	return new Date(Math.floor(now.getTime() / ms) * ms);
}
async function consumeRateLimit({ key, limit, windowSec }) {
	const db = await loadDb();
	const now = /* @__PURE__ */ new Date();
	const start = windowStart(now, windowSec);
	if (((await db.insert(rateLimitBuckets).values({
		bucketKey: key,
		windowStart: start,
		count: 1
	}).onConflictDoUpdate({
		target: [rateLimitBuckets.bucketKey, rateLimitBuckets.windowStart],
		set: { count: sql`${rateLimitBuckets.count} + 1` }
	}).returning({ count: rateLimitBuckets.count }))[0]?.count ?? 1) > limit) throw new RateLimitError(Math.max(1, windowSec - Math.floor((now.getTime() - start.getTime()) / 1e3)));
}
//#endregion
export { consumeRateLimit as t };
