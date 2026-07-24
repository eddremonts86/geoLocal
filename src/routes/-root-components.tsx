import { HeadContent, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { AppProviders } from '@/shared/providers'
import { detectInitialLocale } from '@/modules/i18n'

const themeScript = `(function(){try{var t=localStorage.getItem('geolocal-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})();`

// Run detection at module-load time so the server-rendered <html lang>
// matches what the client i18n init will use. detectInitialLocale() is a
// pure function that reads the cookie (set on previous requests by the
// language switcher). On the very first request (no cookie), both
// server and client default to 'en' — no hydration mismatch.
const initialLocale = detectInitialLocale()

export function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="min-h-screen bg-background font-sans antialiased"
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
