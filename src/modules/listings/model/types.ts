export type ListingCategory = 'property' | 'vehicle' | 'service' | 'experience'
export type TransactionType = 'buy' | 'rent' | 'hire'
export type ListingStatus = 'draft' | 'published' | 'archived'
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid'
export type TransmissionType = 'manual' | 'automatic'
export type PricePeriod = 'one_time' | 'monthly' | 'daily' | 'hourly'
export type SortOption = 'popular' | 'newest' | 'price_asc' | 'price_desc'

// Property sub-categories
export const PROPERTY_SUBCATEGORIES = ['house', 'apartment', 'condo', 'land', 'office', 'commercial', 'warehouse'] as const
export type PropertySubCategory = (typeof PROPERTY_SUBCATEGORIES)[number]

// Vehicle sub-categories
export const VEHICLE_SUBCATEGORIES = ['car', 'suv', 'motorcycle', 'bicycle', 'boat', 'airplane', 'commercial_vehicle', 'truck'] as const
export type VehicleSubCategory = (typeof VEHICLE_SUBCATEGORIES)[number]

// Service sub-categories
export const SERVICE_SUBCATEGORIES = ['home_repair', 'moving', 'cleaning', 'personal_care', 'tutoring', 'events', 'technology'] as const
export type ServiceSubCategory = (typeof SERVICE_SUBCATEGORIES)[number]

// Experience sub-categories
export const EXPERIENCE_SUBCATEGORIES = ['outdoor', 'culinary', 'cultural', 'wellness', 'art', 'sports', 'nightlife', 'guided_tour'] as const
export type ExperienceSubCategory = (typeof EXPERIENCE_SUBCATEGORIES)[number]

export type SubCategory = PropertySubCategory | VehicleSubCategory | ServiceSubCategory | ExperienceSubCategory

// ─── Listing list item (shared fields) ─────────────────────────────────────

export interface ListingBase {
  id: string
  slug: string
  category: ListingCategory
  subCategory: string
  transactionType: TransactionType
  status: ListingStatus
  price: number
  currency: string
  pricePeriod: PricePeriod | null
  latitude: number
  longitude: number
  addressLine1: string
  city: string
  region: string | null
  country: string
  featured: boolean
  title: string
  summary: string | null
  neighborhood: string | null
  coverUrl: string | null
  scrapedSource: string | null
  scrapedSourceUrl: string | null
}

// Category-specific extensions for list items
export interface PropertyListFields {
  bedrooms: number | null
  bathrooms: number | null
  areaSqm: number | null
  yearBuilt: number | null
  parkingSpaces: number | null
  furnished: boolean | null
}

export interface VehicleListFields {
  make: string
  model: string
  year: number
  mileageKm: number | null
  fuelType: FuelType | null
  transmission: TransmissionType | null
  color: string | null
}

export interface ServiceListFields {
  serviceRadiusKm: number | null
  experienceYears: number | null
  responseTime: string | null
}

export interface ExperienceListFields {
  durationHours: number | null
  maxGuests: number | null
  minAge: number | null
  difficulty: string | null
  languages: string[] | null
}

export type ListingListItem =
  | (ListingBase & { category: 'property' } & PropertyListFields)
  | (ListingBase & { category: 'vehicle' } & VehicleListFields)
  | (ListingBase & { category: 'service' } & ServiceListFields)
  | (ListingBase & { category: 'experience' } & ExperienceListFields)

// ─── Detail ────────────────────────────────────────────────────────────────

export interface ListingAsset {
  id: string
  kind: string
  url: string
  altText: string | null
  sortOrder: number
  isCover: boolean
}

export interface ListingDetail extends ListingBase {
  description: string | null
  features: string[]
  assets: ListingAsset[]
  publishedAt: string | null
  createdAt: string
  // Property fields
  bedrooms?: number | null
  bathrooms?: number | null
  areaSqm?: number | null
  lotSqm?: number | null
  yearBuilt?: number | null
  parkingSpaces?: number | null
  floors?: number | null
  furnished?: boolean | null
  // Vehicle fields
  make?: string
  model?: string
  year?: number
  mileageKm?: number | null
  fuelType?: FuelType | null
  transmission?: TransmissionType | null
  color?: string | null
  engineDisplacementCc?: number | null
  doors?: number | null
  // Service fields
  serviceRadiusKm?: number | null
  availability?: any
  experienceYears?: number | null
  certifications?: string | null
  responseTime?: string | null
  // Experience fields
  durationHours?: number | null
  maxGuests?: number | null
  minAge?: number | null
  difficulty?: string | null
  languages?: string[] | null
  meetingPoint?: string | null
  included?: string | null
  notIncluded?: string | null
  seasonalAvailability?: any
}

// ─── Search ────────────────────────────────────────────────────────────────

export interface ListingSearchFilters {
  category?: ListingCategory
  subCategory?: string[]
  transactionType?: TransactionType
  query?: string
  priceMin?: number
  priceMax?: number
  sort?: SortOption
  locale?: string
  bounds?: { north: number; south: number; east: number; west: number }
  // Spatial area filters
  nearLat?: number
  nearLng?: number
  nearRadiusKm?: number
  /** Encoded polygon ring: `lng1,lat1_lng2,lat2_...`. */
  polygon?: string
  // Property-specific
  bedrooms?: (number | 'studio')[]
  bathrooms?: number
  areaMin?: number
  areaMax?: number
  // Vehicle-specific
  make?: string[]
  yearMin?: number
  yearMax?: number
  fuelType?: FuelType[]
  transmission?: TransmissionType
  // Service-specific
  experienceMin?: number
}

export interface ListingSearchResult {
  items: ListingListItem[]
  total: number
  page: number
  pageSize: number
}
