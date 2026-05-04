import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as loadDb } from "./load-gagVjFt5.js";
import { o as listingReports, u as listings, x as userProfiles } from "./schema-Bm7YGE-a.js";
import { r as requireUser, t as requireAdmin } from "./guards-S7H8UmzC.js";
import { t as consumeRateLimit } from "./rate-limit-EW6IDPqE.js";
import { t as sendListingFlaggedEmail } from "./mailer-B0GfxoPd.js";
import { z } from "zod";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
//#region src/modules/admin/api/moderation.fn.ts?tss-serverfn-split
/**
* Listing reports & admin moderation.
*
* - reportListingFn:    any signed-in user can flag a listing.
* - listReportsFn:      admin only.
* - moderateListingFn:  admin sets moderation_status / status / note.
* - banUserFn:          admin sets `banned_at` on a user_profile.
*/
var REASONS = [
	"spam",
	"fraud",
	"illegal",
	"duplicate",
	"wrong_category",
	"inappropriate",
	"other"
];
var reportListingFn_createServerFn_handler = createServerRpc({
	id: "6d15ccacfe20e54c72ec939b1af0ff7e705eb5d5ed43203dec709ddb0cd6451e",
	name: "reportListingFn",
	filename: "src/modules/admin/api/moderation.fn.ts"
}, (opts) => reportListingFn.__executeServer(opts));
var reportListingFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	listingId: z.string().uuid(),
	reason: z.enum(REASONS),
	details: z.string().max(2e3).optional()
})).handler(reportListingFn_createServerFn_handler, async ({ data }) => {
	const user = await requireUser();
	await consumeRateLimit({
		key: `user:${user.userId}:report`,
		limit: 10,
		windowSec: 1440 * 60
	});
	const db = await loadDb();
	await db.insert(listingReports).values({
		listingId: data.listingId,
		reporterId: user.userId,
		reason: data.reason,
		details: data.details ?? null
	});
	const [{ count } = { count: 0 }] = await db.select({ count: sql`count(*)::int` }).from(listingReports).where(and(eq(listingReports.listingId, data.listingId), isNull(listingReports.resolvedAt)));
	if (count >= 3) await db.update(listings).set({
		moderationStatus: "flagged",
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(listings.id, data.listingId));
	return { ok: true };
});
var listReportsFn_createServerFn_handler = createServerRpc({
	id: "2046e133e02b8235307a36c4377e04e303d1aa24e901f7da3da9a776d3906258",
	name: "listReportsFn",
	filename: "src/modules/admin/api/moderation.fn.ts"
}, (opts) => listReportsFn.__executeServer(opts));
var listReportsFn = createServerFn({ method: "GET" }).inputValidator(z.object({ resolved: z.boolean().optional().default(false) }).optional()).handler(listReportsFn_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	return await (await loadDb()).select({
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
		listingOwnerId: listings.ownerId
	}).from(listingReports).leftJoin(listings, eq(listingReports.listingId, listings.id)).where(data?.resolved ? sql`true` : isNull(listingReports.resolvedAt)).orderBy(desc(listingReports.createdAt)).limit(200);
});
var moderateListingFn_createServerFn_handler = createServerRpc({
	id: "4e62eb2462e5b68618926a34bf0b0338946a043825745709d3a30d7080b32fac",
	name: "moderateListingFn",
	filename: "src/modules/admin/api/moderation.fn.ts"
}, (opts) => moderateListingFn.__executeServer(opts));
var moderateListingFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	id: z.string().uuid(),
	moderationStatus: z.enum([
		"ok",
		"flagged",
		"hidden",
		"banned"
	]),
	status: z.enum([
		"draft",
		"published",
		"archived"
	]).optional(),
	note: z.string().max(2e3).optional(),
	resolveReports: z.boolean().optional().default(true)
})).handler(moderateListingFn_createServerFn_handler, async ({ data }) => {
	const admin = await requireAdmin();
	const db = await loadDb();
	const [target] = await db.select({ ownerId: listings.ownerId }).from(listings).where(eq(listings.id, data.id)).limit(1);
	if (!target) throw Object.assign(/* @__PURE__ */ new Error("NOT_FOUND"), { status: 404 });
	await db.transaction(async (tx) => {
		const update = {
			moderationStatus: data.moderationStatus,
			moderationNote: data.note ?? null,
			updatedAt: /* @__PURE__ */ new Date()
		};
		if (data.status) update.status = data.status;
		if (data.moderationStatus === "hidden" || data.moderationStatus === "banned") {
			update.status = "archived";
			update.visibility = "private";
		}
		await tx.update(listings).set(update).where(eq(listings.id, data.id));
		if (data.resolveReports) await tx.update(listingReports).set({
			resolvedAt: /* @__PURE__ */ new Date(),
			resolvedBy: admin.userId
		}).where(and(eq(listingReports.listingId, data.id), isNull(listingReports.resolvedAt)));
	});
	if (target.ownerId && data.moderationStatus !== "ok") sendListingFlaggedEmail({
		recipientUserId: target.ownerId,
		listingId: data.id,
		reason: data.note ?? data.moderationStatus
	});
	return { ok: true };
});
var banUserFn_createServerFn_handler = createServerRpc({
	id: "dbc1a1a24366c65f19c3f34a0ba466389d04ab12db588e72744d56b4dcd43c0a",
	name: "banUserFn",
	filename: "src/modules/admin/api/moderation.fn.ts"
}, (opts) => banUserFn.__executeServer(opts));
var banUserFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	userId: z.string(),
	reason: z.string().max(500),
	banned: z.boolean()
})).handler(banUserFn_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const db = await loadDb();
	await db.insert(userProfiles).values({
		userId: data.userId,
		bannedAt: data.banned ? /* @__PURE__ */ new Date() : null,
		bannedReason: data.banned ? data.reason : null
	}).onConflictDoUpdate({
		target: userProfiles.userId,
		set: {
			bannedAt: data.banned ? /* @__PURE__ */ new Date() : null,
			bannedReason: data.banned ? data.reason : null,
			updatedAt: /* @__PURE__ */ new Date()
		}
	});
	if (data.banned) await db.update(listings).set({
		moderationStatus: "banned",
		status: "archived",
		visibility: "private",
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(listings.ownerId, data.userId));
	return { ok: true };
});
//#endregion
export { banUserFn_createServerFn_handler, listReportsFn_createServerFn_handler, moderateListingFn_createServerFn_handler, reportListingFn_createServerFn_handler };
