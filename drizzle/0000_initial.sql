CREATE TYPE "public"."asset_kind" AS ENUM('image', 'video', 'floor_plan');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('gasoline', 'diesel', 'electric', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."listing_category" AS ENUM('property', 'vehicle', 'service', 'experience');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('sale', 'rent');--> statement-breakpoint
CREATE TYPE "public"."price_period" AS ENUM('one_time', 'monthly', 'daily', 'hourly');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('house', 'apartment', 'condo', 'land');--> statement-breakpoint
CREATE TYPE "public"."scraped_raw_status" AS ENUM('pending', 'reviewed', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."scraped_source_candidate_status" AS ENUM('pending', 'approved', 'rejected', 'dead');--> statement-breakpoint
CREATE TYPE "public"."scraping_source_kind" AS ENUM('built-in', 'external', 'none');--> statement-breakpoint
CREATE TYPE "public"."scraping_source_status" AS ENUM('active', 'paused', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('buy', 'rent', 'hire');--> statement-breakpoint
CREATE TYPE "public"."transmission_type" AS ENUM('manual', 'automatic');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"kind" "asset_kind" DEFAULT 'image' NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_experiences" (
	"listing_id" uuid PRIMARY KEY NOT NULL,
	"duration_hours" double precision,
	"max_guests" integer,
	"min_age" integer,
	"languages" text[],
	"meeting_point" text,
	"included" text,
	"not_included" text,
	"difficulty" varchar(50),
	"seasonal_availability" jsonb
);
--> statement-breakpoint
CREATE TABLE "listing_features" (
	"listing_id" uuid NOT NULL,
	"feature_code" varchar(50) NOT NULL,
	CONSTRAINT "listing_features_listing_id_feature_code_pk" PRIMARY KEY("listing_id","feature_code")
);
--> statement-breakpoint
CREATE TABLE "listing_properties" (
	"listing_id" uuid PRIMARY KEY NOT NULL,
	"bedrooms" integer,
	"bathrooms" integer,
	"area_sqm" double precision,
	"lot_sqm" double precision,
	"year_built" integer,
	"parking_spaces" integer,
	"floors" integer,
	"furnished" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "listing_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"reporter_id" text,
	"reason" varchar(40) NOT NULL,
	"details" text,
	"resolved_at" timestamp,
	"resolved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_services" (
	"listing_id" uuid PRIMARY KEY NOT NULL,
	"service_radius_km" double precision,
	"availability" jsonb,
	"experience_years" integer,
	"certifications" text,
	"response_time" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "listing_translations" (
	"listing_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"description" text,
	"neighborhood" text,
	CONSTRAINT "listing_translations_listing_id_locale_pk" PRIMARY KEY("listing_id","locale")
);
--> statement-breakpoint
CREATE TABLE "listing_vehicles" (
	"listing_id" uuid PRIMARY KEY NOT NULL,
	"make" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"mileage_km" integer,
	"fuel_type" "fuel_type",
	"transmission" "transmission_type",
	"color" varchar(50),
	"engine_displacement_cc" integer,
	"doors" integer
);
--> statement-breakpoint
CREATE TABLE "listing_views" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"listing_id" uuid NOT NULL,
	"viewer_id" text,
	"ip_hash" varchar(64),
	"referrer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" "listing_category" NOT NULL,
	"sub_category" varchar(100) NOT NULL,
	"transaction_type" "transaction_type" NOT NULL,
	"status" "property_status" DEFAULT 'draft' NOT NULL,
	"price" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'DKK' NOT NULL,
	"price_period" "price_period",
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"address_line1" text NOT NULL,
	"city" varchar(255) NOT NULL,
	"region" varchar(255),
	"country" varchar(2) DEFAULT 'DK' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"owner_id" text,
	"scraped_source" varchar(50),
	"scraped_source_url" text,
	"source_kind" varchar(20) DEFAULT 'user' NOT NULL,
	"visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"contact_method" varchar(20) DEFAULT 'in_app' NOT NULL,
	"contact_email" text,
	"contact_phone" text,
	"contact_url" text,
	"moderation_status" varchar(20) DEFAULT 'ok' NOT NULL,
	"moderation_note" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"contact_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "listings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender_id" text NOT NULL,
	"body" text NOT NULL,
	"body_format" varchar(10) DEFAULT 'plain' NOT NULL,
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" varchar(40) NOT NULL,
	"payload" jsonb NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid,
	"thread_id" uuid,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"amount_total" integer NOT NULL,
	"amount_application_fee" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'DKK' NOT NULL,
	"status" varchar(30) DEFAULT 'requires_payment_method' NOT NULL,
	"intent" varchar(20) DEFAULT 'sale' NOT NULL,
	"description" text,
	"metadata" jsonb,
	"stripe_payment_intent_id" text,
	"stripe_charge_id" text,
	"stripe_transfer_id" text,
	"stripe_refund_id" text,
	"client_secret" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	"refunded_at" timestamp,
	"failed_at" timestamp,
	CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"listing_type" "listing_type" NOT NULL,
	"property_type" "property_type" NOT NULL,
	"status" "property_status" DEFAULT 'draft' NOT NULL,
	"price" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"bedrooms" integer,
	"bathrooms" integer,
	"area_m2" double precision,
	"lot_m2" double precision,
	"parking_spaces" integer,
	"floor_number" integer,
	"year_built" integer,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"address_line1" text NOT NULL,
	"city" varchar(255) NOT NULL,
	"region" varchar(255),
	"country" varchar(2) DEFAULT 'DK' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "property_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"kind" "asset_kind" DEFAULT 'image' NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_features" (
	"property_id" uuid NOT NULL,
	"feature_code" varchar(50) NOT NULL,
	CONSTRAINT "property_features_property_id_feature_code_pk" PRIMARY KEY("property_id","feature_code")
);
--> statement-breakpoint
CREATE TABLE "property_translations" (
	"property_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"description" text,
	"neighborhood" text,
	CONSTRAINT "property_translations_property_id_locale_pk" PRIMARY KEY("property_id","locale")
);
--> statement-breakpoint
CREATE TABLE "rate_limit_buckets" (
	"bucket_key" text NOT NULL,
	"window_start" timestamp NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limit_buckets_bucket_key_window_start_pk" PRIMARY KEY("bucket_key","window_start")
);
--> statement-breakpoint
CREATE TABLE "scrape_checkpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(64) NOT NULL,
	"flow" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'idle' NOT NULL,
	"cursor" jsonb DEFAULT '{"page":1}'::jsonb NOT NULL,
	"watermark" jsonb,
	"consecutive_known_items" integer DEFAULT 0 NOT NULL,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"exhausted" boolean DEFAULT false NOT NULL,
	"lease_owner" text,
	"lease_expires_at" timestamp,
	"cooldown_until" timestamp,
	"pause_reason" text,
	"last_success_at" timestamp,
	"next_run_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scrape_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(64) NOT NULL,
	"flow" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'running' NOT NULL,
	"cursor_before" jsonb,
	"cursor_after" jsonb,
	"found_count" integer DEFAULT 0 NOT NULL,
	"new_count" integer DEFAULT 0 NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL,
	"known_count" integer DEFAULT 0 NOT NULL,
	"error_count" integer DEFAULT 0 NOT NULL,
	"stop_reason" text,
	"error_message" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "scraped_raw" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(64) NOT NULL,
	"source_id" text NOT NULL,
	"source_url" text NOT NULL,
	"raw_data" jsonb NOT NULL,
	"mapped_category" "listing_category",
	"status" "scraped_raw_status" DEFAULT 'pending' NOT NULL,
	"published_listing_id" uuid,
	"scraped_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"normalised" jsonb,
	"normalised_at" timestamp,
	"normalised_by" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "scraped_source_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" text NOT NULL,
	"discovered_from" text,
	"discovered_at" timestamp DEFAULT now() NOT NULL,
	"status" "scraped_source_candidate_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	CONSTRAINT "scraped_source_candidates_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "scraping_sources" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"label" varchar(120) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"status" "scraping_source_status" DEFAULT 'active' NOT NULL,
	"kind" "scraping_source_kind" DEFAULT 'none' NOT NULL,
	"country" varchar(2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" varchar(80) NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp,
	"error" text,
	"received_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thread_participants" (
	"thread_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(20) NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_read_at" timestamp,
	"muted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "thread_participants_thread_id_user_id_pk" PRIMARY KEY("thread_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid,
	"subject" text,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"handle" varchar(40),
	"display_name" text,
	"bio" text,
	"avatar_url" text,
	"email" text,
	"phone" text,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"preferred_locale" varchar(5) DEFAULT 'en' NOT NULL,
	"notifications_email" boolean DEFAULT true NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"banned_at" timestamp,
	"banned_reason" text,
	"stripe_account_id" text,
	"stripe_charges_enabled" boolean DEFAULT false NOT NULL,
	"stripe_payouts_enabled" boolean DEFAULT false NOT NULL,
	"stripe_details_submitted" boolean DEFAULT false NOT NULL,
	"stripe_customer_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_handle_unique" UNIQUE("handle"),
	CONSTRAINT "user_profiles_stripe_account_id_unique" UNIQUE("stripe_account_id"),
	CONSTRAINT "user_profiles_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_assets" ADD CONSTRAINT "listing_assets_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_experiences" ADD CONSTRAINT "listing_experiences_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_features" ADD CONSTRAINT "listing_features_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_properties" ADD CONSTRAINT "listing_properties_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_services" ADD CONSTRAINT "listing_services_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_translations" ADD CONSTRAINT "listing_translations_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_vehicles" ADD CONSTRAINT "listing_vehicles_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_views" ADD CONSTRAINT "listing_views_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_assets" ADD CONSTRAINT "property_assets_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_features" ADD CONSTRAINT "property_features_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_translations" ADD CONSTRAINT "property_translations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scrape_checkpoints" ADD CONSTRAINT "scrape_checkpoints_source_scraping_sources_key_fk" FOREIGN KEY ("source") REFERENCES "public"."scraping_sources"("key") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scrape_runs" ADD CONSTRAINT "scrape_runs_source_scraping_sources_key_fk" FOREIGN KEY ("source") REFERENCES "public"."scraping_sources"("key") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scraped_raw" ADD CONSTRAINT "scraped_raw_source_scraping_sources_key_fk" FOREIGN KEY ("source") REFERENCES "public"."scraping_sources"("key") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scraped_raw" ADD CONSTRAINT "scraped_raw_published_listing_id_listings_id_fk" FOREIGN KEY ("published_listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_participants" ADD CONSTRAINT "thread_participants_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_unique" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_favorites_user" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_favorites_listing" ON "favorites" USING btree ("listing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_favorites_user_listing" ON "favorites" USING btree ("user_id","listing_id");--> statement-breakpoint
CREATE INDEX "idx_listing_assets_listing" ON "listing_assets" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_listing_reports_listing" ON "listing_reports" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_listing_reports_resolved" ON "listing_reports" USING btree ("resolved_at");--> statement-breakpoint
CREATE INDEX "idx_listing_views_listing" ON "listing_views" USING btree ("listing_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_listings_category" ON "listings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_listings_sub_category" ON "listings" USING btree ("sub_category");--> statement-breakpoint
CREATE INDEX "idx_listings_transaction_type" ON "listings" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "idx_listings_status" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_listings_price" ON "listings" USING btree ("price");--> statement-breakpoint
CREATE INDEX "idx_listings_coords" ON "listings" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "idx_listings_featured" ON "listings" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "idx_listings_owner" ON "listings" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_listings_moderation" ON "listings" USING btree ("moderation_status");--> statement-breakpoint
CREATE INDEX "idx_listings_source_kind" ON "listings" USING btree ("source_kind");--> statement-breakpoint
CREATE INDEX "idx_messages_thread_created" ON "messages" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_messages_sender" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_unread" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_created" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_payments_buyer" ON "payments" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "idx_payments_seller" ON "payments" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "idx_payments_listing" ON "payments" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_properties_listing_type" ON "properties" USING btree ("listing_type");--> statement-breakpoint
CREATE INDEX "idx_properties_property_type" ON "properties" USING btree ("property_type");--> statement-breakpoint
CREATE INDEX "idx_properties_status" ON "properties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_properties_price" ON "properties" USING btree ("price");--> statement-breakpoint
CREATE INDEX "idx_properties_coords" ON "properties" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "idx_assets_property" ON "property_assets" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_rate_limit_buckets_window" ON "rate_limit_buckets" USING btree ("window_start");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_scrape_checkpoints_source_flow" ON "scrape_checkpoints" USING btree ("source","flow");--> statement-breakpoint
CREATE INDEX "idx_scrape_checkpoints_due" ON "scrape_checkpoints" USING btree ("flow","status","next_run_at");--> statement-breakpoint
CREATE INDEX "idx_scrape_runs_source_started" ON "scrape_runs" USING btree ("source","started_at");--> statement-breakpoint
CREATE INDEX "idx_scrape_runs_flow_started" ON "scrape_runs" USING btree ("flow","started_at");--> statement-breakpoint
CREATE INDEX "idx_scraped_raw_source" ON "scraped_raw" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_scraped_raw_status" ON "scraped_raw" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_scraped_raw_source_id" ON "scraped_raw" USING btree ("source","source_id");--> statement-breakpoint
CREATE INDEX "idx_scraped_source_candidates_status" ON "scraped_source_candidates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_scraping_sources_status" ON "scraping_sources" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_scraping_sources_kind" ON "scraping_sources" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "idx_stripe_events_type" ON "stripe_events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_stripe_events_processed" ON "stripe_events" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "idx_thread_participants_user" ON "thread_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_threads_listing" ON "threads" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_threads_last_message" ON "threads" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_handle" ON "user_profiles" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_role" ON "user_profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_banned" ON "user_profiles" USING btree ("banned_at");