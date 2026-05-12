import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import { Home, Car, Wrench, Sparkles, Heart, User, Menu } from 'lucide-react'
import { useSession, signOut } from '@/shared/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/modules/shared/ui/ThemeToggle'
import { LanguageSwitcher } from '@/modules/shared/ui/LanguageSwitcher'
import { useFavorites } from '@/modules/favorites/ui/useFavorites'

/**
 * Editorial header — Copenhagen magazine style.
 * Pegged to the viewport edges (px-[15px]) so it mirrors the footer masthead strip.
 * Four verticals inline on desktop; hamburger sheet on mobile.
 */
const categories = [
  {
    value: 'property',
    icon: Home,
    labelKey: 'categories.properties',
    fallback: 'Properties',
    accent: 'var(--cat-property)',
  },
  {
    value: 'vehicle',
    icon: Car,
    labelKey: 'categories.vehicles',
    fallback: 'Vehicles',
    accent: 'var(--cat-vehicle)',
  },
  {
    value: 'service',
    icon: Wrench,
    labelKey: 'categories.services',
    fallback: 'Services',
    accent: 'var(--cat-service)',
  },
  {
    value: 'experience',
    icon: Sparkles,
    labelKey: 'categories.experiences',
    fallback: 'Experiences',
    accent: 'var(--cat-experience)',
  },
] as const

export function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const { count: favoriteCount } = useFavorites()
  const { data: session } = useSession()

  // Listen on the public layout's scrollable <main>, not window.
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    const onScroll = () => setScrolled(main.scrollTop > 4)
    onScroll()
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 flex h-16 items-center justify-between bg-background/90 px-[15px] backdrop-blur-sm transition-colors duration-300 ${
        scrolled ? 'border-b border-(--line-1)' : 'border-b border-transparent'
      }`}
    >
      {/* Left: Wordmark + Inline nav */}
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-baseline gap-2 shrink-0">
          <span className="font-display text-xl font-medium leading-none tracking-[-0.02em] text-foreground">
            GeoLocal
          </span>
          <span
            className="meta-label hidden sm:inline"
            style={{ color: 'var(--ink-4)', fontSize: '0.625rem' }}
          >
            CPH
          </span>
        </Link>

        {/* Inline verticals — desktop only */}
        <nav className="hidden items-center gap-7 lg:flex">
          {categories.map(({ value, labelKey, fallback, accent }) => (
            <Link
              key={value}
              to="/explore"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              search={{ category: value } as any}
              className="meta-label group relative transition-colors"
              style={{ color: 'var(--ink-2)' }}
            >
              <span
                className="transition-colors group-hover:text-foreground"
                style={{ ['--cat-hover' as string]: accent } as React.CSSProperties}
              >
                {t(labelKey, fallback)}
              </span>
              <span
                aria-hidden
                className="absolute -bottom-1.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: accent }}
              />
            </Link>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-0.5">
        {/* User-level actions */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-none"
          aria-label={t('nav.favorites', 'Favorites')}
          suppressHydrationWarning
          onClick={() => navigate({ to: '/favorites' })}
        >
          <Heart className="h-4 w-4" strokeWidth={1.5} />
          {favoriteCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-(--red) px-1 text-[10px] font-medium leading-none text-white tabular-nums"
              aria-label={`${favoriteCount} saved`}
            >
              {favoriteCount > 99 ? '99+' : favoriteCount}
            </span>
          )}
        </Button>

        {/* Divider */}
        <span className="mx-1 hidden h-4 w-px bg-(--line-1) sm:inline-block" aria-hidden />

        {/* Chrome cluster */}
        <div className="hidden items-center sm:flex">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Divider */}
        <span className="mx-1 hidden h-4 w-px bg-(--line-1) sm:inline-block" aria-hidden />

        {/* Auth */}
        {session ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="meta-label hidden rounded-none px-3 sm:flex"
              style={{ color: 'var(--ink-2)' }}
              onClick={() => navigate({ to: '/admin' })}
            >
              Admin
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="meta-label hidden rounded-none px-3 sm:flex"
              style={{ color: 'var(--ink-2)' }}
              onClick={() => signOut().then(() => navigate({ to: '/' }))}
            >
              Sign out
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 rounded-none sm:flex"
            aria-label={t('nav.profile', 'Profile')}
            onClick={() => navigate({ to: '/sign-in' })}
          >
            <User className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        )}

        {/* Mobile hamburger (covers md too since nav is lg:flex) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none lg:hidden"
              aria-label={t('nav.menu', 'Menu')}
            >
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex h-full flex-col gap-10 pt-10">
              {/* Navigate section */}
              <div>
                <p
                  className="meta-label mb-5 px-3"
                  style={{ color: 'var(--ink-3)' }}
                >
                  {t('nav.navigate', 'Navigate')}
                </p>
                <div className="flex flex-col">
                  {categories.map(({ value, icon: Icon, labelKey, fallback, accent }) => (
                    <button
                      key={value}
                      type="button"
                      className="group flex items-center justify-between gap-3 border-b border-(--line-1) px-3 py-4 text-left transition-colors hover:bg-(--surface-2)"
                      onClick={() =>
                        navigate({
                          to: '/explore',
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          search: { category: value } as any,
                        })
                      }
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          className="h-4 w-4"
                          strokeWidth={1.5}
                          style={{ color: accent }}
                        />
                        <span className="font-display text-xl font-medium tracking-[-0.01em]">
                          {t(labelKey, fallback)}
                        </span>
                      </span>
                      <span
                        className="meta-label opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: 'var(--ink-3)' }}
                      >
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chrome on mobile */}
              <div className="flex items-center gap-4 px-3 sm:hidden">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
