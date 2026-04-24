import { useTranslation } from 'react-i18next'
import { Toggle } from '@/components/ui/toggle'
import { EXPERIENCE_SUBCATEGORIES } from '@/modules/listings/model/types'

interface ExperienceFiltersProps {
  subCategory: string[] | null
  maxGuests: number | null
  durationMax: number | null
  onSubCategoryChange: (val: string[] | null) => void
  onMaxGuestsChange: (val: number | null) => void
  onDurationMaxChange: (val: number | null) => void
}

const PILL_CLASS =
  'rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background'

const SUBCATEGORY_LABELS: Record<string, string> = {
  outdoor: 'Outdoor',
  culinary: 'Culinary',
  cultural: 'Cultural',
  wellness: 'Wellness',
  art: 'Art & Craft',
  sports: 'Sports',
  nightlife: 'Nightlife',
  guided_tour: 'Guided Tour',
}

const DURATION_OPTIONS = [
  { label: 'Up to 2h', value: 2 },
  { label: 'Up to 4h', value: 4 },
  { label: 'Half day', value: 6 },
  { label: 'Full day', value: 12 },
]

export function ExperienceFilters({
  subCategory,
  maxGuests,
  durationMax,
  onSubCategoryChange,
  onMaxGuestsChange,
  onDurationMaxChange,
}: ExperienceFiltersProps) {
  const { t } = useTranslation()

  function toggleSubCategory(val: string) {
    const current = subCategory ?? []
    const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
    onSubCategoryChange(next.length > 0 ? next : null)
  }

  return (
    <div className="space-y-6">
      {/* Sub-category */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {t('filters.experienceType', 'Experience type')}
        </p>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_SUBCATEGORIES.map((sub) => (
            <Toggle
              key={sub}
              pressed={subCategory?.includes(sub) ?? false}
              onPressedChange={() => toggleSubCategory(sub)}
              variant="outline"
              className={PILL_CLASS}
            >
              {SUBCATEGORY_LABELS[sub] ?? sub}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {t('filters.duration', 'Duration')}
        </p>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <Toggle
              key={opt.value}
              pressed={durationMax === opt.value}
              onPressedChange={() => onDurationMaxChange(durationMax === opt.value ? null : opt.value)}
              variant="outline"
              className={PILL_CLASS}
            >
              {opt.label}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Group size */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {t('filters.groupSize', 'Max group size')}
        </p>
        <div className="flex flex-wrap gap-2">
          {[2, 5, 10, 20].map((n) => (
            <Toggle
              key={n}
              pressed={maxGuests === n}
              onPressedChange={() => onMaxGuestsChange(maxGuests === n ? null : n)}
              variant="outline"
              className={PILL_CLASS}
            >
              {n === 20 ? '20+' : `≤${n}`} {t('filters.guests', 'guests')}
            </Toggle>
          ))}
        </div>
      </div>
    </div>
  )
}
