import {
  pgTable,
  text,
  timestamp,
  integer,
  bigserial,
  boolean,
  pgEnum,
  doublePrecision,
  primaryKey,
  uuid,
  varchar,
  index,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const listingTypeEnum = pgEnum('listing_type', ['sale', 'rent'])
export const propertyTypeEnum = pgEnum('property_type', [
  'house',
  'apartment',
  'condo',
  'land',
])
export const propertyStatusEnum = pgEnum('property_status', [
  'draft',
  'published',
  'archived',
])
export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])
export const assetKindEnum = pgEnum('asset_kind', ['image', 'video', 'floor_plan'])

// New multi-category enums
export const listingCategoryEnum = pgEnum('listing_category', [
  'property',
  'vehicle',
  'service',
  'experience',
])
export const transactionTypeEnum = pgEnum('transaction_type', [
  'buy',
  'rent',
  'hire',
])
export const fuelTypeEnum = pgEnum('fuel_type', [
  'gasoline',
  'diesel',
  'electric',
  'hybrid',
])
export const transmissionTypeEnum = pgEnum('transmission_type', [
  'manual',
  'automatic',
])
export const pricePeriodEnum = pgEnum('price_period', [
  'one_time',
  'monthly',
  'daily',
  'hourly',
])

// ─── Auth tables (Better Auth compatible) ─────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: userRoleEnum('role').notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

// ─── Property tables ──────────────────────────────────────────────────────────

export const properties = pgTable(
  'properties',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    listingType: listingTypeEnum('listing_type').notNull(),
    propertyType: propertyTypeEnum('property_type').notNull(),
    status: propertyStatusEnum('status').notNull().default('draft'),
    price: integer('price').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    bedrooms: integer('bedrooms'),
    bathrooms: integer('bathrooms'),
    areaM2: doublePrecision('area_m2'),
    lotM2: doublePrecision('lot_m2'),
    parkingSpaces: integer('parking_spaces'),
    floorNumber: integer('floor_number'),
    yearBuilt: integer('year_built'),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    addressLine1: text('address_line1').notNull(),
    city: varchar('city', { length: 255 }).notNull(),
    region: varchar('region', { length: 255 }),
    country: varchar('country', { length: 2 }).notNull().default('DK'),
    featured: boolean('featured').notNull().default(false),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_properties_listing_type').on(table.listingType),
    index('idx_properties_property_type').on(table.propertyType),
    index('idx_properties_status').on(table.status),
    index('idx_properties_price').on(table.price),
    index('idx_properties_coords').on(table.latitude, table.longitude),
  ],
)

export const propertyTranslations = pgTable(
  'property_translations',
  {
    propertyId: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 5 }).notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    description: text('description'),
    neighborhood: text('neighborhood'),
  },
  (table) => [
    primaryKey({ columns: [table.propertyId, table.locale] }),
  ],
)

export const propertyAssets = pgTable(
  'property_assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    propertyId: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    kind: assetKindEnum('kind').notNull().default('image'),
    url: text('url').notNull(),
    altText: text('alt_text'),
    sortOrder: integer('sort_order').notNull().default(0),
    isCover: boolean('is_cover').notNull().default(false),
  },
  (table) => [index('idx_assets_property').on(table.propertyId)],
)

export const propertyFeatures = pgTable(
  'property_features',
  {
    propertyId: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    featureCode: varchar('feature_code', { length: 50 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.propertyId, table.featureCode] }),
  ],
)

export const favorites = pgTable(
  'favorites',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(), // Clerk user id
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_favorites_user').on(table.userId),
    index('idx_favorites_listing').on(table.listingId),
    uniqueIndex('ux_favorites_user_listing').on(table.userId, table.listingId),
  ],
)

// ─── Multi-Category Listings (v2) ─────────────────────────────────────────────

export const listings = pgTable(
  'listings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    category: listingCategoryEnum('category').notNull(),
    subCategory: varchar('sub_category', { length: 100 }).notNull(),
    transactionType: transactionTypeEnum('transaction_type').notNull(),
    status: propertyStatusEnum('status').notNull().default('draft'),
    price: integer('price').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('DKK'),
    pricePeriod: pricePeriodEnum('price_period'),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    addressLine1: text('address_line1').notNull(),
    city: varchar('city', { length: 255 }).notNull(),
    region: varchar('region', { length: 255 }),
    country: varchar('country', { length: 2 }).notNull().default('DK'),
    featured: boolean('featured').notNull().default(false),
    ownerId: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
    scrapedSource: varchar('scraped_source', { length: 50 }),
    scrapedSourceUrl: text('scraped_source_url'),
    sourceKind: varchar('source_kind', { length: 20 }).notNull().default('user'),
    visibility: varchar('visibility', { length: 20 }).notNull().default('public'),
    contactMethod: varchar('contact_method', { length: 20 }).notNull().default('in_app'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    contactUrl: text('contact_url'),
    moderationStatus: varchar('moderation_status', { length: 20 }).notNull().default('ok'),
    moderationNote: text('moderation_note'),
    viewCount: integer('view_count').notNull().default(0),
    contactCount: integer('contact_count').notNull().default(0),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_listings_category').on(table.category),
    index('idx_listings_sub_category').on(table.subCategory),
    index('idx_listings_transaction_type').on(table.transactionType),
    index('idx_listings_status').on(table.status),
    index('idx_listings_price').on(table.price),
    index('idx_listings_coords').on(table.latitude, table.longitude),
    index('idx_listings_featured').on(table.featured),
    index('idx_listings_owner').on(table.ownerId),
    index('idx_listings_moderation').on(table.moderationStatus),
    index('idx_listings_source_kind').on(table.sourceKind),
  ],
)

export const listingProperties = pgTable('listing_properties', {
  listingId: uuid('listing_id')
    .primaryKey()
    .references(() => listings.id, { onDelete: 'cascade' }),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  areaSqm: doublePrecision('area_sqm'),
  lotSqm: doublePrecision('lot_sqm'),
  yearBuilt: integer('year_built'),
  parkingSpaces: integer('parking_spaces'),
  floors: integer('floors'),
  furnished: boolean('furnished').default(false),
})

export const listingVehicles = pgTable('listing_vehicles', {
  listingId: uuid('listing_id')
    .primaryKey()
    .references(() => listings.id, { onDelete: 'cascade' }),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  year: integer('year').notNull(),
  mileageKm: integer('mileage_km'),
  fuelType: fuelTypeEnum('fuel_type'),
  transmission: transmissionTypeEnum('transmission'),
  color: varchar('color', { length: 50 }),
  engineDisplacementCc: integer('engine_displacement_cc'),
  doors: integer('doors'),
})

export const listingServices = pgTable('listing_services', {
  listingId: uuid('listing_id')
    .primaryKey()
    .references(() => listings.id, { onDelete: 'cascade' }),
  serviceRadiusKm: doublePrecision('service_radius_km'),
  availability: jsonb('availability'),
  experienceYears: integer('experience_years'),
  certifications: text('certifications'),
  responseTime: varchar('response_time', { length: 100 }),
})

export const listingTranslations = pgTable(
  'listing_translations',
  {
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 5 }).notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    description: text('description'),
    neighborhood: text('neighborhood'),
  },
  (table) => [
    primaryKey({ columns: [table.listingId, table.locale] }),
  ],
)

export const listingAssets = pgTable(
  'listing_assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    kind: assetKindEnum('kind').notNull().default('image'),
    url: text('url').notNull(),
    altText: text('alt_text'),
    sortOrder: integer('sort_order').notNull().default(0),
    isCover: boolean('is_cover').notNull().default(false),
  },
  (table) => [index('idx_listing_assets_listing').on(table.listingId)],
)

export const listingFeatures = pgTable(
  'listing_features',
  {
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    featureCode: varchar('feature_code', { length: 50 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.listingId, table.featureCode] }),
  ],
)

export const listingExperiences = pgTable('listing_experiences', {
  listingId: uuid('listing_id')
    .primaryKey()
    .references(() => listings.id, { onDelete: 'cascade' }),
  durationHours: doublePrecision('duration_hours'),
  maxGuests: integer('max_guests'),
  minAge: integer('min_age'),
  languages: text('languages').array(),
  meetingPoint: text('meeting_point'),
  included: text('included'),
  notIncluded: text('not_included'),
  difficulty: varchar('difficulty', { length: 50 }),
  seasonalAvailability: jsonb('seasonal_availability'),
})

// ─── Scraping staging table ───────────────────────────────────────────────────

export const scrapedRawStatusEnum = pgEnum('scraped_raw_status', [
  'pending',
  'reviewed',
  'published',
  'rejected',
])

// ─── Scraping sources registry ────────────────────────────────────────────────
// Single source of truth for "which sources can appear in scraped_raw.source".
// Approving a candidate in the discovery page INSERTs a row here (kind='none');
// shipping a scraper for it just UPDATEs kind='built-in'. No DB migration
// needed for either action.

export const scrapingSourceStatusEnum = pgEnum('scraping_source_status', [
  'active',
  'paused',
  'deprecated',
])

export const scrapingSourceKindEnum = pgEnum('scraping_source_kind', [
  'built-in', // has a scraper module in scripts/scraping/scrapers/*
  'external', // ingested via external pipeline (future)
  'none',     // approved by a human but no scraper wired up yet
])

export const scrapingSources = pgTable(
  'scraping_sources',
  {
    // Stable identifier used as FK target by scraped_raw.source.
    key: varchar('key', { length: 64 }).primaryKey(),
    label: varchar('label', { length: 120 }).notNull(),
    domain: varchar('domain', { length: 255 }).notNull(),
    status: scrapingSourceStatusEnum('status').notNull().default('active'),
    kind: scrapingSourceKindEnum('kind').notNull().default('none'),
    country: varchar('country', { length: 2 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_scraping_sources_status').on(table.status),
    index('idx_scraping_sources_kind').on(table.kind),
  ],
)

export const scrapedRaw = pgTable(
  'scraped_raw',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    source: varchar('source', { length: 64 })
      .notNull()
      .references(() => scrapingSources.key, { onUpdate: 'cascade', onDelete: 'restrict' }),
    sourceId: text('source_id').notNull(),
    sourceUrl: text('source_url').notNull(),
    rawData: jsonb('raw_data').notNull(),
    mappedCategory: listingCategoryEnum('mapped_category'),
    status: scrapedRawStatusEnum('status').notNull().default('pending'),
    publishedListingId: uuid('published_listing_id').references(() => listings.id, { onDelete: 'set null' }),
    scrapedAt: timestamp('scraped_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    // AI normalisation — populated when the runner succeeds at normalising the raw payload
    normalised: jsonb('normalised'),
    normalisedAt: timestamp('normalised_at'),
    normalisedBy: varchar('normalised_by', { length: 64 }),
  },
  (table) => [
    index('idx_scraped_raw_source').on(table.source),
    index('idx_scraped_raw_status').on(table.status),
    index('idx_scraped_raw_source_id').on(table.source, table.sourceId),
  ],
)

// ─── Source discovery ──────────────────────────────────────────────────────────

export const scrapedSourceCandidateStatusEnum = pgEnum('scraped_source_candidate_status', [
  'pending',
  'approved',
  'rejected',
  'dead',
])

export const scrapedSourceCandidates = pgTable(
  'scraped_source_candidates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    domain: text('domain').notNull().unique(),
    discoveredFrom: text('discovered_from'),
    discoveredAt: timestamp('discovered_at').notNull().defaultNow(),
    status: scrapedSourceCandidateStatusEnum('status').notNull().default('pending'),
    notes: text('notes'),
  },
  (table) => [index('idx_scraped_source_candidates_status').on(table.status)],
)

// ─── User profiles (Clerk-keyed marketplace metadata) ─────────────────────────
// Identity is owned by Clerk; this table holds marketplace-domain extras.
// PK is the Clerk userId returned by `auth().userId` (no FK to `users`).

export const userProfiles = pgTable(
  'user_profiles',
  {
    userId: text('user_id').primaryKey(),
    handle: varchar('handle', { length: 40 }).unique(),
    displayName: text('display_name'),
    bio: text('bio'),
    avatarUrl: text('avatar_url'),
    email: text('email'),
    phone: text('phone'),
    phoneVerified: boolean('phone_verified').notNull().default(false),
    preferredLocale: varchar('preferred_locale', { length: 5 }).notNull().default('en'),
    notificationsEmail: boolean('notifications_email').notNull().default(true),
    role: varchar('role', { length: 20 }).notNull().default('user'),
    bannedAt: timestamp('banned_at'),
    bannedReason: text('banned_reason'),
    stripeAccountId: text('stripe_account_id').unique(),
    stripeChargesEnabled: boolean('stripe_charges_enabled').notNull().default(false),
    stripePayoutsEnabled: boolean('stripe_payouts_enabled').notNull().default(false),
    stripeDetailsSubmitted: boolean('stripe_details_submitted').notNull().default(false),
    stripeCustomerId: text('stripe_customer_id').unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('idx_user_profiles_handle').on(t.handle),
    index('idx_user_profiles_role').on(t.role),
    index('idx_user_profiles_banned').on(t.bannedAt),
  ],
)

// ─── Messaging ────────────────────────────────────────────────────────────────

export const threads = pgTable(
  'threads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'set null' }),
    subject: text('subject'),
    status: varchar('status', { length: 20 }).notNull().default('open'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    lastMessageAt: timestamp('last_message_at').notNull().defaultNow(),
  },
  (t) => [
    index('idx_threads_listing').on(t.listingId),
    index('idx_threads_last_message').on(t.lastMessageAt),
  ],
)

export const threadParticipants = pgTable(
  'thread_participants',
  {
    threadId: uuid('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    role: varchar('role', { length: 20 }).notNull(),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
    lastReadAt: timestamp('last_read_at'),
    muted: boolean('muted').notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.threadId, t.userId] }),
    index('idx_thread_participants_user').on(t.userId),
  ],
)

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    threadId: uuid('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
    senderId: text('sender_id').notNull(),
    body: text('body').notNull(),
    bodyFormat: varchar('body_format', { length: 10 }).notNull().default('plain'),
    attachments: jsonb('attachments'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    editedAt: timestamp('edited_at'),
    deletedAt: timestamp('deleted_at'),
  },
  (t) => [
    index('idx_messages_thread_created').on(t.threadId, t.createdAt),
    index('idx_messages_sender').on(t.senderId),
  ],
)

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    kind: varchar('kind', { length: 40 }).notNull(),
    payload: jsonb('payload').notNull(),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('idx_notifications_user_unread').on(t.userId, t.readAt),
    index('idx_notifications_user_created').on(t.userId, t.createdAt),
  ],
)

// ─── Reports & rate limits ────────────────────────────────────────────────────

export const listingReports = pgTable(
  'listing_reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
    reporterId: text('reporter_id'),
    reason: varchar('reason', { length: 40 }).notNull(),
    details: text('details'),
    resolvedAt: timestamp('resolved_at'),
    resolvedBy: text('resolved_by'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('idx_listing_reports_listing').on(t.listingId),
    index('idx_listing_reports_resolved').on(t.resolvedAt),
  ],
)

export const rateLimitBuckets = pgTable(
  'rate_limit_buckets',
  {
    bucketKey: text('bucket_key').notNull(),
    windowStart: timestamp('window_start').notNull(),
    count: integer('count').notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.bucketKey, t.windowStart] }),
    index('idx_rate_limit_buckets_window').on(t.windowStart),
  ],
)

// ─── Payments — Stripe Connect ────────────────────────────────────────────────

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'set null' }),
    threadId: uuid('thread_id').references(() => threads.id, { onDelete: 'set null' }),
    buyerId: text('buyer_id').notNull(),
    sellerId: text('seller_id').notNull(),
    amountTotal: integer('amount_total').notNull(),
    amountApplicationFee: integer('amount_application_fee').notNull().default(0),
    currency: varchar('currency', { length: 3 }).notNull().default('DKK'),
    status: varchar('status', { length: 30 }).notNull().default('requires_payment_method'),
    intent: varchar('intent', { length: 20 }).notNull().default('sale'),
    description: text('description'),
    metadata: jsonb('metadata'),
    stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
    stripeChargeId: text('stripe_charge_id'),
    stripeTransferId: text('stripe_transfer_id'),
    stripeRefundId: text('stripe_refund_id'),
    clientSecret: text('client_secret'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    paidAt: timestamp('paid_at'),
    refundedAt: timestamp('refunded_at'),
    failedAt: timestamp('failed_at'),
  },
  (t) => [
    index('idx_payments_buyer').on(t.buyerId),
    index('idx_payments_seller').on(t.sellerId),
    index('idx_payments_listing').on(t.listingId),
    index('idx_payments_status').on(t.status),
  ],
)

export const stripeEvents = pgTable(
  'stripe_events',
  {
    id: text('id').primaryKey(),
    type: varchar('type', { length: 80 }).notNull(),
    payload: jsonb('payload').notNull(),
    processedAt: timestamp('processed_at'),
    error: text('error'),
    receivedAt: timestamp('received_at').notNull().defaultNow(),
  },
  (t) => [
    index('idx_stripe_events_type').on(t.type),
    index('idx_stripe_events_processed').on(t.processedAt),
  ],
)

// ─── Listing analytics ────────────────────────────────────────────────────────

export const listingViews = pgTable(
  'listing_views',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
    viewerId: text('viewer_id'),
    ipHash: varchar('ip_hash', { length: 64 }),
    referrer: text('referrer'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('idx_listing_views_listing').on(t.listingId, t.createdAt)],
)
