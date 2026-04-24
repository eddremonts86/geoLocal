import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'

interface PropertyFiltersProps {
  beds: string[] | null
  baths: number | null
  areaMin: number | null
  areaMax: number | null
  onBedsChange: (beds: string[] | null) => void
  onBathsChange: (baths: number | null) => void
  onAreaMinChange: (val: number | null) => void
  onAreaMaxChange: (val: number | null) => void
}

const BED_OPTIONS = ['studio', '1', '2', '3', '4', '5+']

/** Shared Toggle pill classes for active/inactive editorial style */
const PILL_CLASS = 'rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background'

/** Section label — uppercase editorial style */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

export function PropertyFilters({
  beds, baths, areaMin, areaMax,
  onBedsChange, onBathsChange, onAreaMinChange, onAreaMaxChange,
}: PropertyFiltersProps) {
  const { t } = useTranslation()

  const toggleBed = (val: string) => {
    const current = beds ?? []
    if (current.includes(val)) {
      const next = current.filter((b) => b !== val)
      onBedsChange(next.length ? next : null)
    } else {
      onBedsChange([...current, val])
    }
  }

  return (
    <div className="space-y-6">
      {/* Bedrooms */}
      <div>
        <SectionLabel>{t('filters.bedrooms', 'Bedrooms')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {BED_OPTIONS.map((opt) => (
            <Toggle
              key={opt}
              pressed={!!beds?.includes(opt)}
              onPressedChange={() => toggleBed(opt)}
              variant="outline"
              className={PILL_CLASS}
            >
              {opt === 'studio' ? t('filters.studio', 'Studio') : opt}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <SectionLabel>{t('filters.bathrooms', 'Bathrooms')}</SectionLabel>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <Toggle
              key={n}
              pressed={baths === n}
              onPressedChange={() => onBathsChange(baths === n ? null : n)}
              variant="outline"
              className={PILL_CLASS}
            >
              {n}+
            </Toggle>
          ))}
        </div>
      </div>

      {/* Area range */}
      <div>
        <SectionLabel>{t('filters.area', 'Area (m²)')}</SectionLabel>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="mb-1 text-xs text-muted-foreground">{t('filters.min', 'Min')}</p>
            <Input
              type="number"
              placeholder="0 m²"
              value={areaMin ?? ''}
              onChange={(e) => onAreaMinChange(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <span className="mt-5 text-muted-foreground">–</span>
          <div className="flex-1">
            <p className="mb-1 text-xs text-muted-foreground">{t('filters.max', 'Max')}</p>
            <Input
              type="number"
              placeholder="∞ m²"
              value={areaMax ?? ''}
              onChange={(e) => onAreaMaxChange(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
