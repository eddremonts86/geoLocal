import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { listMyPaymentsFn, createConnectOnboardingFn, getPayoutSummaryFn } from '@/modules/payments/api/payments.fn'
import { getMyProfileFn } from '@/modules/profile/api/profile.fn'

export const Route = createFileRoute('/_account/account/payments/')({
  component: PaymentsPage,
})

function PaymentsPage() {
  const profile = useQuery({ queryKey: ['my-profile'], queryFn: () => getMyProfileFn() })
  const buyer = useQuery({ queryKey: ['my-payments', 'buyer'], queryFn: () => listMyPaymentsFn({ data: { side: 'buyer' } }) })
  const seller = useQuery({ queryKey: ['my-payments', 'seller'], queryFn: () => listMyPaymentsFn({ data: { side: 'seller' } }) })
  const payout = useQuery({
    queryKey: ['payout-summary'],
    queryFn: () => getPayoutSummaryFn(),
    enabled: Boolean(profile.data?.stripeAccountId),
  })

  const onboard = useMutation({
    mutationFn: () => createConnectOnboardingFn(),
    onSuccess: (res) => {
      window.location.href = res.url
    },
  })

  const onboarded = Boolean(profile.data?.stripeChargesEnabled)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="text-sm text-neutral-500">Take payments for your listings via Stripe Connect.</p>
      </header>

      <section className="rounded-lg border bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-2 font-medium">Seller account</h2>
        {!profile.data?.stripeAccountId ? (
          <>
            <p className="mb-4 text-sm text-neutral-500">
              You haven&rsquo;t connected a payout account yet. Connect with Stripe to start accepting payments.
            </p>
            <button
              type="button"
              onClick={() => onboard.mutate()}
              disabled={onboard.isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {onboard.isPending ? 'Loading…' : 'Connect with Stripe'}
            </button>
          </>
        ) : !onboarded ? (
          <>
            <p className="mb-4 text-sm text-amber-600">
              Account created but not fully onboarded. Finish setup with Stripe to start receiving payments.
            </p>
            <button
              type="button"
              onClick={() => onboard.mutate()}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Continue onboarding
            </button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Available" value={fmtBalance(payout.data?.available)} />
            <Stat label="Pending" value={fmtBalance(payout.data?.pending)} />
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Table title="As seller" rows={seller.data ?? []} />
        <Table title="As buyer" rows={buyer.data ?? []} />
      </section>

      <p className="text-xs text-neutral-500">
        <Link to="/account/payments/onboarding" className="underline">
          Refresh onboarding status →
        </Link>
      </p>
    </div>
  )
}

function fmtBalance(items?: { amount: number; currency: string }[]): string {
  if (!items || items.length === 0) return '—'
  return items
    .map((b) => `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`)
    .join(' · ')
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-neutral-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}

function Table({
  title,
  rows,
}: {
  title: string
  rows: Array<{
    id: string
    amountTotal: number
    currency: string
    status: string
    intent: string
    createdAt: Date | string
  }>
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="border-b px-4 py-3 text-sm font-medium dark:border-neutral-800">{title}</h3>
      <table className="w-full text-sm">
        <thead className="border-b text-left text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
          <tr>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Intent</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                Nothing here yet.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="border-b last:border-b-0 dark:border-neutral-800">
              <td className="px-4 py-2 font-medium">
                {(r.amountTotal / 100).toFixed(2)} {r.currency}
              </td>
              <td className="px-4 py-2 text-neutral-500">{r.intent}</td>
              <td className="px-4 py-2 text-neutral-500">{r.status}</td>
              <td className="px-4 py-2 text-neutral-500">{new Date(r.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
