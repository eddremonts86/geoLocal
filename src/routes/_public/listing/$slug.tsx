import { createFileRoute } from '@tanstack/react-router'
import { ListingDetailPage } from '@/modules/listings/ui/ListingDetailPage'

export const Route = createFileRoute('/_public/listing/$slug')({
  component: ListingDetailRoute,
})

function ListingDetailRoute() {
  const { slug } = Route.useParams()
  return <ListingDetailPage slug={slug} />
}
