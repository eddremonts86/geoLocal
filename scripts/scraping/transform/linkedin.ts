// ─── LinkedIn transform ───────────────────────────────────────────────────────
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

export function transformLinkedInItem(item: ScrapedItem): ListingInsert | null {
  if (!item.title) return null

  const id = randomUUID()

  return {
    id,
    slug: slugify(item.title, item.sourceId),
    category: 'service',
    subCategory: 'technology',
    transactionType: 'hire',
    status: 'draft',
    price: 0,
    currency: 'DKK',
    pricePeriod: 'one_time',
    latitude: item.latitude ?? 55.6761,
    longitude: item.longitude ?? 12.5683,
    addressLine1: item.city ?? 'Denmark',
    city: item.city ?? 'Copenhagen',
    country: 'DK',
    title_en: item.title,
    summary_en: item.description?.slice(0, 500) ?? null,
    imageUrls: [],
    durationHours: null,
    maxGuests: null,
  }
}
