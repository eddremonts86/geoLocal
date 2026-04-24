import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and, gte, lte, inArray, isNotNull, sql } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import {
  listings,
  listingProperties,
  listingVehicles,
  listingServices,
  listingExperiences,
  listingTranslations,
  listingAssets,
  listingFeatures,
} from '@/shared/lib/db/schema'
import {
  haversineCondition,
  polygonBboxCondition,
  pointInPolygon,
  decodePolygon,
} from '@/shared/lib/db/spatial'
import type { ListingListItem, ListingSearchResult, ListingDetail } from '@/modules/listings/model/types'

const searchInputSchema = z.object({
  category: z.enum(['property', 'vehicle', 'service', 'experience']).optional(),
  subCategory: z.array(z.string()).optional(),
  transactionType: z.enum(['buy', 'rent', 'hire']).optional(),
  query: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  sort: z.enum(['popular', 'newest', 'price_asc', 'price_desc']).optional().default('newest'),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(20),
  locale: z.string().optional().default('en'),
  boundsNorth: z.number().optional(),
  boundsSouth: z.number().optional(),
  boundsEast: z.number().optional(),
  boundsWest: z.number().optional(),
  // Spatial area filters
  nearLat: z.number().optional(),
  nearLng: z.number().optional(),
  nearRadiusKm: z.number().min(0.1).max(500).optional(),
  polygon: z.string().optional(),
  // Property-specific
  bedrooms: z.array(z.union([z.number(), z.literal('studio')])).optional(),
  bathrooms: z.number().optional(),
  areaMin: z.number().optional(),
  areaMax: z.number().optional(),
  // Vehicle-specific
  make: z.array(z.string()).optional(),
  yearMin: z.number().optional(),
  yearMax: z.number().optional(),
  fuelType: z.array(z.enum(['gasoline', 'diesel', 'electric', 'hybrid'])).optional(),
  transmission: z.enum(['manual', 'automatic']).optional(),
  // Service-specific
  experienceMin: z.number().optional(),
})

export const searchListingsFn = createServerFn({ method: 'GET' })
  .inputValidator(searchInputSchema)
  .handler(async ({ data }): Promise<ListingSearchResult> => {
    const db = await loadDb()

    const conditions: any[] = [eq(listings.status, 'published')]

    if (data.category) conditions.push(eq(listings.category, data.category))
    if (data.subCategory?.length) conditions.push(inArray(listings.subCategory, data.subCategory))
    if (data.transactionType) conditions.push(eq(listings.transactionType, data.transactionType))
    if (data.priceMin != null) conditions.push(gte(listings.price, data.priceMin))
    if (data.priceMax != null) conditions.push(lte(listings.price, data.priceMax))

    if (data.boundsNorth != null && data.boundsSouth != null && data.boundsEast != null && data.boundsWest != null) {
      conditions.push(gte(listings.latitude, data.boundsSouth))
      conditions.push(lte(listings.latitude, data.boundsNorth))
      conditions.push(gte(listings.longitude, data.boundsWest))
      conditions.push(lte(listings.longitude, data.boundsEast))
    }

    // Spatial "near me" / radius
    if (data.nearLat != null && data.nearLng != null && data.nearRadiusKm != null) {
      conditions.push(haversineCondition(data.nearLat, data.nearLng, data.nearRadiusKm))
    }

    // Polygon: bbox prefilter here, exact ray-cast after row fetch
    const polygonRing = data.polygon ? decodePolygon(data.polygon) : null
    if (polygonRing) {
      conditions.push(polygonBboxCondition(polygonRing))
    }

    // Order
    const orderBy =
      data.sort === 'price_asc' ? [sql`${listings.price} asc`]
      : data.sort === 'price_desc' ? [sql`${listings.price} desc`]
      : data.sort === 'popular' ? [sql`${listings.featured} desc, ${listings.publishedAt} desc`]
      : [sql`${listings.publishedAt} desc`]

    // When a polygon is active, we can't rely on SQL pagination alone — rows inside
    // the bbox but outside the ring must be removed via ray-cast. Fetch a capped
    // set of bbox-matching rows, filter in JS, then slice for the requested page.
    let total: number
    let rows: any[]

    if (polygonRing) {
      const capped = await db
        .select()
        .from(listings)
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(5000) // safety cap
      const filtered = capped.filter((r) => pointInPolygon(r.longitude, r.latitude, polygonRing))
      total = filtered.length
      const offset = (data.page - 1) * data.pageSize
      rows = filtered.slice(offset, offset + data.pageSize)
    } else {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(listings)
        .where(and(...conditions))
      total = countResult?.count ?? 0

      const offset = (data.page - 1) * data.pageSize
      rows = await db
        .select()
        .from(listings)
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(data.pageSize)
        .offset(offset)
    }

    if (rows.length === 0) {
      return { items: [], total, page: data.page, pageSize: data.pageSize }
    }

    const ids = rows.map((r) => r.id)

    // Translations
    const translations = await db
      .select()
      .from(listingTranslations)
      .where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, data.locale)))

    const fallbackTranslations = data.locale !== 'en'
      ? await db.select().from(listingTranslations).where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, 'en')))
      : []

    const tMap = new Map(translations.map((t) => [t.listingId, t]))
    const fbMap = new Map(fallbackTranslations.map((t) => [t.listingId, t]))

    // Cover images
    const covers = await db
      .select()
      .from(listingAssets)
      .where(and(inArray(listingAssets.listingId, ids), eq(listingAssets.isCover, true)))
    const coverMap = new Map(covers.map((c) => [c.listingId, c.url]))

    // Category extensions
    const propertyIds = rows.filter((r) => r.category === 'property').map((r) => r.id)
    const vehicleIds = rows.filter((r) => r.category === 'vehicle').map((r) => r.id)
    const serviceIds = rows.filter((r) => r.category === 'service').map((r) => r.id)
    const experienceIds = rows.filter((r) => r.category === 'experience').map((r) => r.id)

    const propExtMap = new Map<string, any>()
    const vehExtMap = new Map<string, any>()
    const svcExtMap = new Map<string, any>()
    const expExtMap = new Map<string, any>()

    if (propertyIds.length > 0) {
      const propRows = await db.select().from(listingProperties).where(inArray(listingProperties.listingId, propertyIds))

      // Apply property-specific filters
      for (const p of propRows) {
        let include = true
        if (data.bedrooms?.length) {
          const numBeds = data.bedrooms.filter((b): b is number => typeof b === 'number')
          const hasStudio = data.bedrooms.includes('studio')
          if (numBeds.length > 0 && !numBeds.includes(p.bedrooms ?? -1)) {
            if (!hasStudio || (p.bedrooms !== 0 && p.bedrooms !== null)) include = false
          }
        }
        if (data.bathrooms != null && (p.bathrooms ?? 0) < data.bathrooms) include = false
        if (data.areaMin != null && (p.areaSqm ?? 0) < data.areaMin) include = false
        if (data.areaMax != null && (p.areaSqm ?? Infinity) > data.areaMax) include = false
        if (include) propExtMap.set(p.listingId, p)
      }
    }

    if (vehicleIds.length > 0) {
      const vehRows = await db.select().from(listingVehicles).where(inArray(listingVehicles.listingId, vehicleIds))
      for (const v of vehRows) {
        let include = true
        if (data.make?.length && !data.make.includes(v.make)) include = false
        if (data.yearMin != null && v.year < data.yearMin) include = false
        if (data.yearMax != null && v.year > data.yearMax) include = false
        if (data.fuelType?.length && v.fuelType && !data.fuelType.includes(v.fuelType)) include = false
        if (data.transmission && v.transmission && v.transmission !== data.transmission) include = false
        if (include) vehExtMap.set(v.listingId, v)
      }
    }

    if (serviceIds.length > 0) {
      const svcRows = await db.select().from(listingServices).where(inArray(listingServices.listingId, serviceIds))
      for (const s of svcRows) {
        let include = true
        if (data.experienceMin != null && (s.experienceYears ?? 0) < data.experienceMin) include = false
        if (include) svcExtMap.set(s.listingId, s)
      }
    }

    if (experienceIds.length > 0) {
      const expRows = await db.select().from(listingExperiences).where(inArray(listingExperiences.listingId, experienceIds))
      for (const e of expRows) expExtMap.set(e.listingId, e)
    }

    // Build items, applying text search and extension filters
    const items: ListingListItem[] = []
    for (const r of rows) {
      const t = tMap.get(r.id) ?? fbMap.get(r.id)

      // Text search filter
      if (data.query) {
        const q = data.query.toLowerCase()
        const matches =
          t?.title.toLowerCase().includes(q) ||
          t?.summary?.toLowerCase().includes(q) ||
          r.addressLine1.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q)
        if (!matches) continue
      }

      const base = {
        id: r.id,
        slug: r.slug,
        category: r.category,
        subCategory: r.subCategory,
        transactionType: r.transactionType,
        status: r.status as any,
        price: r.price,
        currency: r.currency,
        pricePeriod: r.pricePeriod,
        latitude: r.latitude,
        longitude: r.longitude,
        addressLine1: r.addressLine1,
        city: r.city,
        region: r.region,
        country: r.country,
        featured: r.featured,
        title: t?.title ?? r.slug,
        summary: t?.summary ?? null,
        neighborhood: t?.neighborhood ?? null,
        coverUrl: coverMap.get(r.id) ?? null,
        scrapedSource: r.scrapedSource ?? null,
        scrapedSourceUrl: r.scrapedSourceUrl ?? null,
      }

      if (r.category === 'property') {
        const ext = propExtMap.get(r.id)
        if (!ext && propertyIds.includes(r.id)) continue // filtered out by property-specific filters
        items.push({
          ...base,
          category: 'property',
          bedrooms: ext?.bedrooms ?? null,
          bathrooms: ext?.bathrooms ?? null,
          areaSqm: ext?.areaSqm ?? null,
          yearBuilt: ext?.yearBuilt ?? null,
          parkingSpaces: ext?.parkingSpaces ?? null,
          furnished: ext?.furnished ?? null,
        })
      } else if (r.category === 'vehicle') {
        const ext = vehExtMap.get(r.id)
        if (!ext && vehicleIds.includes(r.id)) continue
        items.push({
          ...base,
          category: 'vehicle',
          make: ext?.make ?? '',
          model: ext?.model ?? '',
          year: ext?.year ?? 0,
          mileageKm: ext?.mileageKm ?? null,
          fuelType: ext?.fuelType ?? null,
          transmission: ext?.transmission ?? null,
          color: ext?.color ?? null,
        })
      } else if (r.category === 'service') {
        const ext = svcExtMap.get(r.id)
        if (!ext && serviceIds.includes(r.id)) continue
        items.push({
          ...base,
          category: 'service',
          serviceRadiusKm: ext?.serviceRadiusKm ?? null,
          experienceYears: ext?.experienceYears ?? null,
          responseTime: ext?.responseTime ?? null,
        })
      } else if (r.category === 'experience') {
        const ext = expExtMap.get(r.id)
        items.push({
          ...base,
          category: 'experience',
          durationHours: ext?.durationHours ?? null,
          maxGuests: ext?.maxGuests ?? null,
          minAge: ext?.minAge ?? null,
          difficulty: ext?.difficulty ?? null,
          languages: ext?.languages ?? null,
        })
      }
    }

    return { items, total, page: data.page, pageSize: data.pageSize }
  })

export const getListingBySlugFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string(), locale: z.string().default('en') }))
  .handler(async ({ data }): Promise<ListingDetail | null> => {
    const db = await loadDb()

    const [listing] = await db
      .select()
      .from(listings)
      .where(and(eq(listings.slug, data.slug), eq(listings.status, 'published')))
      .limit(1)

    if (!listing) return null

    // Translation
    const [translation] = await db
      .select()
      .from(listingTranslations)
      .where(and(eq(listingTranslations.listingId, listing.id), eq(listingTranslations.locale, data.locale)))
    const [fallback] = data.locale !== 'en'
      ? await db.select().from(listingTranslations).where(and(eq(listingTranslations.listingId, listing.id), eq(listingTranslations.locale, 'en')))
      : [null]
    const t = translation ?? fallback

    // Assets
    const assets = await db
      .select()
      .from(listingAssets)
      .where(eq(listingAssets.listingId, listing.id))
      .orderBy(listingAssets.sortOrder)

    // Features
    const features = await db
      .select()
      .from(listingFeatures)
      .where(eq(listingFeatures.listingId, listing.id))

    // Extension
    let extension: any = {}
    if (listing.category === 'property') {
      const [ext] = await db.select().from(listingProperties).where(eq(listingProperties.listingId, listing.id))
      if (ext) extension = ext
    } else if (listing.category === 'vehicle') {
      const [ext] = await db.select().from(listingVehicles).where(eq(listingVehicles.listingId, listing.id))
      if (ext) extension = ext
    } else {
      const [ext] = await db.select().from(listingServices).where(eq(listingServices.listingId, listing.id))
      if (ext) extension = ext
    }

    const { listingId: _, ...extFields } = extension

    return {
      id: listing.id,
      slug: listing.slug,
      category: listing.category,
      subCategory: listing.subCategory,
      transactionType: listing.transactionType,
      status: listing.status as any,
      price: listing.price,
      currency: listing.currency,
      pricePeriod: listing.pricePeriod,
      latitude: listing.latitude,
      longitude: listing.longitude,
      addressLine1: listing.addressLine1,
      city: listing.city,
      region: listing.region,
      country: listing.country,
      featured: listing.featured,
      title: t?.title ?? listing.slug,
      summary: t?.summary ?? null,
      description: t?.description ?? null,
      neighborhood: t?.neighborhood ?? null,
      coverUrl: assets.find((a) => a.isCover)?.url ?? assets[0]?.url ?? null,
      scrapedSource: listing.scrapedSource ?? null,
      scrapedSourceUrl: listing.scrapedSourceUrl ?? null,
      features: features.map((f) => f.featureCode),
      assets: assets.map((a) => ({
        id: a.id,
        kind: a.kind,
        url: a.url,
        altText: a.altText,
        sortOrder: a.sortOrder,
        isCover: a.isCover,
      })),
      publishedAt: listing.publishedAt?.toISOString() ?? null,
      createdAt: listing.createdAt.toISOString(),
      ...extFields,
    }
  })

// ─── Similar listings ────────────────────────────────────────────────────

export const getSimilarListingsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      category: z.enum(['property', 'vehicle', 'service', 'experience']),
      city: z.string().optional(),
      excludeId: z.string(),
      limit: z.number().default(3),
      locale: z.string().default('en'),
    }),
  )
  .handler(async ({ data }): Promise<Array<Pick<ListingListItem, 'id' | 'slug' | 'category' | 'subCategory' | 'transactionType' | 'price' | 'currency' | 'pricePeriod' | 'title' | 'coverUrl' | 'city' | 'neighborhood' | 'latitude' | 'longitude' | 'addressLine1' | 'region' | 'country' | 'featured' | 'status' | 'summary' | 'scrapedSource' | 'scrapedSourceUrl'>>> => {
    const db = await loadDb()

    // 1st pass: same category + same city
    const sameCityConditions = [
      eq(listings.status, 'published'),
      eq(listings.category, data.category),
      sql`${listings.id} != ${data.excludeId}`,
    ]
    if (data.city) sameCityConditions.push(eq(listings.city, data.city))

    let rows = await db
      .select()
      .from(listings)
      .where(and(...sameCityConditions))
      .orderBy(sql`${listings.featured} desc, ${listings.publishedAt} desc`)
      .limit(data.limit)

    // Fallback: same category only, any city
    if (rows.length < data.limit) {
      const extra = await db
        .select()
        .from(listings)
        .where(
          and(
            eq(listings.status, 'published'),
            eq(listings.category, data.category),
            sql`${listings.id} != ${data.excludeId}`,
            sql`${listings.id} NOT IN (${sql.join(rows.length ? rows.map((r) => sql`${r.id}`) : [sql`''`], sql`, `)})`,
          ),
        )
        .orderBy(sql`${listings.featured} desc, ${listings.publishedAt} desc`)
        .limit(data.limit - rows.length)
      rows = [...rows, ...extra]
    }

    if (rows.length === 0) return []

    const ids = rows.map((r) => r.id)
    const translations = await db
      .select()
      .from(listingTranslations)
      .where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, data.locale)))
    const fallback = data.locale !== 'en'
      ? await db.select().from(listingTranslations).where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, 'en')))
      : []
    const covers = await db
      .select()
      .from(listingAssets)
      .where(and(inArray(listingAssets.listingId, ids), eq(listingAssets.isCover, true)))

    const tMap = new Map(translations.map((t) => [t.listingId, t]))
    const fbMap = new Map(fallback.map((t) => [t.listingId, t]))
    const coverMap = new Map(covers.map((c) => [c.listingId, c.url]))

    return rows.map((r) => {
      const t = tMap.get(r.id) ?? fbMap.get(r.id)
      return {
        id: r.id,
        slug: r.slug,
        category: r.category as any,
        subCategory: r.subCategory,
        transactionType: r.transactionType,
        status: r.status as any,
        price: r.price,
        currency: r.currency,
        pricePeriod: r.pricePeriod,
        title: t?.title ?? r.slug,
        summary: t?.summary ?? null,
        coverUrl: coverMap.get(r.id) ?? null,
        city: r.city,
        neighborhood: t?.neighborhood ?? null,
        latitude: r.latitude,
        longitude: r.longitude,
        addressLine1: r.addressLine1,
        region: r.region,
        country: r.country,
        featured: r.featured,
        scrapedSource: r.scrapedSource ?? null,
        scrapedSourceUrl: r.scrapedSourceUrl ?? null,
      }
    })
  })

export const getFeaturedListingsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ limit: z.number().default(12), locale: z.string().default('en') }))
  .handler(async ({ data }) => {
    const db = await loadDb()

    const rows = await db
      .select()
      .from(listings)
      .where(and(eq(listings.status, 'published'), eq(listings.featured, true)))
      .orderBy(sql`RANDOM()`)
      .limit(data.limit)

    if (rows.length === 0) return []

    const ids = rows.map((r) => r.id)

    const translations = await db
      .select()
      .from(listingTranslations)
      .where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, data.locale)))

    const covers = await db
      .select()
      .from(listingAssets)
      .where(and(inArray(listingAssets.listingId, ids), eq(listingAssets.isCover, true)))

    const tMap = new Map(translations.map((t) => [t.listingId, t]))
    const coverMap = new Map(covers.map((c) => [c.listingId, c.url]))

    return rows.map((r) => {
      const t = tMap.get(r.id)
      return {
        id: r.id,
        slug: r.slug,
        category: r.category,
        subCategory: r.subCategory,
        transactionType: r.transactionType,
        price: r.price,
        currency: r.currency,
        pricePeriod: r.pricePeriod,
        title: t?.title ?? r.slug,
        coverUrl: coverMap.get(r.id) ?? null,
        city: r.city,
      }
    })
  })

const mapMarkersInputSchema = z.object({
  category: z.enum(['property', 'vehicle', 'service', 'experience']).optional(),
  subCategory: z.array(z.string()).optional(),
  transactionType: z.enum(['buy', 'rent', 'hire']).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  bedrooms: z.array(z.union([z.number(), z.literal('studio')])).optional(),
  bathrooms: z.number().optional(),
  areaMin: z.number().optional(),
  areaMax: z.number().optional(),
  make: z.array(z.string()).optional(),
  yearMin: z.number().optional(),
  yearMax: z.number().optional(),
  fuelType: z.array(z.enum(['gasoline', 'diesel', 'electric', 'hybrid'])).optional(),
  transmission: z.enum(['manual', 'automatic']).optional(),
  experienceMin: z.number().optional(),
  // Spatial area filters (same shape as searchListingsFn)
  nearLat: z.number().optional(),
  nearLng: z.number().optional(),
  nearRadiusKm: z.number().min(0.1).max(500).optional(),
  polygon: z.string().optional(),
  limit: z.number().min(1).max(50000).default(10000),
})

/**
 * Lightweight markers endpoint for the map. Returns ALL matching listings
 * (capped at `limit`, default 10k, max 50k) with minimal fields — no
 * translations, no covers, no bounds. Feeds a clustered GeoJSON source so
 * tens of thousands of pins render smoothly.
 */
export const getMapMarkersFn = createServerFn({ method: 'GET' })
  .inputValidator(mapMarkersInputSchema)
  .handler(async ({ data }) => {
    const db = await loadDb()

    const conditions: any[] = [eq(listings.status, 'published')]
    if (data.category) conditions.push(eq(listings.category, data.category))
    if (data.subCategory?.length) conditions.push(inArray(listings.subCategory, data.subCategory))
    if (data.transactionType) conditions.push(eq(listings.transactionType, data.transactionType))
    if (data.priceMin != null) conditions.push(gte(listings.price, data.priceMin))
    if (data.priceMax != null) conditions.push(lte(listings.price, data.priceMax))

    // Spatial filters
    if (data.nearLat != null && data.nearLng != null && data.nearRadiusKm != null) {
      conditions.push(haversineCondition(data.nearLat, data.nearLng, data.nearRadiusKm))
    }
    const polygonRing = data.polygon ? decodePolygon(data.polygon) : null
    if (polygonRing) {
      conditions.push(polygonBboxCondition(polygonRing))
    }

    const rows = await db
      .select({
        id: listings.id,
        slug: listings.slug,
        category: listings.category,
        price: listings.price,
        currency: listings.currency,
        latitude: listings.latitude,
        longitude: listings.longitude,
      })
      .from(listings)
      .where(and(...conditions))
      .limit(data.limit)

    if (rows.length === 0) return []

    // Exact polygon filter (bbox already pruned the SQL result)
    const spatialRows = polygonRing
      ? rows.filter((r) => pointInPolygon(r.longitude, r.latitude, polygonRing))
      : rows

    // Apply category-specific extension filters by fetching only matching ids
    const needsPropertyFilter =
      data.bedrooms?.length || data.bathrooms != null || data.areaMin != null || data.areaMax != null
    const needsVehicleFilter =
      data.make?.length || data.yearMin != null || data.yearMax != null || data.fuelType?.length || data.transmission
    const needsServiceFilter = data.experienceMin != null

    const excluded = new Set<string>()

    if (needsPropertyFilter) {
      const propertyIds = spatialRows.filter((r) => r.category === 'property').map((r) => r.id)
      if (propertyIds.length > 0) {
        const propRows = await db.select().from(listingProperties).where(inArray(listingProperties.listingId, propertyIds))
        const keptIds = new Set<string>()
        for (const p of propRows) {
          let include = true
          if (data.bedrooms?.length) {
            const numBeds = data.bedrooms.filter((b): b is number => typeof b === 'number')
            const hasStudio = data.bedrooms.includes('studio')
            if (numBeds.length > 0 && !numBeds.includes(p.bedrooms ?? -1)) {
              if (!hasStudio || (p.bedrooms !== 0 && p.bedrooms !== null)) include = false
            }
          }
          if (data.bathrooms != null && (p.bathrooms ?? 0) < data.bathrooms) include = false
          if (data.areaMin != null && (p.areaSqm ?? 0) < data.areaMin) include = false
          if (data.areaMax != null && (p.areaSqm ?? Infinity) > data.areaMax) include = false
          if (include) keptIds.add(p.listingId)
        }
        for (const id of propertyIds) if (!keptIds.has(id)) excluded.add(id)
      }
    }

    if (needsVehicleFilter) {
      const vehicleIds = spatialRows.filter((r) => r.category === 'vehicle').map((r) => r.id)
      if (vehicleIds.length > 0) {
        const vehRows = await db.select().from(listingVehicles).where(inArray(listingVehicles.listingId, vehicleIds))
        const keptIds = new Set<string>()
        for (const v of vehRows) {
          let include = true
          if (data.make?.length && !data.make.includes(v.make)) include = false
          if (data.yearMin != null && v.year < data.yearMin) include = false
          if (data.yearMax != null && v.year > data.yearMax) include = false
          if (data.fuelType?.length && v.fuelType && !data.fuelType.includes(v.fuelType)) include = false
          if (data.transmission && v.transmission && v.transmission !== data.transmission) include = false
          if (include) keptIds.add(v.listingId)
        }
        for (const id of vehicleIds) if (!keptIds.has(id)) excluded.add(id)
      }
    }

    if (needsServiceFilter) {
      const serviceIds = spatialRows.filter((r) => r.category === 'service').map((r) => r.id)
      if (serviceIds.length > 0) {
        const svcRows = await db.select().from(listingServices).where(inArray(listingServices.listingId, serviceIds))
        const keptIds = new Set<string>()
        for (const s of svcRows) {
          if (data.experienceMin != null && (s.experienceYears ?? 0) < data.experienceMin) continue
          keptIds.add(s.listingId)
        }
        for (const id of serviceIds) if (!keptIds.has(id)) excluded.add(id)
      }
    }

    return spatialRows
      .filter((r) => !excluded.has(r.id))
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        category: r.category,
        price: r.price,
        currency: r.currency,
        latitude: r.latitude,
        longitude: r.longitude,
      }))
  })

export const getScrapedListingsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ limit: z.number().default(12), locale: z.string().default('en') }))
  .handler(async ({ data }) => {
    const db = await loadDb()

    const rows = await db
      .select()
      .from(listings)
      .where(and(eq(listings.status, 'published'), isNotNull(listings.scrapedSource)))
      .orderBy(sql`RANDOM()`)
      .limit(data.limit)

    if (rows.length === 0) return []

    const ids = rows.map((r) => r.id)

    const translations = await db
      .select()
      .from(listingTranslations)
      .where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, data.locale)))

    const covers = await db
      .select()
      .from(listingAssets)
      .where(and(inArray(listingAssets.listingId, ids), eq(listingAssets.isCover, true)))

    const tMap = new Map(translations.map((t) => [t.listingId, t]))
    const coverMap = new Map(covers.map((c) => [c.listingId, c.url]))

    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      category: r.category,
      subCategory: r.subCategory,
      transactionType: r.transactionType,
      price: r.price,
      currency: r.currency,
      pricePeriod: r.pricePeriod,
      title: tMap.get(r.id)?.title ?? r.slug,
      coverUrl: coverMap.get(r.id) ?? null,
      city: r.city,
      scrapedSource: r.scrapedSource ?? null,
      scrapedSourceUrl: r.scrapedSourceUrl ?? null,
    }))
  })

/**
 * Aggregate stats + imagery for the home page. Returns:
 * - totals per category
 * - top N neighborhoods (city / district) by listing count
 * - one hero image + featured markers for the hero map
 * - sample covers per vertical
 */
export const getHomeStatsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      neighborhoodLimit: z.number().default(8),
      samplesPerVertical: z.number().default(3),
      heroMarkersLimit: z.number().default(40),
      locale: z.string().default('en'),
    }),
  )
  .handler(async ({ data }) => {
    const db = await loadDb()

    // Category counts
    const catRows = await db
      .select({ category: listings.category, count: sql<number>`count(*)::int` })
      .from(listings)
      .where(eq(listings.status, 'published'))
      .groupBy(listings.category)

    const categoryCounts: Record<string, number> = {
      property: 0,
      vehicle: 0,
      service: 0,
      experience: 0,
    }
    let total = 0
    for (const r of catRows) {
      categoryCounts[r.category] = r.count
      total += r.count
    }

    // Top neighborhoods — prefer district, fallback to city; skip empty
    const neighRows = await db
      .select({
        city: listings.city,
        region: listings.region,
        count: sql<number>`count(*)::int`,
      })
      .from(listings)
      .where(eq(listings.status, 'published'))
      .groupBy(listings.city, listings.region)
      .orderBy(sql`count(*) desc`)
      .limit(data.neighborhoodLimit * 3)

    // Deduplicate by label, keep top-N
    const seen = new Set<string>()
    const neighborhoods: Array<{ label: string; city: string; region: string | null; count: number }> = []
    for (const r of neighRows) {
      const label = r.region || r.city
      if (!label || seen.has(label)) continue
      seen.add(label)
      neighborhoods.push({ label, city: r.city, region: r.region ?? null, count: r.count })
      if (neighborhoods.length >= data.neighborhoodLimit) break
    }

    // Hero markers — featured first, fall back to recent
    const heroRows = await db
      .select({
        id: listings.id,
        slug: listings.slug,
        category: listings.category,
        price: listings.price,
        currency: listings.currency,
        latitude: listings.latitude,
        longitude: listings.longitude,
      })
      .from(listings)
      .where(and(eq(listings.status, 'published'), eq(listings.featured, true)))
      .orderBy(sql`RANDOM()`)
      .limit(data.heroMarkersLimit)

    let heroMarkers = heroRows
    if (heroMarkers.length < data.heroMarkersLimit) {
      const extra = await db
        .select({
          id: listings.id,
          slug: listings.slug,
          category: listings.category,
          price: listings.price,
          currency: listings.currency,
          latitude: listings.latitude,
          longitude: listings.longitude,
        })
        .from(listings)
        .where(eq(listings.status, 'published'))
        .orderBy(sql`RANDOM()`)
        .limit(data.heroMarkersLimit - heroMarkers.length)
      heroMarkers = [...heroMarkers, ...extra]
    }

    // Sample covers per vertical
    const verticals: Array<'property' | 'vehicle' | 'service' | 'experience'> = [
      'property',
      'vehicle',
      'service',
      'experience',
    ]
    const samples: Record<string, Array<{ slug: string; coverUrl: string | null; title: string }>> = {
      property: [],
      vehicle: [],
      service: [],
      experience: [],
    }

    for (const cat of verticals) {
      const rows = await db
        .select({ id: listings.id, slug: listings.slug })
        .from(listings)
        .where(and(eq(listings.status, 'published'), eq(listings.category, cat), eq(listings.featured, true)))
        .orderBy(sql`RANDOM()`)
        .limit(data.samplesPerVertical * 2)

      let picked = rows
      if (picked.length < data.samplesPerVertical) {
        const extra = await db
          .select({ id: listings.id, slug: listings.slug })
          .from(listings)
          .where(and(eq(listings.status, 'published'), eq(listings.category, cat)))
          .orderBy(sql`RANDOM()`)
          .limit(data.samplesPerVertical * 2)
        picked = [...picked, ...extra]
      }

      const seenIds = new Set<string>()
      const uniq = picked.filter((r) => {
        if (seenIds.has(r.id)) return false
        seenIds.add(r.id)
        return true
      }).slice(0, data.samplesPerVertical)

      if (uniq.length === 0) continue

      const ids = uniq.map((r) => r.id)
      const covers = await db
        .select()
        .from(listingAssets)
        .where(and(inArray(listingAssets.listingId, ids), eq(listingAssets.isCover, true)))
      const translations = await db
        .select()
        .from(listingTranslations)
        .where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, data.locale)))
      const coverMap = new Map(covers.map((c) => [c.listingId, c.url]))
      const tMap = new Map(translations.map((t) => [t.listingId, t.title]))

      samples[cat] = uniq.map((r) => ({
        slug: r.slug,
        coverUrl: coverMap.get(r.id) ?? null,
        title: tMap.get(r.id) ?? r.slug,
      }))
    }

    return {
      total,
      categoryCounts,
      neighborhoods,
      heroMarkers: heroMarkers.map((m) => ({
        id: m.id,
        slug: m.slug,
        category: m.category,
        price: m.price,
        currency: m.currency,
        latitude: m.latitude,
        longitude: m.longitude,
      })),
      samples,
    }
  })
