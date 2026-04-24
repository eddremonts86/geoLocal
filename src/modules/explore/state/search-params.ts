import { parseAsString, parseAsStringEnum, parseAsInteger, parseAsArrayOf, parseAsFloat } from 'nuqs'
import type { ListingCategory, TransactionType, FuelType, TransmissionType, SortOption } from '@/modules/listings/model/types'

export const exploreParsers = {
  // Core
  category: parseAsStringEnum<ListingCategory>(['property', 'vehicle', 'service', 'experience']),
  subCategory: parseAsArrayOf(parseAsString),
  transactionType: parseAsStringEnum<TransactionType>(['buy', 'rent', 'hire']),
  q: parseAsString.withDefault(''),
  priceMin: parseAsInteger,
  priceMax: parseAsInteger,
  sort: parseAsStringEnum<SortOption>(['popular', 'newest', 'price_asc', 'price_desc']).withDefault('newest'),
  page: parseAsInteger.withDefault(1),
  // Map
  lat: parseAsFloat,
  lng: parseAsFloat,
  zoom: parseAsFloat,
  // Spatial area filters
  nearLat: parseAsFloat,
  nearLng: parseAsFloat,
  nearRadius: parseAsFloat, // km
  polygon: parseAsString, // encoded ring: "lng1,lat1_lng2,lat2_..."
  // Selection
  listingId: parseAsString,
  // Property-specific
  beds: parseAsArrayOf(parseAsString),
  baths: parseAsInteger,
  areaMin: parseAsFloat,
  areaMax: parseAsFloat,
  // Vehicle-specific
  make: parseAsArrayOf(parseAsString),
  yearMin: parseAsInteger,
  yearMax: parseAsInteger,
  fuelType: parseAsArrayOf(parseAsStringEnum<FuelType>(['gasoline', 'diesel', 'electric', 'hybrid'])),
  transmission: parseAsStringEnum<TransmissionType>(['manual', 'automatic']),
  // Service-specific
  experienceMin: parseAsInteger,
}
