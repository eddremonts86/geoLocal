import { Clock, Award, Zap } from 'lucide-react'
import type { ListingBase, ServiceListFields } from '@/modules/listings/model/types'

type ServiceItem = ListingBase & { category: 'service' } & ServiceListFields

export function ServiceCardMetrics({ item }: { item: ServiceItem }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {item.experienceYears != null && (
        <span className="flex items-center gap-1">
          <Award className="h-3.5 w-3.5" /> {item.experienceYears} yrs
        </span>
      )}
      {item.responseTime && (
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {item.responseTime}
        </span>
      )}
      {item.serviceRadiusKm != null && (
        <span className="flex items-center gap-1">
          <Zap className="h-3.5 w-3.5" /> {item.serviceRadiusKm} km
        </span>
      )}
    </div>
  )
}
