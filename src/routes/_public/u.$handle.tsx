import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  getPublicProfileByHandleFn,
  listPublicListingsByHandleFn,
} from '@/modules/profile/api/profile.fn'

export const Route = createFileRoute('/_public/u/$handle')({
  component: PublicProfilePage,
})

function PublicProfilePage() {
  const { handle } = Route.useParams()

  const profile = useQuery({
    queryKey: ['public-profile', handle],
    queryFn: () => getPublicProfileByHandleFn({ data: { handle } }),
  })
  const listings = useQuery({
    queryKey: ['public-listings', handle],
    queryFn: () => listPublicListingsByHandleFn({ data: { handle } }),
    enabled: Boolean(profile.data),
  })

  if (profile.isLoading) {
    return <div className="mx-auto max-w-4xl px-6 py-16 text-center text-neutral-500">Loading…</div>
  }
  if (!profile.data) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">User not found</h1>
        <Link to="/explore" className="mt-4 inline-block text-sm underline">
          Browse listings
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">{profile.data.displayName ?? `@${handle}`}</h1>
        <p className="mt-1 text-neutral-500">@{profile.data.handle}</p>
        {profile.data.bio && <p className="mt-4 max-w-2xl whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{profile.data.bio}</p>}
      </header>

      <h2 className="mb-4 text-xl font-medium">Listings</h2>
      {listings.data?.length ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.data.map((l) => (
            <li key={l.id}>
              <Link
                to="/listing/$slug"
                params={{ slug: l.slug }}
                className="block rounded-lg border bg-white p-4 transition hover:shadow dark:border-neutral-800 dark:bg-neutral-900"
              >
                <h3 className="line-clamp-1 font-medium">{l.subCategory}</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {l.city}, {l.country}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {(l.price / 100).toFixed(2)} {l.currency}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-500">No public listings yet.</p>
      )}
    </div>
  )
}
