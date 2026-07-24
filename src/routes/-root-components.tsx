import { HeadContent, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { AppProviders } from '@/shared/providers'
import { DEFAULT_LOCALE } from '@/modules/i18n'

const themeScript = `(function(){
  try {
    // Apply the user's chosen language class to <html> as early as
    // possible (before React hydrates) so the lang attribute is
    // correct on the first paint even when the server rendered
    // with the default. This runs synchronously in <head>, before
    // <body> is parsed.
    var lng = document.cookie.match(/(?:^|;\\s*)geolocal-locale=([^;]*)/);
    if (lng) lng = decodeURIComponent(lng[1]);
    if (lng === 'es' || lng === 'en') {
      document.documentElement.lang = lng;
    }
    // Theme script (unchanged)
    var t = localStorage.getItem('geolocal-theme');
    if (t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme:dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();`

// Server always renders with the default locale. The inline theme+lang
// script above updates document.documentElement.lang as soon as the
// client parses <head>, so the first paint still has the correct lang.
const initialLocale = DEFAULT_LOCALE

export function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        // Body content legitimately differs between server (English default)
        // and client (which may upgrade to the user's stored language in
        // useEffect). Suppressing hydration warnings on the body element
        // tells React this is expected — the only mismatch source here is
        // the i18n text content, which is dynamic by design. Other
        // hydration mismatches (e.g. attribute or structural) are still
        // caught because we only suppress on this single element.
        suppressHydrationWarning
      >
        <AppProviders>
          {children}
        </AppProviders>
        <Scripts />
      </body>
    </html>
  )
}
