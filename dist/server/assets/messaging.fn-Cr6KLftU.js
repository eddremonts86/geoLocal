import { t as createServerFn } from "../server.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { z } from "zod";
//#region src/modules/messaging/api/messaging.fn.ts
/**
* Messaging server functions.
*
* Authz: only `thread_participants` can read/write a thread. Listing owners
* are added automatically; inquirers join when they call `startThreadFn`.
*
* Side effects: each new message inserts an in-app `notifications.new` row
* for every other participant and (best-effort) triggers an email for
* recipients who opted in (`user_profiles.notifications_email = true`).
*/
var MAX_BODY = 4e3;
var startThreadFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	listingId: z.string().uuid(),
	body: z.string().min(1).max(MAX_BODY)
})).handler(createSsrRpc("fa6881072b65481bc52b460119b86ba8bfef87b7354de45f7f4af88ed797f0ab"));
var sendMessageFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	threadId: z.string().uuid(),
	body: z.string().min(1).max(MAX_BODY)
})).handler(createSsrRpc("252da876f9f7ff7ff21f482fe6361dddd6ad9a983f86523878b061fd076772bc"));
var listThreadsFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional().default({})).handler(createSsrRpc("a55d3bbe82cc48f5bc4fa0aea34fae5fcd535aefcfcd5cdf14004884661d507d"));
var getThreadFn = createServerFn({ method: "GET" }).inputValidator(z.object({ threadId: z.string().uuid() })).handler(createSsrRpc("af4e565b542936bfe1d56bd5c1f68815a447fb2d79a97f02bc135085845dd794"));
var markThreadReadFn = createServerFn({ method: "POST" }).inputValidator(z.object({ threadId: z.string().uuid() })).handler(createSsrRpc("5108dc6c2c32a94c4d95bfd788867b2c784d3964b4f909678ed4a6851a115fae"));
createServerFn({ method: "GET" }).inputValidator(z.object({}).optional()).handler(createSsrRpc("e01475fb62ec747c42803ed02ba8c481c8005cb61eff9c1c5af494732fdd245b"));
var unreadNotificationsCountFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional()).handler(createSsrRpc("ac74c08b37f2902bc2ff72feaf85c5c18376bd316d19ca53d983b408ce5f8278"));
createServerFn({ method: "POST" }).inputValidator(z.object({ notificationsEmail: z.boolean() })).handler(createSsrRpc("4584eee1a4a2d22fef168bcc2707863d87dede1cda50f23596069ef414e66a62"));
//#endregion
export { startThreadFn as a, sendMessageFn as i, listThreadsFn as n, unreadNotificationsCountFn as o, markThreadReadFn as r, getThreadFn as t };
