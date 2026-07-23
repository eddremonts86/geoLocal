#!/usr/bin/env node
/**
 * seed-prod.mjs
 *
 * Idempotent production seed orchestrator. Inspects the current state of
 * the marketplace tables and runs only the seed scripts that are needed:
 *
 *   - `listings` (v2 marketplace)   empty → seed.ts
 *   - vehicle listings              < 10,000 → seed-vehicles-extra.ts
 *   - `properties` (legacy schema)  empty → seed-legacy.ts
 *   - admin user                    not present → seed-admin.ts
 *   - `scraping_sources` registry   empty → seed-scrape-sources.mjs
 *
 * Every child script is itself idempotent (guards in production mode) so
 * re-runs are always safe. The container entrypoint calls this on every
 * boot, so a fresh DB will be bootstrapped automatically and a populated
 * DB will be a no-op.
 *
 * Usage: DATABASE_URL=postgres://... node scripts/db/seed-prod.mjs
 */

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import postgres from 'postgres'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..', '..')

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌  DATABASE_URL is not set.')
  process.exit(1)
}

const sql = postgres(databaseUrl, { max: 1, prepare: false })

function runTsx(label, script, extraEnv = {}) {
  console.log(`\n── ${label} ──`)
  execFileSync(
    'pnpm',
    ['exec', 'tsx', script],
    {
      stdio: 'inherit',
      cwd: repoRoot,
      env: { ...process.env, ...extraEnv },
    },
  )
}

function runNode(label, script, extraEnv = {}) {
  console.log(`\n── ${label} ──`)
  execFileSync('node', [script], {
    stdio: 'inherit',
    cwd: repoRoot,
    env: { ...process.env, ...extraEnv },
  })
}

async function counts() {
  const rows = await sql`
    SELECT
      (SELECT count(*)::int FROM listings)                                           AS listings,
      (SELECT count(*)::int FROM listings WHERE category = 'vehicle')               AS vehicle_listings,
      (SELECT count(*)::int FROM properties)                                        AS properties,
      (SELECT count(*)::int FROM users)                                             AS users,
      (SELECT count(*)::int FROM user_profiles WHERE role = 'admin')                AS admin_profiles,
      (SELECT count(*)::int FROM scraping_sources)                                  AS scraping_sources
  `
  return rows[0]
}

async function main() {
  console.log('▸ seed-prod — production seed orchestrator')
  console.log(`  DATABASE_URL = ${maskUrl(databaseUrl)}`)

  const initial = await counts()
  console.log('\n  Current state:')
  console.log(`    listings               : ${initial.listings}`)
  console.log(`    vehicle_listings       : ${initial.vehicle_listings}`)
  console.log(`    properties (legacy)    : ${initial.properties}`)
  console.log(`    users                  : ${initial.users}`)
  console.log(`    admin_profiles         : ${initial.admin_profiles}`)
  console.log(`    scraping_sources       : ${initial.scraping_sources}`)

  let ranAny = false

  // 1. Registry — must be present before the scraper scheduler can write
  //    to scrape_checkpoints (FK to scraping_sources.key).
  if (initial.scraping_sources === 0) {
    runNode('seed-scrape-sources', 'scripts/db/seed-scrape-sources.mjs')
    ranAny = true
  } else {
    console.log('\n· scraping_sources already populated — skipping')
  }

  // 2. Admin user — only create if no admin profile exists yet. The seed
  //    is idempotent (UPSERT) so re-runs are safe.
  if (initial.admin_profiles === 0) {
    runTsx('seed-admin', 'scripts/db/seed-admin.ts')
    ranAny = true
  } else {
    console.log('\n· admin user already exists — skipping')
  }

  // 3. Marketplace listings — only seed when the v2 listings table is
  //    empty. seed.ts has its own production guard that REFUSES to
  //    TRUNCATE existing rows, so this double-check keeps us safe even
  //    if the script is called from somewhere else.
  let didSeedListings = false
  if (initial.listings === 0) {
    runTsx('seed (listings v2)', 'scripts/db/seed.ts')
    didSeedListings = true
    ranAny = true
  } else {
    console.log('\n· listings already populated — skipping seed.ts')
  }

  // 4. Extra vehicle listings — re-check counts AFTER seed.ts ran, so we
  //    can decide whether the 5k extras are needed.
  const afterSeed = await counts()
  if (afterSeed.vehicle_listings >= 5_000 && afterSeed.vehicle_listings < 10_000) {
    runTsx('seed-vehicles-extra', 'scripts/db/seed-vehicles-extra.ts')
    ranAny = true
  } else if (afterSeed.vehicle_listings >= 10_000) {
    console.log('\n· vehicle extras already seeded — skipping')
  } else {
    console.log('\n· no vehicle listings present (seed.ts must run first) — skipping')
  }

  // 5. Legacy `properties` schema — independent from listings. Only seed
  //    if the table is empty.
  if (afterSeed.properties === 0) {
    runTsx('seed-legacy (properties)', 'scripts/db/seed-legacy.ts')
    ranAny = true
  } else {
    console.log('\n· properties already populated — skipping seed-legacy')
  }

  await sql.end({ timeout: 5 })

  console.log(`\n${ranAny ? '✅  seed-prod finished (some seeds ran)' : '✅  seed-prod finished (no seeds needed — DB already bootstrapped)'}`)
}

function maskUrl(url) {
  try {
    const u = new URL(url)
    if (u.password) u.password = '***'
    return u.toString()
  } catch {
    return '(unparseable)'
  }
}

main().catch((err) => {
  console.error('\n❌  seed-prod failed:', err)
  process.exit(1)
})
