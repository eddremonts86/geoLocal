/**
 * DBA (dba.dk) scraper — Den Blå Avis, Denmark's largest general classifieds.
 *
 * We only target the `/mobility/search/car` section (used cars) because it's
 * the one that ships a rich schema.org `ItemList` with per-item brand/model/
 * price/image info. Other DBA sections don't emit ItemList JSON-LD server-side
 * and would require additional work.
 *
 * Strategy (confirmed via live browser inspection 2026-04-24):
 *   - Search URL: `https://www.dba.dk/mobility/search/car?registration_class=1`
 *   - JSON-LD block: `CollectionPage → mainEntity (ItemList) →
 *     itemListElement[] → item (Product)` — 40 items per page (~16k total).
 *   - Pagination via `&page=N`.
 *   - Product URL: `https://www.dba.dk/mobility/item/<numeric id>`.
 */

import { SCRAPE_TARGETS } from '../config'
import { extractJsonLdProducts, launchAndWarm, type JsonLdProduct } from '../jsonld'
import type { ScrapedItem, ScrapeResult, ScraperConfig } from '../types'

const SOURCE = 'dba'

function extractIdFromUrl(url: string): string | null {
  const m = url.match(/\/mobility\/item\/(\d+)/)
  return m ? m[1]! : null
}

function brandName(b: JsonLdProduct['brand']): string | null {
  if (!b) return null
  if (typeof b === 'string') return b
  if (typeof b === 'object' && typeof b.name === 'string') return b.name
  return null
}

function toScrapedItem(p: JsonLdProduct): ScrapedItem | null {
  const url = typeof p.url === 'string' ? p.url : null
  if (!url) return null
  const sourceId = extractIdFromUrl(url)
  if (!sourceId) return null

  const images: string[] = []
  if (typeof p.image === 'string') images.push(p.image)
  else if (Array.isArray(p.image)) {
    for (const u of p.image) if (typeof u === 'string') images.push(u)
  }

  const offers = p.offers ?? {}
  const priceRaw = typeof offers.price === 'number' ? offers.price : Number(offers.price)
  const price = Number.isFinite(priceRaw) ? priceRaw : null
  const currency = typeof offers.priceCurrency === 'string' ? offers.priceCurrency : 'DKK'

  const brand = brandName(p.brand)
  const model = typeof p.model === 'string' ? p.model : null
  const name = typeof p.name === 'string' ? p.name : null
  const title = name ?? ([brand, model].filter(Boolean).join(' ') || null)

  return {
    sourceId,
    sourceUrl: url,
    rawData: p as unknown as Record<string, unknown>,
    mappedCategory: 'vehicle',
    listingIntent: 'for_sale',
    title,
    description: typeof p.description === 'string' ? p.description : null,
    price,
    currency,
    city: null,
    latitude: null,
    longitude: null,
    imageUrls: images,
    durationHours: null,
    maxGuests: null,
    serviceType: null,
    make: brand,
    model,
  }
}

export async function scrapeDba(overrides: Partial<ScraperConfig> = {}): Promise<ScrapeResult> {
  const startedAt = Date.now()
  const items: ScrapedItem[] = []
  const errors: string[] = []
  const seen = new Set<string>()

  const { browser, context, page, config } = await launchAndWarm(
    SCRAPE_TARGETS.dba.cars,
    overrides,
  )

  const perPage = 40
  const maxPages = Math.max(1, Math.ceil(config.maxItems / perPage))
  console.log(`[dba] up to ${config.maxItems} items across ${maxPages} pages`)

  try {
    for (let p = 1; p <= maxPages; p++) {
      if (items.length >= config.maxItems) break
      if (p > 1) {
        const sep = SCRAPE_TARGETS.dba.cars.includes('?') ? '&' : '?'
        const url = `${SCRAPE_TARGETS.dba.cars}${sep}page=${p}`
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })
        } catch (err) {
          errors.push(`page ${p}: ${(err as Error).message}`)
          break
        }
      }

      const products = await extractJsonLdProducts(page)
      if (products.length === 0) {
        console.log(`[dba]   page ${p}: no Products in JSON-LD, stopping`)
        break
      }

      let added = 0
      for (const pr of products) {
        if (items.length >= config.maxItems) break
        const it = toScrapedItem(pr)
        if (!it) continue
        if (seen.has(it.sourceId)) continue
        seen.add(it.sourceId)
        items.push(it)
        added++
      }
      console.log(`[dba]   page ${p}: ${added} new (total ${items.length}/${config.maxItems})`)
      if (added === 0) break

      if (p < maxPages) await page.waitForTimeout(1500 + Math.random() * 1000)
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err))
  } finally {
    await context.close().catch(() => {})
    await browser.close().catch(() => {})
  }

  return {
    source: SOURCE,
    items,
    errors,
    durationMs: Date.now() - startedAt,
    scrapedAt: new Date(),
  }
}
