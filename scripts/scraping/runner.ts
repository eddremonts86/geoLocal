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
import { saveScrapeResults, printSummary, type NormaliseMeta } from './storage'
import { normaliseBatch } from './normalise'
import { isAIEnabled } from '../../src/shared/lib/ai'
import type { ScrapedSource, RunnerOptions, ScrapeResult } from './types'

interface ParsedOptions extends RunnerOptions {
  skipAI: boolean
}

const ALL_SOURCES: ScrapedSource[] = [
  'airbnb', 'facebook', 'facebook-events', 'linkedin',
  'edc', 'homestra', 'boligsiden', 'boliga',
]

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
    const parts = rawSource.split(',').map((s) => s.trim()) as ScrapedSource[]
    const invalid = parts.filter((s) => !ALL_SOURCES.includes(s))
    if (invalid.length > 0) {
      console.error(`Unknown source(s): ${invalid.join(', ')}. Valid: ${ALL_SOURCES.join(', ')}, all`)
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
  switch (source) {
    case 'airbnb':          return scrapeAirbnb(overrides)
    case 'facebook':        return scrapeFacebook(overrides)
    case 'facebook-events': return scrapeFacebookEvents(overrides)
    case 'linkedin':        return scrapeLinkedIn(overrides)
    case 'edc':             return scrapeEdc(overrides)
    case 'boligsiden':      return scrapeBoligsiden(overrides)
    case 'boliga':          return scrapeBoliga(overrides)
    case 'homestra':        return scrapeHomestra(overrides)
  }
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
