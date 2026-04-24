import { Skeleton } from '@/components/ui/skeleton'

interface MapPanelProps {
  children?: React.ReactNode
}

export function MapPanel({ children }: MapPanelProps) {
  return (
    <div className="relative h-full w-full">
      {children ?? (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
      )}
    </div>
  )
}
