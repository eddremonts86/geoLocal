import { createFileRoute } from '@tanstack/react-router'
import { ExplorePage } from '@/modules/explore/ui/ExplorePage'

export const Route = createFileRoute('/_public/explore')({
  component: ExplorePage,
})
