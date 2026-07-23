import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { signIn } from '@/shared/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await signIn.email({ email, password })
      if (result.error) {
        setError(result.error.message ?? t('auth.invalidCredentials', 'Invalid credentials'))
      } else {
        navigate({ to: '/' })
      }
    } catch {
      setError(t('auth.signInFailed', 'Sign in failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-6">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-medium tracking-tight">
            {t('auth.signInTitle', 'Sign in')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
            {t('auth.signInSubtitle', 'Enter your email and password to continue.')}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t('auth.email', 'Email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              lang={i18n.language}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t('auth.password', 'Password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.signingIn', 'Signing in…') : t('auth.signInCta', 'Sign in')}
          </Button>
        </form>
      </div>
    </div>
  )
}
