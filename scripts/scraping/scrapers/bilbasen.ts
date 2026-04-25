/**
 * Bilbasen (bilbasen.dk) scraper — Denmark's largest used-car marketplace.
 *
 * Strategy (confirmed via live browser inspection 2026-04-24):
 *   - Search page `https://www.bilbasen.dk/brugt/bil` renders a schema.org
 *     `ItemList` with ~30 Products per JSON-LD block (numberOfItems ≈ 38k).
 *   - Pagination via `?page=N` query param (Next.js-based SPA, SSR'd content).
 *   - Per-product fields we use:  name, url (contains unique numeric id),
 *     image (string[]), offers.price (number), offers.priceCurrency.
 */

import { SCRAPE_TARGETS } from '../config'
import { extractJsonLdProducts, launchAndWarm, type JsonLdProduct } from '../jsonld'
import type { ScrapedItem, ScrapeResult, ScraperConfig } from '../types'

const SOURCE = 'bilbasen'

function extractIdFromUrl(url: string): string | null {
  // URLs end with `/…/<numeric id>` — pull the last path segment of digits.
  const m = url.match(/\/(\d{5,})(?:[/?#]|$)/)
  return m ? m[1]! : null
}

function toScrapedItem(p: JsonLdProduct): ScrapedItem | null {
  const url = typeof p.url === 'string' ? p.url : null
  if (!url) return null
  const sourceId = extractIdFromUrl(url)
  if (!sourceId) return null

  const images = Array.isArray(p.image)
    ? p.image.filter((u): u is string => typeof u === 'string')
    : typeof p.image === 'string'
      ? [p.image]
      : []

  const offers = p.offers ?? {}
  const priceRaw = typeof offers.price === 'number' ? offers.price : Number(offers.price)
  const price = Number.isFinite(priceRaw) ? priceRaw : null
  const currency = typeof offers.priceCurrency === 'string' ? offers.priceCurrency : 'DKK'

  return {
    sourceId,
    sourceUrl: url,
    rawData: p as unknown as Record<string, unknown>,
    mappedCategory: 'vehicle',
    listingIntent: 'for_sale',
    title: typeof p.name === 'string' ? p.name : null,
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
  }
}

export async function scrapeBilbasen(
  overrides: Partial<ScraperConfig> = {},
): Promise<ScrapeResult> {
  const startedAt = Date.now()
  const items: ScrapedItem[] = []
  const errors: string[] = []
  const seen = new Set<string>()

  const { browser, context, page, config } = await launchAndWarm(
    SCRAPE_TARGETS.bilbasen.search,
    overrides,
  )

  const perPage = 30
  const maxPages = Math.max(1, Math.ceil(config.maxItems / perPage))
  console.log(`[bilbasen] up to ${config.maxItems} items across ${maxPages} pages`)

  try {
    for (let p = 1; p <= maxPages; p++) {
      if (items.length >= config.maxItems) break
      if (p > 1) {
        const url = `${SCRAPE_TARGETS.bilbasen.search}?page=${p}`
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })
        } catch (err) {
          errors.push(`page ${p}: ${(err as Error).message}`)
          break
        }
      }

      const products = await extractJsonLdProducts(page)
      if (products.length === 0) {
        console.log(`[bilbasen]   page ${p}: no Products in JSON-LD, stopping`)
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
      console.log(
        `[bilbasen]   page ${p}: ${added} new (total ${items.length}/${config.maxItems})`,
      )
      if (added === 0) break // duplicate page → end of catalog

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
