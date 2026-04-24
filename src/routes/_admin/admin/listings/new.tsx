import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ListingFormPage } from '@/modules/admin/ui/ListingFormPage'

const searchSchema = z.object({
  category: z.string().optional(),
})

export const Route = createFileRoute('/_admin/admin/listings/new')({
  validateSearch: searchSchema,
  component: NewListingRoute,
})

function NewListingRoute() {
  const { category } = Route.useSearch()
  return <ListingFormPage initialCategory={category} />
}
