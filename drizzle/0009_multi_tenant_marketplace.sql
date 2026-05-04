-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 0009 — Multi-tenant marketplace
--  Adds user-generated listings, messaging, moderation, profiles and Stripe-
--  Connect-ready payments. Single migration intentionally — keeps related
--  schema changes applied atomically.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Phase 1 — Listing ownership ────────────────────────────────────────────
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS source_kind        varchar(20)  NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS visibility         varchar(20)  NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS contact_method     varchar(20)  NOT NULL DEFAULT 'in_app',
  ADD COLUMN IF NOT EXISTS contact_email      text,
  ADD COLUMN IF NOT EXISTS contact_phone      text,
  ADD COLUMN IF NOT EXISTS contact_url        text,
  ADD COLUMN IF NOT EXISTS moderation_status  varchar(20)  NOT NULL DEFAULT 'ok',
  ADD COLUMN IF NOT EXISTS moderation_note    text,
  ADD COLUMN IF NOT EXISTS view_count         integer      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contact_count      integer      NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_listings_owner       ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_moderation  ON listings(moderation_status);
CREATE INDEX IF NOT EXISTS idx_listings_source_kind ON listings(source_kind);

-- Tag every legacy/scraped row so the source_kind discriminator is meaningful.
UPDATE listings
   SET source_kind = 'scraped'
 WHERE owner_id IS NULL
   AND source_kind = 'user';

-- ── Phase 1 — User profiles (Clerk-keyed) ─────────────────────────────────
-- Identity is owned by Clerk; this table holds marketplace-domain extras.
-- PK matches the Clerk user id we receive from `auth().userId`.
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id              text PRIMARY KEY,
  handle               varchar(40)  UNIQUE,
  display_name         text,
  bio                  text,
  avatar_url           text,
  email                text,
  phone                text,
  phone_verified       boolean      NOT NULL DEFAULT false,
  preferred_locale     varchar(5)   NOT NULL DEFAULT 'en',
  notifications_email  boolean      NOT NULL DEFAULT true,
  role                 varchar(20)  NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  banned_at            timestamp,
  banned_reason        text,
  -- Stripe Connect
  stripe_account_id        text UNIQUE,
  stripe_charges_enabled   boolean NOT NULL DEFAULT false,
  stripe_payouts_enabled   boolean NOT NULL DEFAULT false,
  stripe_details_submitted boolean NOT NULL DEFAULT false,
  -- Stripe Customer (for buyers)
  stripe_customer_id   text UNIQUE,
  created_at           timestamp NOT NULL DEFAULT now(),
  updated_at           timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_profiles_handle  ON user_profiles(handle);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role    ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_banned  ON user_profiles(banned_at);

-- ── Phase 2 — Messaging ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS threads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      uuid REFERENCES listings(id) ON DELETE SET NULL,
  subject         text,
  status          varchar(20) NOT NULL DEFAULT 'open', -- open|archived|blocked
  created_at      timestamp NOT NULL DEFAULT now(),
  last_message_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_threads_listing      ON threads(listing_id);
CREATE INDEX IF NOT EXISTS idx_threads_last_message ON threads(last_message_at DESC);

CREATE TABLE IF NOT EXISTS thread_participants (
  thread_id     uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id       text NOT NULL,                     -- Clerk userId
  role          varchar(20) NOT NULL,              -- owner|inquirer
  joined_at     timestamp NOT NULL DEFAULT now(),
  last_read_at  timestamp,
  muted         boolean NOT NULL DEFAULT false,
  PRIMARY KEY (thread_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user ON thread_participants(user_id);

CREATE TABLE IF NOT EXISTS messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id    text NOT NULL,                      -- Clerk userId
  body         text NOT NULL,
  body_format  varchar(10) NOT NULL DEFAULT 'plain',
  attachments  jsonb,
  created_at   timestamp NOT NULL DEFAULT now(),
  edited_at    timestamp,
  deleted_at   timestamp
);
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender         ON messages(sender_id);

CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL,                       -- Clerk userId
  kind        varchar(40) NOT NULL,                -- message.new | listing.flagged | payout.paid | …
  payload     jsonb NOT NULL,
  read_at     timestamp,
  created_at  timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- ── Phase 3 — Reports & rate limits ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listing_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_id  text,                                -- Clerk userId, nullable for anonymous
  reason       varchar(40) NOT NULL,
  details      text,
  resolved_at  timestamp,
  resolved_by  text,
  created_at   timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_listing_reports_listing  ON listing_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_resolved ON listing_reports(resolved_at);

-- Persistent rate-limit buckets so quotas survive restarts and scale to >1 worker.
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key   text NOT NULL,                       -- e.g. user:abc:create_listing
  window_start timestamp NOT NULL,                  -- start of the current window
  count        integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start)
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_window ON rate_limit_buckets(window_start);

-- ── Payments — Stripe Connect ──────────────────────────────────────────────
-- A single payments table for one-off listing transactions (sale/rent deposit/
-- service booking). Uses Stripe Connect direct charges with a platform fee.
CREATE TABLE IF NOT EXISTS payments (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id               uuid REFERENCES listings(id) ON DELETE SET NULL,
  thread_id                uuid REFERENCES threads(id)  ON DELETE SET NULL,
  buyer_id                 text NOT NULL,
  seller_id                text NOT NULL,
  -- amounts in minor units (øre / cents)
  amount_total             integer NOT NULL,
  amount_application_fee   integer NOT NULL DEFAULT 0,
  currency                 varchar(3) NOT NULL DEFAULT 'DKK',
  status                   varchar(30) NOT NULL DEFAULT 'requires_payment_method',
  -- 'requires_payment_method'|'requires_confirmation'|'requires_action'
  -- 'processing'|'succeeded'|'canceled'|'failed'|'refunded'
  intent                   varchar(20) NOT NULL DEFAULT 'sale', -- sale|rent_deposit|booking|service
  description              text,
  metadata                 jsonb,
  -- Stripe identifiers
  stripe_payment_intent_id text UNIQUE,
  stripe_charge_id         text,
  stripe_transfer_id       text,
  stripe_refund_id         text,
  client_secret            text,
  -- lifecycle timestamps
  created_at               timestamp NOT NULL DEFAULT now(),
  updated_at               timestamp NOT NULL DEFAULT now(),
  paid_at                  timestamp,
  refunded_at              timestamp,
  failed_at                timestamp
);
CREATE INDEX IF NOT EXISTS idx_payments_buyer    ON payments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payments_seller   ON payments(seller_id);
CREATE INDEX IF NOT EXISTS idx_payments_listing  ON payments(listing_id);
CREATE INDEX IF NOT EXISTS idx_payments_status   ON payments(status);

-- Webhook event log — idempotency + audit trail.
CREATE TABLE IF NOT EXISTS stripe_events (
  id            text PRIMARY KEY,                   -- evt_…
  type          varchar(80) NOT NULL,
  payload       jsonb NOT NULL,
  processed_at  timestamp,
  error         text,
  received_at   timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type      ON stripe_events(type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON stripe_events(processed_at);

-- ── Listing analytics ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listing_views (
  id          bigserial PRIMARY KEY,
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewer_id   text,                                 -- Clerk userId or null
  ip_hash     varchar(64),                          -- sha256(ip + UA), no raw PII
  referrer    text,
  created_at  timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing ON listing_views(listing_id, created_at DESC);
