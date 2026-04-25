-- 0008_scraping_sources_registry.sql
-- Option C: replace the hardcoded `scraped_source` pgEnum with a real
-- `scraping_sources` table so approving a new source (or adding a new
-- scraper) no longer requires a schema change.
--
-- Order matters:
--   1. Create new enums + table.
--   2. Seed it with all sources currently referenced by scraped_raw AND any
--      approved candidates (so the FK we add in step 5 doesn't fail).
--   3. Convert scraped_raw.source from the old enum to varchar.
--   4. Drop the old enum.
--   5. Add the FK (→ scraping_sources.key).

-- 1. New enums + registry table ------------------------------------------------

CREATE TYPE scraping_source_status AS ENUM ('active', 'paused', 'deprecated');
CREATE TYPE scraping_source_kind   AS ENUM ('built-in', 'external', 'none');

CREATE TABLE scraping_sources (
  key        varchar(64) PRIMARY KEY,
  label      varchar(120) NOT NULL,
  domain     varchar(255) NOT NULL,
  status     scraping_source_status NOT NULL DEFAULT 'active',
  kind       scraping_source_kind   NOT NULL DEFAULT 'none',
  country    varchar(2),
  notes      text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_scraping_sources_status ON scraping_sources (status);
CREATE INDEX idx_scraping_sources_kind   ON scraping_sources (kind);

-- 2. Seed --------------------------------------------------------------------

-- 2a. Built-in scrapers (must match SCRAPER_REGISTRY_KEYS in
--     src/shared/lib/scraping/registry.ts).
INSERT INTO scraping_sources (key, label, domain, status, kind, country) VALUES
  ('airbnb',          'Airbnb',           'airbnb.com',          'active', 'built-in', 'DK'),
  ('facebook',        'Facebook Pages',   'facebook.com',        'active', 'built-in', 'DK'),
  ('facebook-events', 'Facebook Events',  'facebook.com/events', 'active', 'built-in', 'DK'),
  ('linkedin',        'LinkedIn',         'linkedin.com',        'active', 'built-in', 'DK'),
  ('edc',             'EDC',              'edc.dk',              'active', 'built-in', 'DK'),
  ('homestra',        'Homestra',         'homestra.com',        'active', 'built-in', 'DK'),
  ('boligsiden',      'Boligsiden',       'boligsiden.dk',       'active', 'built-in', 'DK'),
  ('boliga',          'Boliga',           'boliga.dk',           'active', 'built-in', 'DK')
ON CONFLICT (key) DO NOTHING;

-- 2b. Safety net — cover any other values that might already exist in
--     scraped_raw.source (e.g. data seeded by tests that isn't in the list
--     above). Without this the FK in step 5 would fail.
INSERT INTO scraping_sources (key, label, domain, status, kind)
SELECT DISTINCT source::text,
                source::text,
                source::text,
                'active'::scraping_source_status,
                'built-in'::scraping_source_kind
FROM scraped_raw
ON CONFLICT (key) DO NOTHING;

-- 2c. Approved candidates (waiting for a scraper implementation).
INSERT INTO scraping_sources (key, label, domain, status, kind)
SELECT domain, domain, domain,
       'active'::scraping_source_status,
       'none'::scraping_source_kind
FROM scraped_source_candidates
WHERE status = 'approved'
ON CONFLICT (key) DO NOTHING;

-- 3. Convert scraped_raw.source: enum → varchar --------------------------------

ALTER TABLE scraped_raw
  ALTER COLUMN source TYPE varchar(64) USING source::text;

-- 4. Drop the now-unused enum type --------------------------------------------

DROP TYPE scraped_source;

-- 5. Wire up the FK -----------------------------------------------------------

ALTER TABLE scraped_raw
  ADD CONSTRAINT scraped_raw_source_fk
  FOREIGN KEY (source) REFERENCES scraping_sources (key)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;
