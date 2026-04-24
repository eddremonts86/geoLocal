/**
 * Boligsiden (boligsiden.dk) scraper.
 *
 * Uses the public JSON API — simpler and more reliable than HTML scraping.
 * Endpoint: https://api.boligsiden.dk/search/cases?per_page=N&page=M
 *
 * Legal note: Public API, no auth required. Rate-limited to be polite.
 */

import { getScraperConfig, pickUserAgent } from '../config'
import type { ScrapedItem, ScrapeResult, ScraperConfig } from '../types'

interface BoligsidenCase {
  _links?: { self?: { href?: string } }
  id?: number | string
  caseId?: string
  address?: {
    addressText?: string
    roadName?: string
    houseNumber?: string
    floor?: string
    door?: string
    city?: string
    cityName?: string
    zipCode?: string
    postalCode?: string | number
  }
  addressID?: string
  cityName?: string
  coordinates?: { lat?: number; lon?: number } | [number, number]
  casePrice?: number
  priceCash?: number
  price?: number
  description?: string
  descriptionText?: string
  addressType?: string
  propertyType?: string
  housingType?: string
  images?: Array<{ url?: string } | string>
  imageUrls?: string[]
  sizes?: { housingSize?: number }
  housingSize?: number
  livingArea?: number
  buildings?: Array<{
    housingArea?: number
    numberOfRooms?: number
    numberOfBathrooms?: number
    yearBuilt?: number
  }>
  rooms?: number
  numberOfRooms?: number
  yearBuilt?: number
  constructionYear?: number
  latitude?: number
  longitude?: number
  [k: string]: unknown
}

function extractCoords(c: BoligsidenCase): { lat: number | null; lng: number | null } {
  if (typeof c.latitude === 'number' && typeof c.longitude === 'number') {
    return { lat: c.latitude, lng: c.longitude }
  }
  if (Array.isArray(c.coordinates) && c.coordinates.length === 2) {
    const [a, b] = c.coordinates as number[]
    return { lat: a, lng: b }
  }
  const co = c.coordinates as { lat?: number; lon?: number } | undefined
  if (co && typeof co.lat === 'number' && typeof co.lon === 'number') {
    return { lat: co.lat, lng: co.lon }
  }
  return { lat: null, lng: null }
}

function extractImages(c: BoligsidenCase): string[] {
  if (Array.isArray(c.imageUrls)) return c.imageUrls.filter((u): u is string => typeof u === 'string')
  if (Array.isArray(c.images)) {
    return c.images
      .map((i) => (typeof i === 'string' ? i : i?.url ?? null))
      .filter((u): u is string => typeof u === 'string')
  }
  return []
}

function extractCaseId(c: BoligsidenCase): string {
  // Real API: ID is embedded in _links.self.href = "/cases/<uuid>"
  const href = c._links?.self?.href
  if (href) {
    const m = href.match(/\/cases\/([^\/?#]+)/)
    if (m && m[1]) return m[1]
  }
  if (c.id != null) return String(c.id)
  if (c.caseId) return c.caseId
  if (c.addressID) return c.addressID
  return ''
}

function buildAddress(c: BoligsidenCase): string | null {
  if (c.address?.addressText) return c.address.addressText
  const a = c.address
  if (!a) return null
  const parts = [a.roadName, a.houseNumber, a.floor, a.door].filter(Boolean).join(' ')
  if (!parts) return null
  const cityPart = a.cityName ?? a.city
  return cityPart ? `${parts}, ${cityPart}` : parts
}

function normalise(c: BoligsidenCase): ScrapedItem | null {
  const id = extractCaseId(c)
  if (!id) return null

  const { lat, lng } = extractCoords(c)
  const city = c.address?.cityName ?? c.address?.city ?? c.cityName ?? null
  const price = c.casePrice ?? c.priceCash ?? c.price ?? null
  const description = c.description ?? c.descriptionText ?? null
  const title = buildAddress(c)
  const firstBuilding = Array.isArray(c.buildings) ? c.buildings[0] : undefined
  const areaSqm =
    c.sizes?.housingSize ??
    c.housingSize ??
    c.livingArea ??
    firstBuilding?.housingArea ??
    null
  const bedrooms =
    c.rooms ??
    c.numberOfRooms ??
    firstBuilding?.numberOfRooms ??
    null
  const yearBuilt = c.yearBuilt ?? c.constructionYear ?? firstBuilding?.yearBuilt ?? null

  return {
    sourceId: id,
    sourceUrl: `https://www.boligsiden.dk/bolig/${id}`,
    rawData: c as Record<string, unknown>,
    mappedCategory: 'property',
    listingIntent: 'for_sale',
    title,
    description: typeof description === 'string' ? description : null,
    price: typeof price === 'number' ? price : null,
    currency: 'DKK',
    city,
    latitude: lat,
    longitude: lng,
    imageUrls: extractImages(c),
    durationHours: null,
    maxGuests: null,
    serviceType: null,
    bedrooms,
    bathrooms: firstBuilding?.numberOfBathrooms ?? null,
    areaSqm: typeof areaSqm === 'number' ? areaSqm : null,
    yearBuilt,
  }
}

export async function scrapeBoligsiden(overrides: Partial<ScraperConfig> = {}): Promise<ScrapeResult> {
  const config = getScraperConfig(overrides)
  const startedAt = Date.now()
  const items: ScrapedItem[] = []
  const errors: string[] = []

  const perPage = 50
  const maxPages = Math.ceil(config.maxItems / perPage)

  for (let page = 1; page <= maxPages; page++) {
    if (items.length >= config.maxItems) break

    const url = `https://api.boligsiden.dk/search/cases?per_page=${perPage}&page=${page}`
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': pickUserAgent(),
          Accept: 'application/json',
        },
      })
      if (!res.ok) {
        errors.push(`HTTP ${res.status} at page ${page}`)
        break
      }
      const body = (await res.json()) as { cases?: BoligsidenCase[]; data?: BoligsidenCase[]; results?: BoligsidenCase[] }
      const cases = body.cases ?? body.data ?? body.results ?? []
      if (!Array.isArray(cases) || cases.length === 0) break

      for (const c of cases) {
        if (items.length >= config.maxItems) break
        const it = normalise(c)
        if (it) items.push(it)
      }

      // Rate-limit: 2s between pages
      await new Promise((r) => setTimeout(r, 2000))
    } catch (err) {
      errors.push(`page ${page}: ${err instanceof Error ? err.message : String(err)}`)
      break
    }
  }

  return {
    source: 'boligsiden',
    items,
    errors,
    durationMs: Date.now() - startedAt,
    scrapedAt: new Date(),
  }
}
