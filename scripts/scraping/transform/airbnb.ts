// ─── Airbnb transform ─────────────────────────────────────────────────────────
// Maps a normalised ScrapedItem (from airbnb scraper) to the DB insert shape.
// Returns null if the item has insufficient data to create a valid listing.

import { randomUUID } from 'node:crypto'
import type { ScrapedItem } from '../types'

export interface ListingInsert {
  id: string
  slug: string
  category: 'property' | 'vehicle' | 'service' | 'experience'
  subCategory: string
  transactionType: 'buy' | 'rent' | 'hire'
  status: 'draft'
  price: number
  currency: string
  pricePeriod: 'nightly' | 'one_time' | 'daily' | null
  latitude: number
  longitude: number
  addressLine1: string
  city: string
  country: string
  title_en: string
  summary_en: string | null
  imageUrls: string[]
  // Experience-specific
  durationHours?: number | null
  maxGuests?: number | null
}

function slugify(text: string, id: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .slice(0, 60)
  return `${base}-${id.slice(0, 8)}`
}

function mapAirbnbSubCategory(item: ScrapedItem): string {
  if (item.mappedCategory === 'experience') {
    const type = (item.serviceType ?? '').toLowerCase()
    if (type.includes('outdoor') || type.includes('nature')) return 'outdoor'
    if (type.includes('food') || type.includes('culinary') || type.includes('cooking')) return 'culinary'
    if (type.includes('art') || type.includes('craft')) return 'art'
    if (type.includes('wellness') || type.includes('yoga')) return 'wellness'
    if (type.includes('sport') || type.includes('fitness')) return 'sports'
    if (type.includes('culture') || type.includes('history')) return 'cultural'
    return 'guided_tour'
  }
  return 'apartment' // default for stays
}

export function transformAirbnbItem(item: ScrapedItem): ListingInsert | null {
  if (!item.title || !item.city) return null
  if (!item.latitude || !item.longitude) return null

  const id = randomUUID()
  const category = item.mappedCategory ?? 'service'
  const subCategory = mapAirbnbSubCategory(item)

  return {
    id,
    slug: slugify(item.title, item.sourceId),
    category,
    subCategory,
    transactionType: category === 'property' ? 'rent' : category === 'experience' ? 'hire' : 'hire',
    status: 'draft',
    price: item.price ?? 0,
    currency: item.currency ?? 'DKK',
    pricePeriod: category === 'property' ? 'nightly' : category === 'experience' ? 'one_time' : null,
    latitude: item.latitude,
    longitude: item.longitude,
    addressLine1: item.city,
    city: item.city,
    country: 'DK',
    title_en: item.title,
    summary_en: item.description?.slice(0, 500) ?? null,
    imageUrls: item.imageUrls.slice(0, 8),
    durationHours: item.durationHours,
    maxGuests: item.maxGuests,
  }
}
