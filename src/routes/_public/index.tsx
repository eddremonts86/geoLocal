import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/modules/landing/ui/LandingPage'

export const Route = createFileRoute('/_public/')({
  component: LandingPage,
})
