'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ordersApi } from '@/lib/api/orders'
import { formatETB } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import type { Order } from '@/types/order'
import { cn } from '@/lib/utils/cn'
import { ChevronRight, ShoppingBag } from 'lucide-react'

const statusColor: Record<string, string> = {
  open:       'status-open',
  in_kitchen: 'status-kitchen',
  ready:      'status-ready',
}

const statusLabel: Record<string, string> = {
  open:       'Open',
  in_kitchen: 'In Kitchen',
  ready:      'Ready',
  served:     'Served',
  paid:       'Paid',
  cancelled:  'Cancelled',
}

function OrderRow({ order }: { order: Order }) {
  return (
    <Link href={`/waiter/orders/${order.id}`}>
      <div className="card-kimsha flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold">
              {order.table ? `Table ${order.table.number}` : 'Takeaway'}
            </p>
            <span className={cn('status-badge', statusColor[order.status] ?? '')}>
              {statusLabel[order.status] ?? order.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatTime(order.created_at)} · {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <p className="font-black text-base">{formatETB(order.total)}</p>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  )
}

export default function WaiterOrdersPage() {
  const { data } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.list({ status: 'open,in_kitchen,ready,served', limit: 50 }),
    refetchInterval: 8_000,
  })

  const orders = (data?.data ?? []) as Order[]
  const open      = orders.filter(o => o.status === 'open')
  const inKitchen = orders.filter(o => o.status === 'in_kitchen')
  const ready     = orders.filter(o => o.status === 'ready')

  const Section = ({ title, items }: { title: string; items: Order[] }) =>
    items.length > 0 ? (
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">{title}</h2>
        {items.map(o => <OrderRow key={o.id} order={o} />)}
      </div>
    ) : null

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black">My Orders · ትዕዛዞቼ</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} active order{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card-kimsha text-center py-20 text-muted-foreground">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No active orders</p>
          <p className="text-sm mt-1">ምንም ትዕዛዝ የለም</p>
        </div>
      ) : (
        /* On large screens, split into two columns: open/kitchen on left, ready on right */
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
          <div className="space-y-6">
            <Section title="Open" items={open} />
            <Section title="In Kitchen" items={inKitchen} />
          </div>
          <div className="space-y-6">
            <Section title="Ready to Serve" items={ready} />
          </div>
        </div>
      )}
    </div>
  )
}
