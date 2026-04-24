import { useMemo } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MapView, type MapMarker } from '@/modules/map/ui/MapView'
import type { ListingDetail, ListingListItem } from '@/modules/listings/model/types'

interface ListingLocationProps {
  listing: ListingDetail
  sectionNumber?: string
}

/** Extract any "N km" phrases near notable keywords to surface as proximity chips. */
function extractProximities(description: string | null): Array<{ label: string; distance: string }> {
  if (!description) return []
  const matches: Array<{ label: string; distance: string }> = []
  // Match: "<keyword> ... N km" or "just N kilometers ... <keyword>"
  const keywordPatterns: Array<{ rx: RegExp; label: string }> = [
    { rx: /(\d{1,3})\s*(?:km|kilom\w*)[^.]{0,60}\b(airport|lufthavn)\b/gi, label: 'proximity.airport' },
    { rx: /(\d{1,3})\s*(?:km|kilom\w*)[^.]{0,60}\b(beach|coast|sea|strand)\b/gi, label: 'proximity.beach' },
    { rx: /(\d{1,3})\s*(?:km|kilom\w*)[^.]{0,60}\b(city|downtown|centre|center|town)\b/gi, label: 'proximity.city' },
    { rx: /(\d{1,3})\s*(?:km|kilom\w*)[^.]{0,60}\b(station|motorway|highway|autobahn)\b/gi, label: 'proximity.transit' },
  ]
  const seenLabels = new Set<string>()
  for (const { rx, label } of keywordPatterns) {
    const hits = [...description.matchAll(rx)]
    for (const hit of hits.slice(0, 1)) {
      if (seenLabels.has(label)) continue
      seenLabels.add(label)
      matches.push({ label, distance: `${hit[1]} km` })
    }
  }
  return matches.slice(0, 4)
}

const PROXIMITY_LABELS: Record<string, { en: string; es: string }> = {
  'proximity.airport': { en: 'to the airport', es: 'al aeropuerto' },
  'proximity.beach': { en: 'to the coast', es: 'al mar' },
  'proximity.city': { en: 'to the city centre', es: 'al centro' },
  'proximity.transit': { en: 'to transit', es: 'a transporte' },
}

/**
 * Section 03 — "The place". Non-interactive embed of MapView centered on the
 * listing with a single marker, paired with a side panel listing address,
 * neighborhood and any proximity-chips extracted from the description.
 */
export function ListingLocation({ listing, sectionNumber = '03' }: ListingLocationProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'es' ? 'es' : 'en'

  const marker: MapMarker = {
    id: listing.id,
    slug: listing.slug,
    category: listing.category,
    price: listing.price,
    currency: listing.currency,
    latitude: listing.latitude,
    longitude: listing.longitude,
  }

  // Build a minimal ListingListItem so the map popup can render rich content
  const mapItem = useMemo<ListingListItem>(() => {
    const base = {
      id: listing.id,
      slug: listing.slug,
      subCategory: listing.subCategory,
      transactionType: listing.transactionType,
      status: listing.status,
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
      title: listing.title,
      summary: listing.summary,
      neighborhood: listing.neighborhood,
      coverUrl: listing.coverUrl,
      scrapedSource: listing.scrapedSource,
      scrapedSourceUrl: listing.scrapedSourceUrl,
    }
    switch (listing.category) {
      case 'property':
        return {
          ...base,
          category: 'property',
          bedrooms: listing.bedrooms ?? null,
          bathrooms: listing.bathrooms ?? null,
          areaSqm: listing.areaSqm ?? null,
          yearBuilt: listing.yearBuilt ?? null,
          parkingSpaces: listing.parkingSpaces ?? null,
          furnished: listing.furnished ?? null,
        }
      case 'vehicle':
        return {
          ...base,
          category: 'vehicle',
          make: listing.make ?? '',
          model: listing.model ?? '',
          year: listing.year ?? 0,
          mileageKm: listing.mileageKm ?? null,
          fuelType: listing.fuelType ?? null,
          transmission: listing.transmission ?? null,
          color: listing.color ?? null,
        }
      case 'service':
        return {
          ...base,
          category: 'service',
          serviceRadiusKm: listing.serviceRadiusKm ?? null,
          experienceYears: listing.experienceYears ?? null,
          responseTime: listing.responseTime ?? null,
        }
      case 'experience':
        return {
          ...base,
          category: 'experience',
          durationHours: listing.durationHours ?? null,
          maxGuests: listing.maxGuests ?? null,
          minAge: listing.minAge ?? null,
          difficulty: listing.difficulty ?? null,
          languages: listing.languages ?? null,
        }
    }
  }, [listing])

  const proximities = useMemo(() => extractProximities(listing.description), [listing.description])

  return (
    <section>
      <div className="meta-label mb-4">
        {sectionNumber} / {t('listing.location', 'The place')}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Map */}
        <div
          className="relative h-[320px] overflow-hidden md:h-[380px]"
          style={{ border: '1px solid var(--line-1)' }}
        >
          <MapView
            markers={[marker]}
            items={[mapItem]}
            center={[listing.longitude, listing.latitude]}
            zoom={13}
            hideToolbar
            hideNavControls
            interactive={false}
          />
          {/* Fixed floating pin label — non-interactive */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap bg-foreground px-2.5 py-1 font-mono text-[0.65rem] tabular-nums text-background shadow-md"
          >
            {listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="mb-3 flex items-start gap-2" style={{ color: 'var(--ink-1)' }}>
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: 'var(--amber-ink)' }} />
              <div>
                <p className="font-display text-xl font-medium leading-tight text-foreground md:text-2xl">
                  {listing.city}
                </p>
                <p className="text-sm" style={{ color: 'var(--ink-2)' }}>
                  {listing.neighborhood ? `${listing.neighborhood} · ` : ''}
                  {listing.region ? `${listing.region}, ` : ''}
                  {listing.country}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--ink-3)' }}>
                  {listing.addressLine1}
                </p>
              </div>
            </div>

            {proximities.length > 0 && (
              <dl className="mt-5 divide-y" style={{ borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)' }}>
                {proximities.map((p) => (
                  <div key={p.label} className="flex items-center justify-between gap-4 py-2.5" style={{ borderColor: 'var(--line-1)' }}>
                    <dt className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
                      <Navigation className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {PROXIMITY_LABELS[p.label][lang]}
                    </dt>
                    <dd className="font-display text-base font-medium tabular-nums text-foreground">
                      {p.distance}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <p className="mt-6 text-xs" style={{ color: 'var(--ink-3)' }}>
            {t('listing.locationNote', 'Approximate location — exact address shared after inquiry.')}
          </p>
        </div>
      </div>
    </section>
  )
}
