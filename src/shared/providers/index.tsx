import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, domAnimation } from 'framer-motion'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { I18nextProvider } from 'react-i18next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { i18n, useLanguageSync } from '@/modules/i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  useLanguageSync()

  return (
    <NuqsAdapter>
      <LazyMotion features={domAnimation}>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </LazyMotion>
    </NuqsAdapter>
  )
}
