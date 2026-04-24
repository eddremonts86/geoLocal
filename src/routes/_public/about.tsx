import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { EditorialPage, EditorialSection } from '@/components/composite/editorial-page'

export const Route = createFileRoute('/_public/about')({
  component: AboutPage,
})

function AboutPage() {
  const { t } = useTranslation()

  return (
    <EditorialPage
      eyebrow={t('about.eyebrow', '03 · Company')}
      title={t('about.title', 'A marketplace drawn on the map.')}
      lede={t(
        'about.lede',
        'GeoLocal is an editorial marketplace for Copenhagen — a quiet, map-first way to find properties, vehicles, and services in the city and its harbour.',
      )}
    >
      <EditorialSection
        number="01"
        label={t('about.principleLabel', 'Principle')}
        title={t('about.principleTitle', 'The map is the index.')}
      >
        <p>
          {t(
            'about.principleBody',
            'Most marketplaces bury their listings in filters and feeds. We believe the map itself is the best index — a first-class surface where place, price, and provenance are legible at a glance.',
          )}
        </p>
      </EditorialSection>

      <div className="h-px bg-border" />

      <EditorialSection
        number="02"
        label={t('about.craftLabel', 'Craft')}
        title={t('about.craftTitle', 'Editorial, not algorithmic.')}
      >
        <p>
          {t(
            'about.craftBody',
            'We curate our featured listings weekly, the way a magazine would. Fraunces sets the headlines, Geist keeps the body quiet, and JetBrains Mono handles the numbers.',
          )}
        </p>
      </EditorialSection>

      <div className="h-px bg-border" />

      <EditorialSection
        number="03"
        label={t('about.placeLabel', 'Place')}
        title={t('about.placeTitle', 'Copenhagen, first.')}
      >
        <p>
          {t(
            'about.placeBody',
            'We started in Copenhagen because the city rewards attention: its neighbourhoods have character, its listings have stories, and its residents have taste. We will travel from here.',
          )}
        </p>
      </EditorialSection>
    </EditorialPage>
  )
}
