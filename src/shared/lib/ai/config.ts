/**
 * AI config — provider-agnostic.
 *
 * Reads purely from env. Swap the endpoint (LMStudio / Ollama / OpenAI / MiniMax /
 * Anthropic-via-proxy / vLLM / TGI) without touching code. All speak the
 * OpenAI-compatible `/chat/completions` protocol.
 *
 * Variable resolution order (first non-empty wins):
 *   1. AI_SCRAPER_* — canonical per-feature override (highest priority)
 *   2. MINIMAX_*    — workspace-wide provider defaults (single source of truth
 *                     in the root .env; shared with open-design, budget-app, …)
 */

export interface AIConfig {
  baseUrl: string | null
  apiKey: string | null
  /** Model identifier. 'auto' is treated as a sentinel for endpoints that ignore the field (LMStudio). */
  model: string
  timeoutMs: number
  maxRetries: number
}

function readEnv(name: string): string | null {
  const v = process.env[name]
  return v && v.length > 0 ? v : null
}

/** First non-empty env value wins. */
function firstEnv(...names: string[]): string | null {
  for (const n of names) {
    const v = readEnv(n)
    if (v != null) return v
  }
  return null
}

export function getAIConfig(): AIConfig {
  return {
    baseUrl: firstEnv('AI_SCRAPER_BASE_URL', 'MINIMAX_BASE_URL'),
    apiKey: firstEnv('AI_SCRAPER_API_KEY', 'MINIMAX_API_KEY'),
    model: firstEnv('AI_SCRAPER_MODEL', 'MINIMAX_MODEL') ?? 'auto',
    timeoutMs: Number(readEnv('AI_SCRAPER_TIMEOUT_MS') ?? '30000'),
    maxRetries: Number(readEnv('AI_SCRAPER_MAX_RETRIES') ?? '2'),
  }
}

/** True iff an AI endpoint is configured. Callers should gracefully fall back when false. */
export function isAIEnabled(): boolean {
  return getAIConfig().baseUrl != null
}
