import { Calendar, Gauge, Fuel, Settings } from 'lucide-react'
import type { ListingBase, VehicleListFields } from '@/modules/listings/model/types'

type VehicleItem = ListingBase & { category: 'vehicle' } & VehicleListFields

export function VehicleCardMetrics({ item }: { item: VehicleItem }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" /> {item.year}
      </span>
      {item.mileageKm != null && (
        <span className="flex items-center gap-1">
          <Gauge className="h-3.5 w-3.5" /> {(item.mileageKm / 1000).toFixed(0)}k km
        </span>
      )}
      {item.fuelType && (
        <span className="flex items-center gap-1">
          <Fuel className="h-3.5 w-3.5" /> {item.fuelType}
        </span>
      )}
      {item.transmission && (
        <span className="flex items-center gap-1">
          <Settings className="h-3.5 w-3.5" /> {item.transmission}
        </span>
      )}
    </div>
  )
}
