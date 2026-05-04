import Stripe from "stripe";
//#region src/shared/lib/payments/stripe.ts
/**
* Stripe SDK singleton + helpers.
*
* - Server-side import only (lazy). Never imported from client modules.
* - Reads keys from env at first use; throws a clear error if missing so
*   developers don't silently call mock endpoints.
*/
var cached = null;
function getStripe() {
	if (cached) return cached;
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) throw new Error("STRIPE_SECRET_KEY is not set — payments are unavailable");
	cached = new Stripe(key, {
		apiVersion: "2025-06-30.basil",
		typescript: true,
		appInfo: {
			name: "GeoLocal",
			version: "1.0.0"
		}
	});
	return cached;
}
function getWebhookSecret() {
	const v = process.env.STRIPE_WEBHOOK_SECRET;
	if (!v) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
	return v;
}
function getPlatformFeeBps() {
	const raw = process.env.STRIPE_PLATFORM_FEE_BPS;
	const n = raw ? Number.parseInt(raw, 10) : 500;
	if (!Number.isFinite(n) || n < 0 || n > 5e3) return 500;
	return n;
}
//#endregion
export { getStripe as n, getWebhookSecret as r, getPlatformFeeBps as t };
