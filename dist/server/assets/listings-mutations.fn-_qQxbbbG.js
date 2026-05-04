import { t as createServerFn } from "../server.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { z } from "zod";
//#region src/modules/listings/api/listings-mutations.fn.ts
/**
* User-facing listing mutations.
*
* - createListingFn:  authenticated users create their own listings (draft).
* - updateListingFn:  owner or admin may edit.
* - deleteListingFn:  owner or admin may delete (cascades to children).
* - publishListingFn: owner toggles draft<->published.
* - listMyListingsFn: caller's own listings (any status).
*
* Authz is enforced via `requireUser()` / `requireListingOwner()`.
* Rate limits are enforced for create + publish (anti-spam).
*/
var baseSchema = z.object({
	category: z.enum([
		"property",
		"vehicle",
		"service",
		"experience"
	]),
	subCategory: z.string().min(1).max(100),
	transactionType: z.enum([
		"buy",
		"rent",
		"hire"
	]),
	title: z.string().min(3).max(200),
	description: z.string().max(8e3).optional(),
	price: z.number().int().min(0),
	currency: z.string().length(3).default("DKK"),
	pricePeriod: z.enum([
		"one_time",
		"monthly",
		"daily",
		"hourly"
	]).optional(),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
	addressLine1: z.string().min(2).max(500),
	city: z.string().min(1).max(255),
	region: z.string().max(255).optional(),
	country: z.string().length(2).default("DK"),
	contactMethod: z.enum([
		"in_app",
		"email",
		"phone",
		"external_url"
	]).default("in_app"),
	contactEmail: z.string().email().optional(),
	contactPhone: z.string().max(40).optional(),
	contactUrl: z.string().url().optional(),
	imageUrls: z.array(z.string().url()).max(20).default([]),
	property: z.object({
		bedrooms: z.number().int().min(0).max(50).optional(),
		bathrooms: z.number().int().min(0).max(50).optional(),
		areaSqm: z.number().min(0).max(1e5).optional(),
		yearBuilt: z.number().int().min(1500).max(2100).optional()
	}).optional(),
	vehicle: z.object({
		make: z.string().max(100),
		model: z.string().max(100),
		year: z.number().int().min(1900).max(2100),
		mileageKm: z.number().int().min(0).optional(),
		fuelType: z.enum([
			"gasoline",
			"diesel",
			"electric",
			"hybrid"
		]).optional(),
		transmission: z.enum(["manual", "automatic"]).optional()
	}).optional(),
	service: z.object({
		serviceRadiusKm: z.number().min(0).optional(),
		experienceYears: z.number().int().min(0).optional()
	}).optional(),
	experience: z.object({
		durationHours: z.number().min(0).optional(),
		maxGuests: z.number().int().min(1).optional()
	}).optional()
});
var createListingFn = createServerFn({ method: "POST" }).inputValidator(baseSchema).handler(createSsrRpc("aff181cf9ac612a6d438d17d008575c902106ab5541af7390ef5269b60da4cd0"));
var updateSchema = baseSchema.partial().extend({ id: z.string().uuid() });
createServerFn({ method: "POST" }).inputValidator(updateSchema).handler(createSsrRpc("f464c510325eec0cd4c3b5607c1a4fc7ee8c1fdd592c3625dd3231a31c533b40"));
var deleteListingFn = createServerFn({ method: "POST" }).inputValidator(z.object({ id: z.string().uuid() })).handler(createSsrRpc("8f2d1f131172f47c665a38f12c2a2175c692ac696f4c5320891edf2e0fcfeb97"));
var publishListingFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	id: z.string().uuid(),
	publish: z.boolean()
})).handler(createSsrRpc("985b3886099a2a9e5dc60665f3efd4c4867863ec07879c63ffcef3f092209a18"));
var listMyListingsFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional().default({})).handler(createSsrRpc("f0148e9fb9be2bbb8c7adcfb2143cfc28ab52168908ed1da62db0c766df9efb9"));
//#endregion
export { publishListingFn as i, deleteListingFn as n, listMyListingsFn as r, createListingFn as t };
