/**
 * User-facing listing mutations.
 *
 * - createListingFn:  authenticated users create their own listings (draft).
 * - updateListingFn:  owner or admin may edit.
 * - deleteListingFn:  owner or admin may delete (cascades to children).
 * - publishListingFn: owner toggles draft<->published.
 * - listMyListingsFn: caller's own listings (any status).
 *
 * Authz is enforced via `requireUser()` / `requireListingOwner()`.
 * Rate limits are enforced for create + publish (anti-spam).
 */
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import {
  listings,
  listingProperties,
  listingVehicles,
  listingServices,
  listingExperiences,
  listingTranslations,
  listingAssets,
} from '@/shared/lib/db/schema'
import { requireUser, requireListingOwner } from '@/shared/lib/auth/guards'
import { consumeRateLimit } from '@/shared/lib/auth/rate-limit'

const slugify = (raw: string): string =>
  raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'listing'

const baseSchema = z.object({
  category: z.enum(['property', 'vehicle', 'service', 'experience']),
  subCategory: z.string().min(1).max(100),
  transactionType: z.enum(['buy', 'rent', 'hire']),
  title: z.string().min(3).max(200),
  description: z.string().max(8000).optional(),
  price: z.number().int().min(0),
  currency: z.string().length(3).default('DKK'),
  pricePeriod: z.enum(['one_time', 'monthly', 'daily', 'hourly']).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  addressLine1: z.string().min(2).max(500),
  city: z.string().min(1).max(255),
  region: z.string().max(255).optional(),
  country: z.string().length(2).default('DK'),
  contactMethod: z.enum(['in_app', 'email', 'phone', 'external_url']).default('in_app'),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(40).optional(),
  contactUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).max(20).default([]),
  // category-specific extras
  property: z
    .object({
      bedrooms: z.number().int().min(0).max(50).optional(),
      bathrooms: z.number().int().min(0).max(50).optional(),
      areaSqm: z.number().min(0).max(100_000).optional(),
      yearBuilt: z.number().int().min(1500).max(2100).optional(),
    })
    .optional(),
  vehicle: z
    .object({
      make: z.string().max(100),
      model: z.string().max(100),
      year: z.number().int().min(1900).max(2100),
      mileageKm: z.number().int().min(0).optional(),
      fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']).optional(),
      transmission: z.enum(['manual', 'automatic']).optional(),
    })
    .optional(),
  service: z
    .object({
      serviceRadiusKm: z.number().min(0).optional(),
      experienceYears: z.number().int().min(0).optional(),
    })
    .optional(),
  experience: z
    .object({
      durationHours: z.number().min(0).optional(),
      maxGuests: z.number().int().min(1).optional(),
    })
    .optional(),
})

export const createListingFn = createServerFn({ method: 'POST' })
  .inputValidator(baseSchema)
  .handler(async ({ data }) => {
    const user = await requireUser()
    await consumeRateLimit({
      key: `user:${user.userId}:create_listing`,
      limit: 10,
      windowSec: 24 * 60 * 60,
    })

    const db = await loadDb()
    const slugBase = slugify(data.title)
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`

    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(listings)
        .values({
          slug,
          category: data.category,
          subCategory: data.subCategory,
          transactionType: data.transactionType,
          status: 'draft',
          price: data.price,
          currency: data.currency,
          pricePeriod: data.pricePeriod,
          latitude: data.latitude,
          longitude: data.longitude,
          addressLine1: data.addressLine1,
          city: data.city,
          region: data.region,
          country: data.country,
          ownerId: user.userId,
          sourceKind: 'user',
          contactMethod: data.contactMethod,
          contactEmail: data.contactEmail ?? null,
          contactPhone: data.contactPhone ?? null,
          contactUrl: data.contactUrl ?? null,
        })
        .returning({ id: listings.id, slug: listings.slug })

      await tx.insert(listingTranslations).values({
        listingId: row.id,
        locale: 'en',
        title: data.title,
        description: data.description ?? null,
      })

      if (data.imageUrls.length) {
        await tx.insert(listingAssets).values(
          data.imageUrls.map((url, i) => ({
            listingId: row.id,
            kind: 'image' as const,
            url,
            sortOrder: i,
            isCover: i === 0,
          })),
        )
      }

      if (data.category === 'property' && data.property) {
        await tx.insert(listingProperties).values({ listingId: row.id, ...data.property })
      } else if (data.category === 'vehicle' && data.vehicle) {
        await tx.insert(listingVehicles).values({ listingId: row.id, ...data.vehicle })
      } else if (data.category === 'service' && data.service) {
        await tx.insert(listingServices).values({ listingId: row.id, ...data.service })
      } else if (data.category === 'experience' && data.experience) {
        await tx.insert(listingExperiences).values({ listingId: row.id, ...data.experience })
      }

      return { id: row.id, slug: row.slug }
    })
  })

const updateSchema = baseSchema.partial().extend({ id: z.string().uuid() })

export const updateListingFn = createServerFn({ method: 'POST' })
  .inputValidator(updateSchema)
  .handler(async ({ data }) => {
    const { listing } = await requireListingOwner(data.id)
    const db = await loadDb()
    const { id, title, description, imageUrls, property, vehicle, service, experience, ...rest } = data

    await db.transaction(async (tx) => {
      const fields: Record<string, unknown> = { ...rest, updatedAt: new Date() }
      // strip undefineds so we never overwrite existing values with null by accident
      for (const k of Object.keys(fields)) if (fields[k] === undefined) delete fields[k]
      if (Object.keys(fields).length > 1) {
        await tx.update(listings).set(fields).where(eq(listings.id, listing.id))
      }

      if (title !== undefined || description !== undefined) {
        const existing = await tx
          .select({ listingId: listingTranslations.listingId })
          .from(listingTranslations)
          .where(and(eq(listingTranslations.listingId, listing.id), eq(listingTranslations.locale, 'en')))
          .limit(1)
        if (existing.length === 0) {
          await tx.insert(listingTranslations).values({
            listingId: listing.id,
            locale: 'en',
            title: title ?? '(untitled)',
            description: description ?? null,
          })
        } else {
          const set: Record<string, unknown> = {}
          if (title !== undefined) set.title = title
          if (description !== undefined) set.description = description
          await tx
            .update(listingTranslations)
            .set(set)
            .where(and(eq(listingTranslations.listingId, listing.id), eq(listingTranslations.locale, 'en')))
        }
      }

      if (imageUrls) {
        await tx.delete(listingAssets).where(eq(listingAssets.listingId, listing.id))
        if (imageUrls.length) {
          await tx.insert(listingAssets).values(
            imageUrls.map((url, i) => ({
              listingId: listing.id,
              kind: 'image' as const,
              url,
              sortOrder: i,
              isCover: i === 0,
            })),
          )
        }
      }

      if (property) {
        await tx
          .insert(listingProperties)
          .values({ listingId: listing.id, ...property })
          .onConflictDoUpdate({ target: listingProperties.listingId, set: property })
      }
      if (vehicle) {
        await tx
          .insert(listingVehicles)
          .values({ listingId: listing.id, ...vehicle })
          .onConflictDoUpdate({ target: listingVehicles.listingId, set: vehicle })
      }
      if (service) {
        await tx
          .insert(listingServices)
          .values({ listingId: listing.id, ...service })
          .onConflictDoUpdate({ target: listingServices.listingId, set: service })
      }
      if (experience) {
        await tx
          .insert(listingExperiences)
          .values({ listingId: listing.id, ...experience })
          .onConflictDoUpdate({ target: listingExperiences.listingId, set: experience })
      }
    })

    return { ok: true }
  })

export const deleteListingFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { listing } = await requireListingOwner(data.id)
    const db = await loadDb()
    // Soft-anonymize when the listing is part of a published catalog page —
    // hard delete only drafts. This preserves any messaging history.
    if (listing.status === 'published') {
      await db
        .update(listings)
        .set({ status: 'archived', visibility: 'private', updatedAt: new Date() })
        .where(eq(listings.id, listing.id))
      return { ok: true, mode: 'archived' as const }
    }
    await db.delete(listings).where(eq(listings.id, listing.id))
    return { ok: true, mode: 'deleted' as const }
  })

export const publishListingFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid(), publish: z.boolean() }))
  .handler(async ({ data }) => {
    const { user, listing } = await requireListingOwner(data.id)
    if (data.publish) {
      await consumeRateLimit({
        key: `user:${user.userId}:publish_listing`,
        limit: 20,
        windowSec: 24 * 60 * 60,
      })
    }
    const db = await loadDb()
    await db
      .update(listings)
      .set({
        status: data.publish ? 'published' : 'draft',
        publishedAt: data.publish ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listing.id))
    return { ok: true }
  })

export const listMyListingsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({}).optional().default({}))
  .handler(async () => {
    const user = await requireUser()
    const db = await loadDb()
    const rows = await db
      .select({
        id: listings.id,
        slug: listings.slug,
        category: listings.category,
        subCategory: listings.subCategory,
        transactionType: listings.transactionType,
        status: listings.status,
        price: listings.price,
        currency: listings.currency,
        city: listings.city,
        country: listings.country,
        viewCount: listings.viewCount,
        contactCount: listings.contactCount,
        moderationStatus: listings.moderationStatus,
        publishedAt: listings.publishedAt,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
      })
      .from(listings)
      .where(eq(listings.ownerId, user.userId))
      .orderBy(desc(listings.updatedAt))
    return rows
  })
