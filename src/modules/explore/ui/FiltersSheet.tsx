import { useTranslation } from 'react-i18next'
import { m, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Toggle } from '@/components/ui/toggle'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { PropertyFilters } from '@/modules/explore/filters/PropertyFilters'
import { VehicleFilters } from '@/modules/explore/filters/VehicleFilters'
import { ServiceFilters } from '@/modules/explore/filters/ServiceFilters'
import { ExperienceFilters } from '@/modules/explore/filters/ExperienceFilters'
import type { ListingCategory, TransactionType, FuelType, TransmissionType } from '@/modules/listings/model/types'

interface FiltersSheetProps {
  open: boolean
  onClose: () => void
  total: number
  category: ListingCategory | null
  transactionType: TransactionType | null
  priceMin: number | null
  priceMax: number | null
  beds: string[] | null
  baths: number | null
  areaMin: number | null
  areaMax: number | null
  subCategory: string[] | null
  make: string[] | null
  yearMin: number | null
  yearMax: number | null
  fuelType: FuelType[] | null
  transmission: TransmissionType | null
  experienceMin: number | null
  activeFilterCount: number
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
}

export function FiltersSheet(props: FiltersSheetProps) {
  const { t } = useTranslation()

  const txOptions: { value: TransactionType; label: string }[] =
    props.category === 'service'
      ? [{ value: 'hire', label: t('landing.hire', 'Hire') }]
      : [
          { value: 'buy', label: t('filters.sale', 'Buy') },
          { value: 'rent', label: t('filters.rent', 'Rent') },
        ]

  return (
    <Sheet open={props.open} onOpenChange={(o) => !o && props.onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-base font-medium">
              {t('filters.filters', 'Filters')}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={props.onClose}
              className="h-8 w-8 rounded-full"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <ScrollArea className="flex-1">
          <div className="space-y-6 px-6 py-5">
            {/* Transaction type */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('filters.type', 'Type')}
              </p>
              <div className="flex gap-2">
                {txOptions.map((opt) => (
                  <Toggle
                    key={opt.value}
                    pressed={props.transactionType === opt.value}
                    onPressedChange={() =>
                      props.onTransactionTypeChange(
                        props.transactionType === opt.value ? null : opt.value,
                      )
                    }
                    variant="outline"
                    className="rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
                  >
                    {opt.label}
                  </Toggle>
                ))}
              </div>
            </div>

            <Separator />

            {/* Price range */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('filters.priceRange', 'Price Range')}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="mb-1 text-xs text-muted-foreground">{t('filters.min', 'Min')}</p>
                  <Input
                    type="number"
                    placeholder="0 DKK"
                    value={props.priceMin ?? ''}
                    onChange={(e) =>
                      props.onPriceMinChange(e.target.value ? Number(e.target.value) : null)
                    }
                  />
                </div>
                <span className="mt-5 text-muted-foreground">–</span>
                <div className="flex-1">
                  <p className="mb-1 text-xs text-muted-foreground">{t('filters.max', 'Max')}</p>
                  <Input
                    type="number"
                    placeholder="∞ DKK"
                    value={props.priceMax ?? ''}
                    onChange={(e) =>
                      props.onPriceMaxChange(e.target.value ? Number(e.target.value) : null)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Category-specific filters */}
            <AnimatePresence mode="wait">
              {props.category === 'property' && (
                <m.div
                  key="property"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Separator className="mb-6" />
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
                  key="vehicle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Separator className="mb-6" />
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
                  key="service"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Separator className="mb-6" />
                  <ServiceFilters
                    experienceMin={props.experienceMin}
                    onExperienceMinChange={props.onExperienceMinChange}
                  />
                </m.div>
              )}
              {props.category === 'experience' && (
                <m.div
                  key="experience"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Separator className="mb-6" />
                  <ExperienceFilters
                    subCategory={props.subCategory}
                    maxGuests={null}
                    durationMax={null}
                    onSubCategoryChange={props.onSubCategoryChange}
                    onMaxGuestsChange={() => {}}
                    onDurationMaxChange={() => {}}
                  />
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <Button
            variant="ghost"
            onClick={props.onClearAll}
            className="text-sm text-muted-foreground"
          >
            {t('filters.clearAll', 'Clear all')}
          </Button>
          <Button onClick={props.onClose} className="rounded-full px-6">
            {t('filters.showResults', { count: props.total })}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
