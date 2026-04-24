import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { m } from 'framer-motion'
import {
  Search, Home, Car, Wrench, Sparkles, Plus, MoreHorizontal, Pencil, Eye, EyeOff, Archive, Trash2,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { getAdminListingsFn, updateListingStatusFn, deleteListingFn } from '@/modules/admin/api/admin-listings.fn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

const categoryIcons = { property: Home, vehicle: Car, service: Wrench, experience: Sparkles } as const
const statusColors: Record<string, string> = {
  draft: 'bg-yellow-500/10 text-yellow-600',
  published: 'bg-green-500/10 text-green-600',
  archived: 'bg-gray-500/10 text-gray-500',
}

export function ListingsTablePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'listings', { search, categoryFilter, statusFilter, page }],
    queryFn: () =>
      getAdminListingsFn({
        data: {
          query: search || undefined,
          category: categoryFilter !== 'all' ? (categoryFilter as any) : undefined,
          status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
          page,
          pageSize,
        },
      }),
  })

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: 'draft' | 'published' | 'archived' }) =>
      updateListingStatusFn({ data: vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteListingFn({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] }),
  })

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin.listings', 'Listings')}</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.total} total` : ''}
          </p>
        </div>
        <Link to="/admin/listings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.newListing', 'New Listing')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('admin.searchListings', 'Search listings...')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="vehicle">Vehicle</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="p-4 font-medium text-muted-foreground">Listing</th>
                    <th className="p-4 font-medium text-muted-foreground">Category</th>
                    <th className="p-4 font-medium text-muted-foreground">Type</th>
                    <th className="p-4 font-medium text-muted-foreground">Price</th>
                    <th className="p-4 font-medium text-muted-foreground">Status</th>
                    <th className="p-4 font-medium text-muted-foreground">Date</th>
                    <th className="p-4 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data?.items.map((item) => {
                    const Icon = categoryIcons[item.category as keyof typeof categoryIcons] ?? Home
                    return (
                      <m.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {item.coverUrl ? (
                              <img
                                src={item.coverUrl}
                                alt=""
                                className="h-10 w-14 rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-14 items-center justify-center rounded bg-muted">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{item.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5" />
                            {item.subCategory}
                          </div>
                        </td>
                        <td className="p-4 capitalize">{item.transactionType}</td>
                        <td className="p-4 font-medium">
                          {new Intl.NumberFormat('en-DK', { style: 'currency', currency: item.currency, maximumFractionDigits: 0 }).format(item.price)}
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className={statusColors[item.status] ?? ''}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to="/admin/listings/$id" params={{ id: item.id }}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </Link>
                              </DropdownMenuItem>
                              {item.status !== 'published' && (
                                <DropdownMenuItem
                                  onClick={() => statusMutation.mutate({ id: item.id, status: 'published' })}
                                >
                                  <Eye className="mr-2 h-4 w-4" /> Publish
                                </DropdownMenuItem>
                              )}
                              {item.status === 'published' && (
                                <DropdownMenuItem
                                  onClick={() => statusMutation.mutate({ id: item.id, status: 'draft' })}
                                >
                                  <EyeOff className="mr-2 h-4 w-4" /> Unpublish
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => statusMutation.mutate({ id: item.id, status: 'archived' })}
                              >
                                <Archive className="mr-2 h-4 w-4" /> Archive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm('Delete this listing?')) deleteMutation.mutate(item.id)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </m.tr>
                    )
                  })}
                </tbody>
              </table>
              {data?.items.length === 0 && (
                <p className="p-8 text-center text-muted-foreground">No listings found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
