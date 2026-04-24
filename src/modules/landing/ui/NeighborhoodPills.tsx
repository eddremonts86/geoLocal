import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { m } from 'framer-motion'
import { homeStatsQueryOptions } from '@/modules/listings/api/queries'
import { EDITORIAL_EASE as EASE } from '@/modules/listings/model/display'

export function NeighborhoodPills() {
  const { t, i18n } = useTranslation()
  const { data, isLoading } = useQuery(homeStatsQueryOptions(i18n.language))

  const pills = data?.neighborhoods ?? []
  if (!isLoading && pills.length === 0) return null

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 md:px-10 md:py-14">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <span className="meta-label">{t('editorial.neighborhoods', '01 · Neighborhoods')}</span>
        <span className="meta-label hidden md:inline" style={{ color: 'var(--ink-4)' }}>
          {t('landing.whereToLook', 'Where to look')}
        </span>
      </div>

      <m.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-wrap items-center gap-2"
      >
        {(isLoading ? Array.from({ length: 6 }) : pills).map((p, i) => {
          if (isLoading || !p) {
            return (
              <span
                key={i}
                className="h-9 w-28 animate-pulse border"
                style={{ borderColor: 'var(--line-1)', backgroundColor: 'var(--surface-2)' }}
              />
            )
          }
          const item = p as { label: string; count: number }
          return (
            <Link
              key={item.label}
              to="/explore"
              className="group inline-flex items-baseline gap-2 border px-3.5 py-2 transition-colors hover:border-(--amber) hover:bg-(--amber-soft)"
              style={{ borderColor: 'var(--line-1)' }}
            >
              <span className="font-display text-sm" style={{ color: 'var(--ink-1)' }}>
                {item.label}
              </span>
              <span className="text-[11px] tabular-nums" style={{ color: 'var(--ink-3)' }}>
                {item.count.toLocaleString(i18n.language === 'es' ? 'es-ES' : 'en-DK')}
              </span>
            </Link>
          )
        })}
      </m.div>
    </section>
  )
}
