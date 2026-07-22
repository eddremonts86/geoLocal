// ─── Scraping storage layer ───────────────────────────────────────────────────
// Persists scraped items to the scraped_raw staging table.
// Deduplicates on (source, source_id) — already-scraped items are skipped.

import { and, eq, inArray } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { scrapedRaw } from '../../src/shared/lib/db/schema'
import type { ScrapedItem, ScrapedSource, ScrapeResult } from './types'

function getDb() {
  const connectionString =
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5434/geo_dashboard'
  const client = postgres(connectionString, { prepare: false })
  return { client, db: drizzle(client) }
}

export interface SaveResult {
  saved: number
  skipped: number
  updated: number
  errors: string[]
}

export function classifySourceIds(sourceIds: string[], existingIds: Set<string>) {
  const uniqueIds = [...new Set(sourceIds)]
  return {
    newIds: uniqueIds.filter((id) => !existingIds.has(id)),
    knownIds: uniqueIds.filter((id) => existingIds.has(id)),
  }
}

export interface NormaliseMeta {
  by: string | null
  json: Record<string, unknown> | null
}

/**
 * Persist scrape results into the scraped_raw staging table.
 * Items already present (same source + sourceId) are skipped.
 */
export async function saveScrapeResults(
  source: ScrapedSource,
  items: ScrapedItem[],
  dryRun = false,
  normalisedByMap?: Map<string, NormaliseMeta>,
): Promise<SaveResult> {
  if (dryRun) {
    console.log(`[storage] dry-run — would save ${items.length} items from ${source}`)
    return { saved: 0, skipped: 0, updated: 0, errors: [] }
  }

  const { client, db } = getDb()
  let saved = 0
  let skipped = 0
  let updated = 0
  const errors: string[] = []

  try {
    const ids = [...new Set(items.map((item) => item.sourceId))]
    const existingRows = ids.length
      ? await db
          .select({ sourceId: scrapedRaw.sourceId })
          .from(scrapedRaw)
          .where(and(eq(scrapedRaw.source, source), inArray(scrapedRaw.sourceId, ids)))
      : []
    const existingIds = new Set(existingRows.map((row) => row.sourceId))

    for (const item of items) {
      try {
        const meta = normalisedByMap?.get(item.sourceId)
        const rawData = item.listingIntent
          ? { ...item.rawData, _listingIntent: item.listingIntent }
          : item.rawData
        const values = {
          source,
          sourceId: item.sourceId,
          sourceUrl: item.sourceUrl,
          rawData,
          mappedCategory: item.mappedCategory ?? undefined,
          status: 'pending',
          scrapedAt: new Date(),
          normalised: meta?.json ?? undefined,
          normalisedAt: meta?.json ? new Date() : undefined,
          normalisedBy: meta?.by ?? undefined,
        } as const

        await db
          .insert(scrapedRaw)
          .values(values)
          .onConflictDoUpdate({
            target: [scrapedRaw.source, scrapedRaw.sourceId],
            set: {
              sourceUrl: item.sourceUrl,
              rawData,
              mappedCategory: item.mappedCategory ?? undefined,
              scrapedAt: new Date(),
              ...(meta?.json
                ? {
                    normalised: meta.json,
                    normalisedAt: new Date(),
                    normalisedBy: meta.by ?? undefined,
                  }
                : {}),
            },
          })

        if (existingIds.has(item.sourceId)) {
          updated++
          skipped++
        } else {
          saved++
          existingIds.add(item.sourceId)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`[${item.sourceId}] ${msg}`)
      }
    }
  } finally {
    await client.end({ timeout: 5 })
  }

  return { saved, skipped, updated, errors }
}

/**
 * Print a human-readable summary of a ScrapeResult to stdout.
 */
export function printSummary(result: ScrapeResult, saveResult: SaveResult): void {
  const line = '─'.repeat(56)
  console.log(`\n${line}`)
  console.log(`  Source      : ${result.source}`)
  console.log(`  Scraped     : ${result.items.length} items`)
  console.log(`  Duration    : ${(result.durationMs / 1000).toFixed(1)}s`)
  console.log(`  Saved       : ${saveResult.saved}`)
  console.log(`  Refreshed   : ${saveResult.updated} active records`)
  console.log(`  Skipped     : ${saveResult.skipped} (already exist)`)
  if (result.errors.length > 0) {
    console.log(`  Scrape errs : ${result.errors.length}`)
    result.errors.forEach((e) => console.log(`    - ${e}`))
  }
  if (saveResult.errors.length > 0) {
    console.log(`  Save errors : ${saveResult.errors.length}`)
    saveResult.errors.forEach((e) => console.log(`    - ${e}`))
  }
  console.log(line)
}
