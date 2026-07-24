import { useEffect, useRef, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, domAnimation } from 'framer-motion'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { I18nextProvider } from 'react-i18next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { i18n, useLanguageSync, readPreferredLocale } from '@/modules/i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

/**
 * LanguageLoader runs ONCE before any other component renders. It
 * applies the user's preferred language (URL > localStorage > cookie)
 * via i18n.changeLanguage() in a `useRef` initializer — this runs
 * during the very first render, before any child component has
 * rendered its translated text. The change is in place by the time
 * any `useTranslation()` consumer reads, so there's no post-mount
 * re-render and no hydration mismatch.
 *
 * How it avoids the React error #418 trap:
 *  - The i18n module is a shared singleton. Once we call
 *    i18n.changeLanguage() in the ref initializer, every subsequent
 *    useTranslation() read returns the new language.
 *  - Both the server and the client initialize i18n with
 *    `lng: DEFAULT_LOCALE` ('en') at module-load time. This means
 *    the server's first render is English, and the client's first
 *    render (before any effect) is also English. Match.
 *  - On the client, the ref initializer runs BEFORE the JSX of this
 *    component returns. It calls i18n.changeLanguage('es') if the
 *    user has a stored preference. Now i18n.language = 'es'.
 *  - The JSX returned from this component includes its children,
 *    who are now rendered with i18n.language = 'es'. Their
 *    first render is in Spanish.
 *  - React's hydration check compares: server HTML (English) vs
 *    client first render (Spanish) → MISMATCH → error #418.
 *
 *  So even calling changeLanguage in a ref initializer doesn't
 *  help, because the SERVER rendered English (it doesn't know about
 *  the client's preference).
 *
 * The TRUE fix requires the server to also know the user's
 * preference. The cleanest way is a request-scoped middleware that
 * reads the cookie and sets the i18n language before rendering.
 * For now, we accept that the server always renders English and
 * the client re-renders to the user's language AFTER hydration.
 * The re-render is a normal state update, not a hydration mismatch.
 */
function LanguageLoader({ children }: { children: ReactNode }) {
  useLanguageSync()
  const applied = useRef(false)

  useEffect(() => {
    if (applied.current) return
    applied.current = true
    const preferred = readPreferredLocale()
    if (preferred && preferred !== i18n.language) {
      i18n.changeLanguage(preferred)
      // Strip ?lng= from URL after consuming
      try {
        const url = new URL(window.location.href)
        if (url.searchParams.has('lng')) {
          url.searchParams.delete('lng')
          window.history.replaceState({}, '', url.toString())
        }
      } catch { /* no-op */ }
    }
  }, [])

  return <>{children}</>
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <LazyMotion features={domAnimation}>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <LanguageLoader>{children}</LanguageLoader>
            </TooltipProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </LazyMotion>
    </NuqsAdapter>
  )
}

// Re-exports
export { i18n, readPreferredLocale }
