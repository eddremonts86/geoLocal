import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Toggle } from '@/components/ui/toggle'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PropertyFilters } from '@/modules/explore/filters/PropertyFilters'
import { VehicleFilters } from '@/modules/explore/filters/VehicleFilters'
import { ServiceFilters } from '@/modules/explore/filters/ServiceFilters'
import { ExperienceFilters } from '@/modules/explore/filters/ExperienceFilters'
import { SourceFilter } from '@/modules/explore/filters/SourceFilter'
import type { ListingCategory, TransactionType, FuelType, TransmissionType } from '@/modules/listings/model/types'

const PILL_CLASS =
  'rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background'

export interface FiltersSheetProps {
  open: boolean
  onClose: () => void
  total: number
  category: ListingCategory | null
  transactionType: TransactionType | null
  priceMin: number | null
  priceMax: number | null
  // Source provenance
  sourceKind: 'user' | 'scraped' | null
  scrapedSource: string[] | null
  // Property
  beds: string[] | null
  baths: number | null
  areaMin: number | null
  areaMax: number | null
  yearBuiltMin: number | null
  yearBuiltMax: number | null
  parkingMin: number | null
  furnished: boolean | null
  // Vehicle
  subCategory: string[] | null
  make: string[] | null
  yearMin: number | null
  yearMax: number | null
  fuelType: FuelType[] | null
  transmission: TransmissionType | null
  mileageMax: number | null
  doorsMin: number | null
  colors: string[] | null
  // Service
  experienceMin: number | null
  serviceRadiusMin: number | null
  responseTime: 'within_hour' | 'same_day' | 'few_days' | null
  certified: boolean | null
  // Experience
  durationMin: number | null
  durationMax: number | null
  groupMax: number | null
  minAgeMax: number | null
  languages: string[] | null
  difficulty: 'easy' | 'moderate' | 'hard' | null

  activeFilterCount: number
  onTransactionTypeChange: (val: TransactionType | null) => void
  onPriceMinChange: (val: number | null) => void
  onPriceMaxChange: (val: number | null) => void
  onSourceKindChange: (val: 'user' | 'scraped' | null) => void
  onScrapedSourceChange: (val: string[] | null) => void
  onBedsChange: (val: string[] | null) => void
  onBathsChange: (val: number | null) => void
  onAreaMinChange: (val: number | null) => void
  onAreaMaxChange: (val: number | null) => void
  onYearBuiltMinChange: (val: number | null) => void
  onYearBuiltMaxChange: (val: number | null) => void
  onParkingMinChange: (val: number | null) => void
  onFurnishedChange: (val: boolean | null) => void
  onSubCategoryChange: (val: string[] | null) => void
  onMakeChange: (val: string[] | null) => void
  onYearMinChange: (val: number | null) => void
  onYearMaxChange: (val: number | null) => void
  onFuelTypeChange: (val: FuelType[] | null) => void
  onTransmissionChange: (val: TransmissionType | null) => void
  onMileageMaxChange: (val: number | null) => void
  onDoorsMinChange: (val: number | null) => void
  onColorsChange: (val: string[] | null) => void
  onExperienceMinChange: (val: number | null) => void
  onServiceRadiusMinChange: (val: number | null) => void
  onResponseTimeChange: (val: 'within_hour' | 'same_day' | 'few_days' | null) => void
  onCertifiedChange: (val: boolean | null) => void
  onDurationMinChange: (val: number | null) => void
  onDurationMaxChange: (val: number | null) => void
  onGroupMaxChange: (val: number | null) => void
  onMinAgeMaxChange: (val: number | null) => void
  onLanguagesChange: (val: string[] | null) => void
  onDifficultyChange: (val: 'easy' | 'moderate' | 'hard' | null) => void
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

  const categoryLabel =
    props.category === 'property' ? t('filters.propertyDetails', 'Property details')
    : props.category === 'vehicle' ? t('filters.vehicleDetails', 'Vehicle details')
    : props.category === 'service' ? t('filters.serviceDetails', 'Service details')
    : props.category === 'experience' ? t('filters.experienceDetails', 'Experience details')
    : null

  const defaultOpen = ['type', 'price', 'source']
  if (categoryLabel) defaultOpen.push('category')

  return (
    <Sheet open={props.open} onOpenChange={(o) => !o && props.onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-base font-medium">
              {t('filters.filters', 'Filters')}
              {props.activeFilterCount > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-medium text-background">
                  {props.activeFilterCount}
                </span>
              )}
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
          <div className="px-6 py-2">
            <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
              {/* Transaction type */}
              <AccordionItem value="type">
                <AccordionTrigger>{t('filters.type', 'Type')}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2 pt-2">
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
                        className={PILL_CLASS}
                      >
                        {opt.label}
                      </Toggle>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Price */}
              <AccordionItem value="price">
                <AccordionTrigger>{t('filters.priceRange', 'Price range')}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center gap-3 pt-2">
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
                </AccordionContent>
              </AccordionItem>

              {/* Source provenance */}
              <AccordionItem value="source">
                <AccordionTrigger>{t('filters.source', 'Source')}</AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <SourceFilter
                      sourceKind={props.sourceKind}
                      scrapedSource={props.scrapedSource}
                      onSourceKindChange={props.onSourceKindChange}
                      onScrapedSourceChange={props.onScrapedSourceChange}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Category-specific */}
              {categoryLabel && (
                <AccordionItem value="category">
                  <AccordionTrigger>{categoryLabel}</AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2">
                      {props.category === 'property' && (
                        <PropertyFilters
                          subCategory={props.subCategory}
                          beds={props.beds}
                          baths={props.baths}
                          areaMin={props.areaMin}
                          areaMax={props.areaMax}
                          yearBuiltMin={props.yearBuiltMin}
                          yearBuiltMax={props.yearBuiltMax}
                          parkingMin={props.parkingMin}
                          furnished={props.furnished}
                          onSubCategoryChange={props.onSubCategoryChange}
                          onBedsChange={props.onBedsChange}
                          onBathsChange={props.onBathsChange}
                          onAreaMinChange={props.onAreaMinChange}
                          onAreaMaxChange={props.onAreaMaxChange}
                          onYearBuiltMinChange={props.onYearBuiltMinChange}
                          onYearBuiltMaxChange={props.onYearBuiltMaxChange}
                          onParkingMinChange={props.onParkingMinChange}
                          onFurnishedChange={props.onFurnishedChange}
                        />
                      )}
                      {props.category === 'vehicle' && (
                        <VehicleFilters
                          subCategory={props.subCategory}
                          make={props.make}
                          yearMin={props.yearMin}
                          yearMax={props.yearMax}
                          fuelType={props.fuelType}
                          transmission={props.transmission}
                          mileageMax={props.mileageMax}
                          doorsMin={props.doorsMin}
                          colors={props.colors}
                          onSubCategoryChange={props.onSubCategoryChange}
                          onMakeChange={props.onMakeChange}
                          onYearMinChange={props.onYearMinChange}
                          onYearMaxChange={props.onYearMaxChange}
                          onFuelTypeChange={props.onFuelTypeChange}
                          onTransmissionChange={props.onTransmissionChange}
                          onMileageMaxChange={props.onMileageMaxChange}
                          onDoorsMinChange={props.onDoorsMinChange}
                          onColorsChange={props.onColorsChange}
                        />
                      )}
                      {props.category === 'service' && (
                        <ServiceFilters
                          subCategory={props.subCategory}
                          experienceMin={props.experienceMin}
                          serviceRadiusMin={props.serviceRadiusMin}
                          responseTime={props.responseTime}
                          certified={props.certified}
                          onSubCategoryChange={props.onSubCategoryChange}
                          onExperienceMinChange={props.onExperienceMinChange}
                          onServiceRadiusMinChange={props.onServiceRadiusMinChange}
                          onResponseTimeChange={props.onResponseTimeChange}
                          onCertifiedChange={props.onCertifiedChange}
                        />
                      )}
                      {props.category === 'experience' && (
                        <ExperienceFilters
                          subCategory={props.subCategory}
                          durationMin={props.durationMin}
                          durationMax={props.durationMax}
                          groupMax={props.groupMax}
                          minAgeMax={props.minAgeMax}
                          languages={props.languages}
                          difficulty={props.difficulty}
                          onSubCategoryChange={props.onSubCategoryChange}
                          onDurationMinChange={props.onDurationMinChange}
                          onDurationMaxChange={props.onDurationMaxChange}
                          onGroupMaxChange={props.onGroupMaxChange}
                          onMinAgeMaxChange={props.onMinAgeMaxChange}
                          onLanguagesChange={props.onLanguagesChange}
                          onDifficultyChange={props.onDifficultyChange}
                        />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
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
