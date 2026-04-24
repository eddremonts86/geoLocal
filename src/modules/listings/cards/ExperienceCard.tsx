import { Clock, Users, Mountain } from 'lucide-react'
import type { ListingBase, ExperienceListFields } from '@/modules/listings/model/types'

type ExperienceItem = ListingBase & { category: 'experience' } & ExperienceListFields

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  challenging: 'Challenging',
}

export function ExperienceCardMetrics({ item }: { item: ExperienceItem }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {item.durationHours != null && (
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {item.durationHours < 1
            ? `${Math.round(item.durationHours * 60)}min`
            : `${item.durationHours}h`}
        </span>
      )}
      {item.maxGuests != null && (
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> Up to {item.maxGuests}
        </span>
      )}
      {item.difficulty && (
        <span className="flex items-center gap-1">
          <Mountain className="h-3.5 w-3.5" />
          {DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty}
        </span>
      )}
    </div>
  )
}
