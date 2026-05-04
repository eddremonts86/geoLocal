import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as loadDb } from "./load-gagVjFt5.js";
import { u as listings, x as userProfiles } from "./schema-Bm7YGE-a.js";
import { r as requireUser } from "./guards-S7H8UmzC.js";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
//#region src/modules/profile/api/profile.fn.ts?tss-serverfn-split
/**
* User profile management.
*
* - getMyProfileFn:    self.
* - updateMyProfileFn: self.
* - getPublicProfileByHandleFn: public, scoped to safe fields.
* - listPublicListingsByHandleFn: public — only published, public-visibility,
*   non-moderated listings owned by that handle.
*/
var HANDLE_RX = /^[a-z0-9](?:[a-z0-9_-]{1,38}[a-z0-9])?$/;
var getMyProfileFn_createServerFn_handler = createServerRpc({
	id: "e2d508f23b958c5ff9db6a1affbc0d4f2ee1106c4baeeb1cc74899c8d1e13d77",
	name: "getMyProfileFn",
	filename: "src/modules/profile/api/profile.fn.ts"
}, (opts) => getMyProfileFn.__executeServer(opts));
var getMyProfileFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional().default({})).handler(getMyProfileFn_createServerFn_handler, async () => {
	const user = await requireUser();
	const [row] = await (await loadDb()).select().from(userProfiles).where(eq(userProfiles.userId, user.userId)).limit(1);
	return row ?? null;
});
var updateMyProfileFn_createServerFn_handler = createServerRpc({
	id: "ef9ef93b7278ae72c3a7d88359416aa4c1b4a0b2ac342ec0a8ffb5c8aa54fcef",
	name: "updateMyProfileFn",
	filename: "src/modules/profile/api/profile.fn.ts"
}, (opts) => updateMyProfileFn.__executeServer(opts));
var updateMyProfileFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	handle: z.string().toLowerCase().regex(HANDLE_RX, "Handle must be 2–40 chars, lowercase letters, digits, -, _").optional(),
	displayName: z.string().max(120).optional(),
	bio: z.string().max(2e3).optional(),
	avatarUrl: z.string().url().optional().nullable(),
	email: z.string().email().optional(),
	phone: z.string().max(40).optional(),
	preferredLocale: z.string().min(2).max(5).optional(),
	notificationsEmail: z.boolean().optional()
})).handler(updateMyProfileFn_createServerFn_handler, async ({ data }) => {
	const user = await requireUser();
	const db = await loadDb();
	const set = {
		...data,
		updatedAt: /* @__PURE__ */ new Date()
	};
	for (const k of Object.keys(set)) if (set[k] === void 0) delete set[k];
	await db.insert(userProfiles).values({
		userId: user.userId,
		...set
	}).onConflictDoUpdate({
		target: userProfiles.userId,
		set
	});
	return { ok: true };
});
var getPublicProfileByHandleFn_createServerFn_handler = createServerRpc({
	id: "68bd5d7194ff1f9b31d1d7bd99ecee1bf067de42fea20fd3e643c914556a1e0a",
	name: "getPublicProfileByHandleFn",
	filename: "src/modules/profile/api/profile.fn.ts"
}, (opts) => getPublicProfileByHandleFn.__executeServer(opts));
var getPublicProfileByHandleFn = createServerFn({ method: "GET" }).inputValidator(z.object({ handle: z.string().toLowerCase().regex(HANDLE_RX) })).handler(getPublicProfileByHandleFn_createServerFn_handler, async ({ data }) => {
	const [row] = await (await loadDb()).select({
		userId: userProfiles.userId,
		handle: userProfiles.handle,
		displayName: userProfiles.displayName,
		bio: userProfiles.bio,
		avatarUrl: userProfiles.avatarUrl,
		bannedAt: userProfiles.bannedAt
	}).from(userProfiles).where(eq(userProfiles.handle, data.handle)).limit(1);
	if (!row || row.bannedAt) return null;
	const { bannedAt: _b, ...safe } = row;
	return safe;
});
var listPublicListingsByHandleFn_createServerFn_handler = createServerRpc({
	id: "54ba962c9e7cf83d600efbe2557a011d21ccd1b527b15aa1d4e9390b483ca29d",
	name: "listPublicListingsByHandleFn",
	filename: "src/modules/profile/api/profile.fn.ts"
}, (opts) => listPublicListingsByHandleFn.__executeServer(opts));
var listPublicListingsByHandleFn = createServerFn({ method: "GET" }).inputValidator(z.object({ handle: z.string().toLowerCase().regex(HANDLE_RX) })).handler(listPublicListingsByHandleFn_createServerFn_handler, async ({ data }) => {
	const db = await loadDb();
	const [profile] = await db.select({
		userId: userProfiles.userId,
		bannedAt: userProfiles.bannedAt
	}).from(userProfiles).where(eq(userProfiles.handle, data.handle)).limit(1);
	if (!profile || profile.bannedAt) return [];
	return db.select({
		id: listings.id,
		slug: listings.slug,
		category: listings.category,
		subCategory: listings.subCategory,
		transactionType: listings.transactionType,
		price: listings.price,
		currency: listings.currency,
		city: listings.city,
		country: listings.country,
		publishedAt: listings.publishedAt
	}).from(listings).where(and(eq(listings.ownerId, profile.userId), eq(listings.status, "published"), eq(listings.visibility, "public"), eq(listings.moderationStatus, "ok"))).orderBy(desc(listings.publishedAt)).limit(50);
});
//#endregion
export { getMyProfileFn_createServerFn_handler, getPublicProfileByHandleFn_createServerFn_handler, listPublicListingsByHandleFn_createServerFn_handler, updateMyProfileFn_createServerFn_handler };
