/**
 * AI-assisted enrichment + discovery for scraped_raw rows.
 *
 * Two modes:
 *
 *   --discover            Sample N rows per source, ask the model what useful
 *                         fields exist in the raw payload that the rule-based
 *                         extractor is NOT capturing. Writes findings to
 *                         ./.discovery/<source>-<ts>.json. Does NOT touch the DB.
 *
 *   (default) enrich      For rows whose `normalised` has gaps (missing
 *                         address/bedrooms/yearBuilt/etc.), ask the model to
 *                         fill them by reading the raw payload. Merges
 *                         conservatively: only writes fields the rule-based
 *                         step left null. Records a flag `_aiEnrichedAt`.
 *
 * Flags:
 *   --source <name>       Restrict to one source.
 *   --limit N             Cap rows processed (default: all with gaps).
 *   --sample N            For --discover, samples per source (default 8).
 *   --model <id>          Override AI_MODEL env.
 *   --dry-run             Don't write anything.
 *
 * Env:
 *   AI_SCRAPER_BASE_URL  (required, e.g. http://127.0.0.1:1234/v1)
 *   AI_SCRAPER_MODEL     (optional)
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, and, sql as dsql } from 'drizzle-orm'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { scrapedRaw } from '../../src/shared/lib/db/schema'
import {
  chatJSON,
  isAIEnabled,
  enrichPrompt,
  EnrichedItemSchema,
  discoveryPrompt,
  DiscoveryResponseSchema,
} from '../../src/shared/lib/ai'
import type { ScrapedSource } from './types'

interface Args {
  discover?: boolean
  source?: ScrapedSource
  limit?: number
  sample?: number
  model?: string
  dryRun?: boolean
}

function parseArgs(): Args {
  const argv = process.argv.slice(2)
  const out: Args = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--discover') out.discover = true
    else if (a === '--source') out.source = argv[++i] as ScrapedSource
    else if (a === '--limit') out.limit = Number(argv[++i])
    else if (a === '--sample') out.sample = Number(argv[++i])
    else if (a === '--model') out.model = argv[++i]
    else if (a === '--dry-run') out.dryRun = true
  }
  return out
}

function getDb() {
  const connectionString =
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5434/geo_dashboard'
  const client = postgres(connectionString, { prepare: false })
  const db = drizzle(client)
  return { db, client }
}

const ALL_SOURCES: ScrapedSource[] = [
  'boligsiden', 'boliga', 'homestra', 'edc',
  'facebook', 'facebook-events', 'airbnb', 'linkedin',
]

// ─── discovery mode ───────────────────────────────────────────────────────────

async function runDiscovery(args: Args) {
  const { db, client } = getDb()
  const sources = args.source ? [args.source] : ALL_SOURCES
  const sampleSize = args.sample ?? 8
  const outDir = join(process.cwd(), '.discovery')
  mkdirSync(outDir, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

  for (const src of sources) {
    console.log(`\n[discover] ${src} — sampling ${sampleSize} rows…`)
    const rows = await db.execute(dsql`
      SELECT source_id, raw_data, normalised
      FROM scraped_raw
      WHERE source = ${src}
      ORDER BY random()
      LIMIT ${sampleSize}
    `)
    const samples = (rows as unknown as Array<any>).map((r) => ({
      sourceId: String(r.source_id),
      rawJson: r.raw_data,
      extracted: r.normalised ?? null,
    }))
    if (samples.length === 0) {
      console.log(`[discover]   no rows for ${src}, skipping`)
      continue
    }
    try {
      const { data, modelReported } = await chatJSON({
        messages: discoveryPrompt({ source: src, samples }),
        schema: DiscoveryResponseSchema,
      })
      const file = join(outDir, `${src}-${ts}.json`)
      writeFileSync(file, JSON.stringify({ source: src, model: modelReported, samples: samples.length, findings: data.findings }, null, 2))
      console.log(`[discover]   ${data.findings.length} findings → ${file}`)
      for (const f of data.findings.slice(0, 5)) {
        const finding = f as Record<string, unknown>
        const path = String(finding.jsonPath ?? finding.path ?? '?')
        const name = String(finding.suggestedName ?? finding.name ?? '?')
        const reason = String(finding.reasoning ?? finding.reason ?? '')
        const usefulness = String(finding.usefulness ?? finding.priority ?? 'medium')
        console.log(`    [${usefulness}] ${path.padEnd(32)} → ${name}  (${reason.slice(0, 80)})`)
      }
      if (data.findings.length > 5) console.log(`    … +${data.findings.length - 5} more`)
    } catch (err) {
      console.warn(`[discover]   ${src} failed: ${err instanceof Error ? err.message : err}`)
    }
  }

  await client.end({ timeout: 5 })
}

// ─── enrichment mode ──────────────────────────────────────────────────────────

function mergeConservative(
  existing: Record<string, unknown> | null,
  aiOut: Record<string, unknown>,
): Record<string, unknown> {
  const base: Record<string, unknown> = { ...(existing ?? {}) }
  for (const [k, v] of Object.entries(aiOut)) {
    if (v === null || v === undefined) continue
    if (Array.isArray(v) && v.length === 0) continue
    // Never override a value the rule-based step already filled.
    const cur = base[k]
    if (cur === null || cur === undefined || cur === '' || (Array.isArray(cur) && cur.length === 0)) {
      base[k] = v
    }
  }
  base._aiEnrichedAt = new Date().toISOString()
  return base
}

function hasGaps(norm: Record<string, unknown> | null): boolean {
  if (!norm) return true
  // Core identity fields — if any is null/empty the row is under-populated.
  const coreKeys = ['title', 'address', 'imageUrl', 'city']
  if (
    coreKeys.some((k) => {
      const v = norm[k]
      return v === null || v === undefined || v === ''
    })
  ) {
    return true
  }
  // Enrichable property/listing fields — AI can often extract these from
  // free-form descriptions even when the rule-based extractor can't.
  const enrichKeys = ['bedrooms', 'bathrooms', 'areaSqm', 'yearBuilt', 'country']
  if (
    enrichKeys.some((k) => {
      const v = norm[k]
      return v === null || v === undefined
    })
  ) {
    return true
  }
  // Tags: missing or empty array counts as a gap.
  const tags = norm.tags
  if (!Array.isArray(tags) || tags.length === 0) return true
  return false
}

async function runEnrich(args: Args) {
  if (!isAIEnabled()) {
    console.error('AI_BASE_URL not set — cannot enrich. Export it first (e.g. AI_BASE_URL=http://127.0.0.1:1234/v1).')
    process.exit(1)
  }
  if (args.model) process.env.AI_MODEL = args.model

  const { db, client } = getDb()
  const whereParts = []
  if (args.source) whereParts.push(eq(scrapedRaw.source, args.source))
  // Only process rows we already normalised (AI builds on top of rules).
  const baseWhere = whereParts.length > 0 ? and(...whereParts) : undefined

  const rows = await db
    .select({
      id: scrapedRaw.id,
      source: scrapedRaw.source,
      sourceUrl: scrapedRaw.sourceUrl,
      rawData: scrapedRaw.rawData,
      normalised: scrapedRaw.normalised,
      normalisedBy: scrapedRaw.normalisedBy,
    })
    .from(scrapedRaw)
    .where(baseWhere as any)

  // Candidates: rows with gaps in rule-based output, and not yet AI-enriched.
  const candidates = rows.filter((r) => {
    const norm = r.normalised as Record<string, unknown> | null
    if (norm && norm._aiEnrichedAt) return false
    return hasGaps(norm)
  })

  const todo = args.limit ? candidates.slice(0, args.limit) : candidates
  console.log(`[enrich] candidates=${candidates.length}  processing=${todo.length}  dryRun=${!!args.dryRun}`)

  let ok = 0
  let fail = 0
  const bySource = new Map<string, { ok: number; fail: number }>()
  const bumpMap = (s: string, field: 'ok' | 'fail') => {
    const cur = bySource.get(s) ?? { ok: 0, fail: 0 }
    cur[field]++
    bySource.set(s, cur)
  }

  const t0 = Date.now()
  for (let i = 0; i < todo.length; i++) {
    const r = todo[i]
    try {
      const { data, modelReported } = await chatJSON({
        messages: enrichPrompt({
          source: r.source,
          sourceUrl: r.sourceUrl ?? '',
          rawJson: r.rawData,
          existing: r.normalised as Record<string, unknown> | null,
        }),
        schema: EnrichedItemSchema,
      })
      const merged = mergeConservative(r.normalised as Record<string, unknown> | null, data as Record<string, unknown>)
      const by = `${r.normalisedBy ?? 'rules:v1'}+ai:${modelReported}`.slice(0, 64)
      if (!args.dryRun) {
        await db
          .update(scrapedRaw)
          .set({ normalised: merged, normalisedAt: new Date(), normalisedBy: by })
          .where(eq(scrapedRaw.id, r.id))
      }
      ok++
      bumpMap(r.source, 'ok')
      {
        const secs = ((Date.now() - t0) / 1000).toFixed(0)
        console.log(`[enrich] ${i + 1}/${todo.length}  ok=${ok}  fail=${fail}  elapsed=${secs}s  ${r.source}/${r.id.slice(0, 8)}`)
      }
    } catch (err) {
      fail++
      bumpMap(r.source, 'fail')
      const msg = err instanceof Error ? err.message : String(err)
      if (fail <= 5) console.warn(`  ! ${r.source}/${r.id.slice(0, 8)}: ${msg.slice(0, 160)}`)
    }
  }

  console.log(`\n[enrich] done  ok=${ok}  fail=${fail}  elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`)
  for (const [s, c] of [...bySource.entries()].sort()) {
    console.log(`  ${s.padEnd(20)} ok=${c.ok}  fail=${c.fail}`)
  }

  // Coverage report
  const check = await db.execute(dsql`
    SELECT source,
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE (normalised->>'address')   IS NOT NULL) AS w_addr,
           COUNT(*) FILTER (WHERE (normalised->>'bedrooms')  IS NOT NULL) AS w_beds,
           COUNT(*) FILTER (WHERE (normalised->>'areaSqm')   IS NOT NULL) AS w_area,
           COUNT(*) FILTER (WHERE (normalised->>'yearBuilt') IS NOT NULL) AS w_year,
           COUNT(*) FILTER (WHERE (normalised->>'_aiEnrichedAt') IS NOT NULL) AS ai_enriched
    FROM scraped_raw ${args.source ? dsql`WHERE source = ${args.source}` : dsql``}
    GROUP BY source ORDER BY source
  `)
  console.log('\n[coverage]')
  for (const row of check as unknown as Array<Record<string, unknown>>) {
    console.log(
      `  ${String(row.source).padEnd(20)} total=${row.total}  addr=${row.w_addr}  beds=${row.w_beds}  area=${row.w_area}  year=${row.w_year}  ai=${row.ai_enriched}`,
    )
  }

  await client.end({ timeout: 5 })
}

async function main() {
  const args = parseArgs()
  if (args.discover) await runDiscovery(args)
  else await runEnrich(args)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
