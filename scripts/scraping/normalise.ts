/**
 * Normalisation step — AI-first with rule-based fallback.
 *
 * Called by the runner AFTER a scraper collects raw items. For each item:
 *   1. If AI is enabled, call the provider-agnostic client with the raw payload.
 *   2. On success, merge the AI response over the scraper's best-effort fields.
 *   3. On failure (offline, bad JSON, schema mismatch after retry), keep the
 *      scraper's output untouched. `normalisedBy` records the path taken.
 */

import { isAIEnabled, chatJSON, normalisePrompt, NormalisedItemSchema } from '../../src/shared/lib/ai'
import type { ScrapedItem, ScrapedSource } from './types'
import { ruleNormalise } from './normalise-rules'

export interface NormaliseOutcome {
  item: ScrapedItem
  normalisedBy: string | null
  /** JSON payload we persist to scraped_raw.normalised (null when AI failed or was skipped). */
  normalisedJson: Record<string, unknown> | null
}

/** Strict keys allowed on the normalised payload — limits what AI output can overwrite. */
const ALLOWED_FIELDS = [
  'title', 'description', 'price', 'currency', 'city',
  'latitude', 'longitude', 'imageUrls', 'mappedCategory',
  'bedrooms', 'bathrooms', 'areaSqm', 'yearBuilt',
  'make', 'model', 'year', 'mileageKm',
  'durationHours', 'maxGuests', 'serviceType',
] as const

function mergeOverwrite(base: ScrapedItem, overrides: Record<string, unknown>): ScrapedItem {
  const out: Record<string, unknown> = { ...base }
  for (const k of ALLOWED_FIELDS) {
    const v = overrides[k]
    if (v !== undefined && v !== null) out[k] = v
  }
  return out as unknown as ScrapedItem
}

/** Normalise a single item. Safe to call with AI disabled — returns the item as-is. */
export async function normaliseItem(
  item: ScrapedItem,
  source: ScrapedSource,
  opts: { skipAI?: boolean } = {},
): Promise<NormaliseOutcome> {
  // Always compute rule-based projection so every row has structured fields,
  // even when AI is unavailable. AI (when enabled) can override via mergeOverwrite.
  const ruleJson = ruleNormalise(source, {
    ...item.rawData,
    _listingIntent: item.listingIntent ?? (item.rawData as Record<string, unknown>)?._listingIntent,
  })

  if (opts.skipAI || !isAIEnabled()) {
    return {
      item,
      normalisedBy: ruleJson ? 'rules' : null,
      normalisedJson: ruleJson as Record<string, unknown> | null,
    }
  }

  try {
    const { data, modelReported } = await chatJSON({
      messages: normalisePrompt({
        source,
        sourceUrl: item.sourceUrl,
        rawJson: item.rawData,
      }),
      schema: NormalisedItemSchema,
    })

    // AI output wins but rule fields fill any gaps it leaves.
    const merged = { ...(ruleJson ?? {}), ...(data as Record<string, unknown>) }
    return {
      item: mergeOverwrite(item, merged),
      normalisedBy: `ai:${modelReported}`.slice(0, 64),
      normalisedJson: merged,
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    console.warn(`  ! AI normalise failed for ${source}/${item.sourceId}: ${reason.slice(0, 120)}`)
    return {
      item,
      normalisedBy: ruleJson ? 'rules' : null,
      normalisedJson: ruleJson as Record<string, unknown> | null,
    }
  }
}

/** Normalise a batch sequentially (AI endpoints often prefer one request at a time). */
export async function normaliseBatch(
  items: ScrapedItem[],
  source: ScrapedSource,
  opts: { skipAI?: boolean } = {},
): Promise<{ items: ScrapedItem[]; normalisedByMap: Map<string, { by: string | null; json: Record<string, unknown> | null }> }> {
  const out: ScrapedItem[] = []
  const map = new Map<string, { by: string | null; json: Record<string, unknown> | null }>()
  let idx = 0
  for (const it of items) {
    idx++
    const started = Date.now()
    const result = await normaliseItem(it, source, opts)
    const secs = ((Date.now() - started) / 1000).toFixed(1)
    const shortBy = (result.normalisedBy ?? 'none').slice(0, 40)
    console.log(`  [${idx}/${items.length}] ${it.sourceId.slice(0, 16)}… via ${shortBy} in ${secs}s`)
    out.push(result.item)
    map.set(it.sourceId, { by: result.normalisedBy, json: result.normalisedJson })
  }
  return { items: out, normalisedByMap: map }
}
