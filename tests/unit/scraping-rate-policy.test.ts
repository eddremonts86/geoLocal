import { describe, expect, it } from 'vitest'
import { pickUserAgent } from '../../scripts/scraping/config'
import { parseRetryAfterMs, sourceDelayMs } from '../../scripts/scraping/rate-policy'

describe('scraping rate policy', () => {
  it('parses Retry-After seconds', () => {
    expect(parseRetryAfterMs('120', new Date('2026-07-22T00:00:00Z'))).toBe(120_000)
  })

  it('parses Retry-After dates without returning negative delays', () => {
    const now = new Date('2026-07-22T00:00:00Z')
    expect(parseRetryAfterMs('Wed, 22 Jul 2026 00:01:00 GMT', now)).toBe(60_000)
    expect(parseRetryAfterMs('Tue, 21 Jul 2026 00:01:00 GMT', now)).toBe(0)
  })

  it('keeps deterministic jitter inside the source budget', () => {
    expect(sourceDelayMs({ minMs: 2_000, maxMs: 5_000 }, 0)).toBe(2_000)
    expect(sourceDelayMs({ minMs: 2_000, maxMs: 5_000 }, 1)).toBe(5_000)
  })

  it('uses one honest scraper identity instead of rotating browser identities', () => {
    expect(pickUserAgent()).toBe(pickUserAgent())
    expect(pickUserAgent()).toContain('GeoLocalScraper')
  })
})
