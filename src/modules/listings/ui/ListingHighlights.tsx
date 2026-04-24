import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface ListingHighlightsProps {
  description: string
  features: string[]
  sectionNumber?: string
}

/**
 * Extract a bullet list from the tail of a description if it contains a
 * "Key features include: ... " block, otherwise fall back to DB features.
 * Splits by period and filters obvious non-bullet fragments.
 */
function extractBullets(description: string): string[] {
  const m = description.match(/key\s+(property|vehicle|service|experience)?\s*features?\s+include\s*:?(.+)$/is)
  if (!m) return []
  const tail = m[2]
  // Sentences separated by ". " — filter very short / very long
  const parts = tail
    .split(/(?<=\.)\s+(?=[A-Z])/g)
    .map((s) => s.replace(/\.$/, '').trim())
    .filter((s) => s.length >= 6 && s.length <= 120)
  return parts.slice(0, 16)
}

function humanizeFeature(code: string): string {
  return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ListingHighlights({ description, features, sectionNumber = '02' }: ListingHighlightsProps) {
  const { t } = useTranslation()

  const bullets = useMemo(() => {
    const fromDescription = extractBullets(description)
    if (fromDescription.length > 0) return fromDescription
    return features.map(humanizeFeature)
  }, [description, features])

  if (bullets.length === 0) return null

  return (
    <section>
      <div className="meta-label mb-4">
        {sectionNumber} / {t('listing.highlights', 'What makes it special')}
      </div>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2">
        {bullets.map((b, i) => (
          <li
            key={i}
            className="flex items-start gap-3 border-b py-3 text-sm leading-snug"
            style={{ borderColor: 'var(--line-1)', color: 'var(--ink-1)' }}
          >
            <span
              className="mt-[0.6em] block h-[0.3rem] w-[0.3rem] shrink-0 rounded-full"
              style={{ backgroundColor: 'var(--amber)' }}
              aria-hidden="true"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
