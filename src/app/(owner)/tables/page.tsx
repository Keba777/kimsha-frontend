'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tablesApi } from '@/lib/api/tables'
import type { Table, TableStatus } from '@/types/table'
import { cn } from '@/lib/utils/cn'
import { Users } from 'lucide-react'

const statusLabel: Record<TableStatus, { en: string; am: string }> = {
  free:     { en: 'Free',     am: 'ነፃ' },
  occupied: { en: 'Occupied', am: 'የተያዘ' },
  cleaning: { en: 'Cleaning', am: 'እየተጸዳ' },
  reserved: { en: 'Reserved', am: 'ተይዟል' },
}

function TableCard({ table, onStatus }: { table: Table; onStatus: (s: TableStatus) => void }) {
  const nextStatus: Record<TableStatus, TableStatus> = {
    free: 'occupied', occupied: 'cleaning', cleaning: 'free', reserved: 'free',
  }
  return (
    <div
      className={cn('card-kimsha cursor-pointer select-none transition-all active:scale-95 table-' + table.status)}
      onClick={() => onStatus(nextStatus[table.status])}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl font-black text-foreground">{table.number}</span>
        <span className={cn(
          'text-xs font-semibold px-2 py-0.5 rounded-full',
          table.status === 'free'     && 'bg-green-100 text-green-700',
          table.status === 'occupied' && 'bg-red-100 text-red-700',
          table.status === 'cleaning' && 'bg-amber-100 text-amber-700',
          table.status === 'reserved' && 'bg-blue-100 text-blue-700',
        )}>
          {statusLabel[table.status].en}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{statusLabel[table.status].am}</p>
      {table.name && <p className="text-sm font-medium mt-1">{table.name}</p>}
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <Users className="w-3 h-3" />
        <span>{table.capacity}</span>
      </div>
    </div>
  )
}

export default function TablesPage() {
  const qc = useQueryClient()
  const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: tablesApi.list, refetchInterval: 10_000 })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) => tablesApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Tables</h1>
          <p className="text-sm text-muted-foreground">ጠረጴዛዎች · {tables.length} total</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map(table => (
          <TableCard
            key={table.id}
            table={table}
            onStatus={(status) => updateStatus.mutate({ id: table.id, status })}
          />
        ))}
      </div>

      {tables.length === 0 && (
        <div className="card-kimsha text-center py-12 text-muted-foreground">
          <p className="text-lg font-semibold">No tables yet</p>
          <p className="text-sm mt-1">Go to Settings to add tables · ጠረጴዛዎችን ለማስጨመር ወደ ቅንብሮች ሂዱ</p>
        </div>
      )}
    </div>
  )
}
