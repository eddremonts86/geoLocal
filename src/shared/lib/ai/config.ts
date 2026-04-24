/**
 * AI config — provider-agnostic.
 *
 * Reads purely from env. Swap the endpoint (LMStudio / Ollama / OpenAI / Anthropic-via-proxy /
 * vLLM / TGI) without touching code. All four speak the OpenAI-compatible
 * `/chat/completions` protocol.
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

export function getAIConfig(): AIConfig {
  return {
    baseUrl: readEnv('AI_BASE_URL'),
    apiKey: readEnv('AI_API_KEY'),
    model: readEnv('AI_MODEL') ?? 'auto',
    timeoutMs: Number(readEnv('AI_TIMEOUT_MS') ?? '30000'),
    maxRetries: Number(readEnv('AI_MAX_RETRIES') ?? '2'),
  }
}

/** True iff an AI endpoint is configured. Callers should gracefully fall back when false. */
export function isAIEnabled(): boolean {
  return getAIConfig().baseUrl != null
}
