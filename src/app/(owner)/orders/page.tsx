'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ordersApi } from '@/lib/api/orders'
import { formatETB } from '@/lib/utils/currency'
import { formatTime, formatDate } from '@/lib/utils/date'
import type { OrderStatus } from '@/types/order'
import { cn } from '@/lib/utils/cn'

const statuses: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_kitchen', label: 'Kitchen' },
  { value: 'ready', label: 'Ready' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusColors: Record<string, string> = {
  open: 'status-open', in_kitchen: 'status-kitchen',
  ready: 'status-ready', paid: 'status-paid', cancelled: 'status-cancelled',
}

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const { data } = useQuery({
    queryKey: ['orders', status],
    queryFn: () => ordersApi.list({ status: status || undefined, limit: 50 }),
    refetchInterval: 15_000,
  })

  const orders = data?.data ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Orders · ትዕዛዞች</h1>

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value as OrderStatus | '')}
            className={cn('tab-pill whitespace-nowrap', status === s.value && 'tab-pill-active')}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {orders.map(order => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className="card-kimsha hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-base">
                    {order.table ? `Table ${order.table.number}` : 'Takeaway'}
                    {order.order_type === 'takeaway' && ' · Takeaway'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(order.created_at)} · {formatTime(order.created_at)}
                    {order.waiter && ` · ${order.waiter.name}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg">{formatETB(order.total)}</p>
                  <span className={cn('status-badge', statusColors[order.status] ?? '')}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {orders.length === 0 && (
          <div className="card-kimsha text-center py-16 text-muted-foreground">
            <p className="text-lg font-semibold">No orders found</p>
            <p className="text-sm mt-1">ምንም ትዕዛዝ አልተገኘም</p>
          </div>
        )}
      </div>
    </div>
  )
}
