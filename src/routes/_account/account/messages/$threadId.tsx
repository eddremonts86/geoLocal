import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  getThreadFn,
  sendMessageFn,
  markThreadReadFn,
} from '@/modules/messaging/api/messaging.fn'

export const Route = createFileRoute('/_account/account/messages/$threadId')({
  component: ThreadPage,
})

function ThreadPage() {
  const { threadId } = Route.useParams()
  const qc = useQueryClient()
  const [body, setBody] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => getThreadFn({ data: { threadId } }),
    refetchInterval: 15_000,
  })

  const mark = useMutation({
    mutationFn: () => markThreadReadFn({ data: { threadId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-threads'] })
      qc.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  const send = useMutation({
    mutationFn: (text: string) => sendMessageFn({ data: { threadId, body: text } }),
    onSuccess: () => {
      setBody('')
      qc.invalidateQueries({ queryKey: ['thread', threadId] })
      qc.invalidateQueries({ queryKey: ['my-threads'] })
    },
  })

  useEffect(() => {
    mark.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])

  if (isLoading) return <p className="text-sm text-neutral-500">Loading…</p>
  if (!data) return <p className="text-sm text-neutral-500">Thread not found.</p>

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col rounded-lg border bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <header className="border-b p-4 dark:border-neutral-800">
        <Link to="/account/messages" className="text-xs text-neutral-500 hover:underline">
          ← Inbox
        </Link>
        <h1 className="mt-1 text-lg font-medium">Conversation</h1>
        {data.thread.listingId && (
          <p className="text-xs text-neutral-500">
            About listing <span className="font-mono">{data.thread.listingId.slice(0, 8)}…</span>
          </p>
        )}
      </header>

      <ol className="flex-1 space-y-3 overflow-y-auto p-4">
        {data.messages.map((m) => (
          <li key={m.id} className="rounded-md bg-neutral-100 p-3 dark:bg-neutral-800">
            <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium">{m.senderId.slice(0, 12)}…</span>
              <span>{new Date(m.createdAt).toLocaleString()}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm">{m.body}</p>
          </li>
        ))}
        {data.messages.length === 0 && <p className="text-center text-sm text-neutral-500">No messages yet.</p>}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (body.trim()) send.mutate(body.trim())
        }}
        className="border-t p-3 dark:border-neutral-800"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            rows={2}
            placeholder="Write a reply…"
            className="flex-1 resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950"
          />
          <button
            type="submit"
            disabled={send.isPending || body.trim().length === 0}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
