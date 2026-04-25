import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ScrapingSourcesPage } from '@/modules/admin/ui/ScrapingSourcesPage'

const searchSchema = z.object({
  tab: z.enum(['discovery', 'active']).optional(),
})

export const Route = createFileRoute('/_admin/admin/scraping/sources')({
  component: ScrapingSourcesPage,
  validateSearch: searchSchema,
})
