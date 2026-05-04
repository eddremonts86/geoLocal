import { useTranslation } from 'react-i18next'
import { Toggle } from '@/components/ui/toggle'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { SERVICE_SUBCATEGORIES, type ServiceSubCategory } from '@/modules/listings/model/types'

interface ServiceFiltersProps {
  subCategory: string[] | null
  experienceMin: number | null
  serviceRadiusMin: number | null
  responseTime: 'within_hour' | 'same_day' | 'few_days' | null
  certified: boolean | null
  onSubCategoryChange: (val: string[] | null) => void
  onExperienceMinChange: (val: number | null) => void
  onServiceRadiusMinChange: (val: number | null) => void
  onResponseTimeChange: (val: 'within_hour' | 'same_day' | 'few_days' | null) => void
  onCertifiedChange: (val: boolean | null) => void
}

const PILL_CLASS = 'rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

const RESPONSE_OPTIONS: { value: 'within_hour' | 'same_day' | 'few_days'; label: string }[] = [
  { value: 'within_hour', label: 'Within 1h' },
  { value: 'same_day', label: 'Same day' },
  { value: 'few_days', label: 'Few days' },
]

export function ServiceFilters({
  subCategory, experienceMin, serviceRadiusMin, responseTime, certified,
  onSubCategoryChange, onExperienceMinChange, onServiceRadiusMinChange, onResponseTimeChange, onCertifiedChange,
}: ServiceFiltersProps) {
  const { t } = useTranslation()

  const toggleSubCat = (val: ServiceSubCategory) => {
    const current = subCategory ?? []
    if (current.includes(val)) {
      const next = current.filter((x) => x !== val)
      onSubCategoryChange(next.length ? next : null)
    } else {
      onSubCategoryChange([...current, val])
    }
  }

  return (
    <div className="space-y-6">
      {/* Service category */}
      <div>
        <SectionLabel>{t('filters.serviceType', 'Service type')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {SERVICE_SUBCATEGORIES.map((val) => (
            <Toggle
              key={val}
              pressed={!!subCategory?.includes(val)}
              onPressedChange={() => toggleSubCat(val)}
              variant="outline"
              className={PILL_CLASS}
            >
              {t(`filters.subcat_${val}`, val.replace(/_/g, ' '))}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Min experience */}
      <div>
        <SectionLabel>{t('filters.experience', 'Min. experience')}</SectionLabel>
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

      {/* Service coverage radius */}
      <div>
        <SectionLabel>{t('filters.serviceRadius', 'Coverage radius')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {[5, 10, 25, 50].map((km) => (
            <Toggle
              key={km}
              pressed={serviceRadiusMin === km}
              onPressedChange={() => onServiceRadiusMinChange(serviceRadiusMin === km ? null : km)}
              variant="outline"
              className={PILL_CLASS}
            >
              {km}+ km
            </Toggle>
          ))}
        </div>
      </div>

      {/* Response time */}
      <div>
        <SectionLabel>{t('filters.responseTime', 'Response time')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {RESPONSE_OPTIONS.map(({ value, label }) => (
            <Toggle
              key={value}
              pressed={responseTime === value}
              onPressedChange={() => onResponseTimeChange(responseTime === value ? null : value)}
              variant="outline"
              className={PILL_CLASS}
            >
              {label}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Certified switch */}
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <Label htmlFor="certified-switch" className="text-sm font-normal">
          {t('filters.certifiedOnly', 'Certified providers only')}
        </Label>
        <Switch
          id="certified-switch"
          checked={certified === true}
          onCheckedChange={(v) => onCertifiedChange(v ? true : null)}
        />
      </div>
    </div>
  )
}
