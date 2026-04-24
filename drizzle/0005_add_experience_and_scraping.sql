-- Migration: Add 'experience' category and scraping infrastructure
-- Run with: npx drizzle-kit migrate

-- Step 1: Add 'experience' value to existing enum (Postgres requires special handling)
ALTER TYPE "listing_category" ADD VALUE IF NOT EXISTS 'experience';

-- Step 2: Experience extension table
CREATE TABLE IF NOT EXISTS "listing_experiences" (
  "listing_id"             uuid PRIMARY KEY REFERENCES "listings"("id") ON DELETE CASCADE,
  "duration_hours"         double precision,
  "max_guests"             integer,
  "min_age"                integer,
  "languages"              text[],
  "meeting_point"          text,
  "included"               text,
  "not_included"           text,
  "difficulty"             varchar(50),
  "seasonal_availability"  jsonb
);

-- Step 3: Scraped data staging enums
DO $$ BEGIN
  CREATE TYPE "scraped_raw_status" AS ENUM ('pending', 'reviewed', 'published', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "scraped_source" AS ENUM ('airbnb', 'facebook', 'linkedin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Step 4: Scraped raw staging table
CREATE TABLE IF NOT EXISTS "scraped_raw" (
  "id"                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "source"                "scraped_source"       NOT NULL,
  "source_id"             text                   NOT NULL,
  "source_url"            text                   NOT NULL,
  "raw_data"              jsonb                  NOT NULL,
  "mapped_category"       "listing_category",
  "status"                "scraped_raw_status"   NOT NULL DEFAULT 'pending',
  "published_listing_id"  uuid REFERENCES "listings"("id") ON DELETE SET NULL,
  "scraped_at"            timestamp              NOT NULL DEFAULT now(),
  "created_at"            timestamp              NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_scraped_raw_source"    ON "scraped_raw" ("source");
CREATE INDEX IF NOT EXISTS "idx_scraped_raw_status"    ON "scraped_raw" ("status");
CREATE INDEX IF NOT EXISTS "idx_scraped_raw_source_id" ON "scraped_raw" ("source", "source_id");
