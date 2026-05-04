/**
 * Stripe webhook handler.
 *
 * Stripe POSTs JSON events here with a `stripe-signature` header. We:
 *  1. read the raw body (NEVER pre-parse — the signature covers raw bytes)
 *  2. verify the signature with `STRIPE_WEBHOOK_SECRET`
 *  3. record the event in `stripe_events` (idempotency: PK = stripe id)
 *  4. fan out side-effects per event type
 *
 * Errors return a 400 — Stripe will retry. We treat already-processed events
 * as success (200) to stop retries.
 */
import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import { payments, stripeEvents } from '@/shared/lib/db/schema'
import { getStripe, getWebhookSecret } from '@/shared/lib/payments/stripe'
import { sendPaymentReceiptEmail } from '@/shared/lib/notifications/mailer'

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sig = request.headers.get('stripe-signature')
        if (!sig) return new Response('Missing signature', { status: 400 })

        const stripe = getStripe()
        const secret = getWebhookSecret()
        const raw = await request.text()

        let event
        try {
          event = stripe.webhooks.constructEvent(raw, sig, secret)
        } catch (err) {
          return new Response(`Bad signature: ${(err as Error).message}`, { status: 400 })
        }

        const db = await loadDb()
        // idempotency: insert with PK; on conflict do nothing → already processed.
        const inserted = await db
          .insert(stripeEvents)
          .values({ id: event.id, type: event.type, payload: event as unknown as Record<string, unknown> })
          .onConflictDoNothing({ target: stripeEvents.id })
          .returning({ id: stripeEvents.id })
        if (inserted.length === 0) {
          return new Response('Already processed', { status: 200 })
        }

        try {
          await dispatchStripeEvent(event)
          await db
            .update(stripeEvents)
            .set({ processedAt: new Date() })
            .where(eq(stripeEvents.id, event.id))
          return new Response('ok', { status: 200 })
        } catch (err) {
          await db
            .update(stripeEvents)
            .set({ error: (err as Error).message })
            .where(eq(stripeEvents.id, event.id))
          // Return 500 so Stripe retries.
          return new Response('error', { status: 500 })
        }
      },
    },
  },
})

async function dispatchStripeEvent(event: { type: string; data: { object: unknown } }) {
  const db = await loadDb()
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as {
        id: string
        latest_charge?: string | null
        metadata?: Record<string, string>
      }
      const updated = await db
        .update(payments)
        .set({
          status: 'succeeded',
          stripeChargeId: pi.latest_charge ?? null,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.stripePaymentIntentId, pi.id))
        .returning({
          id: payments.id,
          buyerId: payments.buyerId,
          sellerId: payments.sellerId,
          amount: payments.amountTotal,
          currency: payments.currency,
        })
      if (updated[0]) {
        const row = updated[0]
        void sendPaymentReceiptEmail({
          recipientUserId: row.buyerId,
          paymentId: row.id,
          amount: row.amount,
          currency: row.currency,
        })
      }
      return
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as { id: string; last_payment_error?: { message?: string } }
      await db
        .update(payments)
        .set({
          status: 'failed',
          failedAt: new Date(),
          metadata: { error: pi.last_payment_error?.message ?? null } as Record<string, unknown>,
          updatedAt: new Date(),
        })
        .where(eq(payments.stripePaymentIntentId, pi.id))
      return
    }
    case 'charge.refunded': {
      const ch = event.data.object as { id: string; payment_intent: string }
      await db
        .update(payments)
        .set({ status: 'refunded', refundedAt: new Date(), updatedAt: new Date() })
        .where(eq(payments.stripePaymentIntentId, ch.payment_intent))
      return
    }
    case 'account.updated': {
      // Connect onboarding progress — handled via `refreshConnectStatusFn`
      // when the seller returns to our app. No fan-out needed.
      return
    }
    default:
      // unhandled type — still 200, Stripe will not retry
      return
  }
}
