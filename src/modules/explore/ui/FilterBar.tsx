import { useTranslation } from 'react-i18next'
import { m, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { PropertyFilters } from '@/modules/explore/filters/PropertyFilters'
import { VehicleFilters } from '@/modules/explore/filters/VehicleFilters'
import { ServiceFilters } from '@/modules/explore/filters/ServiceFilters'
import type { ListingCategory, TransactionType, FuelType, TransmissionType } from '@/modules/listings/model/types'

interface FilterBarProps {
  category: ListingCategory | null
  transactionType: TransactionType | null
  priceMin: number | null
  priceMax: number | null
  // Property
  beds: string[] | null
  baths: number | null
  areaMin: number | null
  areaMax: number | null
  // Vehicle
  subCategory: string[] | null
  make: string[] | null
  yearMin: number | null
  yearMax: number | null
  fuelType: FuelType[] | null
  transmission: TransmissionType | null
  // Service
  experienceMin: number | null
  // Actions
  onTransactionTypeChange: (val: TransactionType | null) => void
  onPriceMinChange: (val: number | null) => void
  onPriceMaxChange: (val: number | null) => void
  onBedsChange: (val: string[] | null) => void
  onBathsChange: (val: number | null) => void
  onAreaMinChange: (val: number | null) => void
  onAreaMaxChange: (val: number | null) => void
  onSubCategoryChange: (val: string[] | null) => void
  onMakeChange: (val: string[] | null) => void
  onYearMinChange: (val: number | null) => void
  onYearMaxChange: (val: number | null) => void
  onFuelTypeChange: (val: FuelType[] | null) => void
  onTransmissionChange: (val: TransmissionType | null) => void
  onExperienceMinChange: (val: number | null) => void
  onClearAll: () => void
  activeFilterCount: number
}

export function FilterBar(props: FilterBarProps) {
  const { t } = useTranslation()

  const txOptions: { value: TransactionType; label: string }[] =
    props.category === 'service'
      ? [{ value: 'hire', label: t('landing.hire', 'Hire') }]
      : [
          { value: 'buy', label: t('filters.sale', 'Buy') },
          { value: 'rent', label: t('filters.rent', 'Rent') },
        ]

  return (
    <div className="space-y-4 p-4">
      {/* Transaction type */}
      <div className="flex gap-1.5">
        {txOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={props.transactionType === opt.value ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() =>
              props.onTransactionTypeChange(props.transactionType === opt.value ? null : opt.value)
            }
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Price range */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">{t('filters.priceRange', 'Price Range')}</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min DKK"
            value={props.priceMin ?? ''}
            onChange={(e) => props.onPriceMinChange(e.target.value ? Number(e.target.value) : null)}
            className="h-8 text-xs"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max DKK"
            value={props.priceMax ?? ''}
            onChange={(e) => props.onPriceMaxChange(e.target.value ? Number(e.target.value) : null)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      <Separator />

      {/* Category-specific filters */}
      <AnimatePresence mode="wait">
        {props.category === 'property' && (
          <m.div
            key="property-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PropertyFilters
              beds={props.beds}
              baths={props.baths}
              areaMin={props.areaMin}
              areaMax={props.areaMax}
              onBedsChange={props.onBedsChange}
              onBathsChange={props.onBathsChange}
              onAreaMinChange={props.onAreaMinChange}
              onAreaMaxChange={props.onAreaMaxChange}
            />
          </m.div>
        )}
        {props.category === 'vehicle' && (
          <m.div
            key="vehicle-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <VehicleFilters
              subCategory={props.subCategory}
              make={props.make}
              yearMin={props.yearMin}
              yearMax={props.yearMax}
              fuelType={props.fuelType}
              transmission={props.transmission}
              onSubCategoryChange={props.onSubCategoryChange}
              onMakeChange={props.onMakeChange}
              onYearMinChange={props.onYearMinChange}
              onYearMaxChange={props.onYearMaxChange}
              onFuelTypeChange={props.onFuelTypeChange}
              onTransmissionChange={props.onTransmissionChange}
            />
          </m.div>
        )}
        {props.category === 'service' && (
          <m.div
            key="service-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ServiceFilters
              experienceMin={props.experienceMin}
              onExperienceMinChange={props.onExperienceMinChange}
            />
          </m.div>
        )}
      </AnimatePresence>

      {/* Active filter tags */}
      {props.activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <AnimatePresence>
            {props.transactionType && (
              <m.div
                key="tx"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge variant="secondary" className="gap-1 text-xs">
                  {props.transactionType}
                  <button onClick={() => props.onTransactionTypeChange(null)}><X className="h-3 w-3" /></button>
                </Badge>
              </m.div>
            )}
            {props.priceMin != null && (
              <m.div key="pmin" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <Badge variant="secondary" className="gap-1 text-xs">
                  ≥ {props.priceMin.toLocaleString()} DKK
                  <button onClick={() => props.onPriceMinChange(null)}><X className="h-3 w-3" /></button>
                </Badge>
              </m.div>
            )}
            {props.priceMax != null && (
              <m.div key="pmax" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <Badge variant="secondary" className="gap-1 text-xs">
                  ≤ {props.priceMax.toLocaleString()} DKK
                  <button onClick={() => props.onPriceMaxChange(null)}><X className="h-3 w-3" /></button>
                </Badge>
              </m.div>
            )}
          </AnimatePresence>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={props.onClearAll}>
            {t('filters.clearAll', 'Clear all')}
          </Button>
        </div>
      )}
    </div>
  )
}
