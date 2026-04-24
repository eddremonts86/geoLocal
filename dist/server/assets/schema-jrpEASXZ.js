import { boolean, doublePrecision, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
//#region src/shared/lib/db/schema.ts
var listingTypeEnum = pgEnum("listing_type", ["sale", "rent"]);
var propertyTypeEnum = pgEnum("property_type", [
	"house",
	"apartment",
	"condo",
	"land"
]);
var propertyStatusEnum = pgEnum("property_status", [
	"draft",
	"published",
	"archived"
]);
var userRoleEnum = pgEnum("user_role", ["user", "admin"]);
var assetKindEnum = pgEnum("asset_kind", [
	"image",
	"video",
	"floor_plan"
]);
var listingCategoryEnum = pgEnum("listing_category", [
	"property",
	"vehicle",
	"service",
	"experience"
]);
var transactionTypeEnum = pgEnum("transaction_type", [
	"buy",
	"rent",
	"hire"
]);
var fuelTypeEnum = pgEnum("fuel_type", [
	"gasoline",
	"diesel",
	"electric",
	"hybrid"
]);
var transmissionTypeEnum = pgEnum("transmission_type", ["manual", "automatic"]);
var pricePeriodEnum = pgEnum("price_period", [
	"one_time",
	"monthly",
	"daily",
	"hourly"
]);
var users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	role: userRoleEnum("role").notNull().default("user"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
});
pgTable("sessions", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
});
pgTable("accounts", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
});
pgTable("verifications", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at")
});
var properties = pgTable("properties", {
	id: uuid("id").defaultRandom().primaryKey(),
	slug: varchar("slug", { length: 255 }).notNull().unique(),
	listingType: listingTypeEnum("listing_type").notNull(),
	propertyType: propertyTypeEnum("property_type").notNull(),
	status: propertyStatusEnum("status").notNull().default("draft"),
	price: integer("price").notNull(),
	currency: varchar("currency", { length: 3 }).notNull().default("USD"),
	bedrooms: integer("bedrooms"),
	bathrooms: integer("bathrooms"),
	areaM2: doublePrecision("area_m2"),
	lotM2: doublePrecision("lot_m2"),
	parkingSpaces: integer("parking_spaces"),
	floorNumber: integer("floor_number"),
	yearBuilt: integer("year_built"),
	latitude: doublePrecision("latitude").notNull(),
	longitude: doublePrecision("longitude").notNull(),
	addressLine1: text("address_line1").notNull(),
	city: varchar("city", { length: 255 }).notNull(),
	region: varchar("region", { length: 255 }),
	country: varchar("country", { length: 2 }).notNull().default("DK"),
	featured: boolean("featured").notNull().default(false),
	publishedAt: timestamp("published_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [
	index("idx_properties_listing_type").on(table.listingType),
	index("idx_properties_property_type").on(table.propertyType),
	index("idx_properties_status").on(table.status),
	index("idx_properties_price").on(table.price),
	index("idx_properties_coords").on(table.latitude, table.longitude)
]);
pgTable("property_translations", {
	propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
	locale: varchar("locale", { length: 5 }).notNull(),
	title: text("title").notNull(),
	summary: text("summary"),
	description: text("description"),
	neighborhood: text("neighborhood")
}, (table) => [primaryKey({ columns: [table.propertyId, table.locale] })]);
pgTable("property_assets", {
	id: uuid("id").defaultRandom().primaryKey(),
	propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
	kind: assetKindEnum("kind").notNull().default("image"),
	url: text("url").notNull(),
	altText: text("alt_text"),
	sortOrder: integer("sort_order").notNull().default(0),
	isCover: boolean("is_cover").notNull().default(false)
}, (table) => [index("idx_assets_property").on(table.propertyId)]);
pgTable("property_features", {
	propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
	featureCode: varchar("feature_code", { length: 50 }).notNull()
}, (table) => [primaryKey({ columns: [table.propertyId, table.featureCode] })]);
pgTable("favorites", {
	id: uuid("id").defaultRandom().primaryKey(),
	sessionId: text("session_id").notNull(),
	propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => [index("idx_favorites_session").on(table.sessionId), index("idx_favorites_property").on(table.propertyId)]);
var listings = pgTable("listings", {
	id: uuid("id").defaultRandom().primaryKey(),
	slug: varchar("slug", { length: 255 }).notNull().unique(),
	category: listingCategoryEnum("category").notNull(),
	subCategory: varchar("sub_category", { length: 100 }).notNull(),
	transactionType: transactionTypeEnum("transaction_type").notNull(),
	status: propertyStatusEnum("status").notNull().default("draft"),
	price: integer("price").notNull(),
	currency: varchar("currency", { length: 3 }).notNull().default("DKK"),
	pricePeriod: pricePeriodEnum("price_period"),
	latitude: doublePrecision("latitude").notNull(),
	longitude: doublePrecision("longitude").notNull(),
	addressLine1: text("address_line1").notNull(),
	city: varchar("city", { length: 255 }).notNull(),
	region: varchar("region", { length: 255 }),
	country: varchar("country", { length: 2 }).notNull().default("DK"),
	featured: boolean("featured").notNull().default(false),
	ownerId: text("owner_id").references(() => users.id, { onDelete: "set null" }),
	scrapedSource: varchar("scraped_source", { length: 50 }),
	scrapedSourceUrl: text("scraped_source_url"),
	publishedAt: timestamp("published_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [
	index("idx_listings_category").on(table.category),
	index("idx_listings_sub_category").on(table.subCategory),
	index("idx_listings_transaction_type").on(table.transactionType),
	index("idx_listings_status").on(table.status),
	index("idx_listings_price").on(table.price),
	index("idx_listings_coords").on(table.latitude, table.longitude),
	index("idx_listings_featured").on(table.featured)
]);
var listingProperties = pgTable("listing_properties", {
	listingId: uuid("listing_id").primaryKey().references(() => listings.id, { onDelete: "cascade" }),
	bedrooms: integer("bedrooms"),
	bathrooms: integer("bathrooms"),
	areaSqm: doublePrecision("area_sqm"),
	lotSqm: doublePrecision("lot_sqm"),
	yearBuilt: integer("year_built"),
	parkingSpaces: integer("parking_spaces"),
	floors: integer("floors"),
	furnished: boolean("furnished").default(false)
});
var listingVehicles = pgTable("listing_vehicles", {
	listingId: uuid("listing_id").primaryKey().references(() => listings.id, { onDelete: "cascade" }),
	make: varchar("make", { length: 100 }).notNull(),
	model: varchar("model", { length: 100 }).notNull(),
	year: integer("year").notNull(),
	mileageKm: integer("mileage_km"),
	fuelType: fuelTypeEnum("fuel_type"),
	transmission: transmissionTypeEnum("transmission"),
	color: varchar("color", { length: 50 }),
	engineDisplacementCc: integer("engine_displacement_cc"),
	doors: integer("doors")
});
var listingServices = pgTable("listing_services", {
	listingId: uuid("listing_id").primaryKey().references(() => listings.id, { onDelete: "cascade" }),
	serviceRadiusKm: doublePrecision("service_radius_km"),
	availability: jsonb("availability"),
	experienceYears: integer("experience_years"),
	certifications: text("certifications"),
	responseTime: varchar("response_time", { length: 100 })
});
var listingTranslations = pgTable("listing_translations", {
	listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
	locale: varchar("locale", { length: 5 }).notNull(),
	title: text("title").notNull(),
	summary: text("summary"),
	description: text("description"),
	neighborhood: text("neighborhood")
}, (table) => [primaryKey({ columns: [table.listingId, table.locale] })]);
var listingAssets = pgTable("listing_assets", {
	id: uuid("id").defaultRandom().primaryKey(),
	listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
	kind: assetKindEnum("kind").notNull().default("image"),
	url: text("url").notNull(),
	altText: text("alt_text"),
	sortOrder: integer("sort_order").notNull().default(0),
	isCover: boolean("is_cover").notNull().default(false)
}, (table) => [index("idx_listing_assets_listing").on(table.listingId)]);
var listingFeatures = pgTable("listing_features", {
	listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
	featureCode: varchar("feature_code", { length: 50 }).notNull()
}, (table) => [primaryKey({ columns: [table.listingId, table.featureCode] })]);
var listingExperiences = pgTable("listing_experiences", {
	listingId: uuid("listing_id").primaryKey().references(() => listings.id, { onDelete: "cascade" }),
	durationHours: doublePrecision("duration_hours"),
	maxGuests: integer("max_guests"),
	minAge: integer("min_age"),
	languages: text("languages").array(),
	meetingPoint: text("meeting_point"),
	included: text("included"),
	notIncluded: text("not_included"),
	difficulty: varchar("difficulty", { length: 50 }),
	seasonalAvailability: jsonb("seasonal_availability")
});
var scrapedRawStatusEnum = pgEnum("scraped_raw_status", [
	"pending",
	"reviewed",
	"published",
	"rejected"
]);
var scrapedSourceEnum = pgEnum("scraped_source", [
	"airbnb",
	"facebook",
	"facebook-events",
	"linkedin"
]);
var scrapedRaw = pgTable("scraped_raw", {
	id: uuid("id").defaultRandom().primaryKey(),
	source: scrapedSourceEnum("source").notNull(),
	sourceId: text("source_id").notNull(),
	sourceUrl: text("source_url").notNull(),
	rawData: jsonb("raw_data").notNull(),
	mappedCategory: listingCategoryEnum("mapped_category"),
	status: scrapedRawStatusEnum("status").notNull().default("pending"),
	publishedListingId: uuid("published_listing_id").references(() => listings.id, { onDelete: "set null" }),
	scrapedAt: timestamp("scraped_at").notNull().defaultNow(),
	createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => [
	index("idx_scraped_raw_source").on(table.source),
	index("idx_scraped_raw_status").on(table.status),
	index("idx_scraped_raw_source_id").on(table.source, table.sourceId)
]);
//#endregion
export { listingServices as a, listings as c, listingProperties as i, scrapedRaw as l, listingExperiences as n, listingTranslations as o, listingFeatures as r, listingVehicles as s, listingAssets as t };
