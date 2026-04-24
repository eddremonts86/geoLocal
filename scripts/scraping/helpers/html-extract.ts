/**
 * HTML-scraping helpers: JSON-LD + Next.js __NEXT_DATA__ + Nuxt __NUXT__ extraction.
 *
 * Uses plain regex + JSON.parse — avoids pulling in Cheerio as a runtime dep.
 * Good enough for the structured-data extraction we need; Playwright is only
 * used by scrapers that need to execute JavaScript.
 */

import { pickUserAgent } from '../config'

export interface FetchHtmlOptions {
  timeoutMs?: number
  userAgent?: string
  acceptLanguage?: string
}

export async function fetchHtml(url: string, opts: FetchHtmlOptions = {}): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20000)
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': opts.userAgent ?? pickUserAgent(),
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': opts.acceptLanguage ?? 'da-DK,da;q=0.9,en;q=0.5',
      },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timeout)
  }
}

const JSON_LD_RE = /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
const NEXT_DATA_RE = /<script[^>]+id\s*=\s*["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i
const NUXT_DATA_RE = /window\.__NUXT__\s*=\s*([\s\S]*?);\s*<\/script>/i

/** Extract every JSON-LD block in the HTML. Invalid blocks are skipped. */
export function extractJsonLd(html: string): unknown[] {
  const out: unknown[] = []
  for (const match of html.matchAll(JSON_LD_RE)) {
    const raw = match[1]?.trim() ?? ''
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) out.push(...parsed)
      else out.push(parsed)
    } catch {
      // bad JSON-LD — ignore
    }
  }
  return out
}

/** Extract Next.js __NEXT_DATA__ JSON. Returns null when absent/invalid. */
export function extractNextData(html: string): unknown | null {
  const m = NEXT_DATA_RE.exec(html)
  if (!m?.[1]) return null
  try {
    return JSON.parse(m[1])
  } catch {
    return null
  }
}

/** Extract Nuxt __NUXT__ JSON. Returns null when absent/invalid. */
export function extractNuxtData(html: string): unknown | null {
  const m = NUXT_DATA_RE.exec(html)
  if (!m?.[1]) return null
  try {
    return JSON.parse(m[1])
  } catch {
    return null
  }
}

/** Absolute-URL resolver. */
export function absoluteUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString()
  } catch {
    return href
  }
}

/** Strip HTML tags to plaintext (best-effort, no external deps). */
export function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim() || null
}
