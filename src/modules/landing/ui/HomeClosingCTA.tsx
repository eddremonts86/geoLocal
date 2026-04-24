import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { m } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { EDITORIAL_EASE as EASE } from '@/modules/listings/model/display'

export function HomeClosingCTA() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-20 pt-10 md:px-10 md:pb-32 md:pt-20">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-120px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="border px-6 py-14 md:px-14 md:py-20"
        style={{ borderColor: 'var(--line-1)', backgroundColor: 'var(--surface-2)' }}
      >
        <div className="grid grid-cols-12 items-end gap-6">
          <div className="col-span-12 md:col-span-8">
            <span className="meta-label" style={{ color: 'var(--amber-ink)' }}>
              {t('editorial.closing', '06 · Your turn')}
            </span>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,1.4rem+4vw,5rem)] font-medium leading-[0.98] tracking-[-0.025em] text-foreground">
              {t('landing.closing.title', 'Own the block. Rent it. Sell it. Live it.')}
            </h2>
            <p className="mt-5 max-w-[52ch] text-base leading-relaxed md:text-lg" style={{ color: 'var(--ink-2)' }}>
              {t(
                'landing.closing.desc',
                'GeoLocal is free to browse. Listings are published by locals and lightly curated from the open web — no ads, no dark patterns, just a map and the city.',
              )}
            </p>
          </div>
          <div className="col-span-12 flex items-center gap-3 md:col-span-4 md:justify-end">
            <Link
              to="/explore"
              className="group inline-flex items-center gap-3 bg-foreground px-6 py-4 text-sm font-medium text-background transition-colors hover:bg-(--amber) hover:text-(--surface-0)"
            >
              <span>{t('landing.closing.cta', 'Start exploring')}</span>
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        </div>
      </m.div>
    </section>
  )
}
