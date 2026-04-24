import { createFileRoute } from '@tanstack/react-router'
import { ListingsTablePage } from '@/modules/admin/ui/ListingsTablePage'

export const Route = createFileRoute('/_admin/admin/listings/')({
  component: ListingsTablePage,
})
