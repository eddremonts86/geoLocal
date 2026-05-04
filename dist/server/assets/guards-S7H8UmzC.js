import { t as loadDb } from "./load-gagVjFt5.js";
import { u as listings, x as userProfiles } from "./schema-Bm7YGE-a.js";
import { t as auth } from "./auth-Cb6FgvC0.js";
import { eq } from "drizzle-orm";
//#region src/shared/lib/auth/guards.ts
/**
* Server-side auth guards used by every mutating server function.
*
* Identity is owned by Clerk (`auth().userId`); marketplace-domain extras live
* in `user_profiles` keyed by the same Clerk userId.
*
* SECURITY: every authz decision happens here — never trust the client. All
* server functions that mutate domain data MUST go through one of these
* helpers before touching the DB.
*/
var AuthError = class extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;
		this.name = "AuthError";
	}
};
/**
* Resolve the current Clerk user id or throw 401.
* Loads the matching `user_profiles` row, creating one on first sight, and
* blocks banned accounts with a 403.
*/
async function requireUser() {
	const { userId } = await auth();
	if (!userId) throw new AuthError("UNAUTHENTICATED", 401);
	const db = await loadDb();
	const existing = await db.select({
		userId: userProfiles.userId,
		role: userProfiles.role,
		bannedAt: userProfiles.bannedAt
	}).from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
	if (existing.length === 0) {
		await db.insert(userProfiles).values({
			userId,
			role: "user"
		}).onConflictDoNothing({ target: userProfiles.userId });
		return {
			userId,
			role: "user"
		};
	}
	const row = existing[0];
	if (row.bannedAt) throw new AuthError("BANNED", 403);
	return {
		userId,
		role: row.role === "admin" ? "admin" : "user"
	};
}
/** Require admin role. */
async function requireAdmin() {
	const user = await requireUser();
	if (user.role !== "admin") throw new AuthError("FORBIDDEN", 403);
	return user;
}
/**
* Require the caller owns the listing, or is an admin.
* Returns the (light) listing row alongside the resolved user.
*/
async function requireListingOwner(listingId) {
	const user = await requireUser();
	const rows = await (await loadDb()).select({
		id: listings.id,
		ownerId: listings.ownerId,
		status: listings.status,
		sourceKind: listings.sourceKind,
		moderationStatus: listings.moderationStatus
	}).from(listings).where(eq(listings.id, listingId)).limit(1);
	if (rows.length === 0) throw new AuthError("NOT_FOUND", 404);
	const row = rows[0];
	if (row.ownerId !== user.userId && user.role !== "admin") throw new AuthError("FORBIDDEN", 403);
	return {
		user,
		listing: row
	};
}
//#endregion
export { requireListingOwner as n, requireUser as r, requireAdmin as t };
