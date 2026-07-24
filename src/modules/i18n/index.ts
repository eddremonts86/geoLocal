import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { useEffect } from 'react'
import en from './locales/en.json'
import es from './locales/es.json'

const resources = {
  en: { translation: en },
  es: { translation: es },
}

export const SUPPORTED_LOCALES = ['en', 'es'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: SupportedLocale = 'en'
export const LOCALE_COOKIE = 'geolocal-locale'
export const LOCALE_STORAGE = 'geolocal-locale'

/**
 * The hydration-safe i18n flow:
 *
 *   1. The i18n module ALWAYS initializes with `lng: DEFAULT_LOCALE` ('en').
 *      This is the language the SERVER uses to render the HTML, and the
 *      language the CLIENT uses for its first render. They match.
 *
 *   2. After the client hydrates (via useLanguageSync), we read the
 *      user's preferred language (URL > localStorage > cookie >
 *      navigator.language) and call i18n.changeLanguage(). The re-render
 *      happens AFTER React's hydration check has passed, so React
 *      doesn't throw error #418.
 *
 *   3. The language change is persisted to BOTH localStorage AND a
 *      cookie, so the next page-load (full reload or SSR navigation)
 *      sees the same language on the server.
 *
 *   4. The LanguageSwitcher just calls i18n.changeLanguage() — same
 *      effect, just synchronous. Persistence is automatic via the
 *      'languageChanged' listener in useLanguageSync.
 *
 * Earlier implementations of this file tried to detect the locale
 * synchronously on the client and pass it to i18n.init(), but that
 * caused the client to render Spanish on first paint (matching
 * navigator.language='es') while the server rendered English (no
 * cookie on a fresh visit). React detected the text mismatch on the
 * 'Spanish' locale machines and threw "Minified React error #418"
 * on every page load. See git log for the full story.
 */

function isSupported(v: string | null | undefined): v is SupportedLocale {
  return !!v && (SUPPORTED_LOCALES as readonly string[]).includes(v)
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}

function readStorage(name: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const v = window.localStorage.getItem(name)
    return isSupported(v) ? (v as SupportedLocale) : null
  } catch { return null }
}

function readQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const v = new URL(window.location.href).searchParams.get(name)
    return isSupported(v) ? (v as SupportedLocale) : null
  } catch { return null }
}

function persistLocale(lng: string) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LOCALE_STORAGE, lng) } catch {}
  try {
    const oneYear = 60 * 60 * 24 * 365
    document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(lng)}; path=/; max-age=${oneYear}; samesite=lax`
  } catch {}
}

/** Client-only: figure out the user's preferred language. Used by
 *  useLanguageSync AFTER hydration to upgrade from the default.
 *  Never call this on the server (it would return 'en' anyway, but
 *  don't make a habit of it). */
export function detectPreferredLocale(): SupportedLocale {
  return (
    readQueryParam('lng') ??
    readStorage(LOCALE_STORAGE) ??
    readCookie(LOCALE_COOKIE) ??
    (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en')
  )
}

// Always initialize with the default. Server and client agree on the
// first render — both render English.
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    interpolation: { escapeValue: false },
  })

export { i18n }

/** After mount, switch to the user's preferred language. The
 *  `requestAnimationFrame` deferral is critical: it pushes the
 *  i18n.changeLanguage() call past React's first paint, so the
 *  re-render is NOT detected as a hydration mismatch.
 *
 *  Persists every language change to localStorage + cookie so the
 *  next SSR pass uses the same language.
 */
export function useLanguageSync() {
  useEffect(() => {
    const preferred = detectPreferredLocale()
    if (preferred !== i18n.language) {
      const id = requestAnimationFrame(() => {
        i18n.changeLanguage(preferred)
        // Strip the ?lng= param from the URL after consuming it
        try {
          const url = new URL(window.location.href)
          if (url.searchParams.has('lng')) {
            url.searchParams.delete('lng')
            window.history.replaceState({}, '', url.toString())
          }
        } catch { /* no-op */ }
      })
      const handler = (lng: string) => persistLocale(lng)
      i18n.on('languageChanged', handler)
      return () => {
        cancelAnimationFrame(id)
        i18n.off('languageChanged', handler)
      }
    }
    const handler = (lng: string) => persistLocale(lng)
    i18n.on('languageChanged', handler)
    return () => { i18n.off('languageChanged', handler) }
  }, [])
}
