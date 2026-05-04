import { t as createServerFn } from "../server.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { z } from "zod";
import "drizzle-orm";
//#region src/modules/payments/api/payments.fn.ts
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
/**
* Create (or refresh) a Stripe Connect Express onboarding link for the caller.
* Persists the connected account id on first call.
*/
var createConnectOnboardingFn = createServerFn({ method: "POST" }).inputValidator(z.object({}).optional().default({})).handler(createSsrRpc("9ebdf54f03a8e6cfc7e2fe203fe7ac11abbdeba8bd21dc317173e558a253e600"));
/**
* Pull current onboarding status from Stripe and persist the booleans we care
* about. Called when the seller returns from the hosted onboarding.
*/
var refreshConnectStatusFn = createServerFn({ method: "POST" }).inputValidator(z.object({}).optional().default({})).handler(createSsrRpc("0b7d353ced5acd9a035f2f889693d78e13beece31560e3addb8aec3fb626606f"));
/** Buyer-side — create a PaymentIntent for a published listing. */
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
})).handler(createSsrRpc("028c64a85733bda4fe4156fe62741e93a85d4f4d78d0145ae4f81040af30e0fc"));
var listMyPaymentsFn = createServerFn({ method: "GET" }).inputValidator(z.object({ side: z.enum([
	"buyer",
	"seller",
	"both"
]).default("both") }).optional()).handler(createSsrRpc("5f1b32affda33a51f37f9622413c5aba3b5eada66c96c924ee15bed1c1b30e40"));
createServerFn({ method: "GET" }).inputValidator(z.object({ id: z.string().uuid() })).handler(createSsrRpc("b3bc083202076133314332581c96fdb7f2e526337322e215bf101f6883e18651"));
createServerFn({ method: "POST" }).inputValidator(z.object({
	id: z.string().uuid(),
	amount: z.number().int().min(50).optional()
})).handler(createSsrRpc("dd68cad698abf0b693c55065100188977a32d0b288d65c1f1dac3104619d7f38"));
/** Owner-only — list paid-out balance summary. */
var getPayoutSummaryFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional().default({})).handler(createSsrRpc("dd57ebc24f788ba734fa6c95be0113e75a17aed8895cb5b12acc3df4ae17e5bf"));
//#endregion
export { refreshConnectStatusFn as a, listMyPaymentsFn as i, createPaymentIntentFn as n, getPayoutSummaryFn as r, createConnectOnboardingFn as t };
