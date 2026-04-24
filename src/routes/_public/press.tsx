import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight } from 'lucide-react'
import { EditorialPage } from '@/components/composite/editorial-page'

export const Route = createFileRoute('/_public/press')({
  component: PressPage,
})

interface Coverage {
  id: string
  outlet: string
  dateKey: string
  dateDefault: string
  headlineKey: string
  headlineDefault: string
}

const COVERAGE: Coverage[] = [
  {
    id: 'politiken',
    outlet: 'Politiken',
    dateKey: 'press.c1.date',
    dateDefault: 'March 2026',
    headlineKey: 'press.c1.headline',
    headlineDefault: 'A marketplace that reads like a magazine',
  },
  {
    id: 'monocle',
    outlet: 'Monocle',
    dateKey: 'press.c2.date',
    dateDefault: 'February 2026',
    headlineKey: 'press.c2.headline',
    headlineDefault: 'Copenhagen\u2019s editorial answer to classifieds',
  },
  {
    id: 'wallpaper',
    outlet: 'Wallpaper*',
    dateKey: 'press.c3.date',
    dateDefault: 'January 2026',
    headlineKey: 'press.c3.headline',
    headlineDefault: 'Typography as interface: inside GeoLocal',
  },
]

function PressPage() {
  const { t } = useTranslation()

  return (
    <EditorialPage
      eyebrow={t('press.eyebrow', '05 · Press')}
      title={t('press.title', 'Press & coverage.')}
      lede={t(
        'press.lede',
        'Selected recent coverage, and how to reach us for interviews, visuals, or commentary on the Copenhagen marketplace.',
      )}
    >
      <div className="grid grid-cols-12 gap-x-6 gap-y-12">
        <section className="col-span-12 md:col-span-8">
          <p className="meta-label mb-6" style={{ color: 'var(--ink-3)' }}>
            {t('press.recentLabel', 'Recent coverage')}
          </p>
          <ul className="divide-y divide-border">
            {COVERAGE.map((c) => (
              <li key={c.id} className="flex items-baseline justify-between gap-4 py-5">
                <div className="min-w-0 flex-1">
                  <p className="meta-label mb-1.5" style={{ color: 'var(--amber-ink)' }}>
                    {c.outlet} <span style={{ color: 'var(--ink-4)' }}>·</span>{' '}
                    <span style={{ color: 'var(--ink-3)' }}>{t(c.dateKey, c.dateDefault)}</span>
                  </p>
                  <p className="font-display text-lg font-medium leading-[1.15] text-foreground md:text-xl">
                    {t(c.headlineKey, c.headlineDefault)}
                  </p>
                </div>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0"
                  style={{ color: 'var(--ink-3)' }}
                  strokeWidth={1.5}
                />
              </li>
            ))}
          </ul>
        </section>

        <aside className="col-span-12 md:col-span-4">
          <p className="meta-label mb-4" style={{ color: 'var(--ink-3)' }}>
            {t('press.contactLabel', 'Press contact')}
          </p>
          <p className="font-display text-2xl font-medium leading-[1.1] text-foreground">
            Clara Holm
          </p>
          <p className="mt-2 text-sm" style={{ color: 'var(--ink-2)' }}>
            {t('press.role', 'Head of Communications')}
          </p>
          <a
            href="mailto:press@geolocal.cph"
            className="mt-6 inline-flex items-center gap-1.5 border-b border-foreground pb-0.5 text-sm font-medium transition-colors hover:border-[var(--amber)] hover:text-[var(--amber-ink)]"
          >
            press@geolocal.cph
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </a>
          <p className="meta-label mt-8" style={{ color: 'var(--ink-4)' }}>
            {t('press.kitLabel', 'Press kit on request')}
          </p>
        </aside>
      </div>
    </EditorialPage>
  )
}
