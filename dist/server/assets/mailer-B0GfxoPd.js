import { t as loadDb } from "./load-gagVjFt5.js";
import { x as userProfiles } from "./schema-Bm7YGE-a.js";
import { eq } from "drizzle-orm";
//#region src/shared/lib/notifications/mailer.ts
/**
* Lightweight email transport.
*
* Tries Resend first (RESEND_API_KEY); falls back to console logging in dev.
* Recipients are looked up in `user_profiles` and respect their
* `notifications_email` preference.
*
* Never throws — email failures must not break the originating server fn.
*/
async function sendViaResend(payload) {
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) {
		console.info("[mailer] (dry-run)", payload.to, payload.subject);
		return;
	}
	try {
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			console.warn("[mailer] resend failed", res.status, text.slice(0, 200));
		}
	} catch (err) {
		console.warn("[mailer] resend error", err.message);
	}
}
async function lookupRecipient(userId) {
	const rows = await (await loadDb()).select({
		email: userProfiles.email,
		notificationsEmail: userProfiles.notificationsEmail,
		bannedAt: userProfiles.bannedAt
	}).from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
	if (rows.length === 0) return null;
	const r = rows[0];
	if (r.bannedAt) return null;
	return {
		email: r.email,
		optedIn: r.notificationsEmail
	};
}
var FROM = process.env.MAIL_FROM ?? "GeoLocal <noreply@geolocal.dev>";
var APP_URL = process.env.PUBLIC_APP_URL ?? "http://localhost:3001";
async function sendNewMessageEmail(args) {
	const recipient = await lookupRecipient(args.recipientUserId);
	if (!recipient || !recipient.email || !recipient.optedIn) return;
	const preview = args.body.slice(0, 240);
	await sendViaResend({
		from: FROM,
		to: recipient.email,
		subject: "You have a new message on GeoLocal",
		text: `You received a new message:\n\n"${preview}"\n\nReply: ${APP_URL}/account/messages/${args.threadId}\n\nIf you'd rather not get these, change your settings: ${APP_URL}/account/profile`
	});
}
async function sendListingFlaggedEmail(args) {
	const recipient = await lookupRecipient(args.recipientUserId);
	if (!recipient || !recipient.email || !recipient.optedIn) return;
	await sendViaResend({
		from: FROM,
		to: recipient.email,
		subject: "Your listing has been flagged",
		text: `A moderator flagged your listing.\nReason: ${args.reason}\n\nReview it: ${APP_URL}/account/listings`
	});
}
async function sendPaymentReceiptEmail(args) {
	const recipient = await lookupRecipient(args.recipientUserId);
	if (!recipient || !recipient.email || !recipient.optedIn) return;
	const formatted = new Intl.NumberFormat("en-DK", {
		style: "currency",
		currency: args.currency
	}).format(args.amount / 100);
	await sendViaResend({
		from: FROM,
		to: recipient.email,
		subject: `Receipt — ${formatted}`,
		text: `Thanks for your payment of ${formatted}.\n\nView details: ${APP_URL}/account/payments/${args.paymentId}`
	});
}
//#endregion
export { sendNewMessageEmail as n, sendPaymentReceiptEmail as r, sendListingFlaggedEmail as t };
