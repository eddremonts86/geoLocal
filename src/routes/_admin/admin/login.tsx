import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/admin/login')({
  beforeLoad: () => {
    // Auth is handled at the /_admin layout level — sign-in is at /sign-in
    throw redirect({ to: '/sign-in', replace: true })
  },
  component: () => null,
})
