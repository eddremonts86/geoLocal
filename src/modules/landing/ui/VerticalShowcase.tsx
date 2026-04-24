import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { m } from 'framer-motion'
import { Home, Car, Wrench, Sparkles, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { homeStatsQueryOptions } from '@/modules/listings/api/queries'
import { EDITORIAL_EASE as EASE } from '@/modules/listings/model/display'

const PLACEHOLDER = '/img-placeholder.svg'
const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = PLACEHOLDER
  e.currentTarget.onerror = null
}

interface Vertical {
  id: 'property' | 'vehicle' | 'service' | 'experience'
  number: string
  icon: LucideIcon
  titleKey: string
  titleFallback: string
  descKey: string
  descFallback: string
  accent: string
}

const VERTICALS: Vertical[] = [
  {
    id: 'property',
    number: '01',
    icon: Home,
    titleKey: 'landing.properties',
    titleFallback: 'Properties',
    descKey: 'landing.propertiesDesc',
    descFallback: 'Houses, flats, land and more',
    accent: 'var(--amber-ink)',
  },
  {
    id: 'vehicle',
    number: '02',
    icon: Car,
    titleKey: 'landing.vehicles',
    titleFallback: 'Vehicles',
    descKey: 'landing.vehiclesDesc',
    descFallback: 'Cars, bikes, boats and more',
    accent: '#2d6a4f',
  },
  {
    id: 'service',
    number: '03',
    icon: Wrench,
    titleKey: 'landing.services',
    titleFallback: 'Services',
    descKey: 'landing.servicesDesc',
    descFallback: 'Trades, tutors, craftspeople',
    accent: '#9e2a2b',
  },
  {
    id: 'experience',
    number: '04',
    icon: Sparkles,
    titleKey: 'landing.experiences',
    titleFallback: 'Experiences',
    descKey: 'landing.experiencesDesc',
    descFallback: 'Tours, workshops, unique things',
    accent: '#5b3a91',
  },
]

export function VerticalShowcase() {
  const { t, i18n } = useTranslation()
  const { data } = useQuery(homeStatsQueryOptions(i18n.language))

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
      <div className="mb-10 flex items-baseline justify-between gap-4">
        <span className="meta-label">02 · {t('landing.verticalsLabel', 'Verticals')}</span>
        <span className="meta-label hidden md:inline" style={{ color: 'var(--ink-4)' }}>
          {t('editorial.fourCategories', 'Four categories')}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-px bg-(--line-1) md:grid-cols-2">
        {VERTICALS.map((v, i) => {
          const count = data?.categoryCounts[v.id] ?? 0
          const samples = data?.samples[v.id] ?? []
          const Icon = v.icon
          const hero = samples[0]
          const thumbs = samples.slice(1, 3)

          return (
            <m.div
              key={v.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
              className="bg-background"
            >
              <Link
                to="/explore"
                className="group block p-6 transition-colors hover:bg-(--surface-2) md:p-8"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="meta-label tabular-nums" style={{ color: v.accent }}>
                      {v.number} / {v.id}
                    </span>
                  </div>
                  <Icon
                    className="h-5 w-5 transition-colors"
                    strokeWidth={1.5}
                    style={{ color: 'var(--ink-3)' }}
                  />
                </div>

                {/* Imagery grid */}
                <div className="mb-6 grid h-48 grid-cols-[2fr_1fr] gap-1.5 md:h-56">
                  <div className="relative h-full overflow-hidden bg-(--surface-2)">
                    {hero?.coverUrl ? (
                      <img
                        src={hero.coverUrl}
                        alt={hero.title}
                        onError={handleImgError}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Icon className="h-10 w-10" strokeWidth={1} style={{ color: 'var(--ink-4)' }} />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-rows-2 gap-1.5">
                    {[0, 1].map((idx) => {
                      const thumb = thumbs[idx]
                      return (
                        <div
                          key={idx}
                          className="relative h-full overflow-hidden bg-(--surface-2)"
                        >
                          {thumb?.coverUrl ? (
                            <img
                              src={thumb.coverUrl}
                              alt={thumb.title}
                              onError={handleImgError}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Title + desc */}
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <h3 className="font-display text-3xl font-medium leading-none tracking-[-0.015em] text-foreground md:text-4xl">
                      {t(v.titleKey, v.titleFallback)}
                    </h3>
                    <p className="mt-2 text-sm" style={{ color: 'var(--ink-2)' }}>
                      {t(v.descKey, v.descFallback)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="font-display text-2xl font-medium tabular-nums leading-none text-foreground">
                        {count.toLocaleString(i18n.language === 'es' ? 'es-ES' : 'en-DK')}
                      </p>
                      <p className="meta-label mt-1" style={{ color: 'var(--ink-3)' }}>
                        {t('landing.listings', 'listings')}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                      style={{ color: 'var(--ink-2)' }}
                    />
                  </div>
                </div>
              </Link>
            </m.div>
          )
        })}
      </div>
    </section>
  )
}
