import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as loadDb } from "./load-gagVjFt5.js";
import { p as payments, u as listings, x as userProfiles } from "./schema-Bm7YGE-a.js";
import { r as requireUser } from "./guards-S7H8UmzC.js";
import { t as consumeRateLimit } from "./rate-limit-EW6IDPqE.js";
import { n as getStripe, t as getPlatformFeeBps } from "./stripe-BT_rw8Q4.js";
import { z } from "zod";
import { desc, eq, or } from "drizzle-orm";
//#region src/modules/payments/api/payments.fn.ts?tss-serverfn-split
/**
* Stripe Connect — payments server functions.
*
* Flow:
* 1. Seller calls `createConnectOnboardingFn` → redirected to Stripe to set up
*    their `Express` connected account. We persist `stripe_account_id`.
* 2. Buyer presses "Buy / Reserve" on a listing → `createPaymentIntentFn`
*    creates a PaymentIntent with `transfer_data.destination = seller account`
*    and `application_fee_amount` = platform cut. Returns `clientSecret`.
* 3. Client confirms with Stripe.js. Webhook updates payment.status to
*    'succeeded'/'failed'.
*
* Authz:
* - Seller flows: `requireUser()` + ownership of the seller account.
* - Buyer flows: `requireUser()` + listing must be published & not the
*   caller's own listing.
*/
var APP_URL = process.env.PUBLIC_APP_URL ?? "http://localhost:3001";
/**
* Create (or refresh) a Stripe Connect Express onboarding link for the caller.
* Persists the connected account id on first call.
*/
var createConnectOnboardingFn_createServerFn_handler = createServerRpc({
	id: "9ebdf54f03a8e6cfc7e2fe203fe7ac11abbdeba8bd21dc317173e558a253e600",
	name: "createConnectOnboardingFn",
	filename: "src/modules/payments/api/payments.fn.ts"
}, (opts) => createConnectOnboardingFn.__executeServer(opts));
var createConnectOnboardingFn = createServerFn({ method: "POST" }).inputValidator(z.object({}).optional().default({})).handler(createConnectOnboardingFn_createServerFn_handler, async () => {
	const user = await requireUser();
	const db = await loadDb();
	const stripe = getStripe();
	const [profile] = await db.select({
		stripeAccountId: userProfiles.stripeAccountId,
		email: userProfiles.email
	}).from(userProfiles).where(eq(userProfiles.userId, user.userId)).limit(1);
	let accountId = profile?.stripeAccountId ?? null;
	if (!accountId) {
		accountId = (await stripe.accounts.create({
			type: "express",
			country: "DK",
			email: profile?.email ?? void 0,
			capabilities: {
				card_payments: { requested: true },
				transfers: { requested: true }
			},
			metadata: { userId: user.userId }
		})).id;
		await db.insert(userProfiles).values({
			userId: user.userId,
			stripeAccountId: accountId
		}).onConflictDoUpdate({
			target: userProfiles.userId,
			set: {
				stripeAccountId: accountId,
				updatedAt: /* @__PURE__ */ new Date()
			}
		});
	}
	return {
		url: (await stripe.accountLinks.create({
			account: accountId,
			refresh_url: `${APP_URL}/account/payments/onboarding?refresh=1`,
			return_url: `${APP_URL}/account/payments/onboarding?return=1`,
			type: "account_onboarding"
		})).url,
		accountId
	};
});
var refreshConnectStatusFn_createServerFn_handler = createServerRpc({
	id: "0b7d353ced5acd9a035f2f889693d78e13beece31560e3addb8aec3fb626606f",
	name: "refreshConnectStatusFn",
	filename: "src/modules/payments/api/payments.fn.ts"
}, (opts) => refreshConnectStatusFn.__executeServer(opts));
var refreshConnectStatusFn = createServerFn({ method: "POST" }).inputValidator(z.object({}).optional().default({})).handler(refreshConnectStatusFn_createServerFn_handler, async () => {
	const user = await requireUser();
	const db = await loadDb();
	const [profile] = await db.select({ stripeAccountId: userProfiles.stripeAccountId }).from(userProfiles).where(eq(userProfiles.userId, user.userId)).limit(1);
	if (!profile?.stripeAccountId) return null;
	const account = await getStripe().accounts.retrieve(profile.stripeAccountId);
	const set = {
		stripeChargesEnabled: !!account.charges_enabled,
		stripePayoutsEnabled: !!account.payouts_enabled,
		stripeDetailsSubmitted: !!account.details_submitted,
		updatedAt: /* @__PURE__ */ new Date()
	};
	await db.update(userProfiles).set(set).where(eq(userProfiles.userId, user.userId));
	return set;
});
var createPaymentIntentFn_createServerFn_handler = createServerRpc({
	id: "028c64a85733bda4fe4156fe62741e93a85d4f4d78d0145ae4f81040af30e0fc",
	name: "createPaymentIntentFn",
	filename: "src/modules/payments/api/payments.fn.ts"
}, (opts) => createPaymentIntentFn.__executeServer(opts));
var createPaymentIntentFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	listingId: z.string().uuid(),
	amount: z.number().int().min(50),
	currency: z.string().length(3).default("DKK"),
	intent: z.enum([
		"sale",
		"rent_deposit",
		"booking",
		"service"
	]).default("sale"),
	threadId: z.string().uuid().optional(),
	description: z.string().max(500).optional()
})).handler(createPaymentIntentFn_createServerFn_handler, async ({ data }) => {
	const user = await requireUser();
	await consumeRateLimit({
		key: `user:${user.userId}:create_payment`,
		limit: 30,
		windowSec: 3600
	});
	const db = await loadDb();
	const stripe = getStripe();
	const [listing] = await db.select({
		id: listings.id,
		ownerId: listings.ownerId,
		status: listings.status,
		moderationStatus: listings.moderationStatus,
		title: listings.slug
	}).from(listings).where(eq(listings.id, data.listingId)).limit(1);
	if (!listing) throw Object.assign(/* @__PURE__ */ new Error("NOT_FOUND"), { status: 404 });
	if (listing.status !== "published" || listing.moderationStatus !== "ok") throw Object.assign(/* @__PURE__ */ new Error("LISTING_UNAVAILABLE"), { status: 400 });
	if (!listing.ownerId) throw Object.assign(/* @__PURE__ */ new Error("LISTING_HAS_NO_OWNER"), { status: 400 });
	if (listing.ownerId === user.userId) throw Object.assign(/* @__PURE__ */ new Error("SELF_PURCHASE"), { status: 400 });
	const [seller] = await db.select({
		stripeAccountId: userProfiles.stripeAccountId,
		chargesEnabled: userProfiles.stripeChargesEnabled
	}).from(userProfiles).where(eq(userProfiles.userId, listing.ownerId)).limit(1);
	if (!seller?.stripeAccountId || !seller.chargesEnabled) throw Object.assign(/* @__PURE__ */ new Error("SELLER_NOT_ONBOARDED"), { status: 400 });
	const feeBps = getPlatformFeeBps();
	const fee = Math.floor(data.amount * feeBps / 1e4);
	const paymentIntent = await stripe.paymentIntents.create({
		amount: data.amount,
		currency: data.currency.toLowerCase(),
		automatic_payment_methods: { enabled: true },
		application_fee_amount: fee,
		transfer_data: { destination: seller.stripeAccountId },
		metadata: {
			listingId: listing.id,
			buyerId: user.userId,
			sellerId: listing.ownerId,
			intent: data.intent,
			threadId: data.threadId ?? ""
		},
		description: data.description ?? `GeoLocal listing ${listing.id}`
	}, { idempotencyKey: `pi:${user.userId}:${listing.id}:${data.amount}:${Date.now() >> 12}` });
	const [row] = await db.insert(payments).values({
		listingId: listing.id,
		threadId: data.threadId ?? null,
		buyerId: user.userId,
		sellerId: listing.ownerId,
		amountTotal: data.amount,
		amountApplicationFee: fee,
		currency: data.currency.toUpperCase(),
		status: paymentIntent.status,
		intent: data.intent,
		description: data.description ?? null,
		stripePaymentIntentId: paymentIntent.id,
		clientSecret: paymentIntent.client_secret ?? null,
		metadata: paymentIntent.metadata
	}).returning({ id: payments.id });
	return {
		paymentId: row.id,
		clientSecret: paymentIntent.client_secret,
		publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? null
	};
});
var listMyPaymentsFn_createServerFn_handler = createServerRpc({
	id: "5f1b32affda33a51f37f9622413c5aba3b5eada66c96c924ee15bed1c1b30e40",
	name: "listMyPaymentsFn",
	filename: "src/modules/payments/api/payments.fn.ts"
}, (opts) => listMyPaymentsFn.__executeServer(opts));
var listMyPaymentsFn = createServerFn({ method: "GET" }).inputValidator(z.object({ side: z.enum([
	"buyer",
	"seller",
	"both"
]).default("both") }).optional()).handler(listMyPaymentsFn_createServerFn_handler, async ({ data }) => {
	const user = await requireUser();
	const db = await loadDb();
	const side = data?.side ?? "both";
	const where = side === "buyer" ? eq(payments.buyerId, user.userId) : side === "seller" ? eq(payments.sellerId, user.userId) : or(eq(payments.buyerId, user.userId), eq(payments.sellerId, user.userId));
	return (await db.select().from(payments).where(where).orderBy(desc(payments.createdAt)).limit(200)).map(({ metadata: _meta, ...rest }) => rest);
});
var getPaymentFn_createServerFn_handler = createServerRpc({
	id: "b3bc083202076133314332581c96fdb7f2e526337322e215bf101f6883e18651",
	name: "getPaymentFn",
	filename: "src/modules/payments/api/payments.fn.ts"
}, (opts) => getPaymentFn.__executeServer(opts));
var getPaymentFn = createServerFn({ method: "GET" }).inputValidator(z.object({ id: z.string().uuid() })).handler(getPaymentFn_createServerFn_handler, async ({ data }) => {
	const user = await requireUser();
	const [row] = await (await loadDb()).select().from(payments).where(eq(payments.id, data.id)).limit(1);
	if (!row) throw Object.assign(/* @__PURE__ */ new Error("NOT_FOUND"), { status: 404 });
	if (row.buyerId !== user.userId && row.sellerId !== user.userId && user.role !== "admin") throw Object.assign(/* @__PURE__ */ new Error("FORBIDDEN"), { status: 403 });
	const { metadata: _meta, ...rest } = row;
	return rest;
});
var refundPaymentFn_createServerFn_handler = createServerRpc({
	id: "dd68cad698abf0b693c55065100188977a32d0b288d65c1f1dac3104619d7f38",
	name: "refundPaymentFn",
	filename: "src/modules/payments/api/payments.fn.ts"
}, (opts) => refundPaymentFn.__executeServer(opts));
var refundPaymentFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	id: z.string().uuid(),
	amount: z.number().int().min(50).optional()
})).handler(refundPaymentFn_createServerFn_handler, async ({ data }) => {
	const user = await requireUser();
	const db = await loadDb();
	const [row] = await db.select().from(payments).where(eq(payments.id, data.id)).limit(1);
	if (!row) throw Object.assign(/* @__PURE__ */ new Error("NOT_FOUND"), { status: 404 });
	if (row.sellerId !== user.userId && user.role !== "admin") throw Object.assign(/* @__PURE__ */ new Error("FORBIDDEN"), { status: 403 });
	if (row.status !== "succeeded") throw Object.assign(/* @__PURE__ */ new Error("NOT_REFUNDABLE"), { status: 400 });
	const refund = await getStripe().refunds.create({
		payment_intent: row.stripePaymentIntentId,
		amount: data.amount ?? void 0,
		refund_application_fee: true,
		reverse_transfer: true
	});
	await db.update(payments).set({
		status: "refunded",
		stripeRefundId: refund.id,
		refundedAt: /* @__PURE__ */ new Date(),
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(payments.id, row.id));
	return {
		ok: true,
		refundId: refund.id
	};
});
var getPayoutSummaryFn_createServerFn_handler = createServerRpc({
	id: "dd57ebc24f788ba734fa6c95be0113e75a17aed8895cb5b12acc3df4ae17e5bf",
	name: "getPayoutSummaryFn",
	filename: "src/modules/payments/api/payments.fn.ts"
}, (opts) => getPayoutSummaryFn.__executeServer(opts));
var getPayoutSummaryFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional().default({})).handler(getPayoutSummaryFn_createServerFn_handler, async () => {
	const user = await requireUser();
	const [profile] = await (await loadDb()).select({ stripeAccountId: userProfiles.stripeAccountId }).from(userProfiles).where(eq(userProfiles.userId, user.userId)).limit(1);
	if (!profile?.stripeAccountId) return null;
	const balance = await getStripe().balance.retrieve(void 0, { stripeAccount: profile.stripeAccountId });
	return {
		available: balance.available,
		pending: balance.pending
	};
});
//#endregion
export { createConnectOnboardingFn_createServerFn_handler, createPaymentIntentFn_createServerFn_handler, getPaymentFn_createServerFn_handler, getPayoutSummaryFn_createServerFn_handler, listMyPaymentsFn_createServerFn_handler, refreshConnectStatusFn_createServerFn_handler, refundPaymentFn_createServerFn_handler };
