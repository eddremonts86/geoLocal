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
 * The final, battle-tested i18n flow.
 *
 *   1. i18n always initializes with `lng: DEFAULT_LOCALE` ('en'). This
 *      is the language used for BOTH the server-side render and the
 *      client's first render. They match by construction.
 *
 *   2. The user's preferred language is read from the URL (`?lng=es`),
 *      localStorage, or the `geolocal-locale` cookie. The LanguageLoader
 *      component (see `src/shared/providers/index.tsx`) applies this
 *      preference SYNCHRONOUSLY before any other component renders —
 *      it sets `i18n.changeLanguage()` in the same render pass that
 *      uses it, so the first render of every component already uses
 *      the right language. This works because the loader runs at the
 *      very top of the provider tree, and it only calls changeLanguage
 *      when the user has an EXPLICIT preference (URL, stored value, or
 *      cookie from a previous visit) — never based on navigator.language.
 *
 *   3. The LanguageSwitcher calls `i18n.changeLanguage()` on click. The
 *      'languageChanged' listener persists the new language to BOTH
 *      localStorage AND the cookie, so the next request uses the same
 *      language on the server too.
 *
 *   4. We DO NOT auto-detect navigator.language. Doing so caused React
 *      hydration error #418 on Spanish-locale machines, because the
 *      server rendered English (no cookie) while the client re-rendered
 *      Spanish (navigator.language='es') ~50ms after mount, during the
 *      hydration phase. The inline theme script in <head> updates the
 *      <html lang> attribute early so the document is still semantically
 *      correct (lang matches the chosen language, even if the body
 *      content is briefly English before the loader kicks in).
 *
 *   5. If you need a non-English default language for SEO, change
 *      DEFAULT_LOCALE above. The cookie will still override it on
 *      subsequent visits.
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

/** Read the user's preferred language from URL, localStorage, or cookie.
 *  Returns null if the user has no explicit preference (i.e. first
 *  visit). The LanguageLoader uses this to decide whether to apply
 *  a non-default language at first render. */
export function readPreferredLocale(): SupportedLocale | null {
  return (
    readQueryParam('lng') ??
    readStorage(LOCALE_STORAGE) ??
    readCookie(LOCALE_COOKIE) ??
    null
  )
}

// Always initialize with the default. Server and client agree on the
// first render — both render English. The LanguageLoader may change
// the language synchronously before any component renders its
// translated text, in the same render pass.
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

/** No-op hook for API compatibility. The actual sync happens in
 *  LanguageLoader (in providers). This hook just sets up the
 *  persistence listener for explicit user changes. */
export function useLanguageSync() {
  useEffect(() => {
    const handler = (lng: string) => persistLocale(lng)
    i18n.on('languageChanged', handler)
    return () => { i18n.off('languageChanged', handler) }
  }, [])
}
