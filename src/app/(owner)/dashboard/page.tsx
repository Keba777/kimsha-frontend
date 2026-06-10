'use client'

import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/lib/api/reports'
import { ordersApi } from '@/lib/api/orders'
import { formatETB } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import { TrendingUp, ShoppingBag, DollarSign, Clock } from 'lucide-react'
import type { Order } from '@/types/order'

function KPICard({ label, labelAm, value, icon: Icon, accent }: {
  label: string; labelAm: string; value: string; icon: React.ElementType; accent?: boolean
}) {
  return (
    <div className="card-kimsha">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${accent ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-black text-foreground">{value}</p>
      <p className="text-sm font-medium text-foreground mt-1">{label}</p>
      <p className="text-xs text-muted-foreground">{labelAm}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: daily } = useQuery({ queryKey: ['daily'], queryFn: () => reportsApi.daily() })
  const { data: openOrders } = useQuery({
    queryKey: ['orders', 'open'],
    queryFn: () => ordersApi.list({ status: 'open', limit: 5 }),
    refetchInterval: 15_000,
  })

  const stats = daily as { total_revenue?: number; total_orders?: number; paid_orders?: number } | null
  const orders = (openOrders?.data ?? []) as Order[]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">ዛሬ · Today</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Today's Revenue" labelAm="ዛሬ ገቢ"
          value={formatETB(stats?.total_revenue ?? 0)}
          icon={DollarSign} accent
        />
        <KPICard
          label="Total Orders" labelAm="ጠቅላላ ትዕዛዞች"
          value={String(stats?.total_orders ?? 0)}
          icon={ShoppingBag}
        />
        <KPICard
          label="Paid Orders" labelAm="የተከፈሉ"
          value={String(stats?.paid_orders ?? 0)}
          icon={TrendingUp}
        />
        <KPICard
          label="Open Orders" labelAm="ክፍት ትዕዛዞች"
          value={String(orders.length)}
          icon={Clock}
        />
      </div>

      {orders.length > 0 && (
        <div className="card-kimsha">
          <h2 className="text-lg font-bold mb-4">Open Orders · ክፍት ትዕዛዞች</h2>
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-semibold text-sm">
                    {order.table ? `Table ${order.table.number}` : 'Takeaway'}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatTime(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatETB(order.total)}</p>
                  <span className={`status-badge status-${order.status.replace('_', '')}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
