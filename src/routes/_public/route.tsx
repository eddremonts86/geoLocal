import { useEffect, useRef } from 'react'
import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { Header } from '@/components/ui/header'

export const Route = createFileRoute('/_public')({
  component: PublicLayoutWrapper,
})

/**
 * Pathnames that own their scroll state (split-view / map pages).
 * We do NOT force scroll-to-top on these — they manage their own panes.
 */
const SCROLL_EXEMPT = ['/explore']

function PublicLayoutWrapper() {
  const mainRef = useRef<HTMLElement>(null)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    if (SCROLL_EXEMPT.some((p) => pathname.startsWith(p))) return
    // Run on next frame so new route content has mounted and any
    // browser / router scroll restoration has already fired.
    const id = requestAnimationFrame(() => {
      mainRef.current?.scrollTo({ top: 0, left: 0 })
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
