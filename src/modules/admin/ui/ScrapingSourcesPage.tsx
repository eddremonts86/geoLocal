import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Skull, Globe, Loader2 } from 'lucide-react'
import {
  listSourceCandidatesFn,
  updateSourceCandidateStatusFn,
} from '@/modules/admin/api/scraping-sources.fn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

type CandidateStatus = 'pending' | 'approved' | 'rejected' | 'dead'

const statusColors: Record<CandidateStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700',
  approved: 'bg-green-500/10 text-green-700',
  rejected: 'bg-gray-500/10 text-gray-600',
  dead: 'bg-red-500/10 text-red-600',
}

export function ScrapingSourcesPage() {
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('pending')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'source-candidates', { status: statusFilter }],
    queryFn: () =>
      listSourceCandidatesFn({
        data: { status: statusFilter === 'all' ? undefined : statusFilter },
      }),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'source-candidates'] })

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; status: CandidateStatus }) =>
      updateSourceCandidateStatusFn({ data: args }),
    onSuccess: invalidate,
  })

  const items = data?.items ?? []

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight">Source candidates</h1>
          <p className="text-sm text-muted-foreground">
            Domains discovered by the crawler. Approve the ones worth adding as full scrapers.
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as CandidateStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="dead">Dead</SelectItem>
          </SelectContent>
        </Select>
      </header>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No candidates.{' '}
            <span className="font-mono text-xs">
              npx tsx scripts/scraping/discovery.ts
            </span>{' '}
            to discover new sources.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`https://${c.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {c.domain}
                  </a>
                </CardTitle>
                <Badge className={statusColors[c.status as CandidateStatus]}>{c.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="text-xs text-muted-foreground">
                  {c.discoveredFrom && (
                    <div>
                      Discovered from:{' '}
                      <a
                        href={c.discoveredFrom}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {c.discoveredFrom}
                      </a>
                    </div>
                  )}
                  {c.notes && <div className="mt-1 font-mono text-[10px]">{c.notes}</div>}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateMutation.isPending || c.status === 'approved'}
                    onClick={() => updateMutation.mutate({ id: c.id, status: 'approved' })}
                  >
                    {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span className="ml-1.5">Approve</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateMutation.isPending || c.status === 'rejected'}
                    onClick={() => updateMutation.mutate({ id: c.id, status: 'rejected' })}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span className="ml-1.5">Reject</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateMutation.isPending || c.status === 'dead'}
                    onClick={() => updateMutation.mutate({ id: c.id, status: 'dead' })}
                  >
                    <Skull className="h-3.5 w-3.5" />
                    <span className="ml-1.5">Dead</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
