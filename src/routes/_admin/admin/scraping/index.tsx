import { createFileRoute } from '@tanstack/react-router'
import { ScrapingReviewPage } from '@/modules/admin/ui/ScrapingReviewPage'

export const Route = createFileRoute('/_admin/admin/scraping/')({
  component: ScrapingReviewPage,
})
