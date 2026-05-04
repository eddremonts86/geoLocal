/**
 * Lightweight email transport.
 *
 * Tries Resend first (RESEND_API_KEY); falls back to console logging in dev.
 * Recipients are looked up in `user_profiles` and respect their
 * `notifications_email` preference.
 *
 * Never throws — email failures must not break the originating server fn.
 */
import { eq } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import { userProfiles } from '@/shared/lib/db/schema'

type ResendPayload = {
  from: string
  to: string
  subject: string
  text: string
  html?: string
}

async function sendViaResend(payload: ResendPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // dev fallback — never log full body, just metadata
    console.info('[mailer] (dry-run)', payload.to, payload.subject)
    return
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.warn('[mailer] resend failed', res.status, text.slice(0, 200))
    }
  } catch (err) {
    console.warn('[mailer] resend error', (err as Error).message)
  }
}

async function lookupRecipient(userId: string): Promise<{ email: string | null; optedIn: boolean } | null> {
  const db = await loadDb()
  const rows = await db
    .select({ email: userProfiles.email, notificationsEmail: userProfiles.notificationsEmail, bannedAt: userProfiles.bannedAt })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1)
  if (rows.length === 0) return null
  const r = rows[0]
  if (r.bannedAt) return null
  return { email: r.email, optedIn: r.notificationsEmail }
}

const FROM = process.env.MAIL_FROM ?? 'GeoLocal <noreply@geolocal.dev>'
const APP_URL = process.env.PUBLIC_APP_URL ?? 'http://localhost:3001'

export async function sendNewMessageEmail(args: {
  recipientUserId: string
  threadId: string
  body: string
}): Promise<void> {
  const recipient = await lookupRecipient(args.recipientUserId)
  if (!recipient || !recipient.email || !recipient.optedIn) return

  const preview = args.body.slice(0, 240)
  await sendViaResend({
    from: FROM,
    to: recipient.email,
    subject: 'You have a new message on GeoLocal',
    text: `You received a new message:\n\n"${preview}"\n\nReply: ${APP_URL}/account/messages/${args.threadId}\n\nIf you'd rather not get these, change your settings: ${APP_URL}/account/profile`,
  })
}

export async function sendListingFlaggedEmail(args: {
  recipientUserId: string
  listingId: string
  reason: string
}): Promise<void> {
  const recipient = await lookupRecipient(args.recipientUserId)
  if (!recipient || !recipient.email || !recipient.optedIn) return
  await sendViaResend({
    from: FROM,
    to: recipient.email,
    subject: 'Your listing has been flagged',
    text: `A moderator flagged your listing.\nReason: ${args.reason}\n\nReview it: ${APP_URL}/account/listings`,
  })
}

export async function sendPaymentReceiptEmail(args: {
  recipientUserId: string
  paymentId: string
  amount: number
  currency: string
}): Promise<void> {
  const recipient = await lookupRecipient(args.recipientUserId)
  if (!recipient || !recipient.email || !recipient.optedIn) return
  const formatted = new Intl.NumberFormat('en-DK', { style: 'currency', currency: args.currency }).format(
    args.amount / 100,
  )
  await sendViaResend({
    from: FROM,
    to: recipient.email,
    subject: `Receipt — ${formatted}`,
    text: `Thanks for your payment of ${formatted}.\n\nView details: ${APP_URL}/account/payments/${args.paymentId}`,
  })
}
