import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and, sql, inArray, count } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import {
  listings,
  listingTranslations,
  listingAssets,
  listingProperties,
  listingVehicles,
  listingServices,
  listingFeatures,
} from '@/shared/lib/db/schema'

const adminSearchSchema = z.object({
  query: z.string().optional(),
  category: z.enum(['property', 'vehicle', 'service', 'experience']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
})

export const getAdminListingsFn = createServerFn({ method: 'GET' })
  .inputValidator(adminSearchSchema)
  .handler(async ({ data }) => {
    const db = await loadDb()
    const conditions: any[] = []
    if (data.category) conditions.push(eq(listings.category, data.category))
    if (data.status) conditions.push(eq(listings.status, data.status))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [totalResult] = await db.select({ count: count() }).from(listings).where(where)
    const total = totalResult?.count ?? 0

    const offset = (data.page - 1) * data.pageSize
    const rows = await db
      .select()
      .from(listings)
      .where(where)
      .orderBy(sql`${listings.createdAt} desc`)
      .limit(data.pageSize)
      .offset(offset)

    if (rows.length === 0) return { items: [], total, page: data.page, pageSize: data.pageSize }

    const ids = rows.map((r) => r.id)

    const translations = await db
      .select()
      .from(listingTranslations)
      .where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, 'en')))
    const tMap = new Map(translations.map((t) => [t.listingId, t]))

    const covers = await db
      .select()
      .from(listingAssets)
      .where(and(inArray(listingAssets.listingId, ids), eq(listingAssets.isCover, true)))
    const coverMap = new Map(covers.map((c) => [c.listingId, c.url]))

    const items = rows
      .filter((r) => {
        if (!data.query) return true
        const t = tMap.get(r.id)
        const q = data.query.toLowerCase()
        return (
          t?.title.toLowerCase().includes(q) ||
          r.addressLine1.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q)
        )
      })
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        category: r.category,
        subCategory: r.subCategory,
        transactionType: r.transactionType,
        status: r.status,
        price: r.price,
        currency: r.currency,
        city: r.city,
        featured: r.featured,
        title: tMap.get(r.id)?.title ?? r.slug,
        coverUrl: coverMap.get(r.id) ?? null,
        createdAt: r.createdAt.toISOString(),
      }))

    return { items, total, page: data.page, pageSize: data.pageSize }
  })

export const updateListingStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string(), status: z.enum(['draft', 'published', 'archived']) }))
  .handler(async ({ data }) => {
    const db = await loadDb()
    await db
      .update(listings)
      .set({
        status: data.status,
        publishedAt: data.status === 'published' ? new Date() : undefined,
      })
      .where(eq(listings.id, data.id))
    return { success: true }
  })

export const deleteListingFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const db = await loadDb()
    // Delete in order: features, assets, translations, extensions, listing
    await db.delete(listingFeatures).where(eq(listingFeatures.listingId, data.id))
    await db.delete(listingAssets).where(eq(listingAssets.listingId, data.id))
    await db.delete(listingTranslations).where(eq(listingTranslations.listingId, data.id))
    await db.delete(listingProperties).where(eq(listingProperties.listingId, data.id))
    await db.delete(listingVehicles).where(eq(listingVehicles.listingId, data.id))
    await db.delete(listingServices).where(eq(listingServices.listingId, data.id))
    await db.delete(listings).where(eq(listings.id, data.id))
    return { success: true }
  })

const createListingSchema = z.object({
  category: z.enum(['property', 'vehicle', 'service', 'experience']),
  subCategory: z.string(),
  transactionType: z.enum(['buy', 'rent', 'hire']),
  status: z.enum(['draft', 'published']).default('draft'),
  price: z.number(),
  currency: z.string().default('DKK'),
  pricePeriod: z.enum(['one_time', 'monthly', 'daily', 'hourly']).nullable().default(null),
  latitude: z.number(),
  longitude: z.number(),
  addressLine1: z.string(),
  city: z.string(),
  region: z.string().nullable().default(null),
  country: z.string().default('Denmark'),
  featured: z.boolean().default(false),
  translations: z.array(
    z.object({
      locale: z.string(),
      title: z.string(),
      summary: z.string().nullable().default(null),
      description: z.string().nullable().default(null),
      neighborhood: z.string().nullable().default(null),
    }),
  ),
  // Property fields
  bedrooms: z.number().nullable().optional(),
  bathrooms: z.number().nullable().optional(),
  areaSqm: z.number().nullable().optional(),
  lotSqm: z.number().nullable().optional(),
  yearBuilt: z.number().nullable().optional(),
  parkingSpaces: z.number().nullable().optional(),
  floors: z.number().nullable().optional(),
  furnished: z.boolean().nullable().optional(),
  // Vehicle fields
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  mileageKm: z.number().nullable().optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']).nullable().optional(),
  transmission: z.enum(['manual', 'automatic']).nullable().optional(),
  color: z.string().nullable().optional(),
  engineDisplacementCc: z.number().nullable().optional(),
  doors: z.number().nullable().optional(),
  // Service fields
  serviceRadiusKm: z.number().nullable().optional(),
  experienceYears: z.number().nullable().optional(),
  certifications: z.string().nullable().optional(),
  responseTime: z.string().nullable().optional(),
  // Features
  featureCodes: z.array(z.string()).optional(),
  // Assets
  assets: z
    .array(
      z.object({
        kind: z.string().default('image'),
        url: z.string(),
        altText: z.string().nullable().default(null),
        sortOrder: z.number(),
        isCover: z.boolean().default(false),
      }),
    )
    .optional(),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const createListingFn = createServerFn({ method: 'POST' })
  .inputValidator(createListingSchema)
  .handler(async ({ data }) => {
    const db = await loadDb()
    const slug = slugify(data.translations[0]?.title ?? 'listing') + '-' + Date.now().toString(36)

    const [listing] = await db
      .insert(listings)
      .values({
        slug,
        category: data.category,
        subCategory: data.subCategory,
        transactionType: data.transactionType,
        status: data.status,
        price: data.price,
        currency: data.currency,
        pricePeriod: data.pricePeriod,
        latitude: data.latitude,
        longitude: data.longitude,
        addressLine1: data.addressLine1,
        city: data.city,
        region: data.region,
        country: data.country,
        featured: data.featured,
        publishedAt: data.status === 'published' ? new Date() : null,
      })
      .returning()

    // Translations
    if (data.translations.length > 0) {
      await db.insert(listingTranslations).values(
        data.translations.map((t) => ({
          listingId: listing.id,
          locale: t.locale,
          title: t.title,
          summary: t.summary,
          description: t.description,
          neighborhood: t.neighborhood,
        })),
      )
    }

    // Extension table
    if (data.category === 'property') {
      await db.insert(listingProperties).values({
        listingId: listing.id,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        areaSqm: data.areaSqm ?? null,
        lotSqm: data.lotSqm ?? null,
        yearBuilt: data.yearBuilt ?? null,
        parkingSpaces: data.parkingSpaces ?? null,
        floors: data.floors ?? null,
        furnished: data.furnished ?? null,
      })
    } else if (data.category === 'vehicle') {
      await db.insert(listingVehicles).values({
        listingId: listing.id,
        make: data.make ?? '',
        model: data.model ?? '',
        year: data.year ?? new Date().getFullYear(),
        mileageKm: data.mileageKm ?? null,
        fuelType: data.fuelType ?? null,
        transmission: data.transmission ?? null,
        color: data.color ?? null,
        engineDisplacementCc: data.engineDisplacementCc ?? null,
        doors: data.doors ?? null,
      })
    } else {
      await db.insert(listingServices).values({
        listingId: listing.id,
        serviceRadiusKm: data.serviceRadiusKm ?? null,
        experienceYears: data.experienceYears ?? null,
        certifications: data.certifications ?? null,
        responseTime: data.responseTime ?? null,
      })
    }

    // Features
    if (data.featureCodes?.length) {
      await db.insert(listingFeatures).values(
        data.featureCodes.map((code) => ({
          listingId: listing.id,
          featureCode: code,
        })),
      )
    }

    // Assets
    if (data.assets?.length) {
      await db.insert(listingAssets).values(
        data.assets.map((a) => ({
          listingId: listing.id,
          kind: a.kind as 'image' | 'video' | 'floor_plan',
          url: a.url,
          altText: a.altText,
          sortOrder: a.sortOrder,
          isCover: a.isCover,
        })),
      )
    }

    return { id: listing.id, slug: listing.slug }
  })
