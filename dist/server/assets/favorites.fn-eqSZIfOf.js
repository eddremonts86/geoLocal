import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as loadDb } from "./load-gagVjFt5.js";
import { c as listingTranslations, n as listingAssets, t as favorites, u as listings } from "./schema-Bm7YGE-a.js";
import { t as auth } from "./auth-Cb6FgvC0.js";
import { z } from "zod";
import { and, desc, eq, inArray } from "drizzle-orm";
//#region src/modules/favorites/api/favorites.fn.ts?tss-serverfn-split
/**
* Resolve the current Clerk user id or throw. Use for mutations.
*/
async function requireUserId() {
	const { userId } = await auth();
	if (!userId) throw new Error("UNAUTHENTICATED");
	return userId;
}
/**
* Toggle favorite state for a listing. Returns the final state.
* - Inserts if not present
* - Deletes if present
*/
var toggleFavoriteFn_createServerFn_handler = createServerRpc({
	id: "4638e68be622bb050989744a0f35243cd8f557e24b171cb744ecb3fa0271c5ef",
	name: "toggleFavoriteFn",
	filename: "src/modules/favorites/api/favorites.fn.ts"
}, (opts) => toggleFavoriteFn.__executeServer(opts));
var toggleFavoriteFn = createServerFn({ method: "POST" }).inputValidator(z.object({ listingId: z.string().uuid() })).handler(toggleFavoriteFn_createServerFn_handler, async ({ data }) => {
	const userId = await requireUserId();
	const db = await loadDb();
	const existing = await db.select({ id: favorites.id }).from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.listingId, data.listingId))).limit(1);
	if (existing.length > 0) {
		await db.delete(favorites).where(eq(favorites.id, existing[0].id));
		return { favorited: false };
	}
	await db.insert(favorites).values({
		userId,
		listingId: data.listingId
	});
	return { favorited: true };
});
var getFavoriteIdsFn_createServerFn_handler = createServerRpc({
	id: "372abdd9c010c20ad528dc7810d53111b35e2b34ee0c1d0764eca0bdfadd1b74",
	name: "getFavoriteIdsFn",
	filename: "src/modules/favorites/api/favorites.fn.ts"
}, (opts) => getFavoriteIdsFn.__executeServer(opts));
var getFavoriteIdsFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional().default({})).handler(getFavoriteIdsFn_createServerFn_handler, async () => {
	const { userId } = await auth();
	if (!userId) return [];
	return (await (await loadDb()).select({ listingId: favorites.listingId }).from(favorites).where(eq(favorites.userId, userId))).map((r) => r.listingId);
});
var getFavoritesFn_createServerFn_handler = createServerRpc({
	id: "ed7f21ecfe78267a0207b0bff936c6223700eaf0a4d329d1d08fa12b823065db",
	name: "getFavoritesFn",
	filename: "src/modules/favorites/api/favorites.fn.ts"
}, (opts) => getFavoritesFn.__executeServer(opts));
var getFavoritesFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	limit: z.number().min(1).max(100).default(30),
	offset: z.number().min(0).default(0),
	locale: z.string().default("en")
})).handler(getFavoritesFn_createServerFn_handler, async ({ data }) => {
	const { userId } = await auth();
	if (!userId) return {
		items: [],
		total: 0
	};
	const db = await loadDb();
	const rows = await db.select({
		id: listings.id,
		slug: listings.slug,
		category: listings.category,
		subCategory: listings.subCategory,
		transactionType: listings.transactionType,
		price: listings.price,
		currency: listings.currency,
		pricePeriod: listings.pricePeriod,
		city: listings.city,
		latitude: listings.latitude,
		longitude: listings.longitude,
		addressLine1: listings.addressLine1,
		region: listings.region,
		country: listings.country,
		featured: listings.featured,
		status: listings.status,
		scrapedSource: listings.scrapedSource,
		scrapedSourceUrl: listings.scrapedSourceUrl,
		favoritedAt: favorites.createdAt
	}).from(favorites).innerJoin(listings, eq(listings.id, favorites.listingId)).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt)).limit(data.limit).offset(data.offset);
	if (rows.length === 0) return {
		items: [],
		total: 0
	};
	const ids = rows.map((r) => r.id);
	const [translations, covers, totalRow] = await Promise.all([
		db.select().from(listingTranslations).where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, data.locale))),
		db.select().from(listingAssets).where(and(inArray(listingAssets.listingId, ids), eq(listingAssets.isCover, true))),
		db.select({ id: favorites.id }).from(favorites).where(eq(favorites.userId, userId))
	]);
	const tMap = new Map(translations.map((t) => [t.listingId, t]));
	const coverMap = new Map(covers.map((c) => [c.listingId, c.url]));
	return {
		items: rows.map((r) => {
			const t = tMap.get(r.id);
			return {
				id: r.id,
				slug: r.slug,
				category: r.category,
				subCategory: r.subCategory,
				transactionType: r.transactionType,
				price: r.price,
				currency: r.currency,
				pricePeriod: r.pricePeriod,
				title: t?.title ?? r.slug,
				summary: t?.summary ?? null,
				coverUrl: coverMap.get(r.id) ?? null,
				city: r.city,
				region: r.region,
				country: r.country,
				latitude: r.latitude,
				longitude: r.longitude,
				addressLine1: r.addressLine1,
				featured: r.featured,
				status: r.status,
				scrapedSource: r.scrapedSource,
				scrapedSourceUrl: r.scrapedSourceUrl,
				favoritedAt: r.favoritedAt
			};
		}),
		total: totalRow.length
	};
});
var clearFavoritesFn_createServerFn_handler = createServerRpc({
	id: "2ecdbed99ab297fe7af48b5f492a7510ca6e12c8f2f0e0ef4ca1052c9724c489",
	name: "clearFavoritesFn",
	filename: "src/modules/favorites/api/favorites.fn.ts"
}, (opts) => clearFavoritesFn.__executeServer(opts));
var clearFavoritesFn = createServerFn({ method: "POST" }).inputValidator(z.object({}).optional().default({})).handler(clearFavoritesFn_createServerFn_handler, async () => {
	const userId = await requireUserId();
	return { cleared: (await (await loadDb()).delete(favorites).where(eq(favorites.userId, userId)).returning({ id: favorites.id })).length };
});
//#endregion
export { clearFavoritesFn_createServerFn_handler, getFavoriteIdsFn_createServerFn_handler, getFavoritesFn_createServerFn_handler, toggleFavoriteFn_createServerFn_handler };
