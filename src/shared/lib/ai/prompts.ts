/**
 * Prompt builders for AI normalisation of scraped items.
 */

import { z } from 'zod'
import type { ChatMessage } from './client'

// Shared Zod schema for normalised scraped items. Matches the ScrapedItem
// shape in scripts/scraping/types.ts (kept here to avoid pulling scripts/ into src/).
export const NormalisedItemSchema = z.object({
  sourceId: z.string().min(1),
  sourceUrl: z.string().url().or(z.string().min(1)),
  title: z.string().nullable(),
  description: z.string().nullable(),
  price: z.number().nullable(),
  currency: z.string().nullable(),
  city: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  imageUrls: z.array(z.string()).default([]),
  mappedCategory: z.enum(['property', 'service', 'experience', 'vehicle']).nullable(),
  // Property detail
  bedrooms: z.number().nullable().optional(),
  bathrooms: z.number().nullable().optional(),
  areaSqm: z.number().nullable().optional(),
  yearBuilt: z.number().nullable().optional(),
  // Vehicle detail
  make: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  mileageKm: z.number().nullable().optional(),
  // Experience detail
  durationHours: z.number().nullable().optional(),
  maxGuests: z.number().nullable().optional(),
  serviceType: z.string().nullable().optional(),
})

export type NormalisedItem = z.infer<typeof NormalisedItemSchema>

export interface NormalisePromptInput {
  source: string
  sourceUrl: string
  rawJson?: unknown
  rawHtml?: string
}

const SCHEMA_DOC = `{
  "sourceId": string,          // unique id from source
  "sourceUrl": string,
  "title": string | null,
  "description": string | null, // plain text, HTML stripped
  "price": number | null,       // numeric only (no currency symbol)
  "currency": string | null,    // ISO 4217, e.g. "DKK", "EUR"
  "city": string | null,
  "latitude": number | null,    // WGS84 decimal degrees
  "longitude": number | null,
  "imageUrls": string[],        // absolute URLs
  "mappedCategory": "property" | "service" | "experience" | "vehicle" | null,
  "bedrooms": number | null,
  "bathrooms": number | null,
  "areaSqm": number | null,
  "yearBuilt": number | null,
  "make": string | null,
  "model": string | null,
  "year": number | null,
  "mileageKm": number | null,
  "durationHours": number | null,
  "maxGuests": number | null,
  "serviceType": string | null
}`

export function normalisePrompt(input: NormalisePromptInput): ChatMessage[] {
  const payload = input.rawJson
    ? `JSON payload:\n${JSON.stringify(input.rawJson).slice(0, 20000)}`
    : `HTML snippet:\n${(input.rawHtml ?? '').slice(0, 20000)}`

  return [
    {
      role: 'system',
      content:
        'You are a strict data normaliser. You extract listing fields from raw scraped content ' +
        'and emit ONLY valid JSON matching the schema below. You NEVER invent facts — if a field ' +
        'is not clearly present, return null. Prices must be numeric with no currency symbol. ' +
        'Descriptions must be plain text (strip all HTML). Image URLs must be absolute.\n\n' +
        `Schema:\n${SCHEMA_DOC}\n\n` +
        'Respond with a single JSON object. No prose. No code fences.',
    },
    {
      role: 'user',
      content:
        `Source: ${input.source}\n` +
        `URL: ${input.sourceUrl}\n\n` +
        payload,
    },
  ]
}

// ─── Enrichment (second pass on top of rule-based) ────────────────────────────

/**
 * Schema for AI-enrichment: extracts fields the rule-based normaliser cannot
 * derive (free-form text, inferred categories, venue names, etc.).
 * Every field is optional — the caller merges conservatively (only fills nulls).
 */
export const EnrichedItemSchema = z.object({
  // Geography (useful when rule-based leaves it null)
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  // Property detail
  bedrooms: z.number().int().nonnegative().nullable().optional(),
  bathrooms: z.number().nonnegative().nullable().optional(),
  areaSqm: z.number().positive().nullable().optional(),
  yearBuilt: z.number().int().min(1500).max(2100).nullable().optional(),
  energyLabel: z.string().nullable().optional(),
  heating: z.string().nullable().optional(),
  // Listing / marketplace
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'for_parts', 'unknown']).nullable().optional(),
  brand: z.string().nullable().optional(),
  productModel: z.string().nullable().optional(),
  // Event / service / experience
  venueName: z.string().nullable().optional(),
  audience: z.string().nullable().optional(),
  durationHours: z.number().positive().nullable().optional(),
  maxGuests: z.number().int().positive().nullable().optional(),
  serviceType: z.string().nullable().optional(),
  seniority: z.enum(['junior', 'mid', 'senior', 'lead', 'unknown']).nullable().optional(),
  remote: z.boolean().nullable().optional(),
  // Categorisation refinement
  mappedCategory: z.enum(['property', 'service', 'experience', 'vehicle']).nullable().optional(),
  tags: z.array(z.string()).max(10).nullable().optional(),
  // Confidence + notes (helps debugging)
  confidence: z.number().min(0).max(1).nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type EnrichedItem = z.infer<typeof EnrichedItemSchema>

const ENRICH_SCHEMA_DOC = `{
  "address": string | null,          // street + zip + city when inferable
  "city": string | null,
  "country": string | null,          // ISO 3166-1 alpha-2 (e.g. "DK", "US")
  "latitude": number | null,
  "longitude": number | null,
  "bedrooms": number | null,
  "bathrooms": number | null,
  "areaSqm": number | null,
  "yearBuilt": number | null,        // 1500..2100
  "energyLabel": string | null,      // e.g. "A", "B", "C"
  "heating": string | null,
  "condition": "new" | "like_new" | "good" | "fair" | "for_parts" | "unknown" | null,
  "brand": string | null,
  "productModel": string | null,
  "venueName": string | null,
  "audience": string | null,
  "durationHours": number | null,
  "maxGuests": number | null,
  "serviceType": string | null,
  "seniority": "junior" | "mid" | "senior" | "lead" | "unknown" | null,
  "remote": boolean | null,
  "mappedCategory": "property" | "service" | "experience" | "vehicle" | null,
  "tags": string[] | null,           // up to 10 short lowercase keywords
  "confidence": number | null,       // 0..1 self-estimated
  "notes": string | null             // short free-form reasoning, optional
}`

export interface EnrichPromptInput {
  source: string
  sourceUrl: string
  rawJson: unknown
  /** Current rule-based output — AI must not override non-null values here. */
  existing: Record<string, unknown> | null
}

export function enrichPrompt(input: EnrichPromptInput): ChatMessage[] {
  const existing = input.existing ? JSON.stringify(input.existing).slice(0, 1500) : '{}'
  const raw = JSON.stringify(input.rawJson).slice(0, 6000)
  return [
    {
      role: 'system',
      content:
        'You are a careful data enricher. A rule-based extractor has already produced "existing" fields. ' +
        'Your job: fill gaps by reading the RAW payload and returning ONLY fields the rules missed. ' +
        'Rules:\n' +
        '  1. If the rule-based output already has a value for a field, DO NOT include it in your output.\n' +
        '  2. NEVER invent values. If you cannot find it in the raw payload, return null or omit the field.\n' +
        '  3. Prefer values literally present in the raw text. Only infer when the signal is clear.\n' +
        '  4. Return a single JSON object matching the schema. No prose, no code fences.\n\n' +
        `Schema:\n${ENRICH_SCHEMA_DOC}`,
    },
    {
      role: 'user',
      content:
        `Source: ${input.source}\n` +
        `URL: ${input.sourceUrl}\n\n` +
        `Existing rule-based output:\n${existing}\n\n` +
        `Raw payload:\n${raw}`,
    },
  ]
}

// ─── Discovery (pattern mining — never writes to DB) ─────────────────────────

export const DiscoveryFindingSchema = z.object({
  jsonPath: z.string().optional(),
  path: z.string().optional(),
  suggestedName: z.string().optional(),
  name: z.string().optional(),
  exampleValue: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  example: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  reasoning: z.string().optional().default(''),
  reason: z.string().optional(),
  usefulness: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  priority: z.string().optional(),
}).passthrough()

export const DiscoveryResponseSchema = z.object({
  findings: z.array(DiscoveryFindingSchema).max(30),
})

export type DiscoveryResponse = z.infer<typeof DiscoveryResponseSchema>

export interface DiscoveryPromptInput {
  source: string
  samples: Array<{ sourceId: string; rawJson: unknown; extracted: Record<string, unknown> | null }>
}

export function discoveryPrompt(input: DiscoveryPromptInput): ChatMessage[] {
  const body = input.samples
    .map((s, i) => {
      const raw = JSON.stringify(s.rawJson).slice(0, 3000)
      const got = s.extracted ? JSON.stringify(s.extracted).slice(0, 1500) : '{}'
      return `### Sample ${i + 1} (id=${s.sourceId})\nRAW:\n${raw}\n\nEXTRACTED:\n${got}`
    })
    .join('\n\n')
  return [
    {
      role: 'system',
      content:
        'You are a data-mining assistant. Given several raw scraped payloads from the same source ' +
        'and the fields a rule-based extractor currently captures, identify USEFUL fields we are ' +
        'NOT extracting yet. Return findings ranked by usefulness.\n\n' +
        'Rules:\n' +
        '  - Only point out fields that appear consistently across samples.\n' +
        '  - Ignore internal ids, timestamps, booleans obviously irrelevant to a geo-listing dashboard.\n' +
        '  - Good candidates: energy rating, heating type, venue name, bedrooms, contact, amenities, tags, etc.\n' +
        '  - Provide a JSONPath-like string (e.g. "address.roadName", "images[0].url", "location.coordinates[1]").\n' +
        '  - usefulness: high=address/price/category, medium=amenity/detail, low=nice-to-have.\n' +
        '  - Return {"findings": [...]}. No prose.',
    },
    {
      role: 'user',
      content: `Source: ${input.source}\n\n${body}`,
    },
  ]
}

