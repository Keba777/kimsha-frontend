'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { tablesApi } from '@/lib/api/tables'
import { ordersApi } from '@/lib/api/orders'
import type { Table } from '@/types/table'
import { cn } from '@/lib/utils/cn'
import { Users } from 'lucide-react'

function TableCard({ table }: { table: Table }) {
  const router = useRouter()
  const qc = useQueryClient()
  const createOrder = useMutation({
    mutationFn: () => ordersApi.create({ table_id: table.id, order_type: 'dine_in' }),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      router.push(`/waiter/orders/${order.id}`)
    },
  })

  return (
    <div
      className={cn(
        'rounded-3xl p-5 border-2 cursor-pointer active:scale-95 transition-transform select-none',
        'table-' + table.status,
        'bg-card hover:shadow-md transition-shadow'
      )}
      onClick={() => {
        if (table.status === 'free') createOrder.mutate()
        else router.push('/waiter/orders?table=' + table.id)
      }}
    >
      <p className="text-3xl font-black">{table.number}</p>
      {table.name && <p className="text-sm text-muted-foreground mt-1">{table.name}</p>}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{table.capacity}</span>
        </div>
        <span className={cn(
          'text-xs font-bold capitalize',
          table.status === 'free'     && 'text-green-600',
          table.status === 'occupied' && 'text-red-600',
          table.status === 'cleaning' && 'text-amber-600',
        )}>
          {table.status}
        </span>
      </div>
    </div>
  )
}

export default function WaiterTablesPage() {
  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.list,
    refetchInterval: 10_000,
  })

  const all = tables as Table[]
  const free     = all.filter(t => t.status === 'free').length
  const occupied = all.filter(t => t.status === 'occupied').length

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black">Tables · ጠረጴዛዎች</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {free} free · {occupied} occupied · {all.length} total
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Free</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Occupied</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Cleaning</span>
        </div>
      </div>

      {/* Grid — 2 cols mobile, 3 cols tablet, 4 cols desktop, 5 cols xl */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
        {all.map(t => <TableCard key={t.id} table={t} />)}
      </div>

      {all.length === 0 && (
        <div className="card-kimsha text-center py-20 text-muted-foreground">
          <p className="font-semibold">No tables configured</p>
          <p className="text-sm mt-1">Ask the manager to add tables · ጠረጴዛ ያስጨምሩ</p>
        </div>
      )}
    </div>
  )
}
