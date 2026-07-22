export type ScrapeFlow = 'backfill' | 'incremental'

export interface PageCursor {
  page: number
  partition?: string
}

export interface ScrapeWatermark {
  sourceId: string
  observedAt: string
}

const MINIMUM_INCREMENTAL_BATCHES: Readonly<Record<string, number>> = {
  edc: 12,
}

export function advancePageCursor(cursor: PageCursor): PageCursor {
  return { ...cursor, page: cursor.page + 1 }
}

export function shouldStopIncremental(input: {
  consecutiveKnownItems: number
  pageSize: number
  knownPagesThreshold?: number
  partitioned?: boolean
}): boolean {
  if (input.partitioned) return false
  const threshold = input.knownPagesThreshold ?? 2
  if (input.pageSize <= 0 || threshold <= 0) return false
  return input.consecutiveKnownItems >= input.pageSize * threshold
}

export function incrementalBatchLimit(source: string, configuredLimit: number): number {
  const safeConfiguredLimit = Number.isFinite(configuredLimit)
    ? Math.max(1, Math.floor(configuredLimit))
    : 5
  return Math.max(safeConfiguredLimit, MINIMUM_INCREMENTAL_BATCHES[source] ?? 1)
}

export function nextBackoffMs(
  consecutiveFailures: number,
  options: { baseMs?: number; maxMs?: number } = {},
): number {
  const baseMs = options.baseMs ?? 60_000
  const maxMs = options.maxMs ?? 6 * 60 * 60 * 1_000
  const exponent = Math.max(0, consecutiveFailures - 1)
  return Math.min(maxMs, baseMs * 2 ** exponent)
}
