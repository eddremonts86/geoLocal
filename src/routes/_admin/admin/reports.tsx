import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { listReportsFn, moderateListingFn } from '@/modules/admin/api/moderation.fn'

export const Route = createFileRoute('/_admin/admin/reports')({
  component: AdminReportsPage,
})

function AdminReportsPage() {
  const qc = useQueryClient()
  const [includeResolved, setIncludeResolved] = useState(false)
  const reports = useQuery({
    queryKey: ['admin-reports', includeResolved],
    queryFn: () => listReportsFn({ data: { resolved: includeResolved } }),
  })

  const moderate = useMutation({
    mutationFn: (input: Parameters<typeof moderateListingFn>[0]['data']) =>
      moderateListingFn({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reports'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Reports</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeResolved}
            onChange={(e) => setIncludeResolved(e.currentTarget.checked)}
          />
          Include resolved
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Reporter</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Resolved?</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                  No reports.
                </td>
              </tr>
            )}
            {reports.data?.map((r) => {
              const resolved = Boolean(r.resolvedAt)
              return (
                <tr key={r.id} className="border-b align-top last:border-b-0 dark:border-neutral-800">
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.listingSlug ?? `${r.listingId.slice(0, 8)}…`}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {(r.reporterId ?? '—').slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.reason}</div>
                    {r.details && <div className="mt-1 text-xs text-neutral-500">{r.details}</div>}
                  </td>
                  <td className="px-4 py-3">{resolved ? 'yes' : 'no'}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {!resolved && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            moderate.mutate({
                              id: r.listingId,
                              moderationStatus: 'hidden',
                              resolveReports: true,
                            })
                          }
                          className="text-xs font-medium text-amber-600 hover:text-amber-700"
                        >
                          Hide
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            moderate.mutate({
                              id: r.listingId,
                              moderationStatus: 'banned',
                              resolveReports: true,
                            })
                          }
                          className="text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          Ban listing
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            moderate.mutate({
                              id: r.listingId,
                              moderationStatus: 'ok',
                              resolveReports: true,
                            })
                          }
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
