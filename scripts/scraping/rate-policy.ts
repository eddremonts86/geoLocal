export interface RateBudget {
  minMs: number
  maxMs: number
}

export const SOURCE_RATE_BUDGETS: Record<string, RateBudget> = {
  homestra: { minMs: 3_000, maxMs: 7_000 },
  bilbasen: { minMs: 4_000, maxMs: 9_000 },
  edc: { minMs: 4_000, maxMs: 9_000 },
}

export function parseRetryAfterMs(value: string | null, now = new Date()): number | null {
  if (!value) return null
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1_000)
  const retryAt = Date.parse(value)
  if (!Number.isFinite(retryAt)) return null
  return Math.max(0, retryAt - now.getTime())
}

export function sourceDelayMs(budget: RateBudget, randomValue = Math.random()): number {
  const ratio = Math.min(1, Math.max(0, randomValue))
  return Math.round(budget.minMs + (budget.maxMs - budget.minMs) * ratio)
}

export async function waitForSourceBudget(source: string): Promise<void> {
  const budget = SOURCE_RATE_BUDGETS[source] ?? { minMs: 5_000, maxMs: 10_000 }
  await new Promise((resolve) => setTimeout(resolve, sourceDelayMs(budget)))
}
