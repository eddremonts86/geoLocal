import { createFileRoute } from '@tanstack/react-router'
import { ScrapingSourcesPage } from '@/modules/admin/ui/ScrapingSourcesPage'

export const Route = createFileRoute('/_admin/admin/scraping/sources')({
  component: ScrapingSourcesPage,
})
