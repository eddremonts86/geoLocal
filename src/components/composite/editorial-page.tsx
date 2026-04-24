import { m } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { EDITORIAL_EASE } from '@/modules/listings/model/display'
import { Footer } from '@/components/ui/footer'

export interface EditorialPageProps {
  /** Section tag like "03 · Company". */
  eyebrow: string
  /** Large serif headline. */
  title: string
  /** Optional lede paragraph shown under the title. */
  lede?: string
  children: ReactNode
}

/**
 * Shared editorial layout for static pages (about, press, legal, etc.).
 * Matches the Copenhagen design system used by the landing hero.
 */
export function EditorialPage({ eyebrow, title, lede, children }: EditorialPageProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-background">
      <article className="mx-auto max-w-[1400px] px-6 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28 lg:pt-32">
        {/* Masthead strip */}
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EDITORIAL_EASE }}
          className="mb-10 flex items-baseline gap-6"
        >
          <span className="meta-label">{t('editorial.established', 'Copenhagen · Est. 2026')}</span>
          <div className="h-px flex-1 bg-border" />
          <span className="meta-label hidden md:inline">{eyebrow}</span>
        </m.div>

        {/* Headline */}
        <m.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EDITORIAL_EASE, delay: 0.08 }}
          className="font-display max-w-[18ch] text-[clamp(2.5rem,1.8rem+4vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.025em] text-foreground"
        >
          {title}
        </m.h1>

        {lede && (
          <m.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EDITORIAL_EASE, delay: 0.18 }}
            className="mt-8 max-w-[60ch] text-lg leading-[1.55] md:text-xl"
            style={{ color: 'var(--ink-2)' }}
          >
            {lede}
          </m.p>
        )}

        {/* Rule + body */}
        <div className="mt-14 h-px bg-border md:mt-20" />

        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EDITORIAL_EASE, delay: 0.24 }}
          className="mt-12 md:mt-16"
        >
          {children}
        </m.div>
      </article>

      <Footer />
    </div>
  )
}

/**
 * Section heading used inside the editorial body.
 * Renders a numbered meta-label + underline + Fraunces subtitle.
 */
export function EditorialSection({
  number,
  label,
  title,
  children,
}: {
  number: string
  label: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="grid grid-cols-12 gap-x-6 gap-y-4 py-10 md:py-14">
      <div className="col-span-12 md:col-span-4">
        <p className="meta-label" style={{ color: 'var(--ink-3)' }}>
          {number} · {label}
        </p>
        <h2 className="font-display mt-4 text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-medium leading-[1.05] tracking-[-0.015em] text-foreground">
          {title}
        </h2>
      </div>
      <div
        className="col-span-12 space-y-5 text-base leading-[1.7] md:col-span-7 md:col-start-6"
        style={{ color: 'var(--ink-2)' }}
      >
        {children}
      </div>
    </section>
  )
}
