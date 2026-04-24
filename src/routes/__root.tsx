import { createRootRoute } from '@tanstack/react-router'
import appCss from '@/shared/styles/globals.css?url'
import { RootDocument } from './-root-components'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'GeoLocal — Copenhagen Marketplace' },
      {
        name: 'description',
        content: 'Properties, vehicles, and services — discovered on the map of Copenhagen.',
      },
      { name: 'theme-color', content: '#f7f3ea' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,200..900,0..100,0..1;1,9..144,200..900,0..100,0..1&family=Geist:wght@300..700&family=JetBrains+Mono:wght@400;500;600&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})
