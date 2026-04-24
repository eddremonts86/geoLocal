// ─── Scraping shared types ────────────────────────────────────────────────────
// Used by all scrapers, transformers, and the storage layer.

export type ScrapedSource =
  | 'airbnb'
  | 'facebook'
  | 'facebook-events'
  | 'linkedin'
  | 'edc'
  | 'homestra'
  | 'boligsiden'
  | 'boliga'

export type MappedCategory = 'property' | 'service' | 'experience' | 'vehicle'

/**
 * Commercial intent of the listing — answers "is this for sale or for rent?".
 *   - for_sale:   property on the resale market (boligsiden, boliga, edc, homestra)
 *   - for_rent:   long-term rental (not currently wired — future dba.dk/lejebolig.dk)
 *   - stay:       short-term stay (airbnb rooms/homes)
 *   - experience: guided activity (airbnb experiences, facebook-events)
 *   - service:    professional service (facebook pages, linkedin posts)
 */
export type ListingIntent = 'for_sale' | 'for_rent' | 'stay' | 'experience' | 'service'

export interface ScrapedItem {
  /** Original ID from the source platform. */
  sourceId: string
  /** Canonical URL to the original listing page. */
  sourceUrl: string
  /** Raw JSON payload from the source (kept untouched for audit trail). */
  rawData: Record<string, unknown>
  /** Our best-guess category mapping. null = unable to determine. */
  mappedCategory: MappedCategory | null
  /**
   * Commercial intent — set per scraper. null = indeterminate.
   * Persisted inside rawData under the reserved key `_listingIntent` so it
   * flows through the existing storage layer without a schema migration.
   */
  listingIntent?: ListingIntent | null
  // ─── Normalised fields (best-effort — may be null) ─────────────────────
  title: string | null
  description: string | null
  price: number | null
  currency: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  imageUrls: string[]
  // Experience-specific
  durationHours: number | null
  maxGuests: number | null
  // Service-specific
  serviceType: string | null
  // Property detail (optional — AI-normaliser fills these)
  bedrooms?: number | null
  bathrooms?: number | null
  areaSqm?: number | null
  yearBuilt?: number | null
  // Vehicle detail
  make?: string | null
  model?: string | null
  year?: number | null
  mileageKm?: number | null
}

export interface ScrapeResult {
  source: ScrapedSource
  items: ScrapedItem[]
  errors: string[]
  durationMs: number
  scrapedAt: Date
}

export interface ScraperConfig {
  /** Maximum number of items to scrape per run. */
  maxItems: number
  /** Minimum delay between page navigations in ms. */
  minDelayMs: number
  /** Maximum delay between page navigations in ms. */
  maxDelayMs: number
  /** Optional HTTP/SOCKS proxy URL (from SCRAPE_PROXY_URL env var). */
  proxyUrl: string | null
  /** When true, scrape but do NOT write to DB. */
  dryRun: boolean
  /** Country/locale to target. */
  targetCountry: string
  targetLocale: string
}

export interface RunnerOptions {
  sources: ScrapedSource[]
  maxItems: number
  dryRun: boolean
}
