import { Bed, Bath, Maximize, ParkingCircle } from 'lucide-react'
import type { ListingBase, PropertyListFields } from '@/modules/listings/model/types'

type PropertyItem = ListingBase & { category: 'property' } & PropertyListFields

export function PropertyCardMetrics({ item }: { item: PropertyItem }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {item.bedrooms != null && (
        <span className="flex items-center gap-1">
          <Bed className="h-3.5 w-3.5" /> {item.bedrooms}
        </span>
      )}
      {item.bathrooms != null && (
        <span className="flex items-center gap-1">
          <Bath className="h-3.5 w-3.5" /> {item.bathrooms}
        </span>
      )}
      {item.areaSqm != null && (
        <span className="flex items-center gap-1">
          <Maximize className="h-3.5 w-3.5" /> {item.areaSqm} m²
        </span>
      )}
      {item.parkingSpaces != null && (
        <span className="flex items-center gap-1">
          <ParkingCircle className="h-3.5 w-3.5" /> {item.parkingSpaces}
        </span>
      )}
    </div>
  )
}
