/**
 * Boliga (boliga.dk) scraper — Playwright-based to bypass Cloudflare.
 *
 * Strategy (confirmed via live MCP browser inspection 2026-04-23):
 *   - Plain `fetch` against `api.boliga.dk` returns HTTP 403 from Cloudflare
 *     because the request lacks the `__cf_bm` / `cf_clearance` cookies set
 *     when a real browser first loads `www.boliga.dk`.
 *   - Launching chromium, navigating to `https://www.boliga.dk/` to obtain
 *     the CF cookies, then issuing `page.evaluate(() => fetch(apiUrl))` from
 *     the same origin returns HTTP 200 with the full search JSON — same shape
 *     the SPA uses internally.
 *   - Endpoint: `https://api.boliga.dk/api/v2/search/results?pageSize=50&page=N&sort=daysForSale-a`
 *   - Response: `{ meta, results: BoligaRecord[] }` with 44k+ total listings.
 */

import { chromium } from '@playwright/test'
import { getScraperConfig, pickUserAgent } from '../config'
import type { ScrapedItem, ScrapeResult, ScraperConfig } from '../types'

interface BoligaRecord {
  id?: number | string
  estateId?: number | string
  propertyType?: number | string
  price?: number
  rooms?: number
  size?: number
  zipCode?: number | string
  city?: string
  street?: string
  latitude?: number
  longitude?: number
  images?: Array<{ url?: string } | string>
  imageUrl?: string
  description?: string
  buildYear?: number
  [k: string]: unknown
}

interface BoligaApiResponse {
  meta?: {
    totalCount?: number
    totalPages?: number
    pageIndex?: number
    pageSize?: number
  }
  results?: BoligaRecord[]
}

function normalise(rec: BoligaRecord): ScrapedItem | null {
  const id = String(rec.id ?? rec.estateId ?? '').trim()
  if (!id) return null

  const imageUrls: string[] = []
  if (Array.isArray(rec.images)) {
    for (const i of rec.images) {
      if (typeof i === 'string') imageUrls.push(i)
      else if (i?.url) imageUrls.push(i.url)
    }
  } else if (typeof rec.imageUrl === 'string') {
    imageUrls.push(rec.imageUrl)
  }

  const title = rec.street ? `${rec.street}${rec.city ? ', ' + rec.city : ''}` : null

  return {
    sourceId: id,
    sourceUrl: `https://www.boliga.dk/bolig/${id}`,
    rawData: rec as Record<string, unknown>,
    mappedCategory: 'property',
    listingIntent: 'for_sale',
    title,
    description: typeof rec.description === 'string' ? rec.description : null,
    price: typeof rec.price === 'number' ? rec.price : null,
    currency: 'DKK',
    city: rec.city ?? null,
    latitude: typeof rec.latitude === 'number' ? rec.latitude : null,
    longitude: typeof rec.longitude === 'number' ? rec.longitude : null,
    imageUrls,
    durationHours: null,
    maxGuests: null,
    serviceType: null,
    bedrooms: typeof rec.rooms === 'number' ? rec.rooms : null,
    areaSqm: typeof rec.size === 'number' ? rec.size : null,
    yearBuilt: typeof rec.buildYear === 'number' ? rec.buildYear : null,
  }
}

export async function scrapeBoliga(overrides: Partial<ScraperConfig> = {}): Promise<ScrapeResult> {
  const config = getScraperConfig(overrides)
  const startedAt = Date.now()
  const items: ScrapedItem[] = []
  const errors: string[] = []

  const perPage = 50
  const maxPages = Math.ceil(config.maxItems / perPage)

  console.log(`[boliga] launching chromium (headless) to bypass CF for ${config.maxItems} items`)

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
    locale: config.targetLocale,
    extraHTTPHeaders: { 'Accept-Language': `${config.targetLocale},en;q=0.9` },
    viewport: { width: 1440, height: 900 },
  })

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
  })

  const page = await context.newPage()

  try {
    // Warm the origin — gets __cf_bm / cf_clearance cookies automatically.
    console.log('[boliga]   warming origin https://www.boliga.dk/ ...')
    await page.goto('https://www.boliga.dk/', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })

    for (let p = 1; p <= maxPages; p++) {
      if (items.length >= config.maxItems) break
      const apiUrl = `https://api.boliga.dk/api/v2/search/results?pageSize=${perPage}&page=${p}&sort=daysForSale-a`

      const body = await page.evaluate(async (url) => {
        try {
          const res = await fetch(url, { headers: { Accept: 'application/json' } })
          return { status: res.status, text: await res.text() }
        } catch (e) {
          return { status: 0, text: '', error: e instanceof Error ? e.message : String(e) }
        }
      }, apiUrl)

      if (body.status !== 200) {
        errors.push(`page ${p}: HTTP ${body.status}${body.error ? ` (${body.error})` : ''}`)
        break
      }

      let json: BoligaApiResponse
      try {
        json = JSON.parse(body.text) as BoligaApiResponse
      } catch (err) {
        errors.push(`page ${p}: invalid JSON (${(err as Error).message})`)
        break
      }

      const records = json.results ?? []
      if (records.length === 0) {
        console.log(`[boliga]   page ${p}: empty, stopping`)
        break
      }

      let added = 0
      for (const r of records) {
        if (items.length >= config.maxItems) break
        const it = normalise(r)
        if (it) {
          items.push(it)
          added++
        }
      }
      console.log(`[boliga]   page ${p}: ${added} items (total ${items.length}/${config.maxItems})`)

      if (p < maxPages) await page.waitForTimeout(1500 + Math.random() * 1000)
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err))
  } finally {
    await context.close().catch(() => {})
    await browser.close().catch(() => {})
  }

  return {
    source: 'boliga',
    items,
    errors,
    durationMs: Date.now() - startedAt,
    scrapedAt: new Date(),
  }
}
