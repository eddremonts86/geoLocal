/**
 * Shared helpers for scrapers that rely on schema.org JSON-LD `ItemList` /
 * `Product` blocks — currently bilbasen.dk and dba.dk. Both sites render a
 * server-side `<script type="application/ld+json">` with either:
 *   - `{"@type":"ItemList", itemListElement: Product[]}` (bilbasen), or
 *   - `{"@type":"CollectionPage", mainEntity: {"@type":"ItemList", ...}}` (dba).
 */

import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { getScraperConfig, pickUserAgent } from './config'
import type { ScraperConfig } from './types'

/** Minimal subset of schema.org Product we care about. */
export interface JsonLdProduct {
  '@type': 'Product' | string
  name?: string
  description?: string
  url?: string
  image?: string | string[]
  brand?: string | { '@type': 'Brand'; name?: string }
  model?: string
  offers?: {
    '@type'?: 'Offer'
    price?: number | string
    priceCurrency?: string
    availability?: string
    itemCondition?: string
  }
  itemCondition?: string
  // Allow through any extra fields without loss.
  [k: string]: unknown
}

/**
 * Pull every Product out of every `script[type="application/ld+json"]`
 * on the current page. Handles the ItemList / CollectionPage shapes.
 *
 * NOTE: The traversal runs inside `page.evaluate` (browser context), so the
 * function passed must be self-contained. We use an iterative stack instead
 * of a recursive helper because tsx/esbuild injects `__name()` shims around
 * nested function declarations, which break once serialised into the page.
 */
export async function extractJsonLdProducts(page: Page): Promise<JsonLdProduct[]> {
  // Give the SSR'd JSON-LD a moment to appear — some sites inject it late.
  try {
    await page.waitForSelector('script[type="application/ld+json"]', { timeout: 8_000 })
  } catch {
    // proceed anyway; evaluate will just return []
  }
  return page.evaluate(() => {
    const out: Array<Record<string, unknown>> = []
    const stack: unknown[] = []
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      try {
        stack.push(JSON.parse(s.textContent || 'null'))
      } catch {
        // skip malformed blocks
      }
    }
    while (stack.length > 0) {
      const node = stack.pop()
      if (!node) continue
      if (Array.isArray(node)) {
        for (const n of node) stack.push(n)
        continue
      }
      if (typeof node !== 'object') continue
      const n = node as Record<string, unknown>
      if (n['@type'] === 'Product') {
        out.push(n)
        continue
      }
      for (const v of Object.values(n)) stack.push(v)
    }
    return out
  }) as Promise<JsonLdProduct[]>
}

export interface WarmedBrowser {
  browser: Browser
  context: BrowserContext
  page: Page
  config: ScraperConfig
}

/**
 * Launch a stealthy chromium, navigate to `origin` to collect any CF/anti-bot
 * cookies, and return the opened page. Caller is responsible for `close()`.
 */
export async function launchAndWarm(
  origin: string,
  overrides: Partial<ScraperConfig> = {},
): Promise<WarmedBrowser> {
  const config = getScraperConfig(overrides)

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
  // `networkidle` is required for SSR'd sites like bilbasen/dba that serve a
  // 202 skeleton first and inject JSON-LD after a client-side handshake.
  await page.goto(origin, { waitUntil: 'networkidle', timeout: 45_000 })

  return { browser, context, page, config }
}
