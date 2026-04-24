/**
 * Homestra (homestra.com) scraper — Denmark-only.
 *
 * Strategy (confirmed via live MCP browser inspection 2026-04-23):
 *   - Use the country-path URL `/list/houses-for-sale/denmark/` — the
 *     `?country=denmark` query-string filter on the generic list is a SEO hint
 *     only and returns mixed-country results. The country-path variant returns
 *     40/40 Danish Property entities per page (verified on pages 1-3).
 *   - The site is a Next.js app and ships the full Apollo cache embedded as
 *     <script id="__NEXT_DATA__">. We parse that directly — no JS execution
 *     needed, no detail-page fetches required (list already contains
 *     description / price / location / size / photos).
 *   - Photos are stored as separate `Photo:<uuid>` entities referenced by
 *     `featuredPhoto.__ref` and `photos[].__ref`; we resolve them from the
 *     cache.
 */

import type { ScrapedItem, ScrapeResult, ScraperConfig } from '../types'
import { getScraperConfig, pickUserAgent } from '../config'
import { fetchHtml } from '../helpers/html-extract'

const BASE = 'https://homestra.com'
const LIST_PATH = '/list/houses-for-sale/denmark/'
const NEXT_DATA_RE = /<script id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/

interface ApolloRef {
  __ref: string
}

interface HomestraProperty {
  __typename: 'Property'
  id: string
  title?: string
  slug?: string
  address?: string
  location?: { type?: string; coordinates?: [number, number] }
  price?: number
  size?: number
  description?: string
  lotSize?: number
  countryCode?: string
  city?: string
  type?: string
  status?: string
  createdAt?: string
  listingDate?: string
  featuredPhoto?: ApolloRef
  photos?: ApolloRef[]
}

interface HomestraPhoto {
  __typename: 'Photo'
  id: string
  url?: string
  src?: string
  path?: string
}

function parseNextData(html: string): Record<string, unknown> | null {
  const m = NEXT_DATA_RE.exec(html)
  if (!m?.[1]) return null
  try {
    return JSON.parse(m[1]) as Record<string, unknown>
  } catch {
    return null
  }
}

function resolvePhoto(apollo: Record<string, unknown>, ref: ApolloRef | undefined): string | null {
  if (!ref?.__ref) return null
  const entity = apollo[ref.__ref] as HomestraPhoto | undefined
  if (!entity) return null
  const raw = entity.url ?? entity.src ?? entity.path
  if (!raw) return null
  if (/^https?:\/\//i.test(raw)) return raw
  return `${BASE}${raw.startsWith('/') ? '' : '/'}${raw}`
}

function normalise(
  rec: HomestraProperty,
  apollo: Record<string, unknown>,
): ScrapedItem | null {
  if (rec.countryCode !== 'dk') return null
  const id = rec.id
  if (!id) return null

  const imageUrls: string[] = []
  const cover = resolvePhoto(apollo, rec.featuredPhoto)
  if (cover) imageUrls.push(cover)
  for (const ref of rec.photos ?? []) {
    const url = resolvePhoto(apollo, ref)
    if (url && !imageUrls.includes(url)) imageUrls.push(url)
  }

  // location.coordinates is [lat, lng] per the Apollo payload (confirmed
  // against Risør 58.67/9.03 example) — contrary to GeoJSON convention.
  const coords = rec.location?.coordinates
  const latitude = Array.isArray(coords) && typeof coords[0] === 'number' ? coords[0] : null
  const longitude = Array.isArray(coords) && typeof coords[1] === 'number' ? coords[1] : null

  const url = rec.slug ? `${BASE}/property/${rec.slug}/` : `${BASE}/property/${id}/`

  // Persist the resolved cover photo URL inside rawData so the rule-based
  // normaliser can retrieve it without traversing Apollo refs.
  const rawWithPhoto: Record<string, unknown> = { ...(rec as unknown as Record<string, unknown>) }
  if (cover) rawWithPhoto._photoUrl = cover

  return {
    sourceId: id,
    sourceUrl: url,
    rawData: rawWithPhoto,
    mappedCategory: 'property',
    listingIntent: 'for_sale',
    title: rec.title ?? null,
    description: rec.description ?? null,
    price: typeof rec.price === 'number' ? rec.price : null,
    currency: 'EUR',
    city: rec.city ?? null,
    latitude,
    longitude,
    imageUrls,
    durationHours: null,
    maxGuests: null,
    serviceType: null,
    bedrooms: null,
    areaSqm: typeof rec.size === 'number' ? rec.size : null,
    yearBuilt: null,
  }
}

async function scrapePage(page: number): Promise<{ props: HomestraProperty[]; apollo: Record<string, unknown> }> {
  const url = `${BASE}${LIST_PATH}${page > 1 ? `?page=${page}` : ''}`
  const html = await fetchHtml(url, { userAgent: pickUserAgent() })
  const data = parseNextData(html)
  if (!data) throw new Error(`homestra page ${page}: __NEXT_DATA__ not found`)
  const pageProps = (data as { props?: { pageProps?: { __APOLLO_STATE__?: Record<string, unknown> } } }).props?.pageProps
  const apollo = pageProps?.__APOLLO_STATE__ ?? {}
  const props: HomestraProperty[] = []
  for (const [key, value] of Object.entries(apollo)) {
    if (!key.startsWith('Property:')) continue
    const p = value as HomestraProperty
    if (p.__typename === 'Property') props.push(p)
  }
  return { props, apollo }
}

export async function scrapeHomestra(overrides: Partial<ScraperConfig> = {}): Promise<ScrapeResult> {
  const config = getScraperConfig(overrides)
  const startedAt = Date.now()
  const items: ScrapedItem[] = []
  const errors: string[] = []

  const maxPages = Math.max(1, Math.ceil(config.maxItems / 40))
  console.log(`[homestra] fetching DK listings, up to ${config.maxItems} items (${maxPages} pages)`)

  for (let page = 1; page <= maxPages; page++) {
    if (items.length >= config.maxItems) break
    try {
      const { props, apollo } = await scrapePage(page)
      let dkCount = 0
      for (const rec of props) {
        if (items.length >= config.maxItems) break
        const it = normalise(rec, apollo)
        if (it) {
          items.push(it)
          dkCount++
        }
      }
      console.log(`[homestra]   page ${page}: ${dkCount} DK properties`)
      if (dkCount === 0) break // out of DK results
      if (page < maxPages) await new Promise((r) => setTimeout(r, 1000))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`page ${page}: ${msg}`)
      break
    }
  }

  return {
    source: 'homestra',
    items,
    errors,
    durationMs: Date.now() - startedAt,
    scrapedAt: new Date(),
  }
}
