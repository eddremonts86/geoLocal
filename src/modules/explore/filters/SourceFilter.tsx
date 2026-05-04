import { useTranslation } from 'react-i18next'
import { Toggle } from '@/components/ui/toggle'

interface SourceFilterProps {
  sourceKind: 'user' | 'scraped' | null
  scrapedSource: string[] | null
  onSourceKindChange: (val: 'user' | 'scraped' | null) => void
  onScrapedSourceChange: (val: string[] | null) => void
}

const PILL_CLASS =
  'rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background'

/**
 * Mirrors the registry seeded in `drizzle/0008_scraping_sources_registry.sql`.
 * Keep the keys in sync with `scraping_sources.key`.
 */
const SCRAPED_SOURCES: { key: string; label: string }[] = [
  { key: 'airbnb', label: 'Airbnb' },
  { key: 'facebook', label: 'Facebook Pages' },
  { key: 'facebook-events', label: 'Facebook Events' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'edc', label: 'EDC' },
  { key: 'homestra', label: 'Homestra' },
  { key: 'boligsiden', label: 'Boligsiden' },
  { key: 'boliga', label: 'Boliga' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

export function SourceFilter({
  sourceKind, scrapedSource, onSourceKindChange, onScrapedSourceChange,
}: SourceFilterProps) {
  const { t } = useTranslation()

  const toggleSource = (key: string) => {
    const current = scrapedSource ?? []
    if (current.includes(key)) {
      const next = current.filter((x) => x !== key)
      onScrapedSourceChange(next.length ? next : null)
    } else {
      onScrapedSourceChange([...current, key])
    }
  }

  return (
    <div className="space-y-4">
      {/* Origin */}
      <div>
        <SectionLabel>{t('filters.origin', 'Origin')}</SectionLabel>
        <div className="flex gap-2">
          <Toggle
            pressed={sourceKind === 'user'}
            onPressedChange={() => onSourceKindChange(sourceKind === 'user' ? null : 'user')}
            variant="outline"
            className={PILL_CLASS}
          >
            {t('filters.userListings', 'User listings')}
          </Toggle>
          <Toggle
            pressed={sourceKind === 'scraped'}
            onPressedChange={() => onSourceKindChange(sourceKind === 'scraped' ? null : 'scraped')}
            variant="outline"
            className={PILL_CLASS}
          >
            {t('filters.aggregated', 'Aggregated')}
          </Toggle>
        </div>
      </div>

      {/* Specific scraped source — only meaningful when sourceKind != 'user' */}
      {sourceKind !== 'user' && (
        <div>
          <SectionLabel>{t('filters.scrapedSource', 'Sources')}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {SCRAPED_SOURCES.map(({ key, label }) => (
              <Toggle
                key={key}
                pressed={!!scrapedSource?.includes(key)}
                onPressedChange={() => toggleSource(key)}
                variant="outline"
                className={PILL_CLASS}
              >
                {label}
              </Toggle>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
