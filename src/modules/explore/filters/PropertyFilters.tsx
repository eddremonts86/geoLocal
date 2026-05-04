import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PROPERTY_SUBCATEGORIES, type PropertySubCategory } from '@/modules/listings/model/types'

interface PropertyFiltersProps {
  subCategory: string[] | null
  beds: string[] | null
  baths: number | null
  areaMin: number | null
  areaMax: number | null
  yearBuiltMin: number | null
  yearBuiltMax: number | null
  parkingMin: number | null
  furnished: boolean | null
  onSubCategoryChange: (val: string[] | null) => void
  onBedsChange: (beds: string[] | null) => void
  onBathsChange: (baths: number | null) => void
  onAreaMinChange: (val: number | null) => void
  onAreaMaxChange: (val: number | null) => void
  onYearBuiltMinChange: (val: number | null) => void
  onYearBuiltMaxChange: (val: number | null) => void
  onParkingMinChange: (val: number | null) => void
  onFurnishedChange: (val: boolean | null) => void
}

const BED_OPTIONS = ['studio', '1', '2', '3', '4', '5+']
const PILL_CLASS =
  'rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

export function PropertyFilters({
  subCategory, beds, baths, areaMin, areaMax,
  yearBuiltMin, yearBuiltMax, parkingMin, furnished,
  onSubCategoryChange, onBedsChange, onBathsChange,
  onAreaMinChange, onAreaMaxChange,
  onYearBuiltMinChange, onYearBuiltMaxChange,
  onParkingMinChange, onFurnishedChange,
}: PropertyFiltersProps) {
  const { t } = useTranslation()

  const toggleSubCat = (val: PropertySubCategory) => {
    const current = subCategory ?? []
    if (current.includes(val)) {
      const next = current.filter((x) => x !== val)
      onSubCategoryChange(next.length ? next : null)
    } else {
      onSubCategoryChange([...current, val])
    }
  }

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
      {/* Property type */}
      <div>
        <SectionLabel>{t('filters.propertyType', 'Property type')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_SUBCATEGORIES.map((val) => (
            <Toggle
              key={val}
              pressed={!!subCategory?.includes(val)}
              onPressedChange={() => toggleSubCat(val)}
              variant="outline"
              className={PILL_CLASS}
            >
              {t(`filters.subcat_${val}`, val)}
            </Toggle>
          ))}
        </div>
      </div>

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

      {/* Year built range */}
      <div>
        <SectionLabel>{t('filters.yearBuilt', 'Year built')}</SectionLabel>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="mb-1 text-xs text-muted-foreground">{t('filters.from', 'From')}</p>
            <Input
              type="number"
              placeholder="1900"
              value={yearBuiltMin ?? ''}
              onChange={(e) => onYearBuiltMinChange(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <span className="mt-5 text-muted-foreground">–</span>
          <div className="flex-1">
            <p className="mb-1 text-xs text-muted-foreground">{t('filters.to', 'To')}</p>
            <Input
              type="number"
              placeholder="2026"
              value={yearBuiltMax ?? ''}
              onChange={(e) => onYearBuiltMaxChange(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>
      </div>

      {/* Parking */}
      <div>
        <SectionLabel>{t('filters.parking', 'Parking spaces')}</SectionLabel>
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <Toggle
              key={n}
              pressed={parkingMin === n}
              onPressedChange={() => onParkingMinChange(parkingMin === n ? null : n)}
              variant="outline"
              className={PILL_CLASS}
            >
              {n}+
            </Toggle>
          ))}
        </div>
      </div>

      {/* Furnished */}
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <Label htmlFor="furnished-switch" className="text-sm font-normal">
          {t('filters.furnishedOnly', 'Furnished only')}
        </Label>
        <Switch
          id="furnished-switch"
          checked={furnished === true}
          onCheckedChange={(v) => onFurnishedChange(v ? true : null)}
        />
      </div>
    </div>
  )
}
