-- Scraping v2 — AI normalisation + new DK providers + source discovery

-- 1. Extend source enum with 4 new DK real-estate providers
ALTER TYPE "scraped_source" ADD VALUE IF NOT EXISTS 'edc';
ALTER TYPE "scraped_source" ADD VALUE IF NOT EXISTS 'homestra';
ALTER TYPE "scraped_source" ADD VALUE IF NOT EXISTS 'boligsiden';
ALTER TYPE "scraped_source" ADD VALUE IF NOT EXISTS 'boliga';

-- 2. Add normalisation columns to scraped_raw (additive, nullable)
ALTER TABLE "scraped_raw" ADD COLUMN IF NOT EXISTS "normalised" jsonb;
ALTER TABLE "scraped_raw" ADD COLUMN IF NOT EXISTS "normalised_at" timestamp;
ALTER TABLE "scraped_raw" ADD COLUMN IF NOT EXISTS "normalised_by" varchar(64);

-- 3. Candidate provider domains discovered by the crawler
DO $$ BEGIN
  CREATE TYPE "scraped_source_candidate_status" AS ENUM ('pending', 'approved', 'rejected', 'dead');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "scraped_source_candidates" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "domain" text NOT NULL UNIQUE,
  "discovered_from" text,
  "discovered_at" timestamp NOT NULL DEFAULT now(),
  "status" "scraped_source_candidate_status" NOT NULL DEFAULT 'pending',
  "notes" text
);

CREATE INDEX IF NOT EXISTS "idx_scraped_source_candidates_status"
  ON "scraped_source_candidates" ("status");
