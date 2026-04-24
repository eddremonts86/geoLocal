import type { LucideIcon } from 'lucide-react'
import { Bed, Bath, Maximize, Calendar, Gauge, Fuel, Settings2, Award, Clock, Globe2, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ListingDetail } from '@/modules/listings/model/types'

interface Stat {
  icon: LucideIcon
  label: string
  value: string | number
}

interface ListingStatsBarProps {
  listing: ListingDetail
}

/**
 * Horizontal strip of key specs under the gallery. Tabular nums, minimal,
 * editorial. Acts as a scannable summary before the long-form story.
 */
export function ListingStatsBar({ listing }: ListingStatsBarProps) {
  const { t } = useTranslation()
  const stats: Stat[] = []

  if (listing.category === 'property') {
    if (listing.bedrooms != null) stats.push({ icon: Bed, label: t('property.beds', 'Beds'), value: listing.bedrooms })
    if (listing.bathrooms != null) stats.push({ icon: Bath, label: t('property.baths', 'Baths'), value: listing.bathrooms })
    if (listing.areaSqm != null) stats.push({ icon: Maximize, label: t('property.area', 'Area'), value: `${listing.areaSqm} m²` })
    if (listing.yearBuilt != null) stats.push({ icon: Calendar, label: t('property.year', 'Year'), value: listing.yearBuilt })
    if (listing.parkingSpaces != null && listing.parkingSpaces > 0) {
      stats.push({ icon: Settings2, label: t('property.parking', 'Parking'), value: listing.parkingSpaces })
    }
  } else if (listing.category === 'vehicle') {
    if (listing.year != null) stats.push({ icon: Calendar, label: t('vehicle.year', 'Year'), value: listing.year })
    if (listing.mileageKm != null) {
      stats.push({ icon: Gauge, label: t('vehicle.mileage', 'Mileage'), value: `${listing.mileageKm.toLocaleString()} km` })
    }
    if (listing.fuelType) stats.push({ icon: Fuel, label: t('vehicle.fuel', 'Fuel'), value: listing.fuelType })
    if (listing.transmission) stats.push({ icon: Settings2, label: t('vehicle.transmission', 'Transmission'), value: listing.transmission })
  } else if (listing.category === 'service') {
    if (listing.experienceYears != null) {
      stats.push({ icon: Award, label: t('service.experience', 'Experience'), value: `${listing.experienceYears} yrs` })
    }
    if (listing.responseTime) stats.push({ icon: Clock, label: t('service.response', 'Response'), value: listing.responseTime })
    if (listing.serviceRadiusKm != null) {
      stats.push({ icon: Globe2, label: t('service.radius', 'Radius'), value: `${listing.serviceRadiusKm} km` })
    }
  } else if (listing.category === 'experience') {
    if (listing.durationHours != null) stats.push({ icon: Clock, label: t('experience.duration', 'Duration'), value: `${listing.durationHours} h` })
    if (listing.maxGuests != null) stats.push({ icon: Users, label: t('experience.maxGuests', 'Max guests'), value: listing.maxGuests })
    if (listing.difficulty) stats.push({ icon: Award, label: t('experience.difficulty', 'Difficulty'), value: listing.difficulty })
  }

  if (stats.length === 0) return null

  return (
    <div
      className="-mx-4 flex items-stretch gap-px overflow-x-auto border-y md:mx-0"
      style={{ borderColor: 'var(--line-1)', backgroundColor: 'var(--line-1)' }}
      role="list"
    >
      {stats.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          role="listitem"
          className="flex min-w-[7rem] flex-1 shrink-0 flex-col items-start gap-1 bg-background px-4 py-4 md:min-w-0 md:px-5 md:py-5"
        >
          <div className="flex items-center gap-1.5" style={{ color: 'var(--ink-3)' }}>
            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="meta-label" style={{ fontSize: '0.625rem' }}>
              {label}
            </span>
          </div>
          <div className="font-display text-xl font-medium tabular-nums leading-none tracking-tight text-foreground md:text-2xl">
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}
