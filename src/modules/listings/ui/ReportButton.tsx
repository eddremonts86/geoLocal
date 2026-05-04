/**
 * Report-listing button. Opens a small modal, lets the user pick a reason +
 * note, and POSTs `reportListingFn`. Shows confirmation on success.
 */
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { reportListingFn } from '@/modules/admin/api/moderation.fn'

const REASONS = [
  ['spam', 'Spam'],
  ['fraud', 'Fraud / scam'],
  ['illegal', 'Illegal item or activity'],
  ['duplicate', 'Duplicate listing'],
  ['wrong_category', 'Wrong category'],
  ['inappropriate', 'Inappropriate content'],
  ['other', 'Other'],
] as const
type Reason = (typeof REASONS)[number][0]

export function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<Reason>('spam')
  const [note, setNote] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const report = useMutation({
    mutationFn: () =>
      reportListingFn({
        data: { listingId, reason, details: note.trim() === '' ? undefined : note.trim() },
      }),
    onSuccess: () => setDone(true),
    onError: (e: Error) => setErr(e.message ?? 'Could not submit report'),
  })

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-neutral-500 underline hover:text-red-600"
      >
        Report this listing
      </button>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {done ? (
        <>
          <p className="text-sm text-emerald-600">Thanks — we&rsquo;ll review this listing.</p>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setDone(false)
              setNote('')
            }}
            className="mt-3 text-xs text-neutral-500 underline"
          >
            Close
          </button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            report.mutate()
          }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium">Report listing</h3>
          <select
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value as Reason)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          >
            {REASONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <textarea
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
            rows={3}
            maxLength={2000}
            placeholder="Optional note for moderators"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
          {err && <p className="text-xs text-red-600">{err}</p>}
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-neutral-500 hover:underline">
              Cancel
            </button>
            <button
              type="submit"
              disabled={report.isPending}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {report.isPending ? 'Submitting…' : 'Submit report'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
