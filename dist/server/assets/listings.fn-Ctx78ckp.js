import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as loadDb } from "./load-BOqb57Ji.js";
import { a as listingServices, c as listings, i as listingProperties, n as listingExperiences, o as listingTranslations, r as listingFeatures, s as listingVehicles, t as listingAssets } from "./schema-jrpEASXZ.js";
import { a as polygonBboxCondition, i as pointInPolygon, r as haversineCondition, t as decodePolygon } from "./spatial-BwBIKsRR.js";
import { z } from "zod";
import { and, eq, gte, inArray, isNotNull, lte, sql } from "drizzle-orm";
//#region src/modules/listings/api/listings.fn.ts?tss-serverfn-split
var searchInputSchema = z.object({
	category: z.enum([
		"property",
		"vehicle",
		"service",
		"experience"
	]).optional(),
	subCategory: z.array(z.string()).optional(),
	transactionType: z.enum([
		"buy",
		"rent",
		"hire"
	]).optional(),
	query: z.string().optional(),
	priceMin: z.number().optional(),
	priceMax: z.number().optional(),
	sort: z.enum([
		"popular",
		"newest",
		"price_asc",
		"price_desc"
	]).optional().default("newest"),
	page: z.number().optional().default(1),
	pageSize: z.number().optional().default(20),
	locale: z.string().optional().default("en"),
	boundsNorth: z.number().optional(),
	boundsSouth: z.number().optional(),
	boundsEast: z.number().optional(),
	boundsWest: z.number().optional(),
	nearLat: z.number().optional(),
	nearLng: z.number().optional(),
	nearRadiusKm: z.number().min(.1).max(500).optional(),
	polygon: z.string().optional(),
	bedrooms: z.array(z.union([z.number(), z.literal("studio")])).optional(),
	bathrooms: z.number().optional(),
	areaMin: z.number().optional(),
	areaMax: z.number().optional(),
	make: z.array(z.string()).optional(),
	yearMin: z.number().optional(),
	yearMax: z.number().optional(),
	fuelType: z.array(z.enum([
		"gasoline",
		"diesel",
		"electric",
		"hybrid"
	])).optional(),
	transmission: z.enum(["manual", "automatic"]).optional(),
	experienceMin: z.number().optional()
});
var searchListingsFn_createServerFn_handler = createServerRpc({
	id: "e53cc75e2054c57b7158e24edb1292e49eb3e938a08e2c6784c29f79abcb672b",
	name: "searchListingsFn",
	filename: "src/modules/listings/api/listings.fn.ts"
}, (opts) => searchListingsFn.__executeServer(opts));
var searchListingsFn = createServerFn({ method: "GET" }).inputValidator(searchInputSchema).handler(searchListingsFn_createServerFn_handler, async ({ data }) => {
	const db = await loadDb();
	const conditions = [eq(listings.status, "published")];
	if (data.category) conditions.push(eq(listings.category, data.category));
	if (data.subCategory?.length) conditions.push(inArray(listings.subCategory, data.subCategory));
	if (data.transactionType) conditions.push(eq(listings.transactionType, data.transactionType));
	if (data.priceMin != null) conditions.push(gte(listings.price, data.priceMin));
	if (data.priceMax != null) conditions.push(lte(listings.price, data.priceMax));
	if (data.boundsNorth != null && data.boundsSouth != null && data.boundsEast != null && data.boundsWest != null) {
		conditions.push(gte(listings.latitude, data.boundsSouth));
		conditions.push(lte(listings.latitude, data.boundsNorth));
		conditions.push(gte(listings.longitude, data.boundsWest));
		conditions.push(lte(listings.longitude, data.boundsEast));
	}
	if (data.nearLat != null && data.nearLng != null && data.nearRadiusKm != null) conditions.push(haversineCondition(data.nearLat, data.nearLng, data.nearRadiusKm));
	const polygonRing = data.polygon ? decodePolygon(data.polygon) : null;
	if (polygonRing) conditions.push(polygonBboxCondition(polygonRing));
	const orderBy = data.sort === "price_asc" ? [sql`${listings.price} asc`] : data.sort === "price_desc" ? [sql`${listings.price} desc`] : data.sort === "popular" ? [sql`${listings.featured} desc, ${listings.publishedAt} desc`] : [sql`${listings.publishedAt} desc`];
	let total;
	let rows;
	if (polygonRing) {
		const filtered = (await db.select().from(listings).where(and(...conditions)).orderBy(...orderBy).limit(5e3)).filter((r) => pointInPolygon(r.longitude, r.latitude, polygonRing));
		total = filtered.length;
		const offset = (data.page - 1) * data.pageSize;
		rows = filtered.slice(offset, offset + data.pageSize);
	} else {
		const [countResult] = await db.select({ count: sql`count(*)::int` }).from(listings).where(and(...conditions));
		total = countResult?.count ?? 0;
		const offset = (data.page - 1) * data.pageSize;
		rows = await db.select().from(listings).where(and(...conditions)).orderBy(...orderBy).limit(data.pageSize).offset(offset);
	}
	if (rows.length === 0) return {
		items: [],
		total,
		page: data.page,
		pageSize: data.pageSize
	};
	const ids = rows.map((r) => r.id);
	const translations = await db.select().from(listingTranslations).where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, data.locale)));
	const fallbackTranslations = data.locale !== "en" ? await db.select().from(listingTranslations).where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, "en"))) : [];
	const tMap = new Map(translations.map((t) => [t.listingId, t]));
	const fbMap = new Map(fallbackTranslations.map((t) => [t.listingId, t]));
	const covers = await db.select().from(listingAssets).where(and(inArray(listingAssets.listingId, ids), eq(listingAssets.isCover, true)));
	const coverMap = new Map(covers.map((c) => [c.listingId, c.url]));
	const propertyIds = rows.filter((r) => r.category === "property").map((r) => r.id);
	const vehicleIds = rows.filter((r) => r.category === "vehicle").map((r) => r.id);
	const serviceIds = rows.filter((r) => r.category === "service").map((r) => r.id);
	const experienceIds = rows.filter((r) => r.category === "experience").map((r) => r.id);
	const propExtMap = /* @__PURE__ */ new Map();
	const vehExtMap = /* @__PURE__ */ new Map();
	const svcExtMap = /* @__PURE__ */ new Map();
	const expExtMap = /* @__PURE__ */ new Map();
	if (propertyIds.length > 0) {
		const propRows = await db.select().from(listingProperties).where(inArray(listingProperties.listingId, propertyIds));
		for (const p of propRows) {
			let include = true;
			if (data.bedrooms?.length) {
				const numBeds = data.bedrooms.filter((b) => typeof b === "number");
				const hasStudio = data.bedrooms.includes("studio");
				if (numBeds.length > 0 && !numBeds.includes(p.bedrooms ?? -1)) {
					if (!hasStudio || p.bedrooms !== 0 && p.bedrooms !== null) include = false;
				}
			}
			if (data.bathrooms != null && (p.bathrooms ?? 0) < data.bathrooms) include = false;
			if (data.areaMin != null && (p.areaSqm ?? 0) < data.areaMin) include = false;
			if (data.areaMax != null && (p.areaSqm ?? Infinity) > data.areaMax) include = false;
			if (include) propExtMap.set(p.listingId, p);
		}
	}
	if (vehicleIds.length > 0) {
		const vehRows = await db.select().from(listingVehicles).where(inArray(listingVehicles.listingId, vehicleIds));
		for (const v of vehRows) {
			let include = true;
			if (data.make?.length && !data.make.includes(v.make)) include = false;
			if (data.yearMin != null && v.year < data.yearMin) include = false;
			if (data.yearMax != null && v.year > data.yearMax) include = false;
			if (data.fuelType?.length && v.fuelType && !data.fuelType.includes(v.fuelType)) include = false;
			if (data.transmission && v.transmission && v.transmission !== data.transmission) include = false;
			if (include) vehExtMap.set(v.listingId, v);
		}
	}
	if (serviceIds.length > 0) {
		const svcRows = await db.select().from(listingServices).where(inArray(listingServices.listingId, serviceIds));
		for (const s of svcRows) {
			let include = true;
			if (data.experienceMin != null && (s.experienceYears ?? 0) < data.experienceMin) include = false;
			if (include) svcExtMap.set(s.listingId, s);
		}
	}
	if (experienceIds.length > 0) {
		const expRows = await db.select().from(listingExperiences).where(inArray(listingExperiences.listingId, experienceIds));
		for (const e of expRows) expExtMap.set(e.listingId, e);
	}
	const items = [];
	for (const r of rows) {
		const t = tMap.get(r.id) ?? fbMap.get(r.id);
		if (data.query) {
			const q = data.query.toLowerCase();
			if (!(t?.title.toLowerCase().includes(q) || t?.summary?.toLowerCase().includes(q) || r.addressLine1.toLowerCase().includes(q) || r.city.toLowerCase().includes(q))) continue;
		}
		const base = {
			id: r.id,
			slug: r.slug,
			category: r.category,
			subCategory: r.subCategory,
			transactionType: r.transactionType,
			status: r.status,
			price: r.price,
			currency: r.currency,
			pricePeriod: r.pricePeriod,
			latitude: r.latitude,
			longitude: r.longitude,
			addressLine1: r.addressLine1,
			city: r.city,
			region: r.region,
			country: r.country,
			featured: r.featured,
			title: t?.title ?? r.slug,
			summary: t?.summary ?? null,
			neighborhood: t?.neighborhood ?? null,
			coverUrl: coverMap.get(r.id) ?? null,
			scrapedSource: r.scrapedSource ?? null,
			scrapedSourceUrl: r.scrapedSourceUrl ?? null
		};
		if (r.category === "property") {
			const ext = propExtMap.get(r.id);
			if (!ext && propertyIds.includes(r.id)) continue;
			items.push({
				...base,
				category: "property",
				bedrooms: ext?.bedrooms ?? null,
				bathrooms: ext?.bathrooms ?? null,
				areaSqm: ext?.areaSqm ?? null,
				yearBuilt: ext?.yearBuilt ?? null,
				parkingSpaces: ext?.parkingSpaces ?? null,
				furnished: ext?.furnished ?? null
			});
		} else if (r.category === "vehicle") {
			const ext = vehExtMap.get(r.id);
			if (!ext && vehicleIds.includes(r.id)) continue;
			items.push({
				...base,
				category: "vehicle",
				make: ext?.make ?? "",
				model: ext?.model ?? "",
				year: ext?.year ?? 0,
				mileageKm: ext?.mileageKm ?? null,
				fuelType: ext?.fuelType ?? null,
				transmission: ext?.transmission ?? null,
				color: ext?.color ?? null
			});
		} else if (r.category === "service") {
			const ext = svcExtMap.get(r.id);
			if (!ext && serviceIds.includes(r.id)) continue;
			items.push({
				...base,
				category: "service",
				serviceRadiusKm: ext?.serviceRadiusKm ?? null,
				experienceYears: ext?.experienceYears ?? null,
				responseTime: ext?.responseTime ?? null
			});
		} else if (r.category === "experience") {
			const ext = expExtMap.get(r.id);
			items.push({
				...base,
				category: "experience",
				durationHours: ext?.durationHours ?? null,
				maxGuests: ext?.maxGuests ?? null,
				minAge: ext?.minAge ?? null,
				difficulty: ext?.difficulty ?? null,
				languages: ext?.languages ?? null
			});
		}
	}
	return {
		items,
		total,
		page: data.page,
		pageSize: data.pageSize
	};
});
var getListingBySlugFn_createServerFn_handler = createServerRpc({
	id: "7e5929e9ff99e3f2069d820cc5d1474d1a981479eb0d3df677c9569ced879b8f",
	name: "getListingBySlugFn",
	filename: "src/modules/listings/api/listings.fn.ts"
}, (opts) => getListingBySlugFn.__executeServer(opts));
var getListingBySlugFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	slug: z.string(),
	locale: z.string().default("en")
})).handler(getListingBySlugFn_createServerFn_handler, async ({ data }) => {
	const db = await loadDb();
	const [listing] = await db.select().from(listings).where(and(eq(listings.slug, data.slug), eq(listings.status, "published"))).limit(1);
	if (!listing) return null;
	const [translation] = await db.select().from(listingTranslations).where(and(eq(listingTranslations.listingId, listing.id), eq(listingTranslations.locale, data.locale)));
	const [fallback] = data.locale !== "en" ? await db.select().from(listingTranslations).where(and(eq(listingTranslations.listingId, listing.id), eq(listingTranslations.locale, "en"))) : [null];
	const t = translation ?? fallback;
	const assets = await db.select().from(listingAssets).where(eq(listingAssets.listingId, listing.id)).orderBy(listingAssets.sortOrder);
	const features = await db.select().from(listingFeatures).where(eq(listingFeatures.listingId, listing.id));
	let extension = {};
	if (listing.category === "property") {
		const [ext] = await db.select().from(listingProperties).where(eq(listingProperties.listingId, listing.id));
		if (ext) extension = ext;
	} else if (listing.category === "vehicle") {
		const [ext] = await db.select().from(listingVehicles).where(eq(listingVehicles.listingId, listing.id));
		if (ext) extension = ext;
	} else {
		const [ext] = await db.select().from(listingServices).where(eq(listingServices.listingId, listing.id));
		if (ext) extension = ext;
	}
	const { listingId: _, ...extFields } = extension;
	return {
		id: listing.id,
		slug: listing.slug,
		category: listing.category,
		subCategory: listing.subCategory,
		transactionType: listing.transactionType,
		status: listing.status,
		price: listing.price,
		currency: listing.currency,
		pricePeriod: listing.pricePeriod,
		latitude: listing.latitude,
		longitude: listing.longitude,
		addressLine1: listing.addressLine1,
		city: listing.city,
		region: listing.region,
		country: listing.country,
		featured: listing.featured,
		title: t?.title ?? listing.slug,
		summary: t?.summary ?? null,
		description: t?.description ?? null,
		neighborhood: t?.neighborhood ?? null,
		coverUrl: assets.find((a) => a.isCover)?.url ?? assets[0]?.url ?? null,
		features: features.map((f) => f.featureCode),
		assets: assets.map((a) => ({
			id: a.id,
			kind: a.kind,
			url: a.url,
			altText: a.altText,
			sortOrder: a.sortOrder,
			isCover: a.isCover
		})),
		publishedAt: listing.publishedAt?.toISOString() ?? null,
		createdAt: listing.createdAt.toISOString(),
		...extFields
	};
});
var getFeaturedListingsFn_createServerFn_handler = createServerRpc({
	id: "c5b408067539b289f066c2622c1dc33cf351143919567a1e7b6197749403fc3d",
	name: "getFeaturedListingsFn",
	filename: "src/modules/listings/api/listings.fn.ts"
}, (opts) => getFeaturedListingsFn.__executeServer(opts));
var getFeaturedListingsFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	limit: z.number().default(12),
	locale: z.string().default("en")
})).handler(getFeaturedListingsFn_createServerFn_handler, async ({ data }) => {
	const db = await loadDb();
	const rows = await db.select().from(listings).where(and(eq(listings.status, "published"), eq(listings.featured, true))).orderBy(sql`RANDOM()`).limit(data.limit);
	if (rows.length === 0) return [];
	const ids = rows.map((r) => r.id);
	const translations = await db.select().from(listingTranslations).where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, data.locale)));
	const covers = await db.select().from(listingAssets).where(and(inArray(listingAssets.listingId, ids), eq(listingAssets.isCover, true)));
	const tMap = new Map(translations.map((t) => [t.listingId, t]));
	const coverMap = new Map(covers.map((c) => [c.listingId, c.url]));
	return rows.map((r) => {
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
			coverUrl: coverMap.get(r.id) ?? null,
			city: r.city
		};
	});
});
var mapMarkersInputSchema = z.object({
	category: z.enum([
		"property",
		"vehicle",
		"service",
		"experience"
	]).optional(),
	subCategory: z.array(z.string()).optional(),
	transactionType: z.enum([
		"buy",
		"rent",
		"hire"
	]).optional(),
	priceMin: z.number().optional(),
	priceMax: z.number().optional(),
	bedrooms: z.array(z.union([z.number(), z.literal("studio")])).optional(),
	bathrooms: z.number().optional(),
	areaMin: z.number().optional(),
	areaMax: z.number().optional(),
	make: z.array(z.string()).optional(),
	yearMin: z.number().optional(),
	yearMax: z.number().optional(),
	fuelType: z.array(z.enum([
		"gasoline",
		"diesel",
		"electric",
		"hybrid"
	])).optional(),
	transmission: z.enum(["manual", "automatic"]).optional(),
	experienceMin: z.number().optional(),
	nearLat: z.number().optional(),
	nearLng: z.number().optional(),
	nearRadiusKm: z.number().min(.1).max(500).optional(),
	polygon: z.string().optional(),
	limit: z.number().min(1).max(5e4).default(1e4)
});
/**
* Lightweight markers endpoint for the map. Returns ALL matching listings
* (capped at `limit`, default 10k, max 50k) with minimal fields — no
* translations, no covers, no bounds. Feeds a clustered GeoJSON source so
* tens of thousands of pins render smoothly.
*/
var getMapMarkersFn_createServerFn_handler = createServerRpc({
	id: "398eeac2d7ddc049052377cc773688d0ab34697b8f3684fc3f652af848b36f07",
	name: "getMapMarkersFn",
	filename: "src/modules/listings/api/listings.fn.ts"
}, (opts) => getMapMarkersFn.__executeServer(opts));
var getMapMarkersFn = createServerFn({ method: "GET" }).inputValidator(mapMarkersInputSchema).handler(getMapMarkersFn_createServerFn_handler, async ({ data }) => {
	const db = await loadDb();
	const conditions = [eq(listings.status, "published")];
	if (data.category) conditions.push(eq(listings.category, data.category));
	if (data.subCategory?.length) conditions.push(inArray(listings.subCategory, data.subCategory));
	if (data.transactionType) conditions.push(eq(listings.transactionType, data.transactionType));
	if (data.priceMin != null) conditions.push(gte(listings.price, data.priceMin));
	if (data.priceMax != null) conditions.push(lte(listings.price, data.priceMax));
	if (data.nearLat != null && data.nearLng != null && data.nearRadiusKm != null) conditions.push(haversineCondition(data.nearLat, data.nearLng, data.nearRadiusKm));
	const polygonRing = data.polygon ? decodePolygon(data.polygon) : null;
	if (polygonRing) conditions.push(polygonBboxCondition(polygonRing));
	const rows = await db.select({
		id: listings.id,
		slug: listings.slug,
		category: listings.category,
		price: listings.price,
		currency: listings.currency,
		latitude: listings.latitude,
		longitude: listings.longitude
	}).from(listings).where(and(...conditions)).limit(data.limit);
	if (rows.length === 0) return [];
	const spatialRows = polygonRing ? rows.filter((r) => pointInPolygon(r.longitude, r.latitude, polygonRing)) : rows;
	const needsPropertyFilter = data.bedrooms?.length || data.bathrooms != null || data.areaMin != null || data.areaMax != null;
	const needsVehicleFilter = data.make?.length || data.yearMin != null || data.yearMax != null || data.fuelType?.length || data.transmission;
	const needsServiceFilter = data.experienceMin != null;
	const excluded = /* @__PURE__ */ new Set();
	if (needsPropertyFilter) {
		const propertyIds = spatialRows.filter((r) => r.category === "property").map((r) => r.id);
		if (propertyIds.length > 0) {
			const propRows = await db.select().from(listingProperties).where(inArray(listingProperties.listingId, propertyIds));
			const keptIds = /* @__PURE__ */ new Set();
			for (const p of propRows) {
				let include = true;
				if (data.bedrooms?.length) {
					const numBeds = data.bedrooms.filter((b) => typeof b === "number");
					const hasStudio = data.bedrooms.includes("studio");
					if (numBeds.length > 0 && !numBeds.includes(p.bedrooms ?? -1)) {
						if (!hasStudio || p.bedrooms !== 0 && p.bedrooms !== null) include = false;
					}
				}
				if (data.bathrooms != null && (p.bathrooms ?? 0) < data.bathrooms) include = false;
				if (data.areaMin != null && (p.areaSqm ?? 0) < data.areaMin) include = false;
				if (data.areaMax != null && (p.areaSqm ?? Infinity) > data.areaMax) include = false;
				if (include) keptIds.add(p.listingId);
			}
			for (const id of propertyIds) if (!keptIds.has(id)) excluded.add(id);
		}
	}
	if (needsVehicleFilter) {
		const vehicleIds = spatialRows.filter((r) => r.category === "vehicle").map((r) => r.id);
		if (vehicleIds.length > 0) {
			const vehRows = await db.select().from(listingVehicles).where(inArray(listingVehicles.listingId, vehicleIds));
			const keptIds = /* @__PURE__ */ new Set();
			for (const v of vehRows) {
				let include = true;
				if (data.make?.length && !data.make.includes(v.make)) include = false;
				if (data.yearMin != null && v.year < data.yearMin) include = false;
				if (data.yearMax != null && v.year > data.yearMax) include = false;
				if (data.fuelType?.length && v.fuelType && !data.fuelType.includes(v.fuelType)) include = false;
				if (data.transmission && v.transmission && v.transmission !== data.transmission) include = false;
				if (include) keptIds.add(v.listingId);
			}
			for (const id of vehicleIds) if (!keptIds.has(id)) excluded.add(id);
		}
	}
	if (needsServiceFilter) {
		const serviceIds = spatialRows.filter((r) => r.category === "service").map((r) => r.id);
		if (serviceIds.length > 0) {
			const svcRows = await db.select().from(listingServices).where(inArray(listingServices.listingId, serviceIds));
			const keptIds = /* @__PURE__ */ new Set();
			for (const s of svcRows) {
				if (data.experienceMin != null && (s.experienceYears ?? 0) < data.experienceMin) continue;
				keptIds.add(s.listingId);
			}
			for (const id of serviceIds) if (!keptIds.has(id)) excluded.add(id);
		}
	}
	return spatialRows.filter((r) => !excluded.has(r.id)).map((r) => ({
		id: r.id,
		slug: r.slug,
		category: r.category,
		price: r.price,
		currency: r.currency,
		latitude: r.latitude,
		longitude: r.longitude
	}));
});
var getScrapedListingsFn_createServerFn_handler = createServerRpc({
	id: "8001d9a2c4621b6c69f2fa08c181ec576832a8fc1c08474ec70f3ea8bffb1445",
	name: "getScrapedListingsFn",
	filename: "src/modules/listings/api/listings.fn.ts"
}, (opts) => getScrapedListingsFn.__executeServer(opts));
var getScrapedListingsFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	limit: z.number().default(12),
	locale: z.string().default("en")
})).handler(getScrapedListingsFn_createServerFn_handler, async ({ data }) => {
	const db = await loadDb();
	const rows = await db.select().from(listings).where(and(eq(listings.status, "published"), isNotNull(listings.scrapedSource))).orderBy(sql`RANDOM()`).limit(data.limit);
	if (rows.length === 0) return [];
	const ids = rows.map((r) => r.id);
	const translations = await db.select().from(listingTranslations).where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, data.locale)));
	const covers = await db.select().from(listingAssets).where(and(inArray(listingAssets.listingId, ids), eq(listingAssets.isCover, true)));
	const tMap = new Map(translations.map((t) => [t.listingId, t]));
	const coverMap = new Map(covers.map((c) => [c.listingId, c.url]));
	return rows.map((r) => ({
		id: r.id,
		slug: r.slug,
		category: r.category,
		subCategory: r.subCategory,
		transactionType: r.transactionType,
		price: r.price,
		currency: r.currency,
		pricePeriod: r.pricePeriod,
		title: tMap.get(r.id)?.title ?? r.slug,
		coverUrl: coverMap.get(r.id) ?? null,
		city: r.city,
		scrapedSource: r.scrapedSource ?? null,
		scrapedSourceUrl: r.scrapedSourceUrl ?? null
	}));
});
//#endregion
export { getFeaturedListingsFn_createServerFn_handler, getListingBySlugFn_createServerFn_handler, getMapMarkersFn_createServerFn_handler, getScrapedListingsFn_createServerFn_handler, searchListingsFn_createServerFn_handler };
