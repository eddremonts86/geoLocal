// ─── Facebook transform ───────────────────────────────────────────────────────
import { randomUUID } from 'node:crypto'
import type { ScrapedItem } from '../types'
import type { ListingInsert } from './airbnb'

function slugify(text: string, id: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .slice(0, 60) + `-${id.slice(0, 8)}`
}

export function transformFacebookItem(item: ScrapedItem): ListingInsert | null {
  if (!item.title) return null

  const id = randomUUID()
  const category = item.mappedCategory ?? 'service'

  return {
    id,
    slug: slugify(item.title, item.sourceId),
    category,
    subCategory: category === 'property' ? 'apartment' : 'home_repair',
    transactionType: category === 'property' ? 'rent' : 'hire',
    status: 'draft',
    price: item.price ?? 0,
    currency: item.currency ?? 'DKK',
    pricePeriod: 'one_time',
    latitude: item.latitude ?? 55.6761, // Copenhagen fallback
    longitude: item.longitude ?? 12.5683,
    addressLine1: item.city ?? 'Denmark',
    city: item.city ?? 'Copenhagen',
    country: 'DK',
    title_en: item.title,
    summary_en: item.description?.slice(0, 500) ?? null,
    imageUrls: item.imageUrls.slice(0, 8),
    durationHours: null,
    maxGuests: null,
  }
}
