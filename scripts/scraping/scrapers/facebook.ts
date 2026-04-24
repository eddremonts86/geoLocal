// ─── Facebook Marketplace scraper ────────────────────────────────────────────
// Strategy: Playwright headless + DOM extraction.
//
// Cookies are OPTIONAL. Without cookies Facebook (EU/Denmark) shows some
// listings before the login wall appears. We extract whatever is rendered.
//
// For full coverage save session cookies first:
//   npx tsx scripts/scraping/helpers/save-cookies.ts --source facebook
//
// LEGAL NOTE: Scraping Facebook violates their ToS (Section 3.2).
// This script is for internal research only. Never re-sell or redistribute data.

import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { getScraperConfig, pickUserAgent, randomDelay, SCRAPE_TARGETS } from '../config'
import type { ScrapedItem, ScrapeResult, ScraperConfig } from '../types'

const COOKIES_FILE = path.join(import.meta.dirname, '../.fb-cookies.json')

interface FbCard {
  id: string
  url: string
  title: string
  price: string
  location: string
  imageUrl: string
  isService: boolean
}

function parsePriceDKK(priceStr: string): number | null {
  if (!priceStr) return null
  const clean = priceStr.replace(/\./g, '').replace(/,/g, '')
  const match = clean.match(/\d+/)
  if (!match) return null
  const val = parseInt(match[0]!, 10)
  return val > 0 ? val : null
}

function detectCategory(title: string, isService: boolean): 'property' | 'service' {
  if (isService) return 'service'
  const t = title.toLowerCase()
  if (/(lejlighed|hus|værelse|apartment|room|house|rent|leje|bolig|villa)/.test(t)) return 'property'
  if (/(service|repair|clean|fix|help|konsulent|reparation|rengøring|montage|installation|maler)/.test(t)) return 'service'
  return 'service'
}

type Page = import('@playwright/test').Page
type BrowserContext = import('@playwright/test').BrowserContext

async function extractCards(page: Page, isService: boolean): Promise<FbCard[]> {
  return page.evaluate((svc: boolean): FbCard[] => {
    const results: FbCard[] = []
    const seen = new Set<string>()

    const linkEls = document.querySelectorAll<HTMLAnchorElement>('a[href*="/marketplace/item/"]')

    for (const el of linkEls) {
      const href = el.href
      const idMatch = href.match(/\/item\/(\d+)/)
      if (!idMatch) continue
      const id = idMatch[1]!
      if (seen.has(id)) continue
      seen.add(id)

      const allSpans = Array.from(el.querySelectorAll('span'))
      const title =
        allSpans
          .map((s) => s.textContent?.trim() ?? '')
          .filter((t) => t.length > 3 && !/^\d/.test(t) && !/^kr/i.test(t))
          .at(0) ??
        el.getAttribute('aria-label') ??
        ''

      const price =
        allSpans
          .map((s) => s.textContent?.trim() ?? '')
          .find((t) => /kr|DKK|\d{2,}/i.test(t)) ?? ''

      const location =
        allSpans
          .map((s) => s.textContent?.trim() ?? '')
          .filter((t) => t && t !== title && t !== price && !/kr|DKK/i.test(t))
          .at(-1) ?? ''

      const img = el.querySelector('img')
      const imageUrl = img?.src ?? ''

      if (id && title) results.push({ id, url: href, title, price, location, imageUrl, isService: svc })
    }

    return results
  }, isService)
}

async function dismissConsentDialog(page: Page): Promise<void> {
  const consentSelectors = [
    '[data-cookiebanner="accept_button"]',
    '[data-testid="cookie-policy-manage-dialog-accept-button"]',
    'button[title="Accept All"]',
    'button[title="Accepter alle"]',
    'button[title="Allow all cookies"]',
    '[aria-label="Accept All"]',
    '[aria-label="Accepter alle"]',
    'button[title="Kun nødvendige"]',
    'button[title="Only allow essential cookies"]',
  ]

  for (const selector of consentSelectors) {
    try {
      const el = page.locator(selector).first()
      if (await el.isVisible({ timeout: 1500 })) {
        await el.click()
        await new Promise((r) => setTimeout(r, 800))
        return
      }
    } catch {
      // next
    }
  }

  for (const name of ['Accepter alle', 'Accept All', 'Allow all cookies', 'Kun nødvendige']) {
    try {
      const btn = page.getByRole('button', { name })
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click()
        await new Promise((r) => setTimeout(r, 800))
        return
      }
    } catch {
      // next
    }
  }
}

async function isLoginWallVisible(page: Page): Promise<boolean> {
  const wallSelectors = [
    '#loginbutton',
    '[data-testid="royal_login_form"]',
    'form[action*="/login/"]',
    'input[name="email"][type="text"]',
  ]
  for (const sel of wallSelectors) {
    if (await page.locator(sel).isVisible({ timeout: 1500 }).catch(() => false)) return true
  }
  return false
}

async function scrapeMarketplacePage(
  context: BrowserContext,
  url: string,
  isService: boolean,
  config: ReturnType<typeof getScraperConfig>,
): Promise<{ cards: FbCard[]; loginWall: boolean }> {
  const page = await context.newPage()
  const allCards: FbCard[] = []
  let loginWall = false

  try {
    console.log(`[facebook] Navigating to: ${url}`)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40_000 })

    await dismissConsentDialog(page)
    await new Promise((r) => setTimeout(r, 2000))

    loginWall = await isLoginWallVisible(page)
    if (loginWall) {
      console.warn('[facebook] Login wall detected — extracting pre-wall content only')
    }

    for (let scroll = 0; scroll < 6 && allCards.length < config.maxItems; scroll++) {
      const batch = await extractCards(page, isService)
      for (const card of batch) {
        if (!allCards.find((c) => c.id === card.id)) allCards.push(card)
      }
      if (loginWall || allCards.length >= config.maxItems) break
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2))
      await new Promise((r) => setTimeout(r, 1500))
    }

    console.log(
      `[facebook] Extracted ${allCards.length} cards from ${isService ? 'services' : 'general marketplace'}`,
    )
  } catch (err) {
    console.error(
      `[facebook] Error scraping ${url}: ${err instanceof Error ? err.message : String(err)}`,
    )
  } finally {
    await page.close()
  }

  return { cards: allCards, loginWall }
}

function cardToScrapedItem(card: FbCard): ScrapedItem {
  const category = detectCategory(card.title, card.isService)
  return {
    sourceId: card.id,
    sourceUrl: card.url,
    rawData: card as unknown as Record<string, unknown>,
    mappedCategory: category,
    listingIntent: category === 'property' ? 'for_sale' : 'service',
    title: card.title || null,
    description: null,
    price: parsePriceDKK(card.price),
    currency: 'DKK',
    city: card.location || null,
    latitude: null,
    longitude: null,
    imageUrls: card.imageUrl ? [card.imageUrl] : [],
    durationHours: null,
    maxGuests: null,
    serviceType: card.isService ? 'marketplace_service' : null,
  }
}

export async function scrapeFacebook(
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
      console.log('[facebook] Loaded session cookies')
    } catch {
      errors.push('Could not parse .fb-cookies.json — will attempt unauthenticated scrape')
    }
  } else {
    console.warn(
      '[facebook] No cookies found. Results may be limited by login wall.\n' +
        '  Run: npx tsx scripts/scraping/helpers/save-cookies.ts --source facebook',
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
      errors.push('Failed to apply saved cookies')
    }
  }

  try {
    // ── Phase 1: General Denmark marketplace ─────────────────────────────────
    const { cards: generalCards, loginWall } = await scrapeMarketplacePage(
      context,
      SCRAPE_TARGETS.facebook.marketplace,
      false,
      config,
    )
    if (loginWall && cookies.length === 0) {
      errors.push(
        'Facebook login wall hit without cookies. Run save-cookies helper for full access: ' +
          'npx tsx scripts/scraping/helpers/save-cookies.ts --source facebook',
      )
    }

    for (const card of generalCards) {
      if (!seenIds.has(card.id)) {
        seenIds.add(card.id)
        items.push(cardToScrapedItem(card))
      }
    }

    // ── Phase 2: Services-specific marketplace ────────────────────────────────
    if (items.length < config.maxItems) {
      await randomDelay(config)
      const { cards: svcCards } = await scrapeMarketplacePage(
        context,
        SCRAPE_TARGETS.facebook.services,
        true,
        config,
      )
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

  return {
    source: 'facebook',
    items,
    errors,
    durationMs: Date.now() - startTime,
    scrapedAt: new Date(),
  }
}
