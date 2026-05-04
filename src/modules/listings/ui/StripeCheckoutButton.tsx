/**
 * Stripe Elements checkout button.
 *
 * Two-stage flow:
 *  1. Click "Buy" → we POST `createPaymentIntentFn` to get a `client_secret`
 *     for the listing/seller's connected account (with `application_fee_amount`).
 *  2. We mount Stripe `<Elements>` with `<PaymentElement>` and confirm. On
 *     success Stripe redirects to `return_url` which lands on
 *     `/account/payments` where the webhook will have already marked the
 *     payment succeeded.
 *
 * SECURITY: PaymentIntent creation runs server-side (with auth + rate limit).
 * The client never sees seller account ids — only the public client secret.
 */
import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { createPaymentIntentFn } from '@/modules/payments/api/payments.fn'

let stripePromise: Promise<Stripe | null> | null = null
function getStripeJs(): Promise<Stripe | null> {
  if (stripePromise) return stripePromise
  const pk = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined) ?? ''
  if (!pk) {
    // eslint-disable-next-line no-console
    console.warn('[StripeCheckoutButton] VITE_STRIPE_PUBLISHABLE_KEY is not set')
    return Promise.resolve(null)
  }
  stripePromise = loadStripe(pk)
  return stripePromise
}

interface Props {
  listingId: string
  amount: number
  currency: string
  intent: 'sale' | 'rent_deposit' | 'service' | 'booking'
  label?: string
}

export function StripeCheckoutButton(props: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  if (!clientSecret) {
    return (
      <div>
        <button
          type="button"
          disabled={creating}
          onClick={async () => {
            setErr(null)
            setCreating(true)
            try {
              const res = await createPaymentIntentFn({
                data: {
                  listingId: props.listingId,
                  amount: props.amount,
                  currency: props.currency,
                  intent: props.intent,
                },
              })
              if (!res.clientSecret) throw new Error('Payment could not be initiated')
              setClientSecret(res.clientSecret)
              setPaymentId(res.paymentId)
            } catch (e) {
              setErr((e as Error).message ?? 'Could not start checkout')
            } finally {
              setCreating(false)
            }
          }}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? 'Loading…' : (props.label ?? `Buy now · ${(props.amount / 100).toFixed(2)} ${props.currency}`)}
        </button>
        {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
      </div>
    )
  }

  return (
    <Elements stripe={getStripeJs()} options={{ clientSecret }}>
      <CheckoutForm paymentId={paymentId!} />
    </Elements>
  )
}

function CheckoutForm({ paymentId }: { paymentId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!stripe || !elements) return
        setSubmitting(true)
        setErr(null)
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/account/payments?p=${paymentId}`,
          },
        })
        if (error) {
          setErr(error.message ?? 'Payment failed')
          setSubmitting(false)
        }
        // On success Stripe redirects, no further state needed.
      }}
      className="space-y-3 rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <PaymentElement />
      {err && <p className="text-xs text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? 'Processing…' : 'Pay'}
      </button>
    </form>
  )
}
