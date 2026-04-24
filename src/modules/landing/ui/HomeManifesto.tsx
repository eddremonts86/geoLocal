import { useTranslation } from 'react-i18next'
import { m } from 'framer-motion'
import { EDITORIAL_EASE as EASE } from '@/modules/listings/model/display'

export function HomeManifesto() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-32">
      <div className="grid grid-cols-12 gap-6">
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="col-span-12 md:col-span-1 md:col-start-2"
        >
          <span className="meta-label block" style={{ color: 'var(--amber-ink)' }}>
            {t('landing.manifesto.label', 'Manifesto')}
          </span>
        </m.div>

        <m.blockquote
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
          className="col-span-12 md:col-span-8"
        >
          <p className="font-display text-[clamp(1.75rem,1.1rem+2vw,2.75rem)] font-normal italic leading-[1.2] tracking-[-0.01em] text-foreground">
            {t(
              'landing.manifesto.body',
              'We believe a marketplace should feel like a neighbourhood. Slower than a feed, warmer than a database. Every listing here was either written by someone who lives here, or carefully curated from the open web — then stitched onto a single map so you can see, at a glance, where Copenhagen is moving.',
            )}
          </p>
          <footer className="mt-6 flex items-baseline gap-3">
            <span className="h-px w-10 bg-(--ink-3)" aria-hidden />
            <span className="meta-label" style={{ color: 'var(--ink-2)' }}>
              {t('landing.manifesto.signature', 'The editors · GeoLocal CPH')}
            </span>
          </footer>
        </m.blockquote>
      </div>
    </section>
  )
}
