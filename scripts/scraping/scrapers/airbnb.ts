// ─── Airbnb.dk scraper ────────────────────────────────────────────────────────
// Strategy (3-layer):
//  1. Capture POST /api/v3/StaysSearch (GraphQL) responses — primary
//  2. Extract __NEXT_DATA__ from page HTML — secondary
//  3. DOM card extraction fallback
//
// LEGAL NOTE: Scraping Airbnb violates their ToS (section 5.4).
// This script is for internal research/catalogue enrichment only.
// Always respect robots.txt, rate limits, and never re-sell data.

import { chromium, type Page } from '@playwright/test'
import { SCRAPE_TARGETS, getScraperConfig, pickUserAgent, randomDelay } from '../config'
import type { ScrapedItem, ScrapeResult, ScraperConfig } from '../types'
// ─── Normalise helpers ────────────────────────────────────────────────────────

function normaliseListingNode(node: Record<string, unknown>): ScrapedItem | null {
  // Handles both flat listing objects and nested {listing, pricingQuote} shapes
  const listing = (node.listing ?? node) as Record<string, unknown>
  const pricing = (node.pricingQuote ?? node.pricing_quote ?? {}) as Record<string, unknown>

  const id = (listing.id ?? listing.listingId) as string | undefined
  if (!id) return null

  // Title resolution across API versions
  const title =
    (listing.name ?? listing.title ?? listing.listingName) as string | null ?? null

  // Price resolution
  const priceObj = (pricing.rate ?? pricing.displayPrice ?? pricing.structuredStayDisplayPrice) as Record<string, unknown> | undefined
  const price = ((priceObj?.amount ?? (priceObj?.base as Record<string, unknown> | undefined)?.amount ?? null)) as number | null
  const currency = (priceObj?.currency ?? pricing.currency ?? 'DKK') as string

  // Images
  const rawImages = (listing.pictureUrls ?? listing.picture_urls ?? listing.pictures ?? []) as unknown[]
  const imageUrls = (rawImages as string[]).filter((u) => typeof u === 'string')

  // Location
  const lat = (listing.lat ?? listing.latitude) as number | null ?? null
  const lng = (listing.lng ?? listing.longitude) as number | null ?? null
  const city = (listing.city ?? listing.publicAddress ?? null) as string | null

  return {
    sourceId: String(id),
    sourceUrl: `https://www.airbnb.dk/rooms/${id}`,
    rawData: node,
    mappedCategory: 'property',
    listingIntent: 'stay',
    title,
    description: (listing.description ?? null) as string | null,
    price,
    currency,
    city,
    latitude: typeof lat === 'number' ? lat : null,
    longitude: typeof lng === 'number' ? lng : null,
    imageUrls,
    durationHours: null,
    maxGuests: (listing.personCapacity ?? listing.person_capacity ?? null) as number | null,
    serviceType: null,
  }
}

function normaliseExperienceNode(node: Record<string, unknown>): ScrapedItem | null {
  const exp = (node.experience ?? node) as Record<string, unknown>
  const id = (exp.id ?? exp.experienceId) as string | undefined
  if (!id) return null

  const photos = (exp.photos ?? exp.pictureUrls ?? []) as unknown[]
  const imageUrls = photos
    .map((p: unknown) => {
      if (typeof p === 'string') return p
      const photo = p as Record<string, unknown>
      return (photo.url ?? (photo.picture as Record<string, unknown> | undefined)?.url ?? null) as string | null
    })
    .filter(Boolean) as string[]

  const price = (exp.price as Record<string, unknown> | undefined)?.amount as number | null ?? null
  const currency = (exp.price as Record<string, unknown> | undefined)?.currency as string ?? 'DKK'

  return {
    sourceId: String(id),
    sourceUrl: `https://www.airbnb.dk/experiences/${id}`,
    rawData: node,
    mappedCategory: 'experience',
    listingIntent: 'experience',
    title: (exp.title ?? null) as string | null,
    description: (exp.description ?? null) as string | null,
    price,
    currency,
    city: (exp.city ?? null) as string | null,
    latitude: (exp.lat ?? null) as number | null,
    longitude: (exp.lng ?? null) as number | null,
    imageUrls,
    durationHours: typeof exp.duration === 'number' ? exp.duration / 60 : null,
    maxGuests: (exp.maxGuests ?? exp.max_guests ?? null) as number | null,
    serviceType: (exp.category ?? null) as string | null,
  }
}

// ─── Deep-scan a JSON object for Airbnb listing arrays ───────────────────────

function deepFindListings(
  obj: unknown,
  depth = 0,
  found: Array<{ type: 'stay' | 'experience'; node: Record<string, unknown> }> = [],
): typeof found {
  if (depth > 12 || !obj || typeof obj !== 'object') return found

  if (Array.isArray(obj)) {
    for (const item of obj) deepFindListings(item, depth + 1, found)
    return found
  }

  const record = obj as Record<string, unknown>

  // Stays: object with a "listing" key that has an "id" field
  if (record.listing && typeof (record.listing as Record<string, unknown>).id !== 'undefined') {
    found.push({ type: 'stay', node: record })
  }
  // Direct listing node
  else if (record.id && record.name && (record.lat !== undefined || record.latitude !== undefined)) {
    found.push({ type: 'stay', node: record })
  }
  // Experiences
  else if (record.experience && typeof (record.experience as Record<string, unknown>).id !== 'undefined') {
    found.push({ type: 'experience', node: record })
  }

  for (const val of Object.values(record)) {
    deepFindListings(val, depth + 1, found)
  }
  return found
}

// ─── Layer 1: GraphQL API response capture ────────────────────────────────────

async function captureApiResponses(
  page: Page,
  url: string,
  maxItems: number,
): Promise<Array<{ type: 'stay' | 'experience'; node: Record<string, unknown> }>> {
  const found: Array<{ type: 'stay' | 'experience'; node: Record<string, unknown> }> = []

  page.on('response', async (response) => {
    const reqUrl = response.url()
    if (
      !reqUrl.includes('airbnb.com') ||
      !reqUrl.includes('/api/') ||
      response.status() < 200 ||
      response.status() >= 300
    ) return

    try {
      const ct = response.headers()['content-type'] ?? ''
      if (!ct.includes('json')) return
      const json = await response.json() as unknown
      const results = deepFindListings(json)
      for (const r of results) {
        if (found.length < maxItems * 2) found.push(r)
      }
    } catch {
      // ignore parse errors
    }
  })

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 })

  // Scroll multiple times to trigger pagination / lazy loads
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5))
    await new Promise((r) => setTimeout(r, 1200))
    if (found.length >= maxItems) break
  }

  // Small extra wait for in-flight XHRs to settle
  await new Promise((r) => setTimeout(r, 2000))

  return found
}

// ─── Layer 2: __NEXT_DATA__ extraction ───────────────────────────────────────

async function extractNextData(
  page: Page,
): Promise<Array<{ type: 'stay' | 'experience'; node: Record<string, unknown> }>> {
  try {
    const raw = await page.evaluate(() => {
      const el = document.getElementById('__NEXT_DATA__')
      return el ? el.textContent : null
    })
    if (!raw) return []
    const json = JSON.parse(raw) as unknown
    return deepFindListings(json)
  } catch {
    return []
  }
}

// ─── Layer 3: DOM card extraction ────────────────────────────────────────────

async function extractDomCards(
  page: Page,
  isExperience: boolean,
): Promise<ScrapedItem[]> {
  try {
    return await page.evaluate((isExp) => {
      const items: Array<Record<string, unknown>> = []

      // Airbnb renders listing cards with itemprop="itemListElement" or data-testid
      const selectors = [
        '[itemprop="itemListElement"]',
        '[data-testid="card-container"]',
        '[data-testid="listing-card-title"]',
        'div[class*="c4mnd7m"]', // common grid cell class (changes with builds)
      ]

      for (const sel of selectors) {
        const cards = document.querySelectorAll(sel)
        if (cards.length === 0) continue

        for (const card of Array.from(cards)) {
          const link = card.querySelector('a[href*="/rooms/"], a[href*="/experiences/"]') as HTMLAnchorElement | null
          if (!link) continue

          const href = link.href || ''
          const idMatch = href.match(/\/(rooms|experiences)\/(\d+)/)
          if (!idMatch) continue

          const id = idMatch[2]
          const type = idMatch[1] === 'experiences' ? 'experience' : 'stay'
          const titleEl = card.querySelector('[data-testid="listing-card-title"], h3, [id*="title"]') as HTMLElement | null
          const title = titleEl?.textContent?.trim() ?? link.getAttribute('aria-label') ?? null

          const priceEl = card.querySelector('[data-testid*="price"], ._tyxjp1, span[class*="price"]') as HTMLElement | null
          const priceText = priceEl?.textContent ?? null
          // Extract first continuous number sequence (Airbnb often repeats price text)
          const priceMatch = priceText?.match(/[\d,\.]+/)
          const price = priceMatch ? parseInt(priceMatch[0].replace(/[,\.]/g, '').slice(0, 6), 10) : null

          const imgEl = card.querySelector('img') as HTMLImageElement | null
          const imageUrls = imgEl?.src ? [imgEl.src] : []

          items.push({
            id,
            title,
            price,
            imageUrls,
            type,
            href,
          })
        }
        if (items.length > 0) break
      }

      return items.map((item) => ({
        sourceId: String(item.id),
        sourceUrl: isExp
          ? `https://www.airbnb.dk/experiences/${item.id}`
          : `https://www.airbnb.dk/rooms/${item.id}`,
        rawData: item,
        mappedCategory: isExp ? 'experience' : 'property',
        listingIntent: isExp ? 'experience' : 'stay',
        title: item.title as string | null,
        description: null,
        price: item.price as number | null,
        currency: 'DKK',
        city: null,
        latitude: null,
        longitude: null,
        imageUrls: item.imageUrls as string[],
        durationHours: null,
        maxGuests: null,
        serviceType: null,
      }))
    }, isExperience)
  } catch {
    return []
  }
}

// ─── Main scraper function ────────────────────────────────────────────────────

export async function scrapeAirbnb(
  configOverrides: Partial<ScraperConfig> = {},
): Promise<ScrapeResult> {
  const config = getScraperConfig(configOverrides)
  const startTime = Date.now()
  const items: ScrapedItem[] = []
  const errors: string[] = []
  const seen = new Set<string>()

  function addItem(item: ScrapedItem | null) {
    if (!item) return
    if (seen.has(item.sourceId)) return
    seen.add(item.sourceId)
    items.push(item)
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
    locale: config.targetLocale,
    extraHTTPHeaders: { 'Accept-Language': `${config.targetLocale},en;q=0.9` },
    // Mask headless fingerprint
    viewport: { width: 1440, height: 900 },
  })

  // Spoof navigator.webdriver flag
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
  })

  try {
    // ── Stays: scrape general Denmark page + city pages ───────────────────────
    const stayUrls = [SCRAPE_TARGETS.airbnb.stays, ...SCRAPE_TARGETS.airbnb.stayCities]
    let stayPageIndex = 0

    while (items.length < Math.ceil(config.maxItems * 0.6) && stayPageIndex < stayUrls.length) {
      const stayPage = await context.newPage()
      const stayUrl = stayUrls[stayPageIndex++]!

      try {
        console.log(`[airbnb] Navigating to stays (${stayPageIndex}/${stayUrls.length}): ${stayUrl.split('?')[0]}`)
        let stayApiResults = await captureApiResponses(stayPage, stayUrl, config.maxItems)

        if (stayApiResults.length === 0) {
          stayApiResults = await extractNextData(stayPage)
        }

        if (stayApiResults.length === 0) {
          const domItems = await extractDomCards(stayPage, false)
          for (const item of domItems) addItem(item)
        } else {
          const remaining = Math.ceil(config.maxItems * 0.6) - items.length
          for (const r of stayApiResults.slice(0, remaining)) {
            if (r.type === 'stay') addItem(normaliseListingNode(r.node))
            else addItem(normaliseExperienceNode(r.node))
          }
        }
      } catch (err) {
        errors.push(`stays[${stayPageIndex}]: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        await stayPage.close()
      }

      if (stayPageIndex < stayUrls.length && items.length < Math.ceil(config.maxItems * 0.6)) {
        await randomDelay(config)
      }
    }

    console.log(`[airbnb] Stays collected: ${items.length}`)

    if (items.length < config.maxItems) {
      await randomDelay(config)

      // ── Experiences ─────────────────────────────────────────────────────────
      const expPage = await context.newPage()
      const expCountBefore = items.length

      try {
        console.log('[airbnb] Navigating to experiences...')
        let expApiResults = await captureApiResponses(expPage, SCRAPE_TARGETS.airbnb.experiences, config.maxItems)

        if (expApiResults.length === 0) {
          expApiResults = await extractNextData(expPage)
        }

        if (expApiResults.length === 0) {
          const domItems = await extractDomCards(expPage, true)
          for (const item of domItems) addItem(item)
        } else {
          const remaining = config.maxItems - items.length
          for (const r of expApiResults.slice(0, remaining)) {
            addItem(normaliseExperienceNode(r.node))
          }
        }
      } catch (err) {
        errors.push(`experiences: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        await expPage.close()
      }

      console.log(`[airbnb] Experiences collected: ${items.length - expCountBefore}`)
    }

    // ── Services ─────────────────────────────────────────────────────────────
    // Airbnb discontinued standalone services in 2020; the URL may redirect.
    // We still try: capture whatever comes back and map it to 'service'.
    if (items.length < config.maxItems) {
      await randomDelay(config)

      const svcPage = await context.newPage()
      const svcCountBefore = items.length

      try {
        console.log('[airbnb] Navigating to services...')
        let svcApiResults = await captureApiResponses(svcPage, SCRAPE_TARGETS.airbnb.services, config.maxItems)

        if (svcApiResults.length === 0) {
          svcApiResults = await extractNextData(svcPage)
        }

        if (svcApiResults.length === 0) {
          // DOM fallback — treat as non-experience, then override category
          const domItems = await extractDomCards(svcPage, false)
          for (const item of domItems) {
            addItem({ ...item, mappedCategory: 'service' })
          }
        } else {
          const remaining = config.maxItems - items.length
          for (const r of svcApiResults.slice(0, remaining)) {
            const item =
              r.type === 'experience'
                ? normaliseExperienceNode(r.node)
                : normaliseListingNode(r.node)
            if (item) addItem({ ...item, mappedCategory: 'service' })
          }
        }
      } catch (err) {
        errors.push(`services: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        await svcPage.close()
      }

      console.log(`[airbnb] Services collected: ${items.length - svcCountBefore}`)
    }
  } catch (err) {
    errors.push(`fatal: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    await browser.close()
  }

  return {
    source: 'airbnb',
    items,
    errors,
    durationMs: Date.now() - startTime,
    scrapedAt: new Date(),
  }
}

