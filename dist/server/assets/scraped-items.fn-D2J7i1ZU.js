import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as loadDb } from "./load-gagVjFt5.js";
import { a as listingProperties, c as listingTranslations, h as scrapedRaw, l as listingVehicles, n as listingAssets, r as listingExperiences, s as listingServices, u as listings } from "./schema-Bm7YGE-a.js";
import { z } from "zod";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
//#region src/modules/admin/api/scraped-items.fn.ts?tss-serverfn-split
var SCRAPED_SOURCES = [
	"airbnb",
	"facebook",
	"facebook-events",
	"linkedin",
	"edc",
	"homestra",
	"boligsiden",
	"boliga"
];
var listScrapedSchema = z.object({
	source: z.enum(SCRAPED_SOURCES).optional(),
	status: z.enum([
		"pending",
		"reviewed",
		"published",
		"rejected"
	]).optional(),
	page: z.number().default(1),
	pageSize: z.number().default(20)
});
var listScrapedRawFn_createServerFn_handler = createServerRpc({
	id: "3ef48072c2fa482e78b6294900999484ce1a25e39876e200b6bce700e475d59e",
	name: "listScrapedRawFn",
	filename: "src/modules/admin/api/scraped-items.fn.ts"
}, (opts) => listScrapedRawFn.__executeServer(opts));
var listScrapedRawFn = createServerFn({ method: "GET" }).inputValidator(listScrapedSchema).handler(listScrapedRawFn_createServerFn_handler, async ({ data }) => {
	const db = await loadDb();
	const conditions = [];
	if (data.source) conditions.push(eq(scrapedRaw.source, data.source));
	if (data.status) conditions.push(eq(scrapedRaw.status, data.status));
	const where = conditions.length > 0 ? and(...conditions) : void 0;
	const [totalResult] = await db.select({ count: count() }).from(scrapedRaw).where(where);
	const total = totalResult?.count ?? 0;
	const offset = (data.page - 1) * data.pageSize;
	return {
		items: (await db.select({
			id: scrapedRaw.id,
			source: scrapedRaw.source,
			sourceId: scrapedRaw.sourceId,
			sourceUrl: scrapedRaw.sourceUrl,
			mappedCategory: scrapedRaw.mappedCategory,
			status: scrapedRaw.status,
			publishedListingId: scrapedRaw.publishedListingId,
			scrapedAt: scrapedRaw.scrapedAt,
			title: sql`${scrapedRaw.rawData}->>'title'`,
			imageUrl: sql`COALESCE(${scrapedRaw.rawData}->>'imageUrl', (${scrapedRaw.rawData}->'imageUrls'->>0))`,
			city: sql`${scrapedRaw.rawData}->>'city'`,
			price: sql`${scrapedRaw.rawData}->>'price'`,
			description: sql`${scrapedRaw.rawData}->>'description'`,
			startDate: sql`${scrapedRaw.rawData}->>'startDate'`,
			currency: sql`${scrapedRaw.rawData}->>'currency'`
		}).from(scrapedRaw).where(where).orderBy(desc(scrapedRaw.scrapedAt)).limit(data.pageSize).offset(offset)).map((r) => ({
			...r,
			price: r.price != null ? Number(r.price) : null
		})),
		total,
		page: data.page,
		pageSize: data.pageSize
	};
});
var getScrapedRawItemFn_createServerFn_handler = createServerRpc({
	id: "19f137377c5ec98e208077e930b6e9cdc088e3c0b5925ada33bab06774974351",
	name: "getScrapedRawItemFn",
	filename: "src/modules/admin/api/scraped-items.fn.ts"
}, (opts) => getScrapedRawItemFn.__executeServer(opts));
var getScrapedRawItemFn = createServerFn({ method: "GET" }).inputValidator(z.object({ id: z.string().uuid() })).handler(getScrapedRawItemFn_createServerFn_handler, async ({ data }) => {
	const db = await loadDb();
	const [item] = await db.select({
		id: scrapedRaw.id,
		source: scrapedRaw.source,
		sourceId: scrapedRaw.sourceId,
		sourceUrl: scrapedRaw.sourceUrl,
		mappedCategory: scrapedRaw.mappedCategory,
		status: scrapedRaw.status,
		publishedListingId: scrapedRaw.publishedListingId,
		scrapedAt: scrapedRaw.scrapedAt
	}).from(scrapedRaw).where(eq(scrapedRaw.id, data.id)).limit(1);
	if (!item) throw new Error("Not found");
	const [raw] = await db.select({ rawData: scrapedRaw.rawData }).from(scrapedRaw).where(eq(scrapedRaw.id, data.id)).limit(1);
	return {
		...item,
		rawData: JSON.stringify(raw?.rawData ?? {}, null, 2)
	};
});
var rejectScrapedItemFn_createServerFn_handler = createServerRpc({
	id: "fb5a593522eabc562557fd6647e67b62b488c9c88b8908376644e0a802ea4469",
	name: "rejectScrapedItemFn",
	filename: "src/modules/admin/api/scraped-items.fn.ts"
}, (opts) => rejectScrapedItemFn.__executeServer(opts));
var rejectScrapedItemFn = createServerFn({ method: "POST" }).inputValidator(z.object({ id: z.string().uuid() })).handler(rejectScrapedItemFn_createServerFn_handler, async ({ data }) => {
	await (await loadDb()).update(scrapedRaw).set({ status: "rejected" }).where(eq(scrapedRaw.id, data.id));
	return { ok: true };
});
/** Max images we attach per listing — DB-friendly cap. */
var MAX_IMAGES_PER_LISTING = 12;
/** Read first defined value of several possible keys from a loose record. */
function pick(obj, ...keys) {
	if (!obj) return null;
	for (const k of keys) {
		const v = obj[k];
		if (v !== void 0 && v !== null) return v;
	}
	return null;
}
async function publishOne(db, rawId) {
	const [raw] = await db.select().from(scrapedRaw).where(eq(scrapedRaw.id, rawId)).limit(1);
	if (!raw) throw new Error(`Scraped item not found: ${rawId}`);
	if (raw.status === "published") return { listingId: raw.publishedListingId };
	const rd = raw.rawData;
	const nd = raw.normalised ?? null;
	const title = pick(nd, "title") ?? pick(rd, "title") ?? "Imported listing";
	const description = pick(nd, "description") ?? pick(rd, "description") ?? null;
	const price = (typeof nd?.price === "number" ? nd.price : null) ?? (typeof rd.price === "number" ? rd.price : 0);
	const currency = pick(nd, "currency") ?? pick(rd, "currency") ?? "DKK";
	const city = pick(nd, "city") ?? pick(rd, "city") ?? "Copenhagen";
	const lat = (typeof nd?.latitude === "number" ? nd.latitude : null) ?? (typeof rd.latitude === "number" ? rd.latitude : 55.6761);
	const lng = (typeof nd?.longitude === "number" ? nd.longitude : null) ?? (typeof rd.longitude === "number" ? rd.longitude : 12.5683);
	const category = pick(nd, "mappedCategory") ?? raw.mappedCategory ?? "service";
	const collectImages = (src) => {
		if (!src) return [];
		if (Array.isArray(src.imageUrls)) return src.imageUrls.filter((u) => typeof u === "string");
		if (typeof src.imageUrl === "string") return [src.imageUrl];
		return [];
	};
	const imageUrls = Array.from(new Set([...collectImages(nd), ...collectImages(rd)])).slice(0, MAX_IMAGES_PER_LISTING);
	const durationHours = (typeof nd?.durationHours === "number" ? nd.durationHours : null) ?? (typeof rd.durationHours === "number" ? rd.durationHours : null);
	const maxGuests = (typeof nd?.maxGuests === "number" ? nd.maxGuests : null) ?? (typeof rd.maxGuests === "number" ? rd.maxGuests : null);
	const subCategory = category === "experience" ? "guided_tour" : category === "property" ? "apartment" : category === "vehicle" ? "car" : "home_repair";
	const transactionType = category === "property" ? "rent" : category === "vehicle" ? "buy" : "hire";
	const listingId = randomUUID();
	const slug = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").slice(0, 60) + `-${listingId.slice(0, 8)}`;
	await db.insert(listings).values({
		id: listingId,
		slug,
		category,
		subCategory,
		transactionType,
		status: "published",
		publishedAt: /* @__PURE__ */ new Date(),
		price,
		currency,
		pricePeriod: category === "experience" ? "one_time" : void 0,
		latitude: lat,
		longitude: lng,
		addressLine1: city,
		city,
		country: "DK",
		featured: false,
		scrapedSource: raw.source,
		scrapedSourceUrl: raw.sourceUrl
	});
	await db.insert(listingTranslations).values({
		listingId,
		locale: "en",
		title,
		summary: description?.slice(0, 500) ?? null,
		description: description ?? null,
		neighborhood: null
	});
	if (imageUrls.length > 0) await db.insert(listingAssets).values(imageUrls.map((url, i) => ({
		id: randomUUID(),
		listingId,
		kind: "image",
		url,
		altText: title,
		sortOrder: i,
		isCover: i === 0
	})));
	if (category === "experience") await db.insert(listingExperiences).values({
		listingId,
		durationHours,
		maxGuests,
		minAge: null,
		languages: null,
		meetingPoint: null,
		included: null,
		notIncluded: null,
		difficulty: null,
		seasonalAvailability: null
	});
	else if (category === "service") await db.insert(listingServices).values({
		listingId,
		serviceRadiusKm: null,
		availability: null,
		experienceYears: null,
		certifications: null,
		responseTime: null
	});
	else if (category === "property") await db.insert(listingProperties).values({
		listingId,
		bedrooms: typeof nd?.bedrooms === "number" ? nd.bedrooms : null,
		bathrooms: typeof nd?.bathrooms === "number" ? nd.bathrooms : null,
		areaSqm: typeof nd?.areaSqm === "number" ? nd.areaSqm : null,
		lotSqm: null,
		yearBuilt: typeof nd?.yearBuilt === "number" ? nd.yearBuilt : null,
		parkingSpaces: null,
		floors: null,
		furnished: null
	});
	else if (category === "vehicle") {
		const make = pick(nd, "make") ?? "Unknown";
		const model = pick(nd, "model") ?? "Unknown";
		const year = typeof nd?.year === "number" ? nd.year : (/* @__PURE__ */ new Date()).getFullYear();
		await db.insert(listingVehicles).values({
			listingId,
			make,
			model,
			year,
			mileageKm: typeof nd?.mileageKm === "number" ? nd.mileageKm : null,
			fuelType: null,
			transmission: null,
			color: null,
			engineDisplacementCc: null,
			doors: null
		});
	}
	await db.update(scrapedRaw).set({
		status: "published",
		publishedListingId: listingId
	}).where(eq(scrapedRaw.id, rawId));
	return { listingId };
}
var publishSchema = z.object({ id: z.string().uuid() });
var publishScrapedItemFn_createServerFn_handler = createServerRpc({
	id: "47f12cfb5a0fb631acc96673abe852a20e87ebd9d4169b2c83d26832b1a0f55e",
	name: "publishScrapedItemFn",
	filename: "src/modules/admin/api/scraped-items.fn.ts"
}, (opts) => publishScrapedItemFn.__executeServer(opts));
var publishScrapedItemFn = createServerFn({ method: "POST" }).inputValidator(publishSchema).handler(publishScrapedItemFn_createServerFn_handler, async ({ data }) => {
	return {
		ok: true,
		...await publishOne(await loadDb(), data.id)
	};
});
var publishAllSchema = z.object({ source: z.enum(SCRAPED_SOURCES).optional() });
var publishAllPendingFn_createServerFn_handler = createServerRpc({
	id: "32b57744edbbf1c316c75c55e2d985820e52fbe55e588d5bd7b576addf7cc648",
	name: "publishAllPendingFn",
	filename: "src/modules/admin/api/scraped-items.fn.ts"
}, (opts) => publishAllPendingFn.__executeServer(opts));
var publishAllPendingFn = createServerFn({ method: "POST" }).inputValidator(publishAllSchema).handler(publishAllPendingFn_createServerFn_handler, async ({ data }) => {
	const db = await loadDb();
	const conditions = [inArray(scrapedRaw.status, ["pending", "reviewed"])];
	if (data.source) conditions.push(eq(scrapedRaw.source, data.source));
	const rows = await db.select({ id: scrapedRaw.id }).from(scrapedRaw).where(and(...conditions));
	let published = 0;
	const errors = [];
	for (const row of rows) try {
		await publishOne(db, row.id);
		published++;
	} catch (err) {
		errors.push(err instanceof Error ? err.message : String(err));
	}
	return {
		ok: true,
		published,
		skipped: errors.length,
		errors
	};
});
//#endregion
export { getScrapedRawItemFn_createServerFn_handler, listScrapedRawFn_createServerFn_handler, publishAllPendingFn_createServerFn_handler, publishScrapedItemFn_createServerFn_handler, rejectScrapedItemFn_createServerFn_handler };
