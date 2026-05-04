import { t as createServerFn } from "../server.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { z } from "zod";
//#region src/modules/admin/api/admin-listings.fn.ts
var adminSearchSchema = z.object({
	query: z.string().optional(),
	category: z.enum([
		"property",
		"vehicle",
		"service",
		"experience"
	]).optional(),
	status: z.enum([
		"draft",
		"published",
		"archived"
	]).optional(),
	page: z.number().default(1),
	pageSize: z.number().default(20)
});
var getAdminListingsFn = createServerFn({ method: "GET" }).inputValidator(adminSearchSchema).handler(createSsrRpc("0d9bd219ead6f1928a6754aad5dcfd259f51b14b7cb8d8be93586edab53233eb"));
var updateListingStatusFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	id: z.string(),
	status: z.enum([
		"draft",
		"published",
		"archived"
	])
})).handler(createSsrRpc("65737796617caca386ce39fad82c960874f6dcf9227e8edcd34fb6b38e35faa9"));
var deleteListingFn = createServerFn({ method: "POST" }).inputValidator(z.object({ id: z.string() })).handler(createSsrRpc("20ed6b463bc8b36157b30c9d2380bbc43ab5dd9fbd481732bc316dbb56885025"));
var createListingSchema = z.object({
	category: z.enum([
		"property",
		"vehicle",
		"service",
		"experience"
	]),
	subCategory: z.string(),
	transactionType: z.enum([
		"buy",
		"rent",
		"hire"
	]),
	status: z.enum(["draft", "published"]).default("draft"),
	price: z.number(),
	currency: z.string().default("DKK"),
	pricePeriod: z.enum([
		"one_time",
		"monthly",
		"daily",
		"hourly"
	]).nullable().default(null),
	latitude: z.number(),
	longitude: z.number(),
	addressLine1: z.string(),
	city: z.string(),
	region: z.string().nullable().default(null),
	country: z.string().default("Denmark"),
	featured: z.boolean().default(false),
	translations: z.array(z.object({
		locale: z.string(),
		title: z.string(),
		summary: z.string().nullable().default(null),
		description: z.string().nullable().default(null),
		neighborhood: z.string().nullable().default(null)
	})),
	bedrooms: z.number().nullable().optional(),
	bathrooms: z.number().nullable().optional(),
	areaSqm: z.number().nullable().optional(),
	lotSqm: z.number().nullable().optional(),
	yearBuilt: z.number().nullable().optional(),
	parkingSpaces: z.number().nullable().optional(),
	floors: z.number().nullable().optional(),
	furnished: z.boolean().nullable().optional(),
	make: z.string().optional(),
	model: z.string().optional(),
	year: z.number().optional(),
	mileageKm: z.number().nullable().optional(),
	fuelType: z.enum([
		"gasoline",
		"diesel",
		"electric",
		"hybrid"
	]).nullable().optional(),
	transmission: z.enum(["manual", "automatic"]).nullable().optional(),
	color: z.string().nullable().optional(),
	engineDisplacementCc: z.number().nullable().optional(),
	doors: z.number().nullable().optional(),
	serviceRadiusKm: z.number().nullable().optional(),
	experienceYears: z.number().nullable().optional(),
	certifications: z.string().nullable().optional(),
	responseTime: z.string().nullable().optional(),
	featureCodes: z.array(z.string()).optional(),
	assets: z.array(z.object({
		kind: z.string().default("image"),
		url: z.string(),
		altText: z.string().nullable().default(null),
		sortOrder: z.number(),
		isCover: z.boolean().default(false)
	})).optional()
});
var createListingFn = createServerFn({ method: "POST" }).inputValidator(createListingSchema).handler(createSsrRpc("94025facee4761a3176dc6843dc0614251d4732f2bce0abd94c5e3e3b8b322d9"));
//#endregion
export { updateListingStatusFn as i, deleteListingFn as n, getAdminListingsFn as r, createListingFn as t };
