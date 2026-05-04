import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { listThreadsFn } from '@/modules/messaging/api/messaging.fn'

export const Route = createFileRoute('/_account/account/messages/')({
  component: InboxPage,
})

function InboxPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-threads'],
    queryFn: () => listThreadsFn(),
    refetchInterval: 30_000,
  })
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-sm text-neutral-500">Conversations about your listings or listings you contacted.</p>
      </header>

      <div className="overflow-hidden rounded-lg border bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {isLoading && <p className="p-8 text-center text-neutral-500">Loading…</p>}
        {data?.length === 0 && <p className="p-8 text-center text-neutral-500">No conversations yet.</p>}
        <ul>
          {data?.map((t) => (
            <li key={t.threadId} className="border-b last:border-b-0 dark:border-neutral-800">
              <Link
                to="/account/messages/$threadId"
                params={{ threadId: t.threadId }}
                className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-950"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {t.unread && <span className="size-2 rounded-full bg-amber-500" />}
                    <span className="font-medium">Conversation</span>
                    <span className="text-xs text-neutral-500">{new Date(t.lastMessageAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-neutral-500">{t.lastMessagePreview ?? '(no messages)'}</p>
                </div>
                <span className="text-xs text-neutral-500">{t.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
