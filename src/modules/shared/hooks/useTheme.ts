import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'geolocal-theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const resolved = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

// ── Module-level pub-sub so every `useTheme()` instance stays in sync ──
type Listener = (t: Theme) => void
const listeners = new Set<Listener>()
let currentTheme: Theme = typeof window === 'undefined' ? 'system' : readInitialTheme()

function setGlobalTheme(next: Theme) {
  currentTheme = next
  applyTheme(next)
  if (typeof window !== 'undefined') {
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
  }
  listeners.forEach((fn) => fn(next))
}

// Initial paint (before any component mounts)
if (typeof window !== 'undefined') {
  applyTheme(currentTheme)
}

export function useTheme() {
  const [theme, setThemeLocal] = useState<Theme>(currentTheme)

  // Subscribe to global theme changes
  useEffect(() => {
    const fn: Listener = (t) => setThemeLocal(t)
    listeners.add(fn)
    // Sync on mount in case the module-level state advanced between render and effect
    if (currentTheme !== theme) setThemeLocal(currentTheme)
    return () => { listeners.delete(fn) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to OS-level dark-mode flips while theme='system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (currentTheme === 'system') {
        applyTheme('system')
        // Force dependent components to re-read resolvedTheme
        listeners.forEach((fn) => fn('system'))
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setGlobalTheme(newTheme)
  }, [])

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme

  return { theme, setTheme, resolvedTheme } as const
}
