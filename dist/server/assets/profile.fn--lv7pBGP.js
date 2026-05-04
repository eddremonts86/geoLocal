import { t as createServerFn } from "../server.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { z } from "zod";
//#region src/modules/profile/api/profile.fn.ts
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
var getMyProfileFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional().default({})).handler(createSsrRpc("e2d508f23b958c5ff9db6a1affbc0d4f2ee1106c4baeeb1cc74899c8d1e13d77"));
var updateMyProfileFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	handle: z.string().toLowerCase().regex(HANDLE_RX, "Handle must be 2–40 chars, lowercase letters, digits, -, _").optional(),
	displayName: z.string().max(120).optional(),
	bio: z.string().max(2e3).optional(),
	avatarUrl: z.string().url().optional().nullable(),
	email: z.string().email().optional(),
	phone: z.string().max(40).optional(),
	preferredLocale: z.string().min(2).max(5).optional(),
	notificationsEmail: z.boolean().optional()
})).handler(createSsrRpc("ef9ef93b7278ae72c3a7d88359416aa4c1b4a0b2ac342ec0a8ffb5c8aa54fcef"));
var getPublicProfileByHandleFn = createServerFn({ method: "GET" }).inputValidator(z.object({ handle: z.string().toLowerCase().regex(HANDLE_RX) })).handler(createSsrRpc("68bd5d7194ff1f9b31d1d7bd99ecee1bf067de42fea20fd3e643c914556a1e0a"));
var listPublicListingsByHandleFn = createServerFn({ method: "GET" }).inputValidator(z.object({ handle: z.string().toLowerCase().regex(HANDLE_RX) })).handler(createSsrRpc("54ba962c9e7cf83d600efbe2557a011d21ccd1b527b15aa1d4e9390b483ca29d"));
//#endregion
export { updateMyProfileFn as i, getPublicProfileByHandleFn as n, listPublicListingsByHandleFn as r, getMyProfileFn as t };
