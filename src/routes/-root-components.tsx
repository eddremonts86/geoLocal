import { HeadContent, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { AppProviders } from '@/shared/providers'

const themeScript = `(function(){try{var t=localStorage.getItem('geolocal-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})();`

export function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
