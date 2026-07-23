import { useEffect, useRef } from 'react'
import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { Header } from '@/components/ui/header'

export const Route = createFileRoute('/_public')({
  component: PublicLayoutWrapper,
})

/**
 * Pathnames that own their scroll state (split-view / map pages).
 * These need an internal overflow pane so the map can stay fixed while
 * the list scrolls. Other routes get a normal page flow so the body
 * scrolls, framer-motion's whileInView fires correctly, and the user
 * sees the browser's own scrollbar.
 */
const SPLIT_VIEW_ROUTES = ['/explore']

function PublicLayoutWrapper() {
  const mainRef = useRef<HTMLElement>(null)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isSplitView = SPLIT_VIEW_ROUTES.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (isSplitView) return
    // Scroll the body (not the main) on route change.
    const id = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    })
    return () => cancelAnimationFrame(id)
  }, [pathname, isSplitView])

  if (isSplitView) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
