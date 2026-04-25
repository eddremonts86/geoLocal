#!/usr/bin/env tsx
// ─── Scraping runner — CLI entry point ────────────────────────────────────────
// Runs manually: npx tsx scripts/scraping/runner.ts [options]
//
// Options:
//   --source <list>   Sources to scrape: comma-separated or 'all'. Valid:
//                     airbnb, facebook, facebook-events, linkedin,
//                     edc, homestra, boligsiden, boliga, all (default: all)
//   --max N           Max items per source (default: 100)
//   --dry-run         Scrape but don't write to DB
//   --skip-ai         Skip AI normalisation even if AI_BASE_URL is set
//
// Examples:
//   npx tsx scripts/scraping/runner.ts --source boligsiden --max 50
//   npx tsx scripts/scraping/runner.ts --source edc,boliga --max 20

import { config } from 'dotenv'
config({ path: '.env.development' })
config()

import { scrapeAirbnb } from './scrapers/airbnb'
import { scrapeFacebook } from './scrapers/facebook'
import { scrapeFacebookEvents } from './scrapers/facebook-events'
import { scrapeLinkedIn } from './scrapers/linkedin'
import { scrapeEdc } from './scrapers/edc'
import { scrapeBoligsiden } from './scrapers/boligsiden'
import { scrapeBoliga } from './scrapers/boliga'
import { scrapeHomestra } from './scrapers/homestra'
import { scrapeBilbasen } from './scrapers/bilbasen'
import { scrapeDba } from './scrapers/dba'
import { saveScrapeResults, printSummary, type NormaliseMeta } from './storage'
import { normaliseBatch } from './normalise'
import { isAIEnabled } from '../../src/shared/lib/ai'
import type { ScrapedSource, RunnerOptions, ScrapeResult } from './types'

interface ParsedOptions extends RunnerOptions {
  skipAI: boolean
}

type ScraperFn = (opts: { maxItems: number; dryRun: boolean }) => Promise<ScrapeResult>

/**
 * Registry of scrapers we know how to run. Source keys approved in the admin
 * discovery flow that are NOT in this map appear in the UI as
 * "Approved · awaiting scraper" — approving a candidate no longer requires a
 * DB migration, only adding an entry here once a scraper module is written.
 */
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

const ALL_SOURCES: ScrapedSource[] = Object.keys(SCRAPER_REGISTRY)

function parseArgs(): ParsedOptions {
  const args = process.argv.slice(2)
  const sourceArg = args.find((a) => a.startsWith('--source'))
  const maxArg = args.find((a) => a.startsWith('--max'))
  const dryRun = args.includes('--dry-run')
  const skipAI = args.includes('--skip-ai')

  const rawSource = sourceArg?.includes('=')
    ? sourceArg.split('=')[1]
    : args[args.indexOf('--source') + 1]

  let sources: ScrapedSource[]
  if (!rawSource || rawSource === 'all') {
    sources = ALL_SOURCES
  } else {
    const parts = rawSource.split(',').map((s) => s.trim())
    const invalid = parts.filter((s) => !SCRAPER_REGISTRY[s])
    if (invalid.length > 0) {
      console.error(`No scraper registered for: ${invalid.join(', ')}. Known: ${ALL_SOURCES.join(', ')}, all`)
      process.exit(1)
    }
    sources = parts
  }

  const maxItems = maxArg
    ? parseInt(maxArg.includes('=') ? maxArg.split('=')[1]! : args[args.indexOf('--max') + 1]!, 10)
    : 100

  return { sources, maxItems: isNaN(maxItems) ? 100 : maxItems, dryRun, skipAI }
}

async function runOne(
  source: ScrapedSource,
  overrides: { maxItems: number; dryRun: boolean },
): Promise<ScrapeResult> {
  const fn = SCRAPER_REGISTRY[source]
  if (!fn) throw new Error(`No scraper registered for source "${source}"`)
  return fn(overrides)
}

async function run() {
  const options = parseArgs()

  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║         GeoLocal — Scraping Runner                      ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log(`  Sources   : ${options.sources.join(', ')}`)
  console.log(`  Max items : ${options.maxItems} per source`)
  console.log(`  Dry run   : ${options.dryRun ? 'YES — nothing will be saved' : 'NO — results will be saved to DB'}`)
  const aiState = options.skipAI
    ? 'SKIPPED (--skip-ai)'
    : isAIEnabled()
      ? 'ENABLED (via AI_BASE_URL)'
      : 'not configured — rule-based only'
  console.log(`  AI        : ${aiState}`)
  console.log()

  for (const source of options.sources) {
    console.log(`\n▶ Starting ${source} scraper...`)
    const configOverrides = { maxItems: options.maxItems, dryRun: options.dryRun }

    try {
      let result = await runOne(source, configOverrides)

      let normalisedByMap: Map<string, NormaliseMeta> | undefined
      if (!options.dryRun && result.items.length > 0) {
        console.log(`  → normalising ${result.items.length} items...`)
        const { items: normalised, normalisedByMap: map } = await normaliseBatch(
          result.items,
          source,
          { skipAI: options.skipAI },
        )
        result = { ...result, items: normalised }
        normalisedByMap = map
      }

      const saveResult = await saveScrapeResults(source, result.items, options.dryRun, normalisedByMap)
      printSummary(result, saveResult)
    } catch (err) {
      console.error(`\n✗ ${source} scraper failed:`, err instanceof Error ? err.message : err)
    }
  }

  console.log('\n✓ All scrapers finished.')
  console.log('  Review pending items at: /admin/scraping')
  process.exit(0)
}

run()
