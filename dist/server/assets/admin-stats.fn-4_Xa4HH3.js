import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as loadDb } from "./load-BOqb57Ji.js";
import { c as listings, o as listingTranslations } from "./schema-jrpEASXZ.js";
import { count, eq, inArray, sql } from "drizzle-orm";
//#region src/modules/admin/api/admin-stats.fn.ts?tss-serverfn-split
var getAdminStatsFn_createServerFn_handler = createServerRpc({
	id: "26b3366957b2a8598345b4c1cb62a8b116d3a6fe90b4577753278598166b9c79",
	name: "getAdminStatsFn",
	filename: "src/modules/admin/api/admin-stats.fn.ts"
}, (opts) => getAdminStatsFn.__executeServer(opts));
var getAdminStatsFn = createServerFn({ method: "GET" }).handler(getAdminStatsFn_createServerFn_handler, async () => {
	const db = await loadDb();
	const [total] = await db.select({ count: count() }).from(listings);
	const byCategory = await db.select({
		category: listings.category,
		count: count()
	}).from(listings).groupBy(listings.category);
	const byStatus = await db.select({
		status: listings.status,
		count: count()
	}).from(listings).groupBy(listings.status);
	const [featuredCount] = await db.select({ count: count() }).from(listings).where(eq(listings.featured, true));
	return {
		total: total?.count ?? 0,
		byCategory: Object.fromEntries(byCategory.map((r) => [r.category, r.count])),
		byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.count])),
		featured: featuredCount?.count ?? 0
	};
});
var getRecentListingsFn_createServerFn_handler = createServerRpc({
	id: "4d956afcd24172f7e26241eba02632a12c6143fe3e147deff9f8bc71c47e7f59",
	name: "getRecentListingsFn",
	filename: "src/modules/admin/api/admin-stats.fn.ts"
}, (opts) => getRecentListingsFn.__executeServer(opts));
var getRecentListingsFn = createServerFn({ method: "GET" }).handler(getRecentListingsFn_createServerFn_handler, async () => {
	const db = await loadDb();
	const rows = await db.select().from(listings).orderBy(sql`${listings.createdAt} desc`).limit(10);
	if (rows.length === 0) return [];
	const ids = rows.map((r) => r.id);
	const translations = await db.select().from(listingTranslations).where(inArray(listingTranslations.listingId, ids));
	const tMap = /* @__PURE__ */ new Map();
	for (const t of translations) if (!tMap.get(t.listingId) || t.locale === "en") tMap.set(t.listingId, t);
	return rows.map((r) => ({
		id: r.id,
		slug: r.slug,
		category: r.category,
		subCategory: r.subCategory,
		status: r.status,
		price: r.price,
		currency: r.currency,
		city: r.city,
		featured: r.featured,
		title: tMap.get(r.id)?.title ?? r.slug,
		createdAt: r.createdAt.toISOString()
	}));
});
//#endregion
export { getAdminStatsFn_createServerFn_handler, getRecentListingsFn_createServerFn_handler };
