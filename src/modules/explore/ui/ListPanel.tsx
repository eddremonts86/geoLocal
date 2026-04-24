import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReactNode } from 'react'

interface ListPanelProps {
  isLoading: boolean
  children: ReactNode
}

export function ListPanel({ isLoading, children }: ListPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4">
        {children}
      </div>
    </ScrollArea>
  )
}
