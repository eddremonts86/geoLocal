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
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, desc, eq, or } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import { listings, payments, userProfiles } from '@/shared/lib/db/schema'
import { requireUser } from '@/shared/lib/auth/guards'
import { consumeRateLimit } from '@/shared/lib/auth/rate-limit'
import { getPlatformFeeBps, getStripe } from '@/shared/lib/payments/stripe'

const APP_URL = process.env.PUBLIC_APP_URL ?? 'http://localhost:3001'

/**
 * Create (or refresh) a Stripe Connect Express onboarding link for the caller.
 * Persists the connected account id on first call.
 */
export const createConnectOnboardingFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({}).optional().default({}))
  .handler(async () => {
    const user = await requireUser()
    const db = await loadDb()
    const stripe = getStripe()

    const [profile] = await db
      .select({ stripeAccountId: userProfiles.stripeAccountId, email: userProfiles.email })
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.userId))
      .limit(1)

    let accountId = profile?.stripeAccountId ?? null
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'DK',
        email: profile?.email ?? undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { userId: user.userId },
      })
      accountId = account.id
      await db
        .insert(userProfiles)
        .values({ userId: user.userId, stripeAccountId: accountId })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: { stripeAccountId: accountId, updatedAt: new Date() },
        })
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${APP_URL}/account/payments/onboarding?refresh=1`,
      return_url: `${APP_URL}/account/payments/onboarding?return=1`,
      type: 'account_onboarding',
    })
    return { url: link.url, accountId }
  })

/**
 * Pull current onboarding status from Stripe and persist the booleans we care
 * about. Called when the seller returns from the hosted onboarding.
 */
export const refreshConnectStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({}).optional().default({}))
  .handler(async () => {
    const user = await requireUser()
    const db = await loadDb()
    const [profile] = await db
      .select({ stripeAccountId: userProfiles.stripeAccountId })
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.userId))
      .limit(1)
    if (!profile?.stripeAccountId) return null
    const stripe = getStripe()
    const account = await stripe.accounts.retrieve(profile.stripeAccountId)
    const set = {
      stripeChargesEnabled: !!account.charges_enabled,
      stripePayoutsEnabled: !!account.payouts_enabled,
      stripeDetailsSubmitted: !!account.details_submitted,
      updatedAt: new Date(),
    }
    await db.update(userProfiles).set(set).where(eq(userProfiles.userId, user.userId))
    return set
  })

/** Buyer-side — create a PaymentIntent for a published listing. */
export const createPaymentIntentFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      listingId: z.string().uuid(),
      amount: z.number().int().min(50), // minor units
      currency: z.string().length(3).default('DKK'),
      intent: z.enum(['sale', 'rent_deposit', 'booking', 'service']).default('sale'),
      threadId: z.string().uuid().optional(),
      description: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser()
    await consumeRateLimit({
      key: `user:${user.userId}:create_payment`,
      limit: 30,
      windowSec: 60 * 60,
    })
    const db = await loadDb()
    const stripe = getStripe()

    const [listing] = await db
      .select({
        id: listings.id,
        ownerId: listings.ownerId,
        status: listings.status,
        moderationStatus: listings.moderationStatus,
        title: listings.slug,
      })
      .from(listings)
      .where(eq(listings.id, data.listingId))
      .limit(1)
    if (!listing) throw Object.assign(new Error('NOT_FOUND'), { status: 404 })
    if (listing.status !== 'published' || listing.moderationStatus !== 'ok') {
      throw Object.assign(new Error('LISTING_UNAVAILABLE'), { status: 400 })
    }
    if (!listing.ownerId) throw Object.assign(new Error('LISTING_HAS_NO_OWNER'), { status: 400 })
    if (listing.ownerId === user.userId) throw Object.assign(new Error('SELF_PURCHASE'), { status: 400 })

    const [seller] = await db
      .select({
        stripeAccountId: userProfiles.stripeAccountId,
        chargesEnabled: userProfiles.stripeChargesEnabled,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, listing.ownerId))
      .limit(1)
    if (!seller?.stripeAccountId || !seller.chargesEnabled) {
      throw Object.assign(new Error('SELLER_NOT_ONBOARDED'), { status: 400 })
    }

    const feeBps = getPlatformFeeBps()
    const fee = Math.floor((data.amount * feeBps) / 10_000)

    const paymentIntent = await stripe.paymentIntents.create(
      {
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
          threadId: data.threadId ?? '',
        },
        description: data.description ?? `GeoLocal listing ${listing.id}`,
      },
      { idempotencyKey: `pi:${user.userId}:${listing.id}:${data.amount}:${Date.now() >> 12}` },
    )

    const [row] = await db
      .insert(payments)
      .values({
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
        metadata: paymentIntent.metadata as Record<string, unknown>,
      })
      .returning({ id: payments.id })

    return {
      paymentId: row.id,
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? null,
    }
  })

export const listMyPaymentsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ side: z.enum(['buyer', 'seller', 'both']).default('both') }).optional())
  .handler(async ({ data }) => {
    const user = await requireUser()
    const db = await loadDb()
    const side = data?.side ?? 'both'
    const where =
      side === 'buyer'
        ? eq(payments.buyerId, user.userId)
        : side === 'seller'
          ? eq(payments.sellerId, user.userId)
          : or(eq(payments.buyerId, user.userId), eq(payments.sellerId, user.userId))
    const rows = await db
      .select()
      .from(payments)
      .where(where)
      .orderBy(desc(payments.createdAt))
      .limit(200)
    // `metadata` is jsonb (`unknown`) and is not part of the wire contract.
    return rows.map(({ metadata: _meta, ...rest }) => rest)
  })

export const getPaymentFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    const db = await loadDb()
    const [row] = await db.select().from(payments).where(eq(payments.id, data.id)).limit(1)
    if (!row) throw Object.assign(new Error('NOT_FOUND'), { status: 404 })
    if (row.buyerId !== user.userId && row.sellerId !== user.userId && user.role !== 'admin') {
      throw Object.assign(new Error('FORBIDDEN'), { status: 403 })
    }
    const { metadata: _meta, ...rest } = row
    return rest
  })

/** Seller initiates a refund on a succeeded payment. */
export const refundPaymentFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid(), amount: z.number().int().min(50).optional() }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    const db = await loadDb()
    const [row] = await db.select().from(payments).where(eq(payments.id, data.id)).limit(1)
    if (!row) throw Object.assign(new Error('NOT_FOUND'), { status: 404 })
    if (row.sellerId !== user.userId && user.role !== 'admin') {
      throw Object.assign(new Error('FORBIDDEN'), { status: 403 })
    }
    if (row.status !== 'succeeded') throw Object.assign(new Error('NOT_REFUNDABLE'), { status: 400 })

    const stripe = getStripe()
    const refund = await stripe.refunds.create({
      payment_intent: row.stripePaymentIntentId!,
      amount: data.amount ?? undefined,
      refund_application_fee: true,
      reverse_transfer: true,
    })
    await db
      .update(payments)
      .set({
        status: 'refunded',
        stripeRefundId: refund.id,
        refundedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, row.id))
    return { ok: true, refundId: refund.id }
  })

/** Owner-only — list paid-out balance summary. */
export const getPayoutSummaryFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({}).optional().default({}))
  .handler(async () => {
    const user = await requireUser()
    const db = await loadDb()
    const [profile] = await db
      .select({ stripeAccountId: userProfiles.stripeAccountId })
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.userId))
      .limit(1)
    if (!profile?.stripeAccountId) return null
    const stripe = getStripe()
    const balance = await stripe.balance.retrieve(undefined, { stripeAccount: profile.stripeAccountId })
    return {
      available: balance.available,
      pending: balance.pending,
    }
  })

// Reference unused symbol to keep eslint happy in some bundlers
void and
