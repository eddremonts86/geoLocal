/**
 * Back-fill `normalised` jsonb for existing rows using rule-based normalisation.
 * Run:  pnpm tsx scripts/scraping/backfill-normalised.ts [--source <name>] [--force]
 *
 *   --source <name>  Restrict to one source (default: all 8).
 *   --force          Overwrite rows that already have a normalised payload.
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, and, isNull, sql as dsql } from 'drizzle-orm'
import { scrapedRaw } from '../../src/shared/lib/db/schema'
import { ruleNormalise } from './normalise-rules'
import type { ScrapedSource } from './types'

function parseArgs() {
  const argv = process.argv.slice(2)
  const out: { source?: string; force?: boolean } = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--source') out.source = argv[++i]
    else if (argv[i] === '--force') out.force = true
  }
  return out
}

async function main() {
  const args = parseArgs()
  const connectionString =
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5434/geo_dashboard'
  const client = postgres(connectionString, { prepare: false })
  const db = drizzle(client)

  const whereClauses = []
  if (args.source) whereClauses.push(eq(scrapedRaw.source, args.source as ScrapedSource))
  if (!args.force) whereClauses.push(isNull(scrapedRaw.normalised))
  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined

  const rows = await db
    .select({
      id: scrapedRaw.id,
      source: scrapedRaw.source,
      rawData: scrapedRaw.rawData,
    })
    .from(scrapedRaw)
    .where(where as any)

  console.log(`[backfill] ${rows.length} row(s) to process${args.source ? ` (source=${args.source})` : ''}${args.force ? ' (force)' : ''}`)

  let ok = 0
  let empty = 0
  const bySource = new Map<string, number>()
  for (const r of rows) {
    const normalised = ruleNormalise(r.source as ScrapedSource, r.rawData)
    if (!normalised) {
      empty++
      continue
    }
    await db
      .update(scrapedRaw)
      .set({
        normalised: normalised as unknown as Record<string, unknown>,
        normalisedAt: new Date(),
        normalisedBy: 'rules:v1',
      })
      .where(eq(scrapedRaw.id, r.id))
    ok++
    bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1)
  }

  console.log(`[backfill] updated=${ok}  empty=${empty}`)
  for (const [s, n] of [...bySource.entries()].sort()) console.log(`  ${s.padEnd(20)} ${n}`)

  // Verify: count rows still missing image/address per source
  const check = await db.execute(dsql`
    SELECT source,
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE normalised IS NULL) AS no_normalised,
           COUNT(*) FILTER (WHERE (normalised->>'imageUrl') IS NULL) AS no_image,
           COUNT(*) FILTER (WHERE (normalised->>'address') IS NULL) AS no_address
    FROM scraped_raw GROUP BY source ORDER BY source
  `)
  console.log('\n[verify]')
  for (const row of check as unknown as Array<Record<string, unknown>>) {
    console.log(
      `  ${String(row.source).padEnd(20)} total=${row.total}  noNorm=${row.no_normalised}  noImg=${row.no_image}  noAddr=${row.no_address}`,
    )
  }

  await client.end({ timeout: 5 })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
