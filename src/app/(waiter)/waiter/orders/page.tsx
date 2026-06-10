'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ordersApi } from '@/lib/api/orders'
import { formatETB } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import type { Order } from '@/types/order'
import { cn } from '@/lib/utils/cn'

const statusColor: Record<string, string> = {
  open: 'status-open', in_kitchen: 'status-kitchen', ready: 'status-ready',
}

export default function WaiterOrdersPage() {
  const { data } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.list({ status: 'open', limit: 30 }),
    refetchInterval: 10_000,
  })

  const orders = (data?.data ?? []) as Order[]

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-black">My Orders · ትዕዛዞቼ</h1>
      <div className="space-y-3">
        {orders.map(order => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className="card-kimsha">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{order.table ? `Table ${order.table.number}` : 'Takeaway'}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(order.created_at)}</p>
                  <p className="text-xs text-muted-foreground">{order.items?.length ?? 0} items</p>
                </div>
                <div className="text-right">
                  <p className="font-black">{formatETB(order.total)}</p>
                  <span className={cn('status-badge', statusColor[order.status] ?? '')}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {orders.length === 0 && (
          <div className="card-kimsha text-center py-16 text-muted-foreground">
            <p className="font-semibold">No active orders</p>
            <p className="text-sm mt-1">ምንም ትዕዛዝ የለም</p>
          </div>
        )}
      </div>
    </div>
  )
}
