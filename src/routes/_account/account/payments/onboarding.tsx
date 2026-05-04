import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { refreshConnectStatusFn } from '@/modules/payments/api/payments.fn'

export const Route = createFileRoute('/_account/account/payments/onboarding')({
  component: OnboardingReturnPage,
})

function OnboardingReturnPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'ready' | 'incomplete' | 'error'>('loading')

  useEffect(() => {
    let mounted = true
    refreshConnectStatusFn()
      .then((res) => {
        if (!mounted) return
        if (res.chargesEnabled && res.payoutsEnabled) setStatus('ready')
        else setStatus('incomplete')
      })
      .catch(() => mounted && setStatus('error'))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="rounded-lg border bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
      {status === 'loading' && <p className="text-neutral-500">Verifying with Stripe…</p>}
      {status === 'ready' && (
        <>
          <h1 className="text-xl font-semibold text-emerald-600">Onboarding complete</h1>
          <p className="mt-2 text-sm text-neutral-500">You can now accept payments on your listings.</p>
          <button
            type="button"
            onClick={() => navigate({ to: '/account/payments' })}
            className="mt-6 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Go to payments
          </button>
        </>
      )}
      {status === 'incomplete' && (
        <>
          <h1 className="text-xl font-semibold text-amber-600">Setup not finished</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Stripe still needs more information from you. You can resume from the payments page.
          </p>
          <Link
            to="/account/payments"
            className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Back to payments
          </Link>
        </>
      )}
      {status === 'error' && (
        <p className="text-red-600">Could not verify your account. Please refresh.</p>
      )}
    </div>
  )
}
