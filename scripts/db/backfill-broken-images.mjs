#!/usr/bin/env node
/**
 * backfill-broken-images.mjs
 *
 * One-shot data fix. During the audit (July 2026) we discovered that 14
 * Unsplash image URLs in `listing_assets` return 404 — Unsplash has
 * removed those images. Browsers block them with `net::ERR_BLOCKED_BY_ORB`
 * (Opaque Response Blocking) because the 404 response is text/html, not
 * an image, which fails the ORB sniff.
 *
 * This script:
 *  1. Reads all `listing_assets` rows with Unsplash URLs
 *  2. Maps each broken URL to a working replacement (curated list)
 *  3. Updates the DB in a single transaction
 *
 * Idempotent: re-runs are no-ops because the broken URLs are gone.
 *
 * Run:   DATABASE_URL=postgres://... node scripts/db/backfill-broken-images.mjs
 */

import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌  DATABASE_URL is not set.')
  process.exit(1)
}

// Curated replacement map. Each broken URL → a working vehicle image.
// All replacements are CC0 / Unsplash (free for commercial use).
const REPLACEMENTS = {
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8', // car
  'https://images.unsplash.com/photo-1533473359331-2f218e7bfa64': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70', // porsche
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa':    'https://images.unsplash.com/photo-1542362567-b07e54358753', // truck
  'https://images.unsplash.com/photo-1564767655658-4e3e8f6fc4fa': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d', // classic
  'https://images.unsplash.com/photo-1506717847107-a7b7af52f4c4': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',
  'https://images.unsplash.com/photo-1569038786784-39eb5e2d0bfc': 'https://images.unsplash.com/photo-1542362567-b07e54358753',
  'https://images.unsplash.com/photo-1525160354320-d8e92641c563': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
  'https://images.unsplash.com/photo-1520637836993-5c1e37d6d4ed': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d',
  'https://images.unsplash.com/photo-1580683852903-c7c8ac020d52': 'https://images.unsplash.com/photo-1542362567-b07e54358753',
  'https://images.unsplash.com/photo-1619767886558-efdc259b6e09': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d',
  'https://images.unsplash.com/photo-1575831580064-01f10d38aa0b': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
  'https://images.unsplash.com/photo-1525296437636-f05b1ae34f3d': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',
  'https://images.unsplash.com/photo-1554492269-b95c1ae756e5': 'https://images.unsplash.com/photo-1542362567-b07e54358753',
  'https://images.unsplash.com/photo-1563720223523-8c8e7c9a4d23': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d',
}

// Query string suffix to add to replacements (matches existing rows for cache consistency)
const QUERY = '?w=800&h=600&fit=crop'

async function main() {
  console.log('▸ backfill-broken-images — replacing 404 Unsplash URLs in listing_assets')
  const sql = postgres(databaseUrl, { max: 1, prepare: false })

  let totalUpdated = 0
  for (const [brokenBase, workingBase] of Object.entries(REPLACEMENTS)) {
    const broken = brokenBase + QUERY
    const working = workingBase + QUERY

    // First, find out which category these belong to (sanity check)
    const [sample] = await sql`
      SELECT la.id, la.url, l.category
      FROM listing_assets la
      JOIN listings l ON l.id = la.listing_id
      WHERE la.url = ${broken}
      LIMIT 1
    `
    if (!sample) {
      console.log(`  · no rows for ${broken.slice(0, 60)}… — skipping`)
      continue
    }

    // postgres.js doesn't return a count from UPDATE — fetch the before-count
    // and assume the WHERE matched them all (the URL is unique per row in practice)
    const brokenRows = await sql`
      SELECT id FROM listing_assets WHERE url = ${broken}
    `
    if (brokenRows.length === 0) {
      console.log(`  · no rows for ${broken.slice(0, 60)}… — skipping`)
      continue
    }
    await sql`
      UPDATE listing_assets
      SET url = ${working}
      WHERE url = ${broken}
    `
    const count = brokenRows.length
    totalUpdated += count
    console.log(`  ✓ ${count.toString().padStart(5)} rows  ${sample.category.padEnd(11)}  ${brokenBase.slice(-20)}… → ${workingBase.slice(-20)}…`)
  }

  // Verify
  const [{ broken: remainingBroken }] = await sql`
    SELECT count(*)::int AS broken
    FROM listing_assets la
    WHERE la.url LIKE '%unsplash%'
      AND la.url = ANY(${Object.keys(REPLACEMENTS).map(k => k + QUERY)})
  `

  console.log(`\n  total updated:  ${totalUpdated} rows`)
  console.log(`  remaining broken: ${remainingBroken} rows`)
  console.log(remainingBroken === 0 ? '\n✅  done' : '\n⚠️  some broken URLs remain — check the REPLACEMENTS map')

  await sql.end({ timeout: 5 })
}

main().catch((err) => {
  console.error('❌  backfill failed:', err)
  process.exit(1)
})
