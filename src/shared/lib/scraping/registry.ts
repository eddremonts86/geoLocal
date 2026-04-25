/**
 * Pure-TS list of scraper keys we have implementations for.
 *
 * This file MUST stay free of Playwright/Node-only imports so it can be
 * imported by both the CLI runner (`scripts/scraping/runner.ts`) and by
 * server functions that may be bundled for the client (`scraping-sources.fn.ts`).
 *
 * When you add a new scraper module under `scripts/scraping/scrapers/`, add
 * its key here and wire it into `SCRAPER_REGISTRY` in `runner.ts`.
 *
 * The database table `scraping_sources` is the runtime source of truth for
 * *which* sources exist and their status; this constant is the build-time
 * source of truth for *which sources have a scraper wired up*.
 */
export const SCRAPER_REGISTRY_KEYS = [
  'airbnb',
  'facebook',
  'facebook-events',
  'linkedin',
  'edc',
  'homestra',
  'boligsiden',
  'boliga',
  'bilbasen',
  'dba',
] as const

export type RegisteredScraperKey = (typeof SCRAPER_REGISTRY_KEYS)[number]

export function isRegisteredScraper(key: string): key is RegisteredScraperKey {
  return (SCRAPER_REGISTRY_KEYS as readonly string[]).includes(key)
}
