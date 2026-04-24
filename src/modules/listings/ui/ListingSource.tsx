import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SOURCE_LABELS: Record<string, string> = {
  airbnb: 'Airbnb',
  facebook: 'Facebook',
  'facebook-events': 'Facebook Events',
  linkedin: 'LinkedIn',
  edc: 'EDC',
  boliga: 'Boliga',
  homestra: 'Homestra',
  boligsiden: 'Boligsiden',
}

const SOURCE_COLORS: Record<string, string> = {
  airbnb: '#FF5A5F',
  facebook: '#1877F2',
  'facebook-events': '#9333EA',
  linkedin: '#0A66C2',
  edc: '#E30613',
  boliga: '#0B6EAD',
  homestra: '#1F6F54',
  boligsiden: '#003865',
}

interface ListingSourceProps {
  scrapedSource: string | null | undefined
  scrapedSourceUrl: string | null | undefined
  variant?: 'inline' | 'block'
}

/**
 * Editorial attribution chip. When `variant='block'` it renders a full
 * card suitable for the sidebar; `variant='inline'` is a slim tag.
 */
export function ListingSource({ scrapedSource, scrapedSourceUrl, variant = 'block' }: ListingSourceProps) {
  const { t } = useTranslation()
  if (!scrapedSource) return null

  const label = SOURCE_LABELS[scrapedSource] ?? scrapedSource
  const color = SOURCE_COLORS[scrapedSource] ?? 'var(--ink-2)'
  const href = scrapedSourceUrl ?? undefined

  if (variant === 'inline') {
    const Wrapper: any = href ? 'a' : 'span'
    return (
      <Wrapper
        href={href}
        target={href ? '_blank' : undefined}
        rel={href ? 'noopener noreferrer' : undefined}
        className="inline-flex items-center gap-1 text-[0.7rem] font-medium underline-offset-2 hover:underline"
        style={{ color }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        {label}
        {href && <ExternalLink className="h-2.5 w-2.5" />}
      </Wrapper>
    )
  }

  return (
    <div className="border p-4" style={{ borderColor: 'var(--line-1)' }}>
      <div className="meta-label mb-2" style={{ color: 'var(--ink-3)' }}>
        {t('listing.sourceOriginally', 'Originally published on')}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--ink-1)' }}>
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          {label}
        </div>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
            style={{ color: 'var(--amber-ink)' }}
          >
            {t('listing.viewOriginal', 'View original')}
            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </div>
  )
}
