import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { listMyListingsFn } from '@/modules/listings/api/listings-mutations.fn'
import { listThreadsFn, unreadNotificationsCountFn } from '@/modules/messaging/api/messaging.fn'
import { listMyPaymentsFn } from '@/modules/payments/api/payments.fn'

export const Route = createFileRoute('/_account/account/')({
  component: AccountOverview,
})

function AccountOverview() {
  const listings = useQuery({ queryKey: ['my-listings'], queryFn: () => listMyListingsFn() })
  const threads = useQuery({ queryKey: ['my-threads'], queryFn: () => listThreadsFn() })
  const unread = useQuery({ queryKey: ['unread-count'], queryFn: () => unreadNotificationsCountFn(), refetchInterval: 30_000 })
  const payments = useQuery({ queryKey: ['my-payments', 'both'], queryFn: () => listMyPaymentsFn({ data: { side: 'both' } }) })

  const published = (listings.data ?? []).filter((l) => l.status === 'published').length
  const drafts = (listings.data ?? []).filter((l) => l.status === 'draft').length
  const totalEarnings = (payments.data ?? [])
    .filter((p) => p.status === 'succeeded' && p.sellerId)
    .reduce((sum, p) => sum + p.amountTotal - p.amountApplicationFee, 0)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-neutral-500">Here&rsquo;s what&rsquo;s happening across your account.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Published" value={published} />
        <Stat label="Drafts" value={drafts} />
        <Stat label="Unread messages" value={unread.data ?? 0} highlight={Boolean(unread.data && unread.data > 0)} />
        <Stat label="Earnings" value={`${(totalEarnings / 100).toFixed(2)} DKK`} />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Your listings" cta={{ to: '/account/listings', label: 'Manage →' }}>
          {(listings.data ?? []).slice(0, 5).map((l) => (
            <Link
              key={l.id}
              to="/account/listings/$id"
              params={{ id: l.id }}
              className="flex items-center justify-between rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              <span className="truncate text-sm">{l.subCategory}</span>
              <span className="text-xs text-neutral-500">{l.status}</span>
            </Link>
          ))}
          {!listings.data?.length && <EmptyState text="No listings yet." />}
        </Card>

        <Card title="Recent conversations" cta={{ to: '/account/messages', label: 'Open inbox →' }}>
          {(threads.data ?? []).slice(0, 5).map((t) => (
            <Link
              key={t.threadId}
              to="/account/messages/$threadId"
              params={{ threadId: t.threadId }}
              className="block rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.unread ? '● ' : ''}Listing thread</span>
                <span className="text-xs text-neutral-500">{new Date(t.lastMessageAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-1 truncate text-xs text-neutral-500">{t.lastMessagePreview ?? '(no messages)'}</p>
            </Link>
          ))}
          {!threads.data?.length && <EmptyState text="No conversations yet." />}
        </Card>
      </section>

      <section>
        <Link
          to="/account/listings/new"
          className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          + Create a new listing
        </Link>
      </section>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 ${highlight ? 'ring-2 ring-amber-400' : ''}`}>
      <div className="text-xs uppercase tracking-wider text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  )
}

function Card({
  title,
  children,
  cta,
}: {
  title: string
  children: React.ReactNode
  cta?: { to: string; label: string }
}) {
  return (
    <div className="rounded-lg border bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        {cta && (
          <Link to={cta.to} className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
            {cta.label}
          </Link>
        )}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="px-2 py-4 text-sm text-neutral-500">{text}</p>
}
