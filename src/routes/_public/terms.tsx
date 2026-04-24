import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { EditorialPage, EditorialSection } from '@/components/composite/editorial-page'

export const Route = createFileRoute('/_public/terms')({
  component: TermsPage,
})

function TermsPage() {
  const { t } = useTranslation()

  return (
    <EditorialPage
      eyebrow={t('terms.eyebrow', '08 · Terms')}
      title={t('terms.title', 'Terms of service.')}
      lede={t(
        'terms.lede',
        'The rules of using GeoLocal. Short, human, and enforceable.',
      )}
    >
      <p className="meta-label mb-12" style={{ color: 'var(--ink-4)' }}>
        {t('terms.updated', 'Last updated · March 2026')}
      </p>

      <EditorialSection
        number="01"
        label={t('terms.s1.label', 'Accounts')}
        title={t('terms.s1.title', 'One person, one identity.')}
      >
        <p>
          {t(
            'terms.s1.p1',
            'You must provide truthful information, keep your credentials private, and notify us immediately if your account is compromised. You are responsible for activity under your account.',
          )}
        </p>
      </EditorialSection>

      <div className="h-px bg-border" />

      <EditorialSection
        number="02"
        label={t('terms.s2.label', 'Listings')}
        title={t('terms.s2.title', 'Real things, fair prices.')}
      >
        <p>
          {t(
            'terms.s2.p1',
            'Listings must represent real items or services you have the right to offer. Photos must be yours or licensed. Prices must be the prices you\u2019d actually accept.',
          )}
        </p>
        <p>
          {t(
            'terms.s2.p2',
            'We may remove listings that are misleading, discriminatory, or in breach of Danish or EU law.',
          )}
        </p>
      </EditorialSection>

      <div className="h-px bg-border" />

      <EditorialSection
        number="03"
        label={t('terms.s3.label', 'Transactions')}
        title={t('terms.s3.title', 'Between you and the other party.')}
      >
        <p>
          {t(
            'terms.s3.p1',
            'GeoLocal is a discovery surface. Transactions happen between listers and buyers. We do not take a cut and we do not arbitrate disputes beyond providing communication records on request.',
          )}
        </p>
      </EditorialSection>

      <div className="h-px bg-border" />

      <EditorialSection
        number="04"
        label={t('terms.s4.label', 'Termination')}
        title={t('terms.s4.title', 'You can leave, we can end.')}
      >
        <p>
          {t(
            'terms.s4.p1',
            'You may delete your account at any time. We may suspend accounts that violate these terms, with notice except in cases of ongoing fraud or abuse.',
          )}
        </p>
      </EditorialSection>

      <div className="h-px bg-border" />

      <EditorialSection
        number="05"
        label={t('terms.s5.label', 'Jurisdiction')}
        title={t('terms.s5.title', 'København, Denmark.')}
      >
        <p>
          {t(
            'terms.s5.p1',
            'These terms are governed by Danish law and any disputes are resolved in the courts of Copenhagen.',
          )}
        </p>
      </EditorialSection>
    </EditorialPage>
  )
}
