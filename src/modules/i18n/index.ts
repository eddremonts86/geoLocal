import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { useEffect } from 'react'
import en from './locales/en.json'
import es from './locales/es.json'

const resources = {
  en: { translation: en },
  es: { translation: es },
}

// SSR-safe: always init with 'en' so server and client first render match.
// Language detection happens post-hydration via useLanguageSync() hook.
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    interpolation: { escapeValue: false },
  })

export { i18n }
export type SupportedLocale = 'en' | 'es'

const STORAGE_KEY = 'geo-dashboard-lang'

/** Detect stored/browser language AFTER hydration to avoid SSR mismatch. */
export function useLanguageSync() {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const detected = stored ?? (navigator.language?.startsWith('es') ? 'es' : 'en')
    if (detected !== i18n.language) {
      i18n.changeLanguage(detected)
    }
    // Persist future changes
    const handler = (lng: string) => localStorage.setItem(STORAGE_KEY, lng)
    i18n.on('languageChanged', handler)
    return () => { i18n.off('languageChanged', handler) }
  }, [])
}
