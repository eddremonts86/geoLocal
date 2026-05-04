import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { listMyListingsFn } from '@/modules/listings/api/listings-mutations.fn'

export const Route = createFileRoute('/_account/account/listings/$id')({
  component: ListingEditPage,
})

function ListingEditPage() {
  const { id } = Route.useParams()
  const { data } = useQuery({ queryKey: ['my-listings'], queryFn: () => listMyListingsFn() })
  const listing = (data ?? []).find((l) => l.id === id)

  if (!listing) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-neutral-500">Listing not found or not owned by you.</p>
        <Link to="/account/listings" className="mt-4 inline-block text-sm underline">
          ← Back to listings
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{listing.slug}</h1>
        <p className="text-sm text-neutral-500">{listing.category} · {listing.subCategory} · {listing.status}</p>
      </header>

      <div className="rounded-lg border bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Row label="Price" value={`${(listing.price / 100).toFixed(2)} ${listing.currency}`} />
          <Row label="City" value={`${listing.city}, ${listing.country}`} />
          <Row label="Status" value={listing.status} />
          <Row label="Moderation" value={listing.moderationStatus} />
          <Row label="Views" value={listing.viewCount.toString()} />
          <Row label="Contacts" value={listing.contactCount.toString()} />
          <Row label="Updated" value={new Date(listing.updatedAt).toLocaleString()} />
          <Row label="Published" value={listing.publishedAt ? new Date(listing.publishedAt).toLocaleString() : '—'} />
        </dl>
      </div>

      <p className="text-xs text-neutral-500">
        Detailed editing UI ships in the next iteration. For now, delete and recreate to change category-specific fields.
        <br />
        <Link to="/account/listings" className="underline">
          ← Back to my listings
        </Link>
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-neutral-500">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}
