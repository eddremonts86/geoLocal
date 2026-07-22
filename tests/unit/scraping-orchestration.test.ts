import { describe, expect, it } from 'vitest'
import {
  advancePageCursor,
  incrementalBatchLimit,
  nextBackoffMs,
  shouldStopIncremental,
} from '../../scripts/scraping/orchestration'

describe('scraping orchestration state', () => {
  it('advances a backfill page cursor without losing its partition', () => {
    expect(advancePageCursor({ page: 7, partition: 'property' })).toEqual({
      page: 8,
      partition: 'property',
    })
  })

  it('stops incremental collection after two complete pages of known ids', () => {
    expect(
      shouldStopIncremental({
        consecutiveKnownItems: 99,
        pageSize: 50,
        knownPagesThreshold: 2,
      }),
    ).toBe(false)
    expect(
      shouldStopIncremental({
        consecutiveKnownItems: 100,
        pageSize: 50,
        knownPagesThreshold: 2,
      }),
    ).toBe(true)
  })

  it('does not stop early while scanning independent partitions', () => {
    expect(
      shouldStopIncremental({
        consecutiveKnownItems: 100,
        pageSize: 50,
        knownPagesThreshold: 2,
        partitioned: true,
      }),
    ).toBe(false)
  })

  it('scans every EDC partition during an incremental run', () => {
    expect(incrementalBatchLimit('edc', 5)).toBe(12)
    expect(incrementalBatchLimit('homestra', 5)).toBe(5)
  })

  it('uses capped exponential cooldowns', () => {
    expect(nextBackoffMs(1, { baseMs: 60_000, maxMs: 600_000 })).toBe(60_000)
    expect(nextBackoffMs(4, { baseMs: 60_000, maxMs: 600_000 })).toBe(480_000)
    expect(nextBackoffMs(8, { baseMs: 60_000, maxMs: 600_000 })).toBe(600_000)
  })
})
