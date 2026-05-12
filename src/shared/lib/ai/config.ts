/**
 * AI config — provider-agnostic.
 *
 * Reads purely from env. Swap the endpoint (LMStudio / Ollama / OpenAI / Anthropic-via-proxy /
 * vLLM / TGI) without touching code. All four speak the OpenAI-compatible
 * `/chat/completions` protocol.
 *
 * Variable naming: canonical names are AI_SCRAPER_* (see tasks/env-unification-plan.md).
 * The legacy names AI_BASE_URL / AI_API_KEY / AI_MODEL are still read as fallback
 * to keep existing .env files working during the migration period.
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


/** Read only canonical AI_SCRAPER_* names. */
function readEnvCanonical(name: string): string | null {
  return readEnv(name)
}

export function getAIConfig(): AIConfig {
  return {
    baseUrl: readEnvCanonical('AI_SCRAPER_BASE_URL'),
    apiKey: readEnvCanonical('AI_SCRAPER_API_KEY'),
    model: readEnvCanonical('AI_SCRAPER_MODEL') ?? 'auto',
    timeoutMs: Number(readEnvCanonical('AI_SCRAPER_TIMEOUT_MS') ?? '30000'),
    maxRetries: Number(readEnvCanonical('AI_SCRAPER_MAX_RETRIES') ?? '2'),
  }
}

/** True iff an AI endpoint is configured. Callers should gracefully fall back when false. */
export function isAIEnabled(): boolean {
  return getAIConfig().baseUrl != null
}
