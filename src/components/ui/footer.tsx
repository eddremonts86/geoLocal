import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight } from 'lucide-react'

/**
 * Editorial footer — Copenhagen magazine style.
 * Three columns + masthead strip + bottom meta line with issue / city / year.
 */
export function Footer() {
  const { t, i18n } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 w-full bg-background md:mt-32">
      <div className="w-full py-16 md:py-24">
        {/* Masthead strip — pegged to edges with a hair of breathing room */}
        <div className="mb-16 flex items-baseline justify-between gap-6 px-[35px] md:mb-20">
          <span className="meta-label">{t('editorial.established', 'Copenhagen · Est. 2026')}</span>
          <div className="h-px flex-1 bg-border" />
          <span className="meta-label hidden md:inline">{t('editorial.volume', 'Vol. 01')}</span>
        </div>

        {/* Brand + columns grid — centered with site container */}
        <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-x-6 gap-y-12 px-6 md:px-10">
          {/* Brand block — 6 cols */}
          <div className="col-span-12 md:col-span-6">
            <Link to="/" className="inline-flex items-baseline gap-3">
              <span className="font-display text-4xl font-medium leading-none tracking-[-0.02em] text-foreground md:text-5xl">
                GeoLocal
              </span>
              <span
                className="meta-label"
                style={{ color: 'var(--ink-4)' }}
              >
                CPH
              </span>
            </Link>
            <p
              className="mt-5 max-w-sm text-sm leading-relaxed"
              style={{ color: 'var(--ink-2)' }}
            >
              {t(
                'footer.tagline',
                'Properties, vehicles, and services — discovered on the map of Copenhagen.',
              )}
            </p>
          </div>

          {/* Explore column */}
          <nav className="col-span-6 md:col-span-2">
            <p className="meta-label mb-5" style={{ color: 'var(--ink-3)' }}>
              {t('footer.explore', 'Explore')}
            </p>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/explore" search={{ category: 'property' }}>
                {t('categories.properties', 'Properties')}
              </FooterLink>
              <FooterLink to="/explore" search={{ category: 'vehicle' }}>
                {t('categories.vehicles', 'Vehicles')}
              </FooterLink>
              <FooterLink to="/explore" search={{ category: 'service' }}>
                {t('categories.services', 'Services')}
              </FooterLink>
              <FooterLink to="/explore">{t('landing.exploreAll', 'Explore all')}</FooterLink>
            </ul>
          </nav>

          {/* Company column */}
          <nav className="col-span-6 md:col-span-2">
            <p className="meta-label mb-5" style={{ color: 'var(--ink-3)' }}>
              {t('footer.company', 'Company')}
            </p>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/about">{t('footer.about', 'About')}</FooterLink>
              <FooterLink to="/journal">{t('footer.journal', 'Journal')}</FooterLink>
              <FooterLink to="/press">{t('footer.press', 'Press')}</FooterLink>
              <FooterLink to="/contact">{t('footer.contact', 'Contact')}</FooterLink>
            </ul>
          </nav>

          {/* Legal column */}
          <nav className="col-span-12 md:col-span-2">
            <p className="meta-label mb-5" style={{ color: 'var(--ink-3)' }}>
              {t('footer.legal', 'Legal')}
            </p>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/privacy">{t('footer.privacy', 'Privacy')}</FooterLink>
              <FooterLink to="/terms">{t('footer.terms', 'Terms')}</FooterLink>
              <FooterLink to="/cookies">{t('footer.cookies', 'Cookies')}</FooterLink>
            </ul>
          </nav>
        </div>

        {/* Bottom meta line — pegged to edges to mirror the masthead */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 px-[35px] md:mt-20 md:flex-row md:items-baseline">
          <p
            className="meta-label tabular-nums"
            style={{ color: 'var(--ink-3)' }}
          >
            <span>{year}</span>
            <span className="mx-2" style={{ color: 'var(--ink-4)' }}>·</span>
            <span>{t('editorial.city', 'Copenhagen')}</span>
            <span className="mx-2" style={{ color: 'var(--ink-4)' }}>·</span>
            <span>{t('footer.allRightsReserved', 'All rights reserved')}</span>
          </p>
          <div className="flex items-center gap-5 text-xs" style={{ color: 'var(--ink-3)' }}>
            <span className="meta-label">
              {i18n.language === 'es' ? 'ES' : 'EN'}
            </span>
            <span style={{ color: 'var(--ink-4)' }}>·</span>
            <span className="meta-label">DKK</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

interface FooterLinkProps {
  to: string
  search?: Record<string, string>
  children: React.ReactNode
}

function FooterLink({ to, search, children }: FooterLinkProps) {
  return (
    <li>
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        to={to as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        search={search as any}
        className="group inline-flex items-center gap-1.5 border-b border-transparent pb-0.5 text-foreground transition-colors hover:border-[var(--amber)] hover:text-[var(--amber-ink)]"
      >
        {children}
        <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
      </Link>
    </li>
  )
}
