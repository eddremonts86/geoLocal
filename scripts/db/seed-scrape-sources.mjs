#!/usr/bin/env node
/**
 * seed-scrape-sources.mjs
 *
 * Idempotent seed for the `scraping_sources` registry table.
 *
 * `scrape_checkpoints.source` and `scrape_runs.source` both FK to
 * `scraping_sources.key`, so the registry MUST be populated before the
 * scraper scheduler runs its first tick. Migration 0008 used to do this
 * inline, but on a fresh prod DB (where 0000_initial already created the
 * table) that migration is a no-op and the seeds get skipped — leading
 * to a crash-loop with "violates foreign key constraint".
 *
 * Must mirror SCRAPER_REGISTRY_KEYS in
 * src/shared/lib/scraping/registry.ts — if you add a new built-in scraper
 * there, add it here too.
 *
 * Usage: DATABASE_URL=postgres://... node scripts/db/seed-scrape-sources.mjs
 */

import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌  DATABASE_URL is not set.')
  process.exit(1)
}

const BUILT_INS = [
  { key: 'airbnb',          label: 'Airbnb',           domain: 'airbnb.com',          country: 'DK' },
  { key: 'facebook',        label: 'Facebook Pages',   domain: 'facebook.com',        country: 'DK' },
  { key: 'facebook-events', label: 'Facebook Events',  domain: 'facebook.com/events', country: 'DK' },
  { key: 'linkedin',        label: 'LinkedIn',         domain: 'linkedin.com',        country: 'DK' },
  { key: 'edc',             label: 'EDC',              domain: 'edc.dk',              country: 'DK' },
  { key: 'homestra',        label: 'Homestra',         domain: 'homestra.com',        country: 'DK' },
  { key: 'boligsiden',      label: 'Boligsiden',       domain: 'boligsiden.dk',       country: 'DK' },
  { key: 'boliga',          label: 'Boliga',           domain: 'boliga.dk',           country: 'DK' },
]

const sql = postgres(databaseUrl, { max: 1, prepare: false })

try {
  let inserted = 0
  let skipped = 0

  for (const src of BUILT_INS) {
    const rows = await sql`
      INSERT INTO scraping_sources (key, label, domain, status, kind, country)
      VALUES (${src.key}, ${src.label}, ${src.domain}, 'active', 'built-in', ${src.country})
      ON CONFLICT (key) DO NOTHING
      RETURNING key
    `
    if (rows.length > 0) {
      inserted += 1
      console.log(`  ✓ ${src.key}`)
    } else {
      skipped += 1
    }
  }

  // Safety net: any other source already present in scraped_raw but missing
  // from the registry would still crash the scraper. Cover those.
  const extras = await sql`
    INSERT INTO scraping_sources (key, label, domain, status, kind)
    SELECT DISTINCT source::text, source::text, source::text,
                    'active'::scraping_source_status, 'built-in'::scraping_source_kind
    FROM scraped_raw
    WHERE source::text NOT IN (SELECT key FROM scraping_sources)
    ON CONFLICT (key) DO NOTHING
    RETURNING key
  `
  for (const r of extras) {
    console.log(`  ✓ ${r.key} (existed in scraped_raw, added to registry)`)
  }
  inserted += extras.length

  const [count] = await sql`SELECT count(*)::int AS n FROM scraping_sources`
  console.log(`\n✅  scraping_sources ready: ${count.n} rows (${inserted} new, ${skipped} already present)`)
} catch (err) {
  console.error('❌  seed-scrape-sources failed:', err)
  process.exit(1)
} finally {
  await sql.end({ timeout: 5 })
}
