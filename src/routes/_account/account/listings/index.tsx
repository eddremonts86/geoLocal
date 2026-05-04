import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listMyListingsFn, publishListingFn, deleteListingFn } from '@/modules/listings/api/listings-mutations.fn'

export const Route = createFileRoute('/_account/account/listings/')({
  component: MyListingsPage,
})

function MyListingsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['my-listings'], queryFn: () => listMyListingsFn() })

  const publish = useMutation({
    mutationFn: (input: { id: string; publish: boolean }) => publishListingFn({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteListingFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  })

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My listings</h1>
          <p className="text-sm text-neutral-500">Create, edit, publish or archive your listings.</p>
        </div>
        <Link
          to="/account/listings/new"
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          + New listing
        </Link>
      </header>

      <div className="overflow-hidden rounded-lg border bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-3">Title / Slug</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Contacts</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                  Loading…
                </td>
              </tr>
            )}
            {data?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                  Nothing here yet — create your first listing.
                </td>
              </tr>
            )}
            {data?.map((l) => (
              <tr key={l.id} className="border-b last:border-b-0 dark:border-neutral-800">
                <td className="px-4 py-3">
                  <Link to="/account/listings/$id" params={{ id: l.id }} className="font-medium hover:underline">
                    {l.slug}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {l.category}/{l.subCategory}
                </td>
                <td className="px-4 py-3">
                  <Badge status={l.status} moderation={l.moderationStatus} />
                </td>
                <td className="px-4 py-3 text-neutral-500">{l.viewCount}</td>
                <td className="px-4 py-3 text-neutral-500">{l.contactCount}</td>
                <td className="px-4 py-3 text-neutral-500">{new Date(l.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  {l.status === 'draft' ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                      onClick={() => publish.mutate({ id: l.id, publish: true })}
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-xs font-medium text-amber-600 hover:text-amber-700"
                      onClick={() => publish.mutate({ id: l.id, publish: false })}
                    >
                      Unpublish
                    </button>
                  )}
                  <button
                    type="button"
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm('Delete this listing? Published listings will be archived.')) {
                        remove.mutate(l.id)
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Badge({ status, moderation }: { status: string; moderation: string }) {
  if (moderation !== 'ok') {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
        {moderation}
      </span>
    )
  }
  const cls =
    status === 'published'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      : status === 'draft'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>
}
