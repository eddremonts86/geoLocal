/**
 * Stripe SDK singleton + helpers.
 *
 * - Server-side import only (lazy). Never imported from client modules.
 * - Reads keys from env at first use; throws a clear error if missing so
 *   developers don't silently call mock endpoints.
 */
import Stripe from 'stripe'

let cached: Stripe | null = null

export function getStripe(): Stripe {
  if (cached) return cached
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set — payments are unavailable')
  }
  cached = new Stripe(key, {
    // Stripe SDK ships a narrow `apiVersion` literal type that lags behind the
    // dashboard. Pin to the version we tested against and silence the type.
    apiVersion: '2025-06-30.basil' as never,
    typescript: true,
    appInfo: { name: 'GeoLocal', version: '1.0.0' },
  })
  return cached
}

export function getWebhookSecret(): string {
  const v = process.env.STRIPE_WEBHOOK_SECRET
  if (!v) throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  return v
}

export function getPlatformFeeBps(): number {
  // 1 bp = 0.01 %. Default 5 % platform fee.
  const raw = process.env.STRIPE_PLATFORM_FEE_BPS
  const n = raw ? Number.parseInt(raw, 10) : 500
  if (!Number.isFinite(n) || n < 0 || n > 5_000) return 500
  return n
}
