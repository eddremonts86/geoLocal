import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/modules/admin/ui/DashboardPage'

export const Route = createFileRoute('/_admin/admin/')({
  component: DashboardPage,
})
