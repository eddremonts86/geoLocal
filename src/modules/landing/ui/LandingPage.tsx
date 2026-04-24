import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { Footer } from '@/components/ui/footer'
import { HomeHero } from './HomeHero'
import { NeighborhoodPills } from './NeighborhoodPills'
import { VerticalShowcase } from './VerticalShowcase'
import { HomeManifesto } from './HomeManifesto'
import { HomeMapMoment } from './HomeMapMoment'
import { HomeClosingCTA } from './HomeClosingCTA'
import { FeaturedCarousel } from './FeaturedCarousel'
import { ScrapedCarousel } from './ScrapedCarousel'

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="bg-background">
      <HomeHero />

      <EditorialRule />

      <NeighborhoodPills />

      <EditorialRule />

      <VerticalShowcase />

      <HomeManifesto />

      <EditorialRule />

      <section className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="meta-label">03 · {t('landing.fromTheWebLabel', 'From the web')}</span>
            <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3.5rem)] font-medium leading-none tracking-[-0.02em] text-foreground">
              {t('landing.curated', 'Curated')}
            </h2>
          </div>
          <div className="hidden flex-col items-end gap-1 text-right md:flex">
            <p className="max-w-[28ch] text-sm leading-relaxed" style={{ color: 'var(--ink-3)' }}>
              {t('landing.curatedDesc', 'A hand-picked cut from Airbnb, Boliga, Homestra, Facebook and more.')}
            </p>
            <Link
              to="/explore"
              className="group mt-1 inline-flex items-center gap-2 border-b border-border pb-0.5 text-sm transition-colors hover:border-(--amber) hover:text-foreground"
              style={{ color: 'var(--ink-2)' }}
            >
              {t('landing.exploreAll', 'See all')}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <ScrapedCarousel />
      </section>

      <EditorialRule />

      <HomeMapMoment />

      <EditorialRule />

      <section className="mx-auto max-w-[1400px] px-6 pb-16 pt-16 md:px-10 md:pb-20 md:pt-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="meta-label">05 · {t('landing.thisWeekLabel', 'This week')}</span>
            <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3.5rem)] font-medium leading-none tracking-[-0.02em] text-foreground">
              {t('landing.featured', 'Featured')}
            </h2>
          </div>
          <Link
            to="/explore"
            className="group hidden items-center gap-2 border-b border-border pb-0.5 text-sm transition-colors hover:border-(--amber) hover:text-foreground md:inline-flex"
            style={{ color: 'var(--ink-2)' }}
          >
            {t('landing.exploreAll', 'See all')}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <FeaturedCarousel />
      </section>

      <HomeClosingCTA />

      <Footer />
    </div>
  )
}

function EditorialRule() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
      <div className="h-px bg-border" />
    </div>
  )
}
