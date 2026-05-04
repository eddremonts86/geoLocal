import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as loadDb } from "./load-gagVjFt5.js";
import { b as threads, d as messages, f as notifications, u as listings, x as userProfiles, y as threadParticipants } from "./schema-Bm7YGE-a.js";
import { r as requireUser } from "./guards-S7H8UmzC.js";
import { t as consumeRateLimit } from "./rate-limit-EW6IDPqE.js";
import { n as sendNewMessageEmail } from "./mailer-B0GfxoPd.js";
import { z } from "zod";
import { and, asc, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";
//#region src/modules/messaging/api/messaging.fn.ts?tss-serverfn-split
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
var sanitizeBody = (raw) => raw.replace(/\s+/g, (s) => s.includes("\n") ? "\n" : " ").trim().slice(0, MAX_BODY);
async function ensureParticipant(threadId, userId) {
	if ((await (await loadDb()).select({ threadId: threadParticipants.threadId }).from(threadParticipants).where(and(eq(threadParticipants.threadId, threadId), eq(threadParticipants.userId, userId))).limit(1)).length === 0) {
		const err = /* @__PURE__ */ new Error("FORBIDDEN");
		err.status = 403;
		throw err;
	}
}
var startThreadFn_createServerFn_handler = createServerRpc({
	id: "fa6881072b65481bc52b460119b86ba8bfef87b7354de45f7f4af88ed797f0ab",
	name: "startThreadFn",
	filename: "src/modules/messaging/api/messaging.fn.ts"
}, (opts) => startThreadFn.__executeServer(opts));
var startThreadFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	listingId: z.string().uuid(),
	body: z.string().min(1).max(MAX_BODY)
})).handler(startThreadFn_createServerFn_handler, async ({ data }) => {
	const user = await requireUser();
	await consumeRateLimit({
		key: `user:${user.userId}:start_thread`,
		limit: 20,
		windowSec: 3600
	});
	const db = await loadDb();
	const listing = (await db.select({
		id: listings.id,
		ownerId: listings.ownerId,
		status: listings.status,
		contactMethod: listings.contactMethod
	}).from(listings).where(eq(listings.id, data.listingId)).limit(1))[0];
	if (!listing) throw Object.assign(/* @__PURE__ */ new Error("NOT_FOUND"), { status: 404 });
	if (listing.status !== "published") throw Object.assign(/* @__PURE__ */ new Error("NOT_PUBLISHED"), { status: 400 });
	if (!listing.ownerId) throw Object.assign(/* @__PURE__ */ new Error("NO_OWNER"), { status: 400 });
	if (listing.ownerId === user.userId) throw Object.assign(/* @__PURE__ */ new Error("SELF_CONTACT"), { status: 400 });
	if (listing.contactMethod !== "in_app") throw Object.assign(/* @__PURE__ */ new Error("CONTACT_METHOD_DISABLED"), { status: 400 });
	const body = sanitizeBody(data.body);
	const result = await db.transaction(async (tx) => {
		const [thread] = await tx.insert(threads).values({ listingId: listing.id }).returning({ id: threads.id });
		await tx.insert(threadParticipants).values([{
			threadId: thread.id,
			userId: listing.ownerId,
			role: "owner"
		}, {
			threadId: thread.id,
			userId: user.userId,
			role: "inquirer"
		}]);
		const [msg] = await tx.insert(messages).values({
			threadId: thread.id,
			senderId: user.userId,
			body
		}).returning({ id: messages.id });
		await tx.update(listings).set({ contactCount: sql`${listings.contactCount} + 1` }).where(eq(listings.id, listing.id));
		await tx.insert(notifications).values({
			userId: listing.ownerId,
			kind: "message.new",
			payload: {
				threadId: thread.id,
				messageId: msg.id,
				listingId: listing.id,
				fromUserId: user.userId
			}
		});
		return {
			threadId: thread.id,
			messageId: msg.id,
			recipientId: listing.ownerId
		};
	});
	sendNewMessageEmail({
		recipientUserId: result.recipientId,
		threadId: result.threadId,
		body
	});
	return { threadId: result.threadId };
});
var sendMessageFn_createServerFn_handler = createServerRpc({
	id: "252da876f9f7ff7ff21f482fe6361dddd6ad9a983f86523878b061fd076772bc",
	name: "sendMessageFn",
	filename: "src/modules/messaging/api/messaging.fn.ts"
}, (opts) => sendMessageFn.__executeServer(opts));
var sendMessageFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	threadId: z.string().uuid(),
	body: z.string().min(1).max(MAX_BODY)
})).handler(sendMessageFn_createServerFn_handler, async ({ data }) => {
	const user = await requireUser();
	await consumeRateLimit({
		key: `user:${user.userId}:send_message`,
		limit: 60,
		windowSec: 300
	});
	await ensureParticipant(data.threadId, user.userId);
	const db = await loadDb();
	const body = sanitizeBody(data.body);
	const recipients = await db.select({ userId: threadParticipants.userId }).from(threadParticipants).where(and(eq(threadParticipants.threadId, data.threadId), ne(threadParticipants.userId, user.userId)));
	const result = await db.transaction(async (tx) => {
		const [msg] = await tx.insert(messages).values({
			threadId: data.threadId,
			senderId: user.userId,
			body
		}).returning({
			id: messages.id,
			createdAt: messages.createdAt
		});
		await tx.update(threads).set({ lastMessageAt: msg.createdAt }).where(eq(threads.id, data.threadId));
		if (recipients.length) await tx.insert(notifications).values(recipients.map((r) => ({
			userId: r.userId,
			kind: "message.new",
			payload: {
				threadId: data.threadId,
				messageId: msg.id,
				fromUserId: user.userId
			}
		})));
		return msg;
	});
	for (const r of recipients) sendNewMessageEmail({
		recipientUserId: r.userId,
		threadId: data.threadId,
		body
	});
	return { id: result.id };
});
var listThreadsFn_createServerFn_handler = createServerRpc({
	id: "a55d3bbe82cc48f5bc4fa0aea34fae5fcd535aefcfcd5cdf14004884661d507d",
	name: "listThreadsFn",
	filename: "src/modules/messaging/api/messaging.fn.ts"
}, (opts) => listThreadsFn.__executeServer(opts));
var listThreadsFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional().default({})).handler(listThreadsFn_createServerFn_handler, async () => {
	const user = await requireUser();
	const db = await loadDb();
	const rows = await db.select({
		threadId: threads.id,
		listingId: threads.listingId,
		status: threads.status,
		lastMessageAt: threads.lastMessageAt,
		lastReadAt: threadParticipants.lastReadAt
	}).from(threadParticipants).innerJoin(threads, eq(threads.id, threadParticipants.threadId)).where(eq(threadParticipants.userId, user.userId)).orderBy(desc(threads.lastMessageAt)).limit(200);
	if (rows.length === 0) return [];
	const threadIds = rows.map((r) => r.threadId);
	const lastMessages = await db.select({
		threadId: messages.threadId,
		senderId: messages.senderId,
		body: messages.body,
		createdAt: messages.createdAt
	}).from(messages).where(inArray(messages.threadId, threadIds)).orderBy(desc(messages.createdAt));
	const lastByThread = /* @__PURE__ */ new Map();
	for (const m of lastMessages) if (!lastByThread.has(m.threadId)) lastByThread.set(m.threadId, m);
	return rows.map((r) => {
		const lastMsg = lastByThread.get(r.threadId);
		const unread = lastMsg ? (!r.lastReadAt || r.lastReadAt < lastMsg.createdAt) && lastMsg.senderId !== user.userId : false;
		return {
			threadId: r.threadId,
			listingId: r.listingId,
			status: r.status,
			lastMessageAt: r.lastMessageAt,
			lastMessagePreview: lastMsg?.body.slice(0, 200) ?? null,
			lastSenderId: lastMsg?.senderId ?? null,
			unread
		};
	});
});
var getThreadFn_createServerFn_handler = createServerRpc({
	id: "af4e565b542936bfe1d56bd5c1f68815a447fb2d79a97f02bc135085845dd794",
	name: "getThreadFn",
	filename: "src/modules/messaging/api/messaging.fn.ts"
}, (opts) => getThreadFn.__executeServer(opts));
var getThreadFn = createServerFn({ method: "GET" }).inputValidator(z.object({ threadId: z.string().uuid() })).handler(getThreadFn_createServerFn_handler, async ({ data }) => {
	const user = await requireUser();
	await ensureParticipant(data.threadId, user.userId);
	const db = await loadDb();
	const [thread] = await db.select().from(threads).where(eq(threads.id, data.threadId)).limit(1);
	if (!thread) throw Object.assign(/* @__PURE__ */ new Error("NOT_FOUND"), { status: 404 });
	return {
		thread,
		messages: await db.select({
			id: messages.id,
			senderId: messages.senderId,
			body: messages.body,
			createdAt: messages.createdAt
		}).from(messages).where(and(eq(messages.threadId, data.threadId), isNull(messages.deletedAt))).orderBy(asc(messages.createdAt)).limit(500)
	};
});
var markThreadReadFn_createServerFn_handler = createServerRpc({
	id: "5108dc6c2c32a94c4d95bfd788867b2c784d3964b4f909678ed4a6851a115fae",
	name: "markThreadReadFn",
	filename: "src/modules/messaging/api/messaging.fn.ts"
}, (opts) => markThreadReadFn.__executeServer(opts));
var markThreadReadFn = createServerFn({ method: "POST" }).inputValidator(z.object({ threadId: z.string().uuid() })).handler(markThreadReadFn_createServerFn_handler, async ({ data }) => {
	const user = await requireUser();
	await ensureParticipant(data.threadId, user.userId);
	const db = await loadDb();
	await db.update(threadParticipants).set({ lastReadAt: /* @__PURE__ */ new Date() }).where(and(eq(threadParticipants.threadId, data.threadId), eq(threadParticipants.userId, user.userId)));
	await db.update(notifications).set({ readAt: /* @__PURE__ */ new Date() }).where(and(eq(notifications.userId, user.userId), eq(notifications.kind, "message.new"), isNull(notifications.readAt)));
	return { ok: true };
});
var listNotificationsFn_createServerFn_handler = createServerRpc({
	id: "e01475fb62ec747c42803ed02ba8c481c8005cb61eff9c1c5af494732fdd245b",
	name: "listNotificationsFn",
	filename: "src/modules/messaging/api/messaging.fn.ts"
}, (opts) => listNotificationsFn.__executeServer(opts));
var listNotificationsFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional()).handler(listNotificationsFn_createServerFn_handler, async () => {
	const user = await requireUser();
	return await (await loadDb()).select({
		id: notifications.id,
		userId: notifications.userId,
		kind: notifications.kind,
		readAt: notifications.readAt,
		createdAt: notifications.createdAt
	}).from(notifications).where(eq(notifications.userId, user.userId)).orderBy(desc(notifications.createdAt)).limit(50);
});
var unreadNotificationsCountFn_createServerFn_handler = createServerRpc({
	id: "ac74c08b37f2902bc2ff72feaf85c5c18376bd316d19ca53d983b408ce5f8278",
	name: "unreadNotificationsCountFn",
	filename: "src/modules/messaging/api/messaging.fn.ts"
}, (opts) => unreadNotificationsCountFn.__executeServer(opts));
var unreadNotificationsCountFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional()).handler(unreadNotificationsCountFn_createServerFn_handler, async () => {
	const user = await requireUser();
	const [row] = await (await loadDb()).select({ count: sql`count(*)::int` }).from(notifications).where(and(eq(notifications.userId, user.userId), isNull(notifications.readAt)));
	return row?.count ?? 0;
});
var updateNotificationPrefsFn_createServerFn_handler = createServerRpc({
	id: "4584eee1a4a2d22fef168bcc2707863d87dede1cda50f23596069ef414e66a62",
	name: "updateNotificationPrefsFn",
	filename: "src/modules/messaging/api/messaging.fn.ts"
}, (opts) => updateNotificationPrefsFn.__executeServer(opts));
var updateNotificationPrefsFn = createServerFn({ method: "POST" }).inputValidator(z.object({ notificationsEmail: z.boolean() })).handler(updateNotificationPrefsFn_createServerFn_handler, async ({ data }) => {
	const user = await requireUser();
	await (await loadDb()).update(userProfiles).set({
		notificationsEmail: data.notificationsEmail,
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(userProfiles.userId, user.userId));
	return { ok: true };
});
//#endregion
export { getThreadFn_createServerFn_handler, listNotificationsFn_createServerFn_handler, listThreadsFn_createServerFn_handler, markThreadReadFn_createServerFn_handler, sendMessageFn_createServerFn_handler, startThreadFn_createServerFn_handler, unreadNotificationsCountFn_createServerFn_handler, updateNotificationPrefsFn_createServerFn_handler };
