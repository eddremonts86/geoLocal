import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and, count, desc, sql, inArray } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import {
  scrapedRaw,
  listings,
  listingTranslations,
  listingAssets,
  listingExperiences,
  listingServices,
  listingProperties,
  listingVehicles,
} from '@/shared/lib/db/schema'
import { randomUUID } from 'node:crypto'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

// Sources we recognise in server-fn input validators. Keep in sync with scraped_source enum.
const SCRAPED_SOURCES = [
  'airbnb',
  'facebook',
  'facebook-events',
  'linkedin',
  'edc',
  'homestra',
  'boligsiden',
  'boliga',
] as const

// ─── List scraped raw items ────────────────────────────────────────────────────

const listScrapedSchema = z.object({
  source: z.enum(SCRAPED_SOURCES).optional(),
  status: z.enum(['pending', 'reviewed', 'published', 'rejected']).optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
})

export const listScrapedRawFn = createServerFn({ method: 'GET' })
  .inputValidator(listScrapedSchema)
  .handler(async ({ data }) => {
    const db = await loadDb()
    const conditions: any[] = []
    if (data.source) conditions.push(eq(scrapedRaw.source, data.source))
    if (data.status) conditions.push(eq(scrapedRaw.status, data.status))
    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [totalResult] = await db.select({ count: count() }).from(scrapedRaw).where(where)
    const total = totalResult?.count ?? 0
    const offset = (data.page - 1) * data.pageSize

    const rows = await db
      .select({
        id: scrapedRaw.id,
        source: scrapedRaw.source,
        sourceId: scrapedRaw.sourceId,
        sourceUrl: scrapedRaw.sourceUrl,
        mappedCategory: scrapedRaw.mappedCategory,
        status: scrapedRaw.status,
        publishedListingId: scrapedRaw.publishedListingId,
        scrapedAt: scrapedRaw.scrapedAt,
        // Extract preview fields from rawData JSON
        title: sql<string | null>`${scrapedRaw.rawData}->>'title'`,
        imageUrl: sql<string | null>`COALESCE(${scrapedRaw.rawData}->>'imageUrl', (${scrapedRaw.rawData}->'imageUrls'->>0))`,
        city: sql<string | null>`${scrapedRaw.rawData}->>'city'`,
        price: sql<string | null>`${scrapedRaw.rawData}->>'price'`,
        description: sql<string | null>`${scrapedRaw.rawData}->>'description'`,
        startDate: sql<string | null>`${scrapedRaw.rawData}->>'startDate'`,
        currency: sql<string | null>`${scrapedRaw.rawData}->>'currency'`,
      })
      .from(scrapedRaw)
      .where(where)
      .orderBy(desc(scrapedRaw.scrapedAt))
      .limit(data.pageSize)
      .offset(offset)

    const items = rows.map((r) => ({
      ...r,
      price: r.price != null ? Number(r.price) : null,
    }))

    return { items, total, page: data.page, pageSize: data.pageSize }
  })

// ─── Get a single raw item with full rawData ────────────────────────────────

export const getScrapedRawItemFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = await loadDb()
    const [item] = await db
      .select({
        id: scrapedRaw.id,
        source: scrapedRaw.source,
        sourceId: scrapedRaw.sourceId,
        sourceUrl: scrapedRaw.sourceUrl,
        mappedCategory: scrapedRaw.mappedCategory,
        status: scrapedRaw.status,
        publishedListingId: scrapedRaw.publishedListingId,
        scrapedAt: scrapedRaw.scrapedAt,
      })
      .from(scrapedRaw)
      .where(eq(scrapedRaw.id, data.id))
      .limit(1)
    if (!item) throw new Error('Not found')

    // Fetch rawData separately as a JSON string to avoid serialization issues
    const [raw] = await db
      .select({ rawData: scrapedRaw.rawData })
      .from(scrapedRaw)
      .where(eq(scrapedRaw.id, data.id))
      .limit(1)

    return {
      ...item,
      rawData: JSON.stringify(raw?.rawData ?? {}, null, 2),
    }
  })

// ─── Reject a scraped item ───────────────────────────────────────────────────

export const rejectScrapedItemFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = await loadDb()
    await db.update(scrapedRaw).set({ status: 'rejected' }).where(eq(scrapedRaw.id, data.id))
    return { ok: true }
  })

// ─── Publish a scraped item as a listing ──────────────────────────────────────
// Shared core logic used by both single and bulk publish.

/** Max images we attach per listing — DB-friendly cap. */
const MAX_IMAGES_PER_LISTING = 12

/** Read first defined value of several possible keys from a loose record. */
function pick<T>(obj: Record<string, unknown> | null | undefined, ...keys: string[]): T | null {
  if (!obj) return null
  for (const k of keys) {
    const v = obj[k]
    if (v !== undefined && v !== null) return v as T
  }
  return null
}

async function publishOne(db: PostgresJsDatabase<Record<string, never>>, rawId: string): Promise<{ listingId: string }> {
  const [raw] = await db.select().from(scrapedRaw).where(eq(scrapedRaw.id, rawId)).limit(1)
  if (!raw) throw new Error(`Scraped item not found: ${rawId}`)
  if (raw.status === 'published') return { listingId: raw.publishedListingId! }

  // Prefer AI-normalised payload when present; fall back to raw.
  const rd = raw.rawData as Record<string, unknown>
  const nd = (raw.normalised as Record<string, unknown> | null) ?? null

  const title = pick<string>(nd, 'title') ?? pick<string>(rd, 'title') ?? 'Imported listing'
  const description = pick<string>(nd, 'description') ?? pick<string>(rd, 'description') ?? null
  const price =
    (typeof (nd?.price) === 'number' ? (nd.price as number) : null) ??
    (typeof rd.price === 'number' ? rd.price : 0)
  const currency = pick<string>(nd, 'currency') ?? pick<string>(rd, 'currency') ?? 'DKK'
  const city = pick<string>(nd, 'city') ?? pick<string>(rd, 'city') ?? 'Copenhagen'
  const lat =
    (typeof nd?.latitude === 'number' ? (nd.latitude as number) : null) ??
    (typeof rd.latitude === 'number' ? rd.latitude : 55.6761)
  const lng =
    (typeof nd?.longitude === 'number' ? (nd.longitude as number) : null) ??
    (typeof rd.longitude === 'number' ? rd.longitude : 12.5683)

  // Category: normalised override > mappedCategory > default
  const normalisedCat = pick<string>(nd, 'mappedCategory')
  const category = (normalisedCat ?? raw.mappedCategory ?? 'service') as
    | 'property' | 'vehicle' | 'service' | 'experience'

  // Collect images — accept `imageUrls` array from either normalised or raw; also accept single `imageUrl`
  const collectImages = (src: Record<string, unknown> | null): string[] => {
    if (!src) return []
    if (Array.isArray(src.imageUrls)) return (src.imageUrls as unknown[]).filter((u): u is string => typeof u === 'string')
    if (typeof src.imageUrl === 'string') return [src.imageUrl]
    return []
  }
  const imageUrls = Array.from(new Set([...collectImages(nd), ...collectImages(rd)])).slice(0, MAX_IMAGES_PER_LISTING)

  // Experience-specific
  const durationHours =
    (typeof nd?.durationHours === 'number' ? (nd.durationHours as number) : null) ??
    (typeof rd.durationHours === 'number' ? rd.durationHours : null)
  const maxGuests =
    (typeof nd?.maxGuests === 'number' ? (nd.maxGuests as number) : null) ??
    (typeof rd.maxGuests === 'number' ? rd.maxGuests : null)

  const subCategory = category === 'experience' ? 'guided_tour'
    : category === 'property' ? 'apartment'
    : category === 'vehicle' ? 'car'
    : 'home_repair'
  const transactionType = category === 'property' ? 'rent' : category === 'vehicle' ? 'buy' : 'hire'

  const listingId = randomUUID()
  const slug =
    title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').slice(0, 60) +
    `-${listingId.slice(0, 8)}`

  await db.insert(listings).values({
    id: listingId,
    slug,
    category,
    subCategory,
    transactionType: transactionType as any,
    status: 'published',
    publishedAt: new Date(),
    price,
    currency,
    pricePeriod: category === 'experience' ? 'one_time' : undefined,
    latitude: lat,
    longitude: lng,
    addressLine1: city,
    city,
    country: 'DK',
    featured: false,
    scrapedSource: raw.source,
    scrapedSourceUrl: raw.sourceUrl,
  })

  await db.insert(listingTranslations).values({
    listingId,
    locale: 'en',
    title,
    summary: description?.slice(0, 500) ?? null,
    description: description ?? null,
    neighborhood: null,
  })

  // Insert ALL images — not just the first one. Cap at MAX_IMAGES_PER_LISTING.
  if (imageUrls.length > 0) {
    await db.insert(listingAssets).values(
      imageUrls.map((url, i) => ({
        id: randomUUID(),
        listingId,
        kind: 'image' as const,
        url,
        altText: title,
        sortOrder: i,
        isCover: i === 0,
      })),
    )
  }

  if (category === 'experience') {
    await db.insert(listingExperiences).values({
      listingId, durationHours, maxGuests,
      minAge: null, languages: null, meetingPoint: null,
      included: null, notIncluded: null, difficulty: null, seasonalAvailability: null,
    })
  } else if (category === 'service') {
    await db.insert(listingServices).values({
      listingId, serviceRadiusKm: null, availability: null,
      experienceYears: null, certifications: null, responseTime: null,
    })
  } else if (category === 'property') {
    await db.insert(listingProperties).values({
      listingId,
      bedrooms: typeof nd?.bedrooms === 'number' ? (nd.bedrooms as number) : null,
      bathrooms: typeof nd?.bathrooms === 'number' ? (nd.bathrooms as number) : null,
      areaSqm: typeof nd?.areaSqm === 'number' ? (nd.areaSqm as number) : null,
      lotSqm: null,
      yearBuilt: typeof nd?.yearBuilt === 'number' ? (nd.yearBuilt as number) : null,
      parkingSpaces: null, floors: null, furnished: null,
    })
  } else if (category === 'vehicle') {
    const make = pick<string>(nd, 'make') ?? 'Unknown'
    const model = pick<string>(nd, 'model') ?? 'Unknown'
    const year = typeof nd?.year === 'number' ? (nd.year as number) : new Date().getFullYear()
    await db.insert(listingVehicles).values({
      listingId, make, model, year,
      mileageKm: typeof nd?.mileageKm === 'number' ? (nd.mileageKm as number) : null,
      fuelType: null, transmission: null, color: null,
      engineDisplacementCc: null, doors: null,
    })
  }

  await db.update(scrapedRaw)
    .set({ status: 'published', publishedListingId: listingId })
    .where(eq(scrapedRaw.id, rawId))

  return { listingId }
}

const publishSchema = z.object({ id: z.string().uuid() })

export const publishScrapedItemFn = createServerFn({ method: 'POST' })
  .inputValidator(publishSchema)
  .handler(async ({ data }) => {
    const db = await loadDb()
    const result = await publishOne(db as any, data.id)
    return { ok: true, ...result }
  })

// ─── Publish ALL pending items (bulk) ─────────────────────────────────────────

const publishAllSchema = z.object({
  source: z.enum(SCRAPED_SOURCES).optional(),
})

export const publishAllPendingFn = createServerFn({ method: 'POST' })
  .inputValidator(publishAllSchema)
  .handler(async ({ data }) => {
    const db = await loadDb()

    const conditions: any[] = [inArray(scrapedRaw.status, ['pending', 'reviewed'])]
    if (data.source) conditions.push(eq(scrapedRaw.source, data.source))

    const rows = await db
      .select({ id: scrapedRaw.id })
      .from(scrapedRaw)
      .where(and(...conditions))

    let published = 0
    const errors: string[] = []

    for (const row of rows) {
      try {
        await publishOne(db as any, row.id)
        published++
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err))
      }
    }

    return { ok: true, published, skipped: errors.length, errors }
  })
