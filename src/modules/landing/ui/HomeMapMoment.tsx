import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { m } from 'framer-motion'
import { ArrowUpRight, Expand } from 'lucide-react'
import { homeStatsQueryOptions } from '@/modules/listings/api/queries'
import { MapView, type MapMarker } from '@/modules/map/ui/MapView'
import { EDITORIAL_EASE as EASE } from '@/modules/listings/model/display'

export function HomeMapMoment() {
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

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
      <div className="grid grid-cols-12 gap-6 gap-y-10">
        {/* Left — legend */}
        <div className="col-span-12 md:col-span-4">
          <span className="meta-label">{t('editorial.mapped', '04 · The map')}</span>
          <h2 className="mt-3 font-display text-[clamp(2.25rem,1.4rem+3vw,4rem)] font-medium leading-[0.95] tracking-[-0.02em] text-foreground">
            {t('landing.mapTitle', 'Copenhagen, mapped')}
          </h2>
          <p className="mt-5 max-w-prose text-base leading-relaxed" style={{ color: 'var(--ink-2)' }}>
            {t(
              'landing.mapDesc',
              'Every listing pinned to a single map so you can scan a neighbourhood in seconds and spot the ones that are walking distance from your life.',
            )}
          </p>
          <dl className="mt-8 space-y-3">
            <div className="flex items-baseline justify-between gap-4 border-b pb-2" style={{ borderColor: 'var(--line-1)' }}>
              <dt className="meta-label" style={{ color: 'var(--ink-3)' }}>
                {t('landing.stats.totalOnMap', 'Pinned on the map')}
              </dt>
              <dd className="font-display text-2xl font-medium tabular-nums" style={{ color: 'var(--ink-1)' }}>
                {(data?.total ?? 0).toLocaleString(i18n.language === 'es' ? 'es-ES' : 'en-DK')}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b pb-2" style={{ borderColor: 'var(--line-1)' }}>
              <dt className="meta-label" style={{ color: 'var(--ink-3)' }}>
                {t('landing.stats.neighborhoods', 'Neighbourhoods')}
              </dt>
              <dd className="font-display text-2xl font-medium tabular-nums" style={{ color: 'var(--ink-1)' }}>
                {(data?.neighborhoods?.length ?? 0).toLocaleString(i18n.language === 'es' ? 'es-ES' : 'en-DK')}
              </dd>
            </div>
          </dl>

          <Link
            to="/explore"
            className="group mt-8 inline-flex items-center gap-3 border-b border-foreground pb-1 text-sm font-medium text-foreground transition-colors hover:border-(--amber) hover:text-(--amber-ink)"
          >
            {t('landing.openMap', 'Open the full map')}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </Link>
        </div>

        {/* Right — big ambient map */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="col-span-12 md:col-span-8"
        >
          <Link
            to="/explore"
            className="group relative block h-[420px] overflow-hidden border md:h-[560px]"
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
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, transparent 70%, rgba(0,0,0,0.15) 100%)',
              }}
            />
            <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 border bg-background/90 px-3 py-2 backdrop-blur-sm transition-colors group-hover:border-(--amber) group-hover:text-(--amber-ink)" style={{ borderColor: 'var(--line-1)', color: 'var(--ink-1)' }}>
              <Expand className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="meta-label">{t('landing.exploreMap', 'Explore on the map')}</span>
            </div>
          </Link>
        </m.div>
      </div>
    </section>
  )
}
