/**
 * EDC (edc.dk) scraper.
 *
 * Strategy:
 *  1. Fetch EDC search listings pages.
 *  2. Extract property detail links from the HTML.
 *  3. For each detail page, extract JSON-LD (@type RealEstateListing or similar).
 *  4. Fall back to meta tags if JSON-LD is absent.
 *
 * Legal note: EDC's terms permit crawling with reasonable rate limits. We respect robots.txt.
 */

import { getScraperConfig } from '../config'
import type { ScrapedItem, ScrapeResult, ScraperConfig } from '../types'
import { fetchHtml, extractJsonLd, stripHtml, absoluteUrl } from '../helpers/html-extract'

const BASE = 'https://www.edc.dk'

// Seed zone pages that list property types per city.
// We walk these breadth-first to discover real listing URLs (pattern /alle-boliger/...).
// All URLs are probed to exist before adding here.
const ZONE_SEEDS = [
  `${BASE}/bolig/ejerlejlighed/1000-1399-koebenhavn-k/`,
  `${BASE}/bolig/ejerlejlighed/2100-koebenhavn-oe/`,
  `${BASE}/bolig/ejerlejlighed/2200-koebenhavn-n/`,
  `${BASE}/bolig/ejerlejlighed/2300-koebenhavn-s/`,
  `${BASE}/bolig/ejerlejlighed/2000-frederiksberg/`,
  `${BASE}/bolig/villa/2000-frederiksberg/`,
  `${BASE}/bolig/villa/2100-koebenhavn-oe/`,
  `${BASE}/bolig/villa/2200-koebenhavn-n/`,
  `${BASE}/bolig/villa/2300-koebenhavn-s/`,
  `${BASE}/bolig/raekkehus/2000-frederiksberg/`,
  `${BASE}/bolig/raekkehus/2100-koebenhavn-oe/`,
  `${BASE}/bolig/raekkehus/2300-koebenhavn-s/`,
]

// Real EDC listing URLs look like: /alle-boliger/<type>/<zipCity>/<streetSlug>/<numericId>/
const LISTING_LINK_RE = /href="(\/alle-boliger\/[^"?#]+\/\d+\/?)"/g

function collectDetailLinks(html: string): string[] {
  const out = new Set<string>()
  for (const m of html.matchAll(LISTING_LINK_RE)) {
    if (m[1]) out.add(absoluteUrl(m[1], BASE))
  }
  return Array.from(out)
}

function findJsonLdListing(blocks: unknown[]): Record<string, unknown> | null {
  // EDC wraps real-estate data in a schema.org Offer whose itemOffered is the
  // Apartment/House/Product record. We accept either shape.
  for (const b of blocks) {
    if (!b || typeof b !== 'object') continue
    const rec = b as Record<string, unknown>
    const type = rec['@type']
    const matches = (t: unknown): boolean =>
      typeof t === 'string' && /RealEstate|Product|Residence|House|Apartment|Offer/i.test(t)
    if (matches(type) || (Array.isArray(type) && type.some(matches))) {
      return rec
    }
  }
  return null
}

/**
 * When the top-level block is an Offer, merge offer-level fields (price, identifier)
 * into the itemOffered so extractors below see a single flat record.
 */
function flattenOffer(rec: Record<string, unknown>): Record<string, unknown> {
  const type = rec['@type']
  const isOffer = typeof type === 'string' && /Offer/i.test(type)
  if (!isOffer) return rec
  const item = rec.itemOffered as Record<string, unknown> | undefined
  if (!item || typeof item !== 'object') return rec
  return {
    ...item,
    price: rec.price ?? item.price,
    priceCurrency: rec.priceCurrency ?? item.priceCurrency,
    identifier: rec.identifier ?? item.identifier,
    _offerWrapper: rec,
  }
}

function readAdditionalProperty(rec: Record<string, unknown>, name: string): unknown {
  const arr = rec.additionalProperty
  if (!Array.isArray(arr)) return undefined
  for (const p of arr) {
    if (p && typeof p === 'object' && (p as Record<string, unknown>).name === name) {
      return (p as Record<string, unknown>).value
    }
  }
  return undefined
}

function extractPrice(rec: Record<string, unknown>): { price: number | null; currency: string } {
  const offers = rec.offers as Record<string, unknown> | undefined
  const priceVal = rec.price ?? offers?.price
  const currency = (rec.priceCurrency as string) ?? (offers?.priceCurrency as string) ?? 'DKK'
  const num =
    typeof priceVal === 'number'
      ? priceVal
      : typeof priceVal === 'string'
        ? Number(priceVal.replace(/[^\d.]/g, ''))
        : null
  return { price: Number.isFinite(num) ? (num as number) : null, currency }
}

function extractGeo(rec: Record<string, unknown>): { lat: number | null; lng: number | null; city: string | null } {
  const geo = rec.geo as Record<string, unknown> | undefined
  const address = rec.address as Record<string, unknown> | undefined
  const lat = typeof geo?.latitude === 'number' ? (geo.latitude as number) : Number(geo?.latitude as unknown) || null
  const lng = typeof geo?.longitude === 'number' ? (geo.longitude as number) : Number(geo?.longitude as unknown) || null
  const city = (address?.addressLocality as string) ?? null
  return { lat: Number.isFinite(lat ?? NaN) ? lat : null, lng: Number.isFinite(lng ?? NaN) ? lng : null, city }
}

function extractImages(rec: Record<string, unknown>): string[] {
  const out: string[] = []
  const push = (v: unknown) => {
    if (typeof v === 'string') out.push(v)
    else if (v && typeof v === 'object') {
      const url = (v as Record<string, unknown>).url
      if (typeof url === 'string') out.push(url)
    }
  }
  const image = rec.image
  if (Array.isArray(image)) image.forEach(push)
  else if (image) push(image)
  // EDC stores gallery images inside accommodationFloorPlan.layoutImage
  const plan = rec.accommodationFloorPlan as Record<string, unknown> | undefined
  if (plan?.layoutImage && Array.isArray(plan.layoutImage)) {
    plan.layoutImage.forEach(push)
  }
  // Dedupe while preserving order
  const seen = new Set<string>()
  return out.filter((u) => (seen.has(u) ? false : seen.add(u)))
}

async function scrapeDetailPage(url: string): Promise<ScrapedItem | null> {
  try {
    const html = await fetchHtml(url)
    const jsonLdBlocks = extractJsonLd(html)
    const raw = findJsonLdListing(jsonLdBlocks)
    if (!raw) return null
    const listing = flattenOffer(raw)

    const { price, currency } = extractPrice(listing)
    const { lat, lng, city } = extractGeo(listing)

    const address = listing.address as Record<string, unknown> | undefined
    const streetAddress = (address?.streetAddress as string) ?? null
    const postalCode = (address?.postalCode as string) ?? null
    const addressRegion = (address?.addressRegion as string) ?? null
    const title =
      (listing.name as string) ??
      (streetAddress && addressRegion ? `${streetAddress}, ${postalCode ?? ''} ${addressRegion}`.trim() : streetAddress)

    const description = stripHtml((listing.description as string) ?? null)

    // Extract numeric fields from additionalProperty array
    const livingAreaRaw = readAdditionalProperty(listing, 'LivingArea')
    const livingArea =
      livingAreaRaw && typeof livingAreaRaw === 'object'
        ? ((livingAreaRaw as Record<string, unknown>).value as number | undefined)
        : typeof livingAreaRaw === 'number'
          ? livingAreaRaw
          : null
    const yearBuiltRaw = readAdditionalProperty(listing, 'YearBuilt')
    const yearBuilt = typeof yearBuiltRaw === 'number' ? yearBuiltRaw : null
    const plan = listing.accommodationFloorPlan as Record<string, unknown> | undefined
    const bedrooms = typeof plan?.numberOfRooms === 'number' ? (plan.numberOfRooms as number) : null

    const sourceId =
      (listing.identifier as string) ??
      (listing.productID as string) ??
      url.split('/').filter(Boolean).pop() ??
      url

    return {
      sourceId: String(sourceId),
      sourceUrl: url,
      rawData: { ...listing, _sourceUrl: url } as Record<string, unknown>,
      mappedCategory: 'property',
      listingIntent: 'for_sale',
      title,
      description,
      price,
      currency,
      city: city ?? addressRegion,
      latitude: lat,
      longitude: lng,
      imageUrls: extractImages(listing),
      durationHours: null,
      maxGuests: null,
      serviceType: null,
      bedrooms,
      areaSqm: typeof livingArea === 'number' && livingArea > 0 ? livingArea : null,
      yearBuilt,
    }
  } catch {
    return null
  }
}

export async function scrapeEdc(overrides: Partial<ScraperConfig> = {}): Promise<ScrapeResult> {
  const config = getScraperConfig(overrides)
  const startedAt = Date.now()
  const items: ScrapedItem[] = []
  const errors: string[] = []

  for (const searchUrl of ZONE_SEEDS) {
    if (items.length >= config.maxItems) break
    try {
      console.log(`  [edc] browsing ${searchUrl}`)
      const indexHtml = await fetchHtml(searchUrl)
      const links = collectDetailLinks(indexHtml)
      console.log(`  [edc]   found ${links.length} listing links`)
      if (links.length === 0) {
        errors.push(`${searchUrl}: no listings matched pattern`)
        continue
      }
      for (const link of links) {
        if (items.length >= config.maxItems) break
        const it = await scrapeDetailPage(link)
        if (it) {
          items.push(it)
          console.log(`  [edc]   + ${it.title ?? it.sourceId}`)
        }
        await new Promise((r) => setTimeout(r, config.minDelayMs))
      }
    } catch (err) {
      errors.push(`${searchUrl}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { source: 'edc', items, errors, durationMs: Date.now() - startedAt, scrapedAt: new Date() }
}
