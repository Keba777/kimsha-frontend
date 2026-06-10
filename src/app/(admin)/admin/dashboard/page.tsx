'use client'

import { useQuery } from '@tanstack/react-query'
import { Building2, Users, ShoppingBag, Banknote, CheckCircle2 } from 'lucide-react'
import { statsApi } from '@/lib/api/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function StatCard({ title, value, icon: Icon, sub }: {
  title: string
  value: string | number
  icon: React.ElementType
  sub?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: statsApi.get,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}><CardContent className="h-24 animate-pulse bg-muted rounded-xl mt-4" /></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Tenants"
          value={stats?.total_tenants ?? 0}
          icon={Building2}
        />
        <StatCard
          title="Active Tenants"
          value={stats?.active_tenants ?? 0}
          icon={CheckCircle2}
          sub={`${stats?.total_tenants ? Math.round(((stats.active_tenants ?? 0) / stats.total_tenants) * 100) : 0}% of total`}
        />
        <StatCard
          title="Total Users"
          value={stats?.total_users ?? 0}
          icon={Users}
        />
        <StatCard
          title="Total Orders"
          value={stats?.total_orders ?? 0}
          icon={ShoppingBag}
        />
        <StatCard
          title="Total Revenue"
          value={`ETB ${(stats?.total_revenue ?? 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`}
          icon={Banknote}
        />
      </div>
    </div>
  )
}
