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
      router.push(`/orders/${order.id}`)
    },
  })

  return (
    <div
      className={cn('rounded-3xl p-5 border-2 cursor-pointer active:scale-95 transition-transform',
        'table-' + table.status, 'bg-card'
      )}
      onClick={() => {
        if (table.status === 'free') createOrder.mutate()
        else router.push('/orders?table=' + table.id)
      }}
    >
      <p className="text-3xl font-black">{table.number}</p>
      {table.name && <p className="text-sm text-muted-foreground mt-1">{table.name}</p>}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{table.capacity}</span>
        </div>
        <span className={cn('text-xs font-bold capitalize',
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
  const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: tablesApi.list, refetchInterval: 10_000 })

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-black">Tables · ጠረጴዛዎች</h1>
      <div className="grid grid-cols-2 gap-3">
        {(tables as Table[]).map(t => <TableCard key={t.id} table={t} />)}
      </div>
    </div>
  )
}
