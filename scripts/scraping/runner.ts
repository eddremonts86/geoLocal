#!/usr/bin/env tsx

import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { isAIEnabled } from '../../src/shared/lib/ai'
import { CheckpointStore, type RunTotals } from './checkpoint-store'
import { normaliseBatch } from './normalise'
import {
  incrementalBatchLimit,
  shouldStopIncremental,
  type PageCursor,
  type ScrapeWatermark,
} from './orchestration'
import { waitForSourceBudget } from './rate-policy'
import { parseRunnerArgs, type ParsedRunnerOptions } from './runner-options'
import { scrapeAirbnb } from './scrapers/airbnb'
import { scrapeBilbasen } from './scrapers/bilbasen'
import { scrapeBoliga } from './scrapers/boliga'
import { scrapeBoligsiden } from './scrapers/boligsiden'
import { scrapeDba } from './scrapers/dba'
import { scrapeEdc } from './scrapers/edc'
import { scrapeFacebook } from './scrapers/facebook'
import { scrapeFacebookEvents } from './scrapers/facebook-events'
import { scrapeHomestra } from './scrapers/homestra'
import { scrapeLinkedIn } from './scrapers/linkedin'
import { isSourceRunnable } from './source-policy'
import { saveScrapeResults, printSummary, type NormaliseMeta } from './storage'
import type { ScrapedSource, ScrapeResult, ScraperConfig } from './types'

config({ path: '.env.development' })
config()

type ScraperFn = (opts: Partial<ScraperConfig>) => Promise<ScrapeResult>

export const SCRAPER_REGISTRY: Record<string, ScraperFn> = {
  airbnb: scrapeAirbnb,
  facebook: scrapeFacebook,
  'facebook-events': scrapeFacebookEvents,
  linkedin: scrapeLinkedIn,
  edc: scrapeEdc,
  homestra: scrapeHomestra,
  boligsiden: scrapeBoligsiden,
  boliga: scrapeBoliga,
  bilbasen: scrapeBilbasen,
  dba: scrapeDba,
}

export const RUNNABLE_SOURCES = Object.keys(SCRAPER_REGISTRY).filter(isSourceRunnable)

function emptyTotals(): RunTotals {
  return { found: 0, saved: 0, updated: 0, known: 0, errors: 0 }
}

async function scrapeAndSaveBatch(input: {
  source: ScrapedSource
  options: ParsedRunnerOptions
  cursor: PageCursor
  store?: CheckpointStore
}) {
  const scraper = SCRAPER_REGISTRY[input.source]
  if (!scraper) throw new Error(`No scraper registered for source "${input.source}"`)
  let result = await scraper({
    maxItems: input.options.maxItems,
    dryRun: input.options.dryRun,
    startPage: input.cursor.page,
    flow: input.options.flow,
  })
  if (result.errors.length > 0) {
    throw new Error(result.errors.join('; '))
  }

  let normalisedByMap: Map<string, NormaliseMeta> | undefined
  if (!input.options.dryRun && result.items.length > 0) {
    const knownIds = input.store
      ? await input.store.knownSourceIds(input.source, result.items.map((item) => item.sourceId))
      : new Set<string>()
    const itemsToNormalise = result.items.filter((item) => !knownIds.has(item.sourceId))
    const normalised = await normaliseBatch(itemsToNormalise, input.source, {
      skipAI: input.options.skipAI,
    })
    const normalisedById = new Map(normalised.items.map((item) => [item.sourceId, item]))
    result = {
      ...result,
      items: result.items.map((item) => normalisedById.get(item.sourceId) ?? item),
    }
    normalisedByMap = normalised.normalisedByMap
  }
  const saveResult = await saveScrapeResults(
    input.source,
    result.items,
    input.options.dryRun,
    normalisedByMap,
  )
  printSummary(result, saveResult)
  return { result, saveResult }
}

async function runDrySource(source: string, options: ParsedRunnerOptions) {
  await scrapeAndSaveBatch({ source, options, cursor: { page: 1 } })
}

async function runManagedSource(
  source: string,
  options: ParsedRunnerOptions,
  store: CheckpointStore,
) {
  const owner = `${process.pid}-${randomUUID()}`
  const checkpoint = await store.claim(source, options.flow, owner)
  if (!checkpoint) {
    console.log(`[runner] ${source}/${options.flow} is not due, paused, exhausted, or already leased`)
    return
  }
  const runId = await store.startRun(checkpoint)
  const totals = emptyTotals()
  let cursor = checkpoint.cursor
  let watermark = checkpoint.watermark
  let capturedIncrementalWatermark = false
  let consecutiveKnownItems = checkpoint.consecutiveKnownItems
  let exhausted = false
  let stopReason = 'slice_complete'

  try {
    const maxBatches = options.flow === 'incremental'
      ? incrementalBatchLimit(
          source,
          Number(process.env.SCRAPE_INCREMENTAL_MAX_BATCHES ?? 5),
        )
      : 1

    for (let batch = 0; batch < maxBatches; batch++) {
      const { result, saveResult } = await scrapeAndSaveBatch({ source, options, cursor, store })
      totals.found += result.items.length
      totals.saved += saveResult.saved
      totals.updated += saveResult.updated
      totals.known += saveResult.skipped
      totals.errors += result.errors.length + saveResult.errors.length
      if (saveResult.errors.length) throw new Error(saveResult.errors.join('; '))

      if (options.flow === 'incremental' && !capturedIncrementalWatermark && result.items[0]) {
        watermark = {
          sourceId: result.items[0].sourceId,
          observedAt: result.scrapedAt.toISOString(),
        } satisfies ScrapeWatermark
        capturedIncrementalWatermark = true
      }
      consecutiveKnownItems = saveResult.saved > 0
        ? 0
        : consecutiveKnownItems + result.items.length
      cursor = result.nextCursor ?? { page: cursor.page + 1 }
      exhausted = result.exhausted === true

      if (exhausted) {
        stopReason = 'source_exhausted'
        break
      }
      if (
        options.flow === 'incremental' &&
        shouldStopIncremental({
          consecutiveKnownItems,
          pageSize: options.maxItems,
          knownPagesThreshold: 2,
          partitioned: Boolean(cursor.partition),
        })
      ) {
        stopReason = 'known_watermark_overlap'
        break
      }
      if (options.flow === 'backfill') break
      await waitForSourceBudget(source)
    }

    const incrementalHours = Number(process.env.SCRAPE_INCREMENTAL_INTERVAL_HOURS ?? 6)
    const backfillMinutes = Number(process.env.SCRAPE_BACKFILL_INTERVAL_MINUTES ?? 20)
    const nextRunAt = new Date(
      Date.now() +
        (options.flow === 'incremental'
          ? incrementalHours * 60 * 60_000
          : backfillMinutes * 60_000),
    )
    const persistedCursor = options.flow === 'incremental' ? { page: 1 } : cursor
    await store.succeed({
      checkpoint,
      runId,
      owner,
      cursor: persistedCursor,
      watermark,
      consecutiveKnownItems: options.flow === 'incremental' ? 0 : consecutiveKnownItems,
      exhausted,
      totals,
      stopReason,
      nextRunAt,
    })
  } catch (error) {
    await store.fail({ checkpoint, runId, owner, error })
    throw error
  }
}

export async function runScraping(args = process.argv.slice(2)) {
  const options = parseRunnerArgs(args, RUNNABLE_SOURCES)
  console.log(`GeoLocal scraper | flow=${options.flow} | sources=${options.sources.join(',')}`)
  console.log(`AI normalisation: ${options.skipAI ? 'disabled' : isAIEnabled() ? 'enabled' : 'rules only'}`)

  if (options.dryRun) {
    for (const source of options.sources) await runDrySource(source, options)
    return
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL is required for managed scraping')
  const store = new CheckpointStore(databaseUrl)
  try {
    await store.reconcileStaleRuns()
    for (const source of options.sources) {
      try {
        await runManagedSource(source, options, store)
      } catch (error) {
        console.error(`[runner] ${source}/${options.flow} failed:`, error)
      }
    }
  } finally {
    await store.close()
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isDirectRun) {
  runScraping().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
