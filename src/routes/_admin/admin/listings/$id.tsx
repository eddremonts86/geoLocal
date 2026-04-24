import { createFileRoute } from '@tanstack/react-router'
import { ListingFormPage } from '@/modules/admin/ui/ListingFormPage'

export const Route = createFileRoute('/_admin/admin/listings/$id')({
  component: EditListingRoute,
})

function EditListingRoute() {
  // TODO: fetch existing listing by Route.useParams().id and pass as initialData
  return <ListingFormPage />
}
