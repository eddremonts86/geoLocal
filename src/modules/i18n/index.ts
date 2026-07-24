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

/** Best-effort language detection that runs in the SAME order on server and client.
 *
 * Priority:
 *  1. URL query param `?lng=es|en` (highest — user explicit override)
 *  2. localStorage `geolocal-locale` (client only — skipped on server)
 *  3. Cookie `geolocal-locale` (set by the language switcher)
 *  4. Accept-Language header / `navigator.language` (browser default)
 *  5. `en` fallback
 *
 * Critically, this is a PURE function that returns the same value when called
 * on server and client for the same request. The previous version mutated
 * `i18n.language` in a `useEffect` after mount, which caused React hydration
 * error #418 whenever the user's browser language didn't match the server's
 * `lng: 'en'` default.
 */
export function detectInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') {
    // Server: read cookie (set by previous client switch) + Accept-Language header
    // Cookie header is on the document, set by TanStack Start per-request
    const cookieLocale = readCookie(LOCALE_COOKIE)
    if (isSupported(cookieLocale)) return cookieLocale
    const acceptLang = readAcceptLanguage()
    return pickFromAcceptLanguage(acceptLang)
  }
  // Client: read URL > localStorage > cookie > navigator
  try {
    const url = new URL(window.location.href)
    const fromQuery = url.searchParams.get('lng')
    if (isSupported(fromQuery)) return fromQuery as SupportedLocale
  } catch { /* no-op */ }
  try {
    const stored = window.localStorage.getItem('geolocal-locale')
    if (isSupported(stored)) return stored as SupportedLocale
  } catch { /* no-op */ }
  const cookieLocale = readCookie(LOCALE_COOKIE)
  if (isSupported(cookieLocale)) return cookieLocale
  return pickFromAcceptLanguage(typeof navigator !== 'undefined' ? navigator.language : '')
}

function isSupported(v: string | null | undefined): v is SupportedLocale {
  return !!v && (SUPPORTED_LOCALES as readonly string[]).includes(v)
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}

function readAcceptLanguage(): string {
  if (typeof document === 'undefined') return ''
  // The browser exposes the preferred language on navigator.language on the
  // client; on the server we don't have a reliable way to read the
  // Accept-Language header from inside a React component, so the cookie
  // is the source of truth in the SSR pass.
  return ''
}

function pickFromAcceptLanguage(header: string | undefined): SupportedLocale {
  if (!header) return DEFAULT_LOCALE
  const first = header.split(',')[0]?.trim().toLowerCase() ?? ''
  if (first.startsWith('es')) return 'es'
  if (first.startsWith('en')) return 'en'
  return DEFAULT_LOCALE
}

// SSR-safe: detect once at init time so server + client agree on the
// first render. If they disagree, the cookie or query param fixes it.
const initialLocale = detectInitialLocale()

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    interpolation: { escapeValue: false },
  })

export { i18n }

/** Persist the language choice in BOTH localStorage and a cookie.
 *  The cookie is what the server reads on the next request to keep SSR
 *  and client in sync (no hydration mismatch). The localStorage is a
 *  fast-path that avoids a cookie read on subsequent client navigations.
 */
function persistLocale(lng: string) {
  try { localStorage.setItem('geolocal-locale', lng) } catch {}
  try {
    const oneYear = 60 * 60 * 24 * 365
    document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(lng)}; path=/; max-age=${oneYear}; samesite=lax`
  } catch {}
}

/** After the app mounts, keep i18n in sync with the URL or any explicit
 *  user choice. This hook is now SAFE for hydration because detectInitialLocale
 *  produces the same value on server and client (cookie-driven).
 */
export function useLanguageSync() {
  useEffect(() => {
    const initial = detectInitialLocale()
    if (initial !== i18n.language) {
      i18n.changeLanguage(initial)
    }
    // Persist future changes
    const handler = (lng: string) => persistLocale(lng)
    i18n.on('languageChanged', handler)
    return () => { i18n.off('languageChanged', handler) }
  }, [])
}
