// ─── Facebook Events Denmark scraper ─────────────────────────────────────────
// Strategy: Two-phase scraping of public Facebook events.
//
// Phase 1 — Discover event IDs:
//   Search pages (events/search?q=City) render some event cards before the
//   login wall. We extract all a[href*="/events/{numeric-id}"] links.
//
// Phase 2 — Enrich from individual event pages:
//   Public event pages (facebook.com/events/{id}) are accessible without login
//   and contain rich structured data:
//     - <meta property="og:*"> OpenGraph tags
//     - <meta property="event:start_time"> / event:end_time / event:location
//     - <script type="application/ld+json"> schema.org Event objects
//     - Inline JSON blobs in <script> tags (for location coordinates)
//
// Cookies are OPTIONAL — individual event pages work without login.
// With session cookies, the search results are richer (more events visible).
//
// LEGAL NOTE: Scraping Facebook violates their ToS (Section 3.2).
// This script is for internal research only. Never re-sell or redistribute data.

import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { getScraperConfig, pickUserAgent, randomDelay, SCRAPE_TARGETS } from '../config'
import type { ScrapedItem, ScrapeResult, ScraperConfig } from '../types'

const COOKIES_FILE = path.join(import.meta.dirname, '../.fb-cookies.json')

// Matches event IDs in href attributes: relative (/events/ID), absolute, or protocol-relative
const EVENT_ID_RE_STR = '\\/events\\/(\\d{8,})'

interface FbEventRaw {
  id: string
  url: string
  title: string | null
  description: string | null
  startDate: string | null
  endDate: string | null
  locationName: string | null
  locationCity: string | null
  latitude: number | null
  longitude: number | null
  imageUrl: string | null
  isOnline: boolean
}

type Page = import('@playwright/test').Page
type BrowserContext = import('@playwright/test').BrowserContext

// ─── Cookie consent ───────────────────────────────────────────────────────────

async function dismissConsent(page: Page): Promise<void> {
  const selectors = [
    '[data-cookiebanner="accept_button"]',
    '[data-testid="cookie-policy-manage-dialog-accept-button"]',
    'button[title="Accept All"]',
    'button[title="Accepter alle"]',
    '[aria-label="Accept All"]',
    '[aria-label="Accepter alle"]',
    'button[title="Kun nødvendige"]',
  ]
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first()
      if (await el.isVisible({ timeout: 1200 })) {
        await el.click()
        await new Promise((r) => setTimeout(r, 600))
        return
      }
    } catch { /* next */ }
  }
  for (const name of ['Accepter alle', 'Accept All', 'Kun nødvendige']) {
    try {
      const btn = page.getByRole('button', { name })
      if (await btn.isVisible({ timeout: 800 })) {
        await btn.click()
        await new Promise((r) => setTimeout(r, 600))
        return
      }
    } catch { /* next */ }
  }
}

// ─── Phase 1: Discover event IDs from search/explore pages ───────────────────

async function discoverEventIds(
  context: BrowserContext,
  config: ReturnType<typeof getScraperConfig>,
): Promise<Set<string>> {
  const ids = new Set<string>()
  const searchUrls = [...SCRAPE_TARGETS.facebookEvents.searches, SCRAPE_TARGETS.facebookEvents.explore]

  for (const url of searchUrls) {
    if (ids.size >= config.maxItems * 2) break // enough IDs to work with

    const page = await context.newPage()
    try {
      console.log(`[fb-events] Discovering events at: ${url}`)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35_000 })
      await dismissConsent(page)
      await new Promise((r) => setTimeout(r, 2000))

      // Scroll once to load more
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2))
      await new Promise((r) => setTimeout(r, 1500))

      // Extract all event IDs from the page HTML (avoids page.evaluate transpiler issues)
      const html = await page.content()
      const linkRe = new RegExp(EVENT_ID_RE_STR, 'gi')
      const foundIds: string[] = []
      let match: RegExpExecArray | null
      while ((match = linkRe.exec(html)) !== null) {
        const id = match[1]!
        // Minimum 10 digits ensures these are real event IDs (not e.g. post IDs)
        if (id.length >= 10 && !foundIds.includes(id)) foundIds.push(id)
      }

      for (const id of foundIds) ids.add(id)
      console.log(`[fb-events]   Found ${foundIds.length} IDs (total: ${ids.size})`)
    } catch (err) {
      console.warn(`[fb-events] Discovery error at ${url}: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      await page.close()
    }

    if (ids.size < config.maxItems * 2) {
      await randomDelay(config)
    }
  }

  return ids
}

// ─── Phase 2: Enrich individual event pages ───────────────────────────────────
// Uses page.content() + Node.js regex to avoid page.evaluate serialization
// issues with tsx/esbuild __name helpers.

/** Extract a meta tag value from raw HTML string */
function extractMeta(html: string, prop: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i')
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i')
  return (html.match(re) ?? html.match(re2))?.[1]?.trim() ?? null
}

async function enrichEventPage(page: Page, eventId: string): Promise<FbEventRaw | null> {
  const url = `https://www.facebook.com/events/${eventId}/`

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await new Promise((r) => setTimeout(r, 1200))

    const html = await page.content()

    // ── OpenGraph meta tags ────────────────────────────────────────────────
    const title = extractMeta(html, 'og:title')
    const description = extractMeta(html, 'og:description')
    const imageUrl = extractMeta(html, 'og:image')
    const startDate = extractMeta(html, 'event:start_time')
    const endDate = extractMeta(html, 'event:end_time')
    const locationName = extractMeta(html, 'event:location')

    // ── schema.org JSON-LD ─────────────────────────────────────────────────
    let ldLocation: string | null = null
    let ldLatitude: number | null = null
    let ldLongitude: number | null = null
    let ldCity: string | null = null
    let ldStartDate: string | null = null
    let ldEndDate: string | null = null
    let ldDescription: string | null = null
    let isOnline = false

    // Extract all <script type="application/ld+json"> blocks
    const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    let ldMatch: RegExpExecArray | null
    while ((ldMatch = ldRe.exec(html)) !== null) {
      try {
        const data = JSON.parse(ldMatch[1]!) as unknown
        const items = Array.isArray(data) ? data : [data]
        for (const item of items as Record<string, unknown>[]) {
          if (item['@type'] !== 'Event') continue
          ldStartDate = (item['startDate'] as string | null) ?? ldStartDate
          ldEndDate = (item['endDate'] as string | null) ?? ldEndDate
          ldDescription = (item['description'] as string | null) ?? ldDescription

          const loc = item['location'] as Record<string, unknown> | null
          if (loc) {
            if (loc['@type'] === 'VirtualLocation') {
              isOnline = true
            } else {
              ldLocation = (loc['name'] as string | null) ?? null
              const addr = loc['address'] as Record<string, unknown> | null
              if (addr) {
                ldCity =
                  (addr['addressLocality'] as string | null) ??
                  (addr['addressRegion'] as string | null) ??
                  null
              }
              const geo = loc['geo'] as Record<string, unknown> | null
              if (geo) {
                const lat = parseFloat(String(geo['latitude'] ?? ''))
                const lon = parseFloat(String(geo['longitude'] ?? ''))
                if (!isNaN(lat)) ldLatitude = lat
                if (!isNaN(lon)) ldLongitude = lon
              }
            }
          }
        }
      } catch { /* ignore malformed JSON */ }
    }

    // ── Inline JSON for coordinates (Denmark bounding box: lat 54–58, lon 8–15) ──
    if (ldLatitude === null) {
      const latMatch = html.match(/"latitude"\s*:\s*(5[4-8]\.\d+)/)
      const lonMatch = html.match(/"longitude"\s*:\s*((?:[89]|1[0-5])\.\d+)/)
      if (latMatch && lonMatch) {
        ldLatitude = parseFloat(latMatch[1]!)
        ldLongitude = parseFloat(lonMatch[1]!)
      }
    }

    // ── Page title fallback ────────────────────────────────────────────────
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const titleFallback = titleTagMatch?.[1]?.replace(' | Facebook', '').trim() ?? null
    const finalTitle = title ?? titleFallback

    if (!finalTitle || finalTitle === 'Facebook' || finalTitle.toLowerCase().includes('log in')) return null

    return {
      id: eventId,
      url,
      title: finalTitle,
      description: ldDescription ?? description,
      startDate: ldStartDate ?? startDate,
      endDate: ldEndDate ?? endDate,
      locationName: ldLocation ?? locationName,
      locationCity: ldCity,
      latitude: ldLatitude,
      longitude: ldLongitude,
      imageUrl,
      isOnline,
    }
  } catch (err) {
    console.warn(`[fb-events] Failed to enrich event ${eventId}: ${err instanceof Error ? err.message : String(err)}`)
    return null
  }
}

// ─── Raw → ScrapedItem ────────────────────────────────────────────────────────

function eventToScrapedItem(ev: FbEventRaw): ScrapedItem {
  let durationHours: number | null = null
  if (ev.startDate && ev.endDate) {
    const start = new Date(ev.startDate).getTime()
    const end = new Date(ev.endDate).getTime()
    if (!isNaN(start) && !isNaN(end) && end > start) {
      durationHours = Math.round(((end - start) / 3_600_000) * 10) / 10
    }
  }

  return {
    sourceId: `evt_${ev.id}`,
    sourceUrl: ev.url,
    rawData: ev as unknown as Record<string, unknown>,
    mappedCategory: 'experience',
    listingIntent: 'experience',
    title: ev.title,
    description: ev.description,
    price: null, // Facebook events rarely publish price in meta tags
    currency: 'DKK',
    city: ev.locationCity ?? (ev.locationName ? extractCityHint(ev.locationName) : null),
    latitude: ev.latitude,
    longitude: ev.longitude,
    imageUrls: ev.imageUrl ? [ev.imageUrl] : [],
    durationHours,
    maxGuests: null,
    serviceType: ev.isOnline ? 'online_event' : null,
  }
}

/** Rough heuristic: extract Danish city name from a location string */
function extractCityHint(locationName: string): string | null {
  const knownCities = [
    'Copenhagen', 'København', 'Aarhus', 'Århus', 'Odense',
    'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Vejle',
    'Horsens', 'Roskilde', 'Helsingør', 'Fredericia', 'Silkeborg',
  ]
  for (const city of knownCities) {
    if (locationName.toLowerCase().includes(city.toLowerCase())) return city
  }
  return null
}

// ─── Main scraper ─────────────────────────────────────────────────────────────

export async function scrapeFacebookEvents(
  configOverrides: Partial<ScraperConfig> = {},
): Promise<ScrapeResult> {
  const config = getScraperConfig(configOverrides)
  const startTime = Date.now()
  const items: ScrapedItem[] = []
  const errors: string[] = []
  const seenIds = new Set<string>()

  // ── Load cookies (optional) ───────────────────────────────────────────────
  let cookies: Array<Record<string, unknown>> = []
  if (fs.existsSync(COOKIES_FILE)) {
    try {
      cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'))
      console.log('[fb-events] Loaded session cookies — will see more events')
    } catch {
      errors.push('Could not parse .fb-cookies.json — scraping public events only')
    }
  } else {
    console.warn(
      '[fb-events] No cookies. Only public event pages will be scraped.\n' +
        '  Run: npx tsx scripts/scraping/helpers/save-cookies.ts --source facebook',
    )
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ],
    ...(config.proxyUrl ? { proxy: { server: config.proxyUrl } } : {}),
  })

  const context = await browser.newContext({
    userAgent: pickUserAgent(),
    locale: 'da-DK',
    extraHTTPHeaders: { 'Accept-Language': 'da-DK,da;q=0.9,en;q=0.8' },
    viewport: { width: 1440, height: 900 },
  })

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
  })

  if (cookies.length > 0) {
    try {
      await context.addCookies(cookies as unknown as Parameters<typeof context.addCookies>[0])
    } catch {
      errors.push('Failed to apply saved cookies')
    }
  }

  try {
    // ── Phase 1: Discover event IDs ───────────────────────────────────────────
    console.log('[fb-events] Phase 1: Discovering event IDs from search pages...')
    const eventIds = await discoverEventIds(context, config)
    console.log(`[fb-events] Discovered ${eventIds.size} unique event IDs`)

    if (eventIds.size === 0) {
      errors.push(
        'No event IDs discovered. Facebook may require login for event search. ' +
          'Run: npx tsx scripts/scraping/helpers/save-cookies.ts --source facebook',
      )
    }

    // ── Phase 2: Enrich individual event pages ────────────────────────────────
    console.log('[fb-events] Phase 2: Enriching individual event pages...')
    const enrichPage = await context.newPage()
    let enriched = 0

    for (const id of eventIds) {
      if (items.length >= config.maxItems) break

      await randomDelay({ ...config, minDelayMs: 1200, maxDelayMs: 2500 })

      const ev = await enrichEventPage(enrichPage, id)
      if (!ev) {
        console.log(`[fb-events]   Event ${id}: no data (private or deleted)`)
        continue
      }

      const scrapedKey = `evt_${id}`
      if (!seenIds.has(scrapedKey)) {
        seenIds.add(scrapedKey)
        items.push(eventToScrapedItem(ev))
        enriched++
        console.log(`[fb-events]   ✓ ${ev.title?.slice(0, 50) ?? id} (${ev.locationCity ?? ev.locationName ?? 'location unknown'})`)
      }
    }

    await enrichPage.close()
    console.log(`[fb-events] Phase 2 complete: ${enriched} events enriched`)
  } catch (err) {
    errors.push(`fatal: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    await browser.close()
  }

  return {
    source: 'facebook-events',
    items,
    errors,
    durationMs: Date.now() - startTime,
    scrapedAt: new Date(),
  }
}
