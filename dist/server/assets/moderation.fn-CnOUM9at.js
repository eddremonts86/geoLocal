import { t as createServerFn } from "../server.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { z } from "zod";
var reportListingFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	listingId: z.string().uuid(),
	reason: z.enum([
		"spam",
		"fraud",
		"illegal",
		"duplicate",
		"wrong_category",
		"inappropriate",
		"other"
	]),
	details: z.string().max(2e3).optional()
})).handler(createSsrRpc("6d15ccacfe20e54c72ec939b1af0ff7e705eb5d5ed43203dec709ddb0cd6451e"));
var listReportsFn = createServerFn({ method: "GET" }).inputValidator(z.object({ resolved: z.boolean().optional().default(false) }).optional()).handler(createSsrRpc("2046e133e02b8235307a36c4377e04e303d1aa24e901f7da3da9a776d3906258"));
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
})).handler(createSsrRpc("4e62eb2462e5b68618926a34bf0b0338946a043825745709d3a30d7080b32fac"));
var banUserFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	userId: z.string(),
	reason: z.string().max(500),
	banned: z.boolean()
})).handler(createSsrRpc("dbc1a1a24366c65f19c3f34a0ba466389d04ab12db588e72744d56b4dcd43c0a"));
//#endregion
export { reportListingFn as i, listReportsFn as n, moderateListingFn as r, banUserFn as t };
