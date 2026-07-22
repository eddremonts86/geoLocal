-- Durable scraping checkpoints, run history, and database-enforced idempotency.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM scraped_raw
    GROUP BY source, source_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add scraping uniqueness constraint: duplicate source/source_id rows exist';
  END IF;
END $$;

DROP INDEX IF EXISTS idx_scraped_raw_source_id;
CREATE UNIQUE INDEX IF NOT EXISTS uq_scraped_raw_source_id
  ON scraped_raw (source, source_id);

CREATE TABLE IF NOT EXISTS scrape_checkpoints (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source                  varchar(64) NOT NULL REFERENCES scraping_sources(key) ON UPDATE CASCADE ON DELETE CASCADE,
  flow                    varchar(20) NOT NULL CHECK (flow IN ('backfill', 'incremental')),
  status                  varchar(20) NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'exhausted', 'cooldown', 'paused')),
  cursor                  jsonb NOT NULL DEFAULT '{"page":1}'::jsonb,
  watermark               jsonb,
  consecutive_known_items integer NOT NULL DEFAULT 0,
  consecutive_failures    integer NOT NULL DEFAULT 0,
  exhausted               boolean NOT NULL DEFAULT false,
  lease_owner             text,
  lease_expires_at        timestamp,
  cooldown_until          timestamp,
  pause_reason            text,
  last_success_at         timestamp,
  next_run_at             timestamp,
  created_at              timestamp NOT NULL DEFAULT now(),
  updated_at              timestamp NOT NULL DEFAULT now(),
  CONSTRAINT uq_scrape_checkpoints_source_flow UNIQUE (source, flow)
);

CREATE INDEX IF NOT EXISTS idx_scrape_checkpoints_due
  ON scrape_checkpoints (flow, status, next_run_at);

CREATE TABLE IF NOT EXISTS scrape_runs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source         varchar(64) NOT NULL REFERENCES scraping_sources(key) ON UPDATE CASCADE ON DELETE CASCADE,
  flow           varchar(20) NOT NULL CHECK (flow IN ('backfill', 'incremental')),
  status         varchar(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'succeeded', 'failed', 'skipped')),
  cursor_before  jsonb,
  cursor_after   jsonb,
  found_count    integer NOT NULL DEFAULT 0,
  new_count      integer NOT NULL DEFAULT 0,
  updated_count  integer NOT NULL DEFAULT 0,
  known_count    integer NOT NULL DEFAULT 0,
  error_count    integer NOT NULL DEFAULT 0,
  stop_reason    text,
  error_message  text,
  started_at     timestamp NOT NULL DEFAULT now(),
  finished_at    timestamp
);

CREATE INDEX IF NOT EXISTS idx_scrape_runs_source_started
  ON scrape_runs (source, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrape_runs_flow_started
  ON scrape_runs (flow, started_at DESC);

INSERT INTO scrape_checkpoints (source, flow, status, next_run_at)
SELECT key, flow, CASE WHEN status = 'active' AND kind = 'built-in' THEN 'idle' ELSE 'paused' END, now()
FROM scraping_sources
CROSS JOIN (VALUES ('backfill'), ('incremental')) AS flows(flow)
ON CONFLICT (source, flow) DO NOTHING;

UPDATE scrape_checkpoints
SET status = 'paused',
    pause_reason = CASE source
      WHEN 'airbnb' THEN 'Authorization required by source terms'
      WHEN 'facebook' THEN 'Authorization required by source terms'
      WHEN 'facebook-events' THEN 'Authorization required by source terms'
      WHEN 'linkedin' THEN 'Explicit crawl permission required'
      WHEN 'dba' THEN 'Automated collection requires explicit permission'
      WHEN 'boligsiden' THEN 'Current adapter uses a robots-disallowed API path; commercial API required'
      WHEN 'boliga' THEN 'Current adapter depends on anti-bot circumvention and must be replaced'
    END,
    updated_at = now()
WHERE source IN ('airbnb', 'facebook', 'facebook-events', 'linkedin', 'dba', 'boligsiden', 'boliga');
