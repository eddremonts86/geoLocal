import { parseAsString, parseAsStringEnum, parseAsInteger, parseAsArrayOf, parseAsFloat, parseAsBoolean } from 'nuqs'
import type { ListingCategory, TransactionType, FuelType, TransmissionType, SortOption } from '@/modules/listings/model/types'

/**
 * Centralised URL ↔ state parsers for /explore.
 *
 * Adding a new filter? Three places to wire it:
 *   1. Here (parser + URL key).
 *   2. `searchListingsFn` in `listings/api/listings.fn.ts` (z input + filter logic).
 *   3. The matching filter component in `explore/filters/`.
 */
export const exploreParsers = {
  // ── Core ───────────────────────────────────────────────────────────────────
  category: parseAsStringEnum<ListingCategory>(['property', 'vehicle', 'service', 'experience']),
  subCategory: parseAsArrayOf(parseAsString),
  transactionType: parseAsStringEnum<TransactionType>(['buy', 'rent', 'hire']),
  q: parseAsString.withDefault(''),
  priceMin: parseAsInteger,
  priceMax: parseAsInteger,
  sort: parseAsStringEnum<SortOption>(['popular', 'newest', 'price_asc', 'price_desc']).withDefault('newest'),
  page: parseAsInteger.withDefault(1),
  // Source provenance — common to every category
  sourceKind: parseAsStringEnum<'user' | 'scraped'>(['user', 'scraped']),
  scrapedSource: parseAsArrayOf(parseAsString),
  // ── Map ────────────────────────────────────────────────────────────────────
  lat: parseAsFloat,
  lng: parseAsFloat,
  zoom: parseAsFloat,
  nearLat: parseAsFloat,
  nearLng: parseAsFloat,
  nearRadius: parseAsFloat, // km
  polygon: parseAsString, // encoded ring: "lng1,lat1_lng2,lat2_..."
  // ── Selection ──────────────────────────────────────────────────────────────
  listingId: parseAsString,
  // ── Property ───────────────────────────────────────────────────────────────
  beds: parseAsArrayOf(parseAsString),
  baths: parseAsInteger,
  areaMin: parseAsFloat,
  areaMax: parseAsFloat,
  yearBuiltMin: parseAsInteger,
  yearBuiltMax: parseAsInteger,
  parkingMin: parseAsInteger,
  furnished: parseAsBoolean,
  // ── Vehicle ────────────────────────────────────────────────────────────────
  make: parseAsArrayOf(parseAsString),
  yearMin: parseAsInteger,
  yearMax: parseAsInteger,
  fuelType: parseAsArrayOf(parseAsStringEnum<FuelType>(['gasoline', 'diesel', 'electric', 'hybrid'])),
  transmission: parseAsStringEnum<TransmissionType>(['manual', 'automatic']),
  mileageMax: parseAsInteger,
  doorsMin: parseAsInteger,
  colors: parseAsArrayOf(parseAsString),
  // ── Service ────────────────────────────────────────────────────────────────
  experienceMin: parseAsInteger,
  serviceRadiusMin: parseAsFloat,
  responseTime: parseAsStringEnum<'within_hour' | 'same_day' | 'few_days'>(['within_hour', 'same_day', 'few_days']),
  certified: parseAsBoolean,
  // ── Experience ─────────────────────────────────────────────────────────────
  durationMin: parseAsFloat,
  durationMax: parseAsFloat,
  groupMax: parseAsInteger,
  minAgeMax: parseAsInteger,
  languages: parseAsArrayOf(parseAsString),
  difficulty: parseAsStringEnum<'easy' | 'moderate' | 'hard'>(['easy', 'moderate', 'hard']),
}
