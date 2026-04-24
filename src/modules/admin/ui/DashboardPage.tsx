import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { m } from 'framer-motion'
import { Home, Car, Wrench, Star, Plus, FileText, Eye } from 'lucide-react'
import { getAdminStatsFn, getRecentListingsFn } from '@/modules/admin/api/admin-stats.fn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const categoryIcons = { property: Home, vehicle: Car, service: Wrench } as const
const statusColors: Record<string, string> = {
  draft: 'bg-yellow-500/10 text-yellow-600',
  published: 'bg-green-500/10 text-green-600',
  archived: 'bg-gray-500/10 text-gray-500',
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function DashboardPage() {
  const { t } = useTranslation()
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => getAdminStatsFn(),
  })
  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ['admin', 'recent'],
    queryFn: () => getRecentListingsFn(),
  })

  const statCards = [
    { label: t('admin.totalListings', 'Total Listings'), value: stats?.total ?? 0, icon: FileText, color: 'text-primary' },
    { label: t('admin.properties', 'Properties'), value: stats?.byCategory?.property ?? 0, icon: Home, color: 'text-blue-500' },
    { label: t('admin.vehicles', 'Vehicles'), value: stats?.byCategory?.vehicle ?? 0, icon: Car, color: 'text-emerald-500' },
    { label: t('admin.services', 'Services'), value: stats?.byCategory?.service ?? 0, icon: Wrench, color: 'text-amber-500' },
    { label: t('admin.published', 'Published'), value: stats?.byStatus?.published ?? 0, icon: Eye, color: 'text-green-500' },
    { label: t('admin.featured', 'Featured'), value: stats?.featured ?? 0, icon: Star, color: 'text-yellow-500' },
  ]

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin.dashboard', 'Dashboard')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.dashboardDesc', 'Overview of your marketplace')}</p>
        </div>
      </div>

      {/* Stat cards */}
      <m.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
      >
        {statCards.map((card) => (
          <m.div key={card.label} variants={cardVariant}>
            <Card>
              <CardContent className="p-4">
                {statsLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                      <span className="text-xs text-muted-foreground">{card.label}</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold">{card.value.toLocaleString()}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </m.div>
        ))}
      </m.div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/listings/new" search={{ category: 'property' }}>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            <Home className="h-4 w-4" /> {t('admin.addProperty', 'Add Property')}
          </Button>
        </Link>
        <Link to="/admin/listings/new" search={{ category: 'vehicle' }}>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            <Car className="h-4 w-4" /> {t('admin.addVehicle', 'Add Vehicle')}
          </Button>
        </Link>
        <Link to="/admin/listings/new" search={{ category: 'service' }}>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            <Wrench className="h-4 w-4" /> {t('admin.addService', 'Add Service')}
          </Button>
        </Link>
      </div>

      {/* Recent listings */}
      <m.div variants={cardVariant} initial="hidden" animate="show">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t('admin.recentListings', 'Recent Listings')}</CardTitle>
            <Link to="/admin/listings">
              <Button variant="ghost" size="sm">{t('admin.viewAll', 'View All')}</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recent?.map((item) => {
                  const Icon = categoryIcons[item.category as keyof typeof categoryIcons] ?? FileText
                  return (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.city} · {item.subCategory}</p>
                      </div>
                      <Badge variant="secondary" className={statusColors[item.status] ?? ''}>
                        {item.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </m.div>
    </div>
  )
}
