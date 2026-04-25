/**
 * Deterministic rule-based normaliser.
 *
 * Projects raw payloads into a consistent shape regardless of source.
 * Runs *without* AI so it is safe to call from --skip-ai flows and from
 * SQL back-fills over existing rows.
 *
 * Output shape is the subset of fields the UI/admin reads:
 *   { title, address, imageUrl, imageUrls[], city, latitude, longitude,
 *     price, currency, mappedCategory, listingIntent }
 *
 * Any field that cannot be derived from the raw payload is left out of
 * the JSON (rather than set to null) so callers can rely on simple
 * `normalised ? 'x' IS NOT NULL` checks.
 */

import type { ScrapedSource } from './types'

export interface RuleNormalised {
  title?: string
  address?: string
  imageUrl?: string
  imageUrls?: string[]
  city?: string
  latitude?: number
  longitude?: number
  price?: number
  currency?: string
  mappedCategory?: string
  listingIntent?: string
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function str(v: unknown): string | undefined {
  if (typeof v === 'string') {
    const t = v.trim()
    return t.length > 0 ? t : undefined
  }
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return undefined
}

function num(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const cleaned = v.replace(/[^\d.\-]/g, '')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function get<T = unknown>(obj: unknown, path: (string | number)[]): T | undefined {
  let cur: any = obj
  for (const k of path) {
    if (cur == null) return undefined
    cur = cur[k as any]
  }
  return (cur ?? undefined) as T | undefined
}

function pickLargestBoligsidenImage(source: unknown): string | undefined {
  const arr = get<any[]>(source, ['imageSources'])
  if (!Array.isArray(arr) || arr.length === 0) return undefined
  // pick the largest (prefer 1440x960 / 600x600 range)
  let best = arr[0]
  let bestArea = (best?.size?.width ?? 0) * (best?.size?.height ?? 0)
  for (const s of arr) {
    const a = (s?.size?.width ?? 0) * (s?.size?.height ?? 0)
    if (a > bestArea) {
      best = s
      bestArea = a
    }
  }
  return str(best?.url)
}

// ─── per-source normalisers ──────────────────────────────────────────────────

function fromBoligsiden(raw: any): RuleNormalised {
  const addr = raw?.address ?? {}
  const roadName = str(addr.roadName ?? addr.road?.name)
  const houseNumber = str(addr.houseNumber)
  const zip = str(addr.zipCode ?? addr.zip?.zipCode)
  const city = str(addr.cityName ?? addr.city?.name)
  const addressParts = [
    [roadName, houseNumber].filter(Boolean).join(' '),
    [zip, city].filter(Boolean).join(' '),
  ].filter((p) => p.length > 0)
  const address = addressParts.length > 0 ? addressParts.join(', ') : undefined

  const defaultImg = pickLargestBoligsidenImage(raw?.defaultImage)
  const gallery = Array.isArray(raw?.images)
    ? raw.images
        .map((i: unknown) => pickLargestBoligsidenImage(i))
        .filter((u: string | undefined): u is string => Boolean(u))
    : []
  const imageUrl = defaultImg ?? gallery[0]
  const imageUrls = gallery.length > 0 ? gallery : imageUrl ? [imageUrl] : undefined

  return {
    title: address,
    address,
    city,
    imageUrl,
    imageUrls,
    latitude: num(raw?.coordinates?.lat),
    longitude: num(raw?.coordinates?.lon),
    price: num(raw?.priceCash ?? raw?.address?.casePrice),
    currency: 'DKK',
  }
}

function fromBoliga(raw: any): RuleNormalised {
  const street = str(raw?.street ?? raw?.cleanStreet)
  const zip = str(raw?.zipCode)
  const city = str(raw?.city)
  const address = [street, [zip, city].filter(Boolean).join(' ')]
    .filter((p) => p && p.length > 0)
    .join(', ')
  const images = Array.isArray(raw?.images)
    ? raw.images.map((i: any) => str(i?.url)).filter((u: string | undefined): u is string => Boolean(u))
    : []
  return {
    title: street ?? address ?? undefined,
    address: address.length > 0 ? address : undefined,
    city,
    imageUrl: images[0],
    imageUrls: images.length > 0 ? images : undefined,
    latitude: num(raw?.latitude),
    longitude: num(raw?.longitude),
    price: num(raw?.price),
    currency: 'DKK',
  }
}

function fromHomestra(raw: any): RuleNormalised {
  // Prefer the resolved URL stashed by the scraper. featuredPhoto is often
  // an Apollo __ref that we cannot resolve without the full cache.
  let imageUrl: string | undefined = str(raw?._photoUrl)
  if (!imageUrl) {
    const fp = raw?.featuredPhoto
    if (fp && typeof fp === 'object' && '__ref' in fp) {
      imageUrl = undefined
    } else {
      imageUrl = str(fp?.url) ?? str(fp)
    }
  }
  return {
    title: str(raw?.title),
    address: str(raw?.address),
    city: str(raw?.city),
    imageUrl,
    imageUrls: imageUrl ? [imageUrl] : undefined,
    latitude: num(raw?.location?.lat ?? raw?.location?.latitude),
    longitude: num(raw?.location?.lng ?? raw?.location?.longitude),
    price: num(raw?.price),
    currency: 'EUR',
  }
}

function fromEdc(raw: any): RuleNormalised {
  const a = raw?.address ?? {}
  const street = str(a.streetAddress)
  const postal = str(a.postalCode)
  const locality = str(a.addressLocality)
  const address = [street, [postal, locality].filter(Boolean).join(' ')]
    .filter((p) => p && p.length > 0)
    .join(', ')
  const imageUrl = str(raw?._offerWrapper?.image?.url) ?? str(raw?._offerWrapper?.image)
  return {
    title: address.length > 0 ? address : undefined,
    address: address.length > 0 ? address : undefined,
    city: locality,
    imageUrl,
    imageUrls: imageUrl ? [imageUrl] : undefined,
    latitude: num(raw?.geo?.latitude),
    longitude: num(raw?.geo?.longitude),
    price: num(raw?.price ?? raw?._offerWrapper?.price),
    currency: str(raw?.priceCurrency) ?? 'DKK',
  }
}

function fromAirbnb(raw: any): RuleNormalised {
  const imgs = Array.isArray(raw?.imageUrls)
    ? raw.imageUrls.map((u: unknown) => str(u)).filter((u: string | undefined): u is string => Boolean(u))
    : []
  const title = str(raw?.title)
  const { price, currency } = parsePriceText(raw?.price)
  return {
    title,
    // address intentionally omitted — listing pages don't expose it
    imageUrl: imgs[0],
    imageUrls: imgs.length > 0 ? imgs : undefined,
    price,
    currency,
  }
}

/** Parse free-form price strings like "280 $", "1.000 kr.", "€45" → {price, currency}. */
function parsePriceText(v: unknown): { price?: number; currency?: string } {
  const s = typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
  if (!s) return {}
  const CUR_MAP: Record<string, string> = {
    '$': 'USD', 'US$': 'USD', 'USD': 'USD',
    '€': 'EUR', 'EUR': 'EUR',
    '£': 'GBP', 'GBP': 'GBP',
    'kr': 'DKK', 'kr.': 'DKK', 'DKK': 'DKK',
    'SEK': 'SEK', 'NOK': 'NOK',
  }
  let currency: string | undefined
  for (const [tok, code] of Object.entries(CUR_MAP)) {
    if (s.toLowerCase().includes(tok.toLowerCase())) { currency = code; break }
  }
  // Strip non-digits except , . - and normalise
  const cleaned = s.replace(/[^\d.,\-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
  const n = Number(cleaned)
  return { price: Number.isFinite(n) ? n : undefined, currency }
}

function fromFacebook(raw: any): RuleNormalised {
  const loc = str(raw?.location)
  const img = str(raw?.imageUrl)
  const { price, currency } = parsePriceText(raw?.price)
  return {
    title: str(raw?.title),
    address: loc,
    city: loc,
    imageUrl: img,
    imageUrls: img ? [img] : undefined,
    price,
    currency,
  }
}

function fromFacebookEvents(raw: any): RuleNormalised {
  const name = str(raw?.locationName)
  const locCity = str(raw?.locationCity)
  const title = str(raw?.title)
  // Venue is often encoded in the title as "Event | Venue" or "Event - Venue".
  let venueFromTitle: string | undefined
  if (title) {
    const m = /[|\-–]\s*([^|\-–]{3,})\s*$/.exec(title)
    if (m?.[1]) venueFromTitle = m[1].trim()
  }
  const addressParts = [name ?? venueFromTitle, locCity].filter(Boolean) as string[]
  const address = addressParts.length > 0 ? addressParts.join(', ') : undefined
  const img = str(raw?.imageUrl)
  return {
    title,
    address,
    city: locCity,
    imageUrl: img,
    imageUrls: img ? [img] : undefined,
    latitude: num(raw?.latitude),
    longitude: num(raw?.longitude),
  }
}

function fromLinkedin(raw: any): RuleNormalised {
  const loc = str(raw?.location)
  return {
    title: str(raw?.title),
    address: loc,
    city: loc,
  }
}

// Both bilbasen and dba produce JSON-LD `Product` payloads with the same
// shape, so a single normaliser works for both.
function fromJsonLdProduct(raw: any): RuleNormalised {
  const rawImg = raw?.image
  const images: string[] = Array.isArray(rawImg)
    ? rawImg.filter((u: unknown) => typeof u === 'string')
    : typeof rawImg === 'string'
      ? [rawImg]
      : []
  const brand =
    typeof raw?.brand === 'string'
      ? raw.brand
      : typeof raw?.brand?.name === 'string'
        ? raw.brand.name
        : undefined
  const model = str(raw?.model)
  const name = str(raw?.name) ?? ([brand, model].filter(Boolean).join(' ') || undefined)
  const price = num(raw?.offers?.price)
  const currency = str(raw?.offers?.priceCurrency)
  return {
    title: name,
    imageUrl: images[0],
    imageUrls: images.length > 0 ? images : undefined,
    price,
    currency,
    mappedCategory: 'vehicle',
    listingIntent: 'for_sale',
  }
}

// ─── public API ───────────────────────────────────────────────────────────────

/**
 * Derive a normalised JSON payload from the raw scraped data using
 * source-specific rules. Returns `null` if nothing meaningful could be
 * extracted (extremely rare — almost always returns at least a title).
 */
export function ruleNormalise(source: ScrapedSource, raw: unknown): RuleNormalised | null {
  const r = (raw ?? {}) as any
  let out: RuleNormalised
  switch (source) {
    case 'boligsiden': out = fromBoligsiden(r); break
    case 'boliga':     out = fromBoliga(r); break
    case 'homestra':   out = fromHomestra(r); break
    case 'edc':        out = fromEdc(r); break
    case 'airbnb':     out = fromAirbnb(r); break
    case 'facebook':   out = fromFacebook(r); break
    case 'facebook-events': out = fromFacebookEvents(r); break
    case 'linkedin':   out = fromLinkedin(r); break
    case 'bilbasen':   out = fromJsonLdProduct(r); break
    case 'dba':        out = fromJsonLdProduct(r); break
    default: return null
  }
  const intent = str(r?._listingIntent)
  if (intent) out.listingIntent = intent
  // drop undefineds so JSON stays compact
  const cleaned: RuleNormalised = {}
  for (const [k, v] of Object.entries(out)) {
    if (v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)) {
      ;(cleaned as any)[k] = v
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : null
}
