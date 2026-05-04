/**
 * Marketplace contact-button.
 *
 * For listings whose `contactMethod === 'in_app'` (multi-tenant flow), this
 * starts a Thread with the owner via `startThreadFn` and navigates the buyer
 * to the message thread. For other contact methods, the parent should not
 * render this — display the email/phone/url directly.
 */
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { startThreadFn } from '@/modules/messaging/api/messaging.fn'

interface Props {
  listingId: string
  ownerId: string
  className?: string
  label?: string
}

export function ContactButton({ listingId, className, label = 'Contact seller' }: Props) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const start = useMutation({
    mutationFn: () => startThreadFn({ data: { listingId, body: body.trim() } }),
    onSuccess: (res) => {
      navigate({ to: '/account/messages/$threadId', params: { threadId: res.threadId } })
    },
    onError: (e: Error) => setErr(e.message ?? 'Could not start conversation'),
  })

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          'rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900'
        }
      >
        {label}
      </button>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (body.trim().length === 0) return
        start.mutate()
      }}
      className="space-y-3 rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.currentTarget.value)}
        rows={4}
        maxLength={4000}
        placeholder="Hi! I'm interested in your listing…"
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950"
      />
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="px-3 py-1 text-xs text-neutral-500 hover:underline">
          Cancel
        </button>
        <button
          type="submit"
          disabled={start.isPending || body.trim().length === 0}
          className="rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {start.isPending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  )
}
