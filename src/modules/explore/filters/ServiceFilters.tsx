import { useTranslation } from 'react-i18next'
import { Toggle } from '@/components/ui/toggle'

interface ServiceFiltersProps {
  experienceMin: number | null
  onExperienceMinChange: (val: number | null) => void
}

const PILL_CLASS = 'rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background'

export function ServiceFilters({ experienceMin, onExperienceMinChange }: ServiceFiltersProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Minimum experience */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {t('filters.experience', 'Min. Experience')}
        </p>
        <div className="flex flex-wrap gap-2">
          {[1, 3, 5, 10].map((yr) => (
            <Toggle
              key={yr}
              pressed={experienceMin === yr}
              onPressedChange={() => onExperienceMinChange(experienceMin === yr ? null : yr)}
              variant="outline"
              className={PILL_CLASS}
            >
              {yr}+ {t('filters.years', 'yrs')}
            </Toggle>
          ))}
        </div>
      </div>
    </div>
  )
}
