/**
 * Provider-agnostic AI client.
 *
 * Uses the OpenAI chat-completions protocol which is spoken by LMStudio,
 * Ollama (via /v1 prefix), vLLM, TGI, and OpenAI itself. Only env config
 * drives the endpoint — no code changes to switch providers.
 */

import { z, type ZodType } from 'zod'
import { getAIConfig } from './config'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatJSONOptions<T> {
  messages: ChatMessage[]
  schema: ZodType<T>
  /** Optional signal to cancel the request from outside. */
  signal?: AbortSignal
}

interface OpenAIChatResponse {
  model?: string
  choices: Array<{ message: { content: string; reasoning_content?: string } }>
}

export interface ChatJSONResult<T> {
  data: T
  /** Model id the server reported (e.g. 'gemma-4-9b'). Used for audit / normalised_by. */
  modelReported: string
}

const JSON_FENCE_RE = /```(?:json)?\s*([\s\S]*?)```/i

/** Strip markdown fences and extract the JSON blob a chat model may wrap around the payload. */
function extractJson(raw: string): string {
  const fenced = JSON_FENCE_RE.exec(raw)
  if (fenced?.[1]) return fenced[1].trim()
  // Fallback: locate the first balanced JSON object in the response
  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) return raw.slice(firstBrace, lastBrace + 1)
  return raw.trim()
}

/**
 * Call the chat-completions endpoint and parse the reply against a Zod schema.
 * Retries once with validator feedback on JSON/schema parse failure.
 */
export async function chatJSON<T>(options: ChatJSONOptions<T>): Promise<ChatJSONResult<T>> {
  const config = getAIConfig()
  if (!config.baseUrl) {
    throw new Error('AI_SCRAPER_BASE_URL is not set — guard with isAIEnabled() before calling chatJSON')
  }

  const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`
  let messages = options.messages
  let lastError: unknown

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    const controller = new AbortController()
    const externalAbort = () => controller.abort()
    options.signal?.addEventListener('abort', externalAbort, { once: true })
    const timeout = setTimeout(() => controller.abort(new Error('AI request timed out')), config.timeoutMs)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: 0.1,
          max_tokens: 3000,
          // NOTE: response_format is intentionally omitted — LMStudio rejects
          // { type: 'json_object' }; the strict system prompt + extractJson()
          // fence-stripper handle the parsing reliably across all providers.
          stream: false,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`AI HTTP ${res.status}: ${body.slice(0, 200)}`)
      }

      const json = (await res.json()) as OpenAIChatResponse
      const choiceMsg = json.choices?.[0]?.message
      // Thinking models (Qwen3, DeepSeek-R1, etc.) return reasoning in
      // `reasoning_content` and leave `content` empty. Fall back to it so the
      // same client works with both thinking and non-thinking models.
      const content =
        (choiceMsg?.content && choiceMsg.content.trim().length > 0
          ? choiceMsg.content
          : choiceMsg?.reasoning_content) ?? ''
      const modelReported = json.model ?? config.model

      let parsed: unknown
      try {
        parsed = JSON.parse(extractJson(content))
      } catch (err) {
        throw new Error(`AI returned non-JSON: ${(err as Error).message}`)
      }

      const result = options.schema.safeParse(parsed)
      if (result.success) {
        return { data: result.data, modelReported }
      }

      lastError = new Error(`AI payload failed schema: ${result.error.message.slice(0, 300)}`)
      // Retry once with validator feedback injected
      messages = [
        ...options.messages,
        { role: 'assistant', content },
        {
          role: 'user',
          content:
            'Your previous response did not match the required JSON schema. ' +
            `Zod error: ${result.error.message.slice(0, 400)}. ` +
            'Return ONLY valid JSON matching the schema — no prose, no code fences.',
        },
      ]
    } catch (err) {
      lastError = err
    } finally {
      clearTimeout(timeout)
      options.signal?.removeEventListener('abort', externalAbort)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

export { z }
