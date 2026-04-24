import { Link } from '@tanstack/react-router'
import { m } from 'framer-motion'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ListingCategory } from '@/modules/listings/model/types'
import { CATEGORY_ACCENT_VAR, EDITORIAL_EASE } from '@/modules/listings/model/display'

interface CategoryCardProps {
  icon: LucideIcon
  category: ListingCategory
  number: string
  /** Already-translated title (not an i18n key). */
  title: string
  /** Already-translated description (not an i18n key). */
  description: string
  index: number
}

export function CategoryCard({ icon: Icon, category, number, title, description, index }: CategoryCardProps) {
  const { t } = useTranslation()
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EDITORIAL_EASE, delay: index * 0.08 }}
      className="group relative bg-background transition-colors duration-300 hover:bg-[var(--surface-2)]"
    >
      <Link
        to="/explore"
        search={{ category }}
        className="flex h-full flex-col justify-between gap-10 p-8 md:p-10"
      >
        {/* Top row — meta + icon */}
        <div className="flex items-start justify-between">
          <span className="meta-label" style={{ color: CATEGORY_ACCENT_VAR[category] }}>
            {number} / {category}
          </span>
          <Icon
            className="h-5 w-5 transition-transform duration-500"
            style={{ color: 'var(--ink-3)' }}
            strokeWidth={1.25}
          />
        </div>

        {/* Title + desc */}
        <div className="space-y-3">
          <h3 className="font-display text-[clamp(1.875rem,1.4rem+2vw,2.75rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground">
            {title}
          </h3>
          <p className="max-w-[32ch] text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>
            {description}
          </p>
        </div>

        {/* Bottom link */}
        <div className="flex items-center gap-2 text-sm transition-colors" style={{ color: 'var(--ink-2)' }}>
          <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-[var(--amber)] group-hover:text-foreground">
            {t('editorial.discover', 'Discover')}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--amber-ink)]" />
        </div>
      </Link>
    </m.div>
  )
}
