import { t as createServerFn } from "../server.js";
import { t as createSsrRpc } from "./createSsrRpc-CoTEs1AR.js";
import { z } from "zod";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
//#region src/modules/listings/api/listings.fn.ts
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
var searchListingsFn = createServerFn({ method: "GET" }).inputValidator(searchInputSchema).handler(createSsrRpc("e53cc75e2054c57b7158e24edb1292e49eb3e938a08e2c6784c29f79abcb672b"));
var getListingBySlugFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	slug: z.string(),
	locale: z.string().default("en")
})).handler(createSsrRpc("7e5929e9ff99e3f2069d820cc5d1474d1a981479eb0d3df677c9569ced879b8f"));
var getFeaturedListingsFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	limit: z.number().default(12),
	locale: z.string().default("en")
})).handler(createSsrRpc("c5b408067539b289f066c2622c1dc33cf351143919567a1e7b6197749403fc3d"));
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
var getMapMarkersFn = createServerFn({ method: "GET" }).inputValidator(mapMarkersInputSchema).handler(createSsrRpc("398eeac2d7ddc049052377cc773688d0ab34697b8f3684fc3f652af848b36f07"));
var getScrapedListingsFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	limit: z.number().default(12),
	locale: z.string().default("en")
})).handler(createSsrRpc("8001d9a2c4621b6c69f2fa08c181ec576832a8fc1c08474ec70f3ea8bffb1445"));
//#endregion
//#region src/modules/listings/api/queries.ts
var listingKeys = {
	all: ["listings"],
	lists: () => [...listingKeys.all, "list"],
	list: (filters) => [...listingKeys.lists(), filters],
	details: () => [...listingKeys.all, "detail"],
	detail: (slug) => [...listingKeys.details(), slug],
	featured: (limit) => [
		...listingKeys.all,
		"featured",
		limit
	],
	scraped: (limit) => [
		...listingKeys.all,
		"scraped",
		limit
	],
	mapMarkers: (filters) => [
		...listingKeys.all,
		"mapMarkers",
		filters
	]
};
function listingInfiniteQueryOptions(filters) {
	return infiniteQueryOptions({
		queryKey: [...listingKeys.list(filters), "infinite"],
		queryFn: ({ pageParam = 1 }) => searchListingsFn({ data: {
			category: filters.category,
			subCategory: filters.subCategory,
			transactionType: filters.transactionType,
			query: filters.query,
			priceMin: filters.priceMin,
			priceMax: filters.priceMax,
			boundsNorth: filters.bounds?.north,
			boundsSouth: filters.bounds?.south,
			boundsEast: filters.bounds?.east,
			boundsWest: filters.bounds?.west,
			nearLat: filters.nearLat,
			nearLng: filters.nearLng,
			nearRadiusKm: filters.nearRadiusKm,
			polygon: filters.polygon,
			sort: filters.sort ?? "newest",
			page: pageParam,
			pageSize: filters.pageSize ?? 20,
			locale: filters.locale ?? "en",
			bedrooms: filters.bedrooms,
			bathrooms: filters.bathrooms,
			areaMin: filters.areaMin,
			areaMax: filters.areaMax,
			make: filters.make,
			yearMin: filters.yearMin,
			yearMax: filters.yearMax,
			fuelType: filters.fuelType,
			transmission: filters.transmission,
			experienceMin: filters.experienceMin
		} }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const nextPage = lastPage.page + 1;
			return nextPage * lastPage.pageSize <= lastPage.total + lastPage.pageSize ? nextPage : void 0;
		}
	});
}
function listingDetailQueryOptions(slug, locale = "en") {
	return queryOptions({
		queryKey: listingKeys.detail(slug),
		queryFn: () => getListingBySlugFn({ data: {
			slug,
			locale
		} }),
		enabled: !!slug
	});
}
function featuredListingsQueryOptions(limit = 12, locale = "en") {
	return queryOptions({
		queryKey: listingKeys.featured(limit),
		queryFn: () => getFeaturedListingsFn({ data: {
			limit,
			locale
		} }),
		staleTime: 1e3 * 60 * 5
	});
}
function scrapedListingsQueryOptions(limit = 12, locale = "en") {
	return queryOptions({
		queryKey: listingKeys.scraped(limit),
		queryFn: () => getScrapedListingsFn({ data: {
			limit,
			locale
		} }),
		staleTime: 1e3 * 60 * 5
	});
}
function mapMarkersQueryOptions(filters) {
	return queryOptions({
		queryKey: listingKeys.mapMarkers(filters),
		queryFn: () => getMapMarkersFn({ data: {
			category: filters.category,
			subCategory: filters.subCategory,
			transactionType: filters.transactionType,
			priceMin: filters.priceMin,
			priceMax: filters.priceMax,
			bedrooms: filters.bedrooms,
			bathrooms: filters.bathrooms,
			areaMin: filters.areaMin,
			areaMax: filters.areaMax,
			make: filters.make,
			yearMin: filters.yearMin,
			yearMax: filters.yearMax,
			fuelType: filters.fuelType,
			transmission: filters.transmission,
			experienceMin: filters.experienceMin,
			nearLat: filters.nearLat,
			nearLng: filters.nearLng,
			nearRadiusKm: filters.nearRadiusKm,
			polygon: filters.polygon,
			limit: 1e4
		} }),
		staleTime: 1e3 * 60 * 2
	});
}
//#endregion
export { scrapedListingsQueryOptions as a, mapMarkersQueryOptions as i, listingDetailQueryOptions as n, listingInfiniteQueryOptions as r, featuredListingsQueryOptions as t };
