import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface ListingStoryProps {
  description: string
  summary?: string | null
  sectionNumber?: string
}

/**
 * Split a long description string into readable paragraphs. Handles three cases:
 *   1) Text already contains blank-line breaks → respect them.
 *   2) Text contains sentence delimiters (". ") → chunk by ~3 sentences.
 *   3) Otherwise → return the whole string as a single paragraph.
 *
 * Also strips a trailing "Key property features include: ..." block so
 * <ListingHighlights> can render it separately without duplication.
 */
function splitParagraphs(raw: string): { paragraphs: string[]; trailingBullets: string | null } {
  const cleaned = raw.replace(/\s+/g, ' ').trim()

  // Extract "Key features include: ..." if present (handled by Highlights component)
  let trailingBullets: string | null = null
  const bulletsRegex = /key\s+(property|vehicle|service|experience)?\s*features?\s+include\s*:/i
  const bulletsMatch = cleaned.match(bulletsRegex)
  let body = cleaned
  if (bulletsMatch && bulletsMatch.index != null) {
    body = cleaned.slice(0, bulletsMatch.index).trim()
    trailingBullets = cleaned.slice(bulletsMatch.index + bulletsMatch[0].length).trim()
  }

  // 1) Already paragraphed
  if (/\n\n/.test(body)) {
    return {
      paragraphs: body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean),
      trailingBullets,
    }
  }

  // 2) Sentence-based chunking (~3 sentences per paragraph)
  const sentences = body.split(/(?<=[.!?])\s+(?=[A-Z])/g)
  if (sentences.length <= 1) {
    return { paragraphs: [body], trailingBullets }
  }

  const SENTENCES_PER_PARA = 3
  const paragraphs: string[] = []
  for (let i = 0; i < sentences.length; i += SENTENCES_PER_PARA) {
    paragraphs.push(sentences.slice(i, i + SENTENCES_PER_PARA).join(' ').trim())
  }
  return { paragraphs, trailingBullets }
}

/**
 * Editorial long-form narrative. First paragraph gets a drop cap. When the
 * description is long (> ~1,200 chars), the body is initially collapsed
 * behind a "Read more" fade.
 */
export function ListingStory({ description, summary, sectionNumber = '01' }: ListingStoryProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const { paragraphs } = useMemo(() => splitParagraphs(description), [description])
  const totalChars = description.length
  const isLong = totalChars > 1200

  if (paragraphs.length === 0) return null

  return (
    <section>
      <div className="meta-label mb-4">
        {sectionNumber} / {t('listing.description', 'The story')}
      </div>

      {summary && (
        <p
          className="mb-6 font-display text-lg font-normal italic leading-relaxed md:text-xl"
          style={{ color: 'var(--ink-2)' }}
        >
          {summary}
        </p>
      )}

      <div
        className={`relative transition-[max-height] duration-500 ${
          isLong && !expanded ? 'max-h-[36rem] overflow-hidden' : 'max-h-none'
        }`}
      >
        <div className="space-y-5 text-base leading-[1.75]" style={{ color: 'var(--ink-1)' }}>
          {paragraphs.map((p, idx) => {
            if (idx === 0) {
              // Drop cap: extract first letter
              const firstChar = p.charAt(0)
              const rest = p.slice(1)
              return (
                <p key={idx} className="first-paragraph">
                  <span
                    className="float-left mr-2 font-display font-medium leading-[0.9]"
                    style={{
                      fontSize: 'clamp(3.2rem, 2.2rem + 2.5vw, 5rem)',
                      color: 'var(--amber-ink)',
                      paddingTop: '0.1em',
                      paddingRight: '0.05em',
                    }}
                    aria-hidden="true"
                  >
                    {firstChar}
                  </span>
                  <span className="sr-only">{firstChar}</span>
                  {rest}
                </p>
              )
            }
            return (
              <p key={idx} className="max-w-[65ch]">
                {p}
              </p>
            )
          })}
        </div>

        {/* Fade overlay when collapsed */}
        {isLong && !expanded && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, var(--color-background) 85%)',
            }}
          />
        )}
      </div>

      {isLong && (
        <div className="mt-4">
          <Button
            variant="ghost"
            onClick={() => setExpanded((v) => !v)}
            className="h-auto gap-1.5 rounded-none px-0 py-1 text-sm hover:bg-transparent"
            style={{ color: 'var(--amber-ink)' }}
          >
            <span className="meta-label">
              {expanded
                ? t('listing.readLess', 'Read less')
                : t('listing.readMore', 'Read the full story')}
            </span>
          </Button>
        </div>
      )}
    </section>
  )
}
