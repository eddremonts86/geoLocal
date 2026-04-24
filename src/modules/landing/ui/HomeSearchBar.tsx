import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Search, ArrowRight } from 'lucide-react'
import { m } from 'framer-motion'
import { EDITORIAL_EASE as EASE } from '@/modules/listings/model/display'

type Category = 'all' | 'property' | 'vehicle' | 'service' | 'experience'

const CATEGORIES: Array<{ id: Category; labelKey: string; fallback: string }> = [
  { id: 'all', labelKey: 'search.all', fallback: 'All' },
  { id: 'property', labelKey: 'landing.properties', fallback: 'Properties' },
  { id: 'vehicle', labelKey: 'landing.vehicles', fallback: 'Vehicles' },
  { id: 'service', labelKey: 'landing.services', fallback: 'Services' },
  { id: 'experience', labelKey: 'landing.experiences', fallback: 'Experiences' },
]

/**
 * Editorial search composer for the home hero. Renders a horizontal rail of
 * category chips and a single free-text "where/what" input. Submit navigates
 * to /explore. The composer is intentionally minimal — deep filtering happens
 * inside Explore.
 */
export function HomeSearchBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category>('all')
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({ to: '/explore' })
  }

  return (
    <m.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.32 }}
      className="w-full"
    >
      {/* Category chip rail */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {CATEGORIES.map((c) => {
          const active = category === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`meta-label rounded-none px-3 py-1.5 transition-colors ${
                active
                  ? 'bg-foreground text-background'
                  : 'border border-(--line-1) text-(--ink-2) hover:border-(--amber) hover:text-(--amber-ink)'
              }`}
              style={active ? {} : { borderColor: 'var(--line-1)' }}
            >
              {t(c.labelKey, c.fallback)}
            </button>
          )
        })}
      </div>

      {/* Search field */}
      <label
        htmlFor="home-search-input"
        className="flex items-center gap-3 border-y py-3"
        style={{ borderColor: 'var(--ink-1)' }}
      >
        <Search className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: 'var(--ink-3)' }} />
        <input
          id="home-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder', 'Search by neighborhood, model, or keyword…')}
          className="flex-1 bg-transparent text-base outline-none placeholder:text-(--ink-3) md:text-lg"
          style={{ color: 'var(--ink-1)' }}
        />
        <button
          type="submit"
          className="group inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-(--amber-ink)"
          style={{ color: 'var(--ink-1)' }}
        >
          <span className="meta-label hidden sm:inline">{t('search.go', 'Search')}</span>
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        </button>
      </label>
    </m.form>
  )
}
