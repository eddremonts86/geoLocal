import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import type { FuelType, TransmissionType, VehicleSubCategory } from '@/modules/listings/model/types'
import { VEHICLE_SUBCATEGORIES } from '@/modules/listings/model/types'

interface VehicleFiltersProps {
  subCategory: string[] | null
  make: string[] | null
  yearMin: number | null
  yearMax: number | null
  fuelType: FuelType[] | null
  transmission: TransmissionType | null
  onSubCategoryChange: (val: string[] | null) => void
  onMakeChange: (makes: string[] | null) => void
  onYearMinChange: (val: number | null) => void
  onYearMaxChange: (val: number | null) => void
  onFuelTypeChange: (types: FuelType[] | null) => void
  onTransmissionChange: (val: TransmissionType | null) => void
}

const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
]

const POPULAR_MAKES = ['Toyota', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Tesla', 'Ford', 'Hyundai', 'Volvo', 'Peugeot']

const PILL_CLASS = 'rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

export function VehicleFilters({
  subCategory, make, yearMin, yearMax, fuelType, transmission,
  onSubCategoryChange, onMakeChange, onYearMinChange, onYearMaxChange, onFuelTypeChange, onTransmissionChange,
}: VehicleFiltersProps) {
  const { t } = useTranslation()

  const toggleSubCat = (val: VehicleSubCategory) => {
    const current = subCategory ?? []
    if (current.includes(val)) {
      const next = current.filter((x) => x !== val)
      onSubCategoryChange(next.length ? next : null)
    } else {
      onSubCategoryChange([...current, val])
    }
  }

  const toggleMake = (m: string) => {
    const current = make ?? []
    if (current.includes(m)) {
      const next = current.filter((x) => x !== m)
      onMakeChange(next.length ? next : null)
    } else {
      onMakeChange([...current, m])
    }
  }

  const toggleFuel = (f: FuelType) => {
    const current = fuelType ?? []
    if (current.includes(f)) {
      const next = current.filter((x) => x !== f)
      onFuelTypeChange(next.length ? next : null)
    } else {
      onFuelTypeChange([...current, f])
    }
  }

  return (
    <div className="space-y-6">
      {/* Vehicle type */}
      <div>
        <SectionLabel>{t('filters.vehicleType', 'Vehicle type')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_SUBCATEGORIES.map((val) => (
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

      {/* Make */}
      <div>
        <SectionLabel>{t('filters.make', 'Make')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {POPULAR_MAKES.map((m) => (
            <Toggle
              key={m}
              pressed={!!make?.includes(m)}
              onPressedChange={() => toggleMake(m)}
              variant="outline"
              className={PILL_CLASS}
            >
              {m}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Year range */}
      <div>
        <SectionLabel>{t('filters.year', 'Year')}</SectionLabel>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="mb-1 text-xs text-muted-foreground">{t('filters.from', 'From')}</p>
            <Input
              type="number"
              placeholder="2000"
              value={yearMin ?? ''}
              onChange={(e) => onYearMinChange(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <span className="mt-5 text-muted-foreground">–</span>
          <div className="flex-1">
            <p className="mb-1 text-xs text-muted-foreground">{t('filters.to', 'To')}</p>
            <Input
              type="number"
              placeholder="2026"
              value={yearMax ?? ''}
              onChange={(e) => onYearMaxChange(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>
      </div>

      {/* Fuel type */}
      <div>
        <SectionLabel>{t('filters.fuelType', 'Fuel Type')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {FUEL_OPTIONS.map(({ value, label }) => (
            <Toggle
              key={value}
              pressed={!!fuelType?.includes(value)}
              onPressedChange={() => toggleFuel(value)}
              variant="outline"
              className={PILL_CLASS}
            >
              {label}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <SectionLabel>{t('filters.transmission', 'Transmission')}</SectionLabel>
        <div className="flex gap-2">
          {(['manual', 'automatic'] as const).map((val) => (
            <Toggle
              key={val}
              pressed={transmission === val}
              onPressedChange={() => onTransmissionChange(transmission === val ? null : val)}
              variant="outline"
              className={PILL_CLASS}
            >
              {val === 'manual' ? t('filters.manual', 'Manual') : t('filters.automatic', 'Automatic')}
            </Toggle>
          ))}
        </div>
      </div>
    </div>
  )
}

