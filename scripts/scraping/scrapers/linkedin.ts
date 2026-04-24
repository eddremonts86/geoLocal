// ─── LinkedIn scraper ─────────────────────────────────────────────────────────
// Strategy: Playwright headless + DOM extraction of SSR-rendered content.
//
// LinkedIn server-renders job/service cards in the HTML even without login.
// The "Sign In" modal is overlaid on top but the data is still in the DOM.
// We use domcontentloaded (not networkidle) to capture SSR content before
// redirects kick in.
//
// For full access (page 2+, full descriptions) save session cookies first:
//   npx tsx scripts/scraping/helpers/save-cookies.ts --source linkedin
//
// LEGAL NOTE: Scraping LinkedIn violates their ToS (Section 8.2).
// This script is for internal research only. Never re-sell data.

import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as https from 'node:https'
import { getScraperConfig, pickUserAgent, randomDelay, SCRAPE_TARGETS } from '../config'
import type { ScrapedItem, ScrapeResult, ScraperConfig } from '../types'

// LinkedIn guest jobs API — no cookies required.
// Returns HTML fragments with job cards. Denmark geoId = 104514075.
const LINKEDIN_GUEST_API_BASE =
  'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?' +
  'keywords=freelance+services&location=Denmark&geoId=104514075&count=25'

/** Fetch the LinkedIn guest API using raw HTTPS (avoids Playwright fingerprinting) */
async function fetchGuestApiHtml(userAgent: string, start = 0): Promise<string> {
  const url = new URL(`${LINKEDIN_GUEST_API_BASE}&start=${start}`)
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'da-DK,da;q=0.9,en;q=0.8',
        Referer: 'https://www.linkedin.com/',
      },
    }
    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk: string | Buffer) => { body += chunk })
      res.on('end', () => resolve(body))
    })
    req.on('error', reject)
    req.end()
  })
}

/** Parse job cards from LinkedIn guest API HTML response */
function parseGuestApiCards(html: string): LinkedInCard[] {
  const results: LinkedInCard[] = []
  const seen = new Set<string>()

  // Split into blocks by job card div (each has a data-entity-urn)
  const blocks = html.split(/(?=<(?:div|li)[^>]*data-entity-urn="urn:li:jobPosting:)/gi)

  for (const block of blocks) {
    // Extract job ID from data-entity-urn
    const urnMatch = block.match(/data-entity-urn="urn:li:jobPosting:(\d+)"/)
    if (!urnMatch) continue
    const id = urnMatch[1]!
    if (seen.has(id)) continue
    seen.add(id)

    // Extract canonical job URL (may be dk.linkedin.com or linkedin.com)
    const hrefMatch = block.match(/href="(https?:\/\/[^"]*\.linkedin\.com\/jobs\/view\/[^"]+)"/)
    const url = hrefMatch
      ? hrefMatch[1]!.replace(/&amp;/g, '&')
      : `https://www.linkedin.com/jobs/view/${id}`

    // Extract title — try multiple patterns
    const titleMatch =
      block.match(/<h3[^>]*base-search-card__title[^>]*>\s*([\s\S]*?)\s*<\/h3>/i) ??
      block.match(/<span[^>]*class="sr-only"[^>]*>\s*([\s\S]*?)\s*<\/span>/i)
    const title = titleMatch ? titleMatch[1]!.replace(/<[^>]+>/g, '').trim() : ''

    // Extract company name
    const companyMatch = block.match(/<h4[^>]*base-search-card__subtitle[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)
    const company = companyMatch ? companyMatch[1]!.replace(/<[^>]+>/g, '').trim() : ''

    // Extract location
    const locationMatch = block.match(/<span[^>]*job-search-card__location[^>]*>([\s\S]*?)<\/span>/i)
    const location = locationMatch ? locationMatch[1]!.replace(/<[^>]+>/g, '').trim() : ''

    if (title) results.push({ id, title, company, location, url, isService: false })
  }
  return results
}

const COOKIES_FILE = path.join(import.meta.dirname, '../.linkedin-cookies.json')

interface LinkedInCard {
  id: string
  title: string
  company: string
  location: string
  url: string
  isService: boolean
}

type Page = import('@playwright/test').Page
type BrowserContext = import('@playwright/test').BrowserContext

/** Extract job/service cards from current page using multiple selector strategies */
async function extractLinkedInCards(page: Page, isService: boolean): Promise<LinkedInCard[]> {
  return page.evaluate((svc: boolean): LinkedInCard[] => {
    const results: LinkedInCard[] = []
    const seen = new Set<string>()

    // Strategy 1: Job search results list (SSR-rendered, public)
    const jobSelectors = [
      '.jobs-search__results-list > li',
      '.base-search-results__list > li',
      'ul[class*="jobs-search"] > li',
      '.job-search-card',
      '[data-entity-urn*="jobPosting"]',
    ]

    for (const sel of jobSelectors) {
      const cards = document.querySelectorAll(sel)
      if (cards.length === 0) continue

      for (const li of cards) {
        // Multiple link selector strategies
        const anchor =
          li.querySelector<HTMLAnchorElement>('a.base-card__full-link') ??
          li.querySelector<HTMLAnchorElement>('a.job-card-container__link') ??
          li.querySelector<HTMLAnchorElement>('a[href*="/jobs/view/"]') ??
          li.querySelector<HTMLAnchorElement>('a[href*="jobs"]')

        const href = anchor?.href ?? ''
        const idMatch = href.match(/\/jobs\/view\/(\d+)/)
        const id = idMatch?.[1] ?? ''
        if (!id || seen.has(id)) continue
        seen.add(id)

        const title =
          li.querySelector('.base-search-card__title')?.textContent?.trim() ??
          li.querySelector('.job-card-list__title')?.textContent?.trim() ??
          li.querySelector('h3')?.textContent?.trim() ??
          anchor?.textContent?.trim() ??
          ''

        const company =
          li.querySelector('.base-search-card__subtitle')?.textContent?.trim() ??
          li.querySelector('.job-card-container__company-name')?.textContent?.trim() ??
          li.querySelector('h4')?.textContent?.trim() ??
          ''

        const location =
          li.querySelector('.job-search-card__location')?.textContent?.trim() ??
          li.querySelector('.job-card-container__metadata-wrapper')?.textContent?.trim() ??
          ''

        if (title) results.push({ id: id || `li-${results.length}`, title, company, location, url: href, isService: svc })
      }

      if (results.length > 0) break
    }

    // Strategy 2: Generic card extraction if job selectors yielded nothing
    if (results.length === 0) {
      const genericCards = document.querySelectorAll('[data-view-name="job-card"], .scaffold-layout__list-item')
      for (const card of genericCards) {
        const anchor = card.querySelector<HTMLAnchorElement>('a[href*="/jobs/"]')
        const href = anchor?.href ?? ''
        const idMatch = href.match(/\/jobs\/view\/(\d+)/)
        const id = idMatch?.[1] ?? ''
        if (!id || seen.has(id)) continue
        seen.add(id)

        const title = card.querySelector('strong, h3, h4')?.textContent?.trim() ?? anchor?.textContent?.trim() ?? ''
        if (title) results.push({ id, title, company: '', location: '', url: href, isService: svc })
      }
    }

    return results
  }, isService)
}

/** Extract service provider cards from LinkedIn Services Marketplace */
async function extractServiceProviderCards(page: Page): Promise<LinkedInCard[]> {
  return page.evaluate((): LinkedInCard[] => {
    const results: LinkedInCard[] = []
    const seen = new Set<string>()

    // LinkedIn Services Marketplace card selectors
    const cardSelectors = [
      '[data-view-name="profile-entity-lockup"]',
      '.services-top-box-shadow',
      '.reusable-search__result-container',
      '[class*="service-result"]',
      '.entity-result',
    ]

    for (const sel of cardSelectors) {
      const cards = document.querySelectorAll(sel)
      if (cards.length === 0) continue

      for (const card of cards) {
        const anchor = card.querySelector<HTMLAnchorElement>('a[href*="/in/"]') ??
          card.querySelector<HTMLAnchorElement>('a[href*="/services/"]')
        const href = anchor?.href ?? ''
        const idMatch = href.match(/\/in\/([^/?#]+)/)
        const id = idMatch?.[1] ?? ''
        if (!id || seen.has(id)) continue
        seen.add(id)

        const name =
          card.querySelector('.entity-result__title-text, .actor-name')?.textContent?.trim() ??
          card.querySelector('span[aria-hidden="true"]')?.textContent?.trim() ??
          ''

        const serviceTitle =
          card.querySelector('.entity-result__primary-subtitle, .t-14')?.textContent?.trim() ?? ''

        const location =
          card.querySelector('.entity-result__secondary-subtitle')?.textContent?.trim() ?? ''

        if (name) {
          results.push({
            id,
            title: serviceTitle || name,
            company: name,
            location,
            url: href,
            isService: true,
          })
        }
      }

      if (results.length > 0) break
    }

    return results
  })
}

async function scrapeSingleLinkedInUrl(
  context: BrowserContext,
  url: string,
  isService: boolean,
  config: ReturnType<typeof getScraperConfig>,
  hasCookies: boolean,
): Promise<{ cards: LinkedInCard[]; errors: string[] }> {
  const page = await context.newPage()
  const allCards: LinkedInCard[] = []
  const errors: string[] = []

  try {
    console.log(`[linkedin] Navigating to: ${url}`)
    // domcontentloaded captures SSR content before login redirects fire
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35_000 })
    // Small wait for JS render to settle (but don't wait for full SPA navigation)
    await new Promise((r) => setTimeout(r, 2500))

    // Extract first batch (SSR content is here even behind login modal)
    const firstBatch = isService
      ? await extractServiceProviderCards(page)
      : await extractLinkedInCards(page, isService)

    for (const card of firstBatch) {
      if (!allCards.find((c) => c.id === card.id)) allCards.push(card)
    }

    // If we have cookies, scroll for more
    if (hasCookies && allCards.length < config.maxItems) {
      for (let scroll = 0; scroll < 4 && allCards.length < config.maxItems; scroll++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2))
        await randomDelay(config)

        const batch = isService
          ? await extractServiceProviderCards(page)
          : await extractLinkedInCards(page, isService)

        for (const card of batch) {
          if (!allCards.find((c) => c.id === card.id)) allCards.push(card)
        }
      }
    }

    console.log(
      `[linkedin] Extracted ${allCards.length} cards from ${isService ? 'services marketplace' : 'job search'}`,
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`scrape error (${url}): ${msg}`)
    console.error(`[linkedin] Error: ${msg}`)
  } finally {
    await page.close()
  }

  return { cards: allCards, errors }
}

export async function scrapeLinkedIn(
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
      console.log('[linkedin] Loaded session cookies')
    } catch {
      errors.push('Could not parse .linkedin-cookies.json — will attempt public scrape')
    }
  } else {
    console.warn(
      '[linkedin] No cookies found. SSR content only (first page, no pagination).\n' +
        '  Run: npx tsx scripts/scraping/helpers/save-cookies.ts --source linkedin',
    )
  }

  const launchOptions: Parameters<typeof chromium.launch>[0] = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ],
    ...(config.proxyUrl ? { proxy: { server: config.proxyUrl } } : {}),
  }

  const browser = await chromium.launch(launchOptions)
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
      errors.push('Failed to apply LinkedIn cookies')
    }
  }

  const hasCookies = cookies.length > 0

  try {
    // ── Phase 0: LinkedIn guest API (no cookies, no browser needed) ───────────
    console.log('[linkedin] Trying guest jobs API (no authentication required)...')
    try {
      const ua = pickUserAgent()
      const html = await fetchGuestApiHtml(ua, 0)
      let guestCards = parseGuestApiCards(html)
      // Second page if we need more
      if (guestCards.length > 0 && items.length + guestCards.length < config.maxItems) {
        const html2 = await fetchGuestApiHtml(ua, 25)
        guestCards = [...guestCards, ...parseGuestApiCards(html2)]
      }
      console.log(`[linkedin] Guest API returned ${guestCards.length} job cards`)
      for (const card of guestCards) {
        if (!seenIds.has(card.id)) {
          seenIds.add(card.id)
          items.push(cardToScrapedItem(card))
        }
      }
    } catch (guestErr) {
      const msg = guestErr instanceof Error ? guestErr.message : String(guestErr)
      errors.push(`guest API failed: ${msg}`)
      console.warn(`[linkedin] Guest API error: ${msg}`)
    }

    // ── Phase 1: Job/contract search (Playwright — works with cookies) ────────
    if (items.length < config.maxItems) {
      const { cards: jobCards, errors: jobErrors } = await scrapeSingleLinkedInUrl(
        context,
        SCRAPE_TARGETS.linkedin.services,
        false,
        config,
        hasCookies,
      )
      errors.push(...jobErrors)

      for (const card of jobCards) {
        if (!seenIds.has(card.id)) {
          seenIds.add(card.id)
          items.push(cardToScrapedItem(card))
        }
      }
    }

    // ── Phase 2: LinkedIn Services Marketplace ────────────────────────────────
    if (items.length < config.maxItems) {
      await randomDelay(config)

      const { cards: svcCards, errors: svcErrors } = await scrapeSingleLinkedInUrl(
        context,
        SCRAPE_TARGETS.linkedin.servicesMarketplace,
        true,
        config,
        hasCookies,
      )
      errors.push(...svcErrors)

      for (const card of svcCards) {
        if (!seenIds.has(card.id)) {
          seenIds.add(card.id)
          items.push(cardToScrapedItem(card))
        }
      }
    }
  } catch (err) {
    errors.push(`fatal: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    await browser.close()
  }

  if (!hasCookies && items.length === 0) {
    errors.push(
      'No items scraped without cookies. LinkedIn SSR may not have rendered data. ' +
        'Try: npx tsx scripts/scraping/helpers/save-cookies.ts --source linkedin',
    )
  }

  return {
    source: 'linkedin',
    items,
    errors,
    durationMs: Date.now() - startTime,
    scrapedAt: new Date(),
  }
}

function cardToScrapedItem(card: LinkedInCard): ScrapedItem {
  return {
    sourceId: card.id,
    sourceUrl: card.url,
    rawData: card as unknown as Record<string, unknown>,
    mappedCategory: 'service',
    listingIntent: 'service',
    title: card.title || null,
    description: card.company ? `${card.company}${card.location ? ` — ${card.location}` : ''}` : null,
    price: null,
    currency: 'DKK',
    city: card.location || null,
    latitude: null,
    longitude: null,
    imageUrls: [],
    durationHours: null,
    maxGuests: null,
    serviceType: card.isService ? 'services_marketplace' : 'professional_service',
  }
}
