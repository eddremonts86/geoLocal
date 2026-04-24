// ─── Scraper configuration ────────────────────────────────────────────────────
// Centralised config: rate limits, targets, env-driven proxy.

import type { ScraperConfig } from './types'

export function getScraperConfig(overrides: Partial<ScraperConfig> = {}): ScraperConfig {
  return {
    maxItems: 100,
    minDelayMs: 2500,
    maxDelayMs: 5500,
    proxyUrl: process.env.SCRAPE_PROXY_URL ?? null,
    dryRun: false,
    targetCountry: 'DK',
    targetLocale: 'da-DK',
    ...overrides,
  }
}

// Source-specific target URLs
export const SCRAPE_TARGETS = {
  airbnb: {
    /** Airbnb Denmark stays — multiple city queries for better coverage */
    stays: 'https://www.airbnb.dk/s/Denmark/homes?tab_id=home_tab',
    /** Additional stay pages by Danish cities */
    stayCities: [
      'https://www.airbnb.dk/s/Copenhagen--Denmark/homes?tab_id=home_tab',
      'https://www.airbnb.dk/s/Aarhus--Denmark/homes?tab_id=home_tab',
      'https://www.airbnb.dk/s/Odense--Denmark/homes?tab_id=home_tab',
      'https://www.airbnb.dk/s/Aalborg--Denmark/homes?tab_id=home_tab',
      'https://www.airbnb.dk/s/Bornholm--Denmark/homes?tab_id=home_tab',
      'https://www.airbnb.dk/s/Funen--Denmark/homes?tab_id=home_tab',
    ],
    /** Airbnb Denmark experiences — use international URL with DK locale */
    experiences: 'https://www.airbnb.dk/s/Denmark/experiences?tab_id=experience_tab',
    /** Airbnb Denmark services search */
    services: 'https://www.airbnb.dk/s/Denmark/services',
  },
  facebook: {
    marketplace: 'https://www.facebook.com/marketplace/denmark/',
    /** Facebook Marketplace Denmark — Services category */
    services: 'https://www.facebook.com/marketplace/denmark/services/',
  },
  facebookEvents: {
    /** Event search pages by Danish city — used to discover event IDs */
    searches: [
      'https://www.facebook.com/events/search/?q=Copenhagen',
      'https://www.facebook.com/events/search/?q=Aarhus',
      'https://www.facebook.com/events/search/?q=Odense',
      'https://www.facebook.com/events/search/?q=Aalborg',
      'https://www.facebook.com/events/search/?q=Denmark',
    ],
    /** Facebook explore events — may show local events without login */
    explore: 'https://www.facebook.com/events/explore/',
  },
  linkedin: {
    /** LinkedIn freelancer/contractor job search in Denmark */
    services: 'https://www.linkedin.com/jobs/search/?keywords=freelance+services&location=Denmark&f_JT=C',
    /** LinkedIn Services Marketplace — service provider profiles */
    servicesMarketplace: 'https://www.linkedin.com/services/search/?keywords=freelance&location=Denmark',
  },
} as const

// Realistic user-agent pool to rotate
export const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
]

export function randomDelay(config: ScraperConfig): Promise<void> {
  const ms = config.minDelayMs + Math.random() * (config.maxDelayMs - config.minDelayMs)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function pickUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]!
}
