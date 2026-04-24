import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { m } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { homeStatsQueryOptions } from '@/modules/listings/api/queries'
import { MapView, type MapMarker } from '@/modules/map/ui/MapView'
import { EDITORIAL_EASE as EASE } from '@/modules/listings/model/display'
import { HomeSearchBar } from './HomeSearchBar'

export function HomeHero() {
  const { t, i18n } = useTranslation()
  const { data } = useQuery(homeStatsQueryOptions(i18n.language))

  const markers: MapMarker[] =
    data?.heroMarkers?.filter((m) => m.latitude != null && m.longitude != null).map((m) => ({
      id: m.id,
      slug: m.slug,
      category: m.category,
      price: m.price,
      currency: m.currency,
      latitude: m.latitude,
      longitude: m.longitude,
    })) ?? []

  const stats = [
    { n: data?.total ?? 0, label: t('landing.stats.listings', 'listings') },
    { n: 4, label: t('landing.stats.verticals', 'verticals') },
    { n: data?.neighborhoods.length ?? 0, label: t('landing.stats.neighborhoods', 'neighborhoods') },
  ]

  return (
    <section className="relative mx-auto max-w-[1400px] px-6 pb-14 pt-14 md:px-10 md:pb-20 md:pt-20 lg:pt-24">
      {/* Meta strip */}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-10 flex flex-wrap items-baseline gap-4 md:gap-6"
      >
        <span className="meta-label">{t('editorial.established', 'Copenhagen · Est. 2026')}</span>
        <div className="hidden h-px flex-1 bg-border md:block" />
        <div className="flex items-baseline gap-4 md:gap-5">
          {stats.map((s, i) => (
            <span key={i} className="flex items-baseline gap-1.5">
              <span className="font-display text-sm font-medium tabular-nums" style={{ color: 'var(--ink-1)' }}>
                {s.n.toLocaleString(i18n.language === 'es' ? 'es-ES' : 'en-DK')}
              </span>
              <span className="meta-label" style={{ color: 'var(--ink-3)' }}>{s.label}</span>
            </span>
          ))}
        </div>
      </m.div>

      {/* Split body */}
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        {/* LEFT — copy + search */}
        <div className="col-span-12 lg:col-span-7">
          <m.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
            className="font-display text-[clamp(3rem,1.6rem+6vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.025em] text-foreground"
          >
            {t('landing.hero', '¿Qué estás buscando?')}
          </m.h1>
          <m.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
            className="mt-6 max-w-prose text-base leading-relaxed md:text-lg md:leading-[1.55]"
            style={{ color: 'var(--ink-2)' }}
          >
            {t(
              'landing.subtitleLong',
              'A quiet, hand-curated marketplace for Copenhagen. Properties, vehicles, services and experiences — one map, one conversation.',
            )}
          </m.p>

          <div className="mt-8 md:mt-10">
            <HomeSearchBar />
          </div>

          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
            className="mt-6"
          >
            <Link
              to="/explore"
              className="group inline-flex items-center gap-2 text-sm transition-colors hover:text-foreground"
              style={{ color: 'var(--ink-3)' }}
            >
              <span className="meta-label">{t('landing.openTheMap', 'or browse everything on the map')}</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </m.div>
        </div>

        {/* RIGHT — ambient map */}
        <m.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className="relative col-span-12 lg:col-span-5"
        >
          <Link
            to="/explore"
            className="group relative block h-[320px] overflow-hidden border md:h-[440px] lg:h-[520px]"
            style={{ borderColor: 'var(--line-1)' }}
          >
            <div className="pointer-events-none absolute inset-0">
              <MapView
                markers={markers}
                hideToolbar
                hideNavControls
                interactive={false}
                center={[12.5683, 55.6761]}
                zoom={11}
              />
            </div>
            {/* Gradient edge so markers don't clash visually with the page */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.12) 100%)',
              }}
            />
            {/* Floating caption */}
            <div
              className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-xs"
              style={{ color: 'var(--surface-0)' }}
            >
              <div
                className="inline-flex items-center gap-2 border bg-background/90 px-2.5 py-1.5 backdrop-blur-sm"
                style={{ borderColor: 'var(--line-1)', color: 'var(--ink-1)' }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--amber)' }}
                  aria-hidden
                />
                <span className="meta-label">
                  {t('landing.liveMap', 'Live map · Copenhagen')}
                </span>
              </div>
              <span
                className="inline-flex items-center gap-1 border bg-background/90 px-2.5 py-1.5 text-xs backdrop-blur-sm transition-colors group-hover:border-(--amber) group-hover:text-(--amber-ink)"
                style={{ borderColor: 'var(--line-1)', color: 'var(--ink-2)' }}
              >
                <span className="meta-label">{t('landing.openMap', 'Open the map')}</span>
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
              </span>
            </div>
          </Link>
        </m.div>
      </div>
    </section>
  )
}
