'use client'

import { useEffect } from 'react'
import { kitchenApi, createKitchenWS } from '@/lib/api/kitchen'
import type { KitchenTicket, TicketStatus } from '@/types/kitchen'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import { elapsedMinutes } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'

function TicketCard({ ticket }: { ticket: KitchenTicket }) {
  const qc = useQueryClient()
  const update = useMutation({
    mutationFn: (status: TicketStatus) => kitchenApi.updateStatus(ticket.id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kitchen-tickets'] }),
  })

  const elapsed = ticket.started_at ? elapsedMinutes(ticket.started_at) : elapsedMinutes(ticket.created_at)

  return (
    <div className={cn(
      'rounded-3xl p-5 border-2 flex flex-col gap-3',
      ticket.status === 'queued'  && 'border-amber-400 bg-amber-50 dark:bg-amber-950/20',
      ticket.status === 'cooking' && 'border-primary bg-red-50 dark:bg-red-950/10',
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-black text-xl">{ticket.table_ref}</p>
          {ticket.priority > 0 && (
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-bold">RUSH</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{elapsed}m</span>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <p className="font-bold text-lg">{ticket.quantity}× {ticket.item_name}</p>
        {ticket.note && <p className="text-sm text-muted-foreground mt-1">📝 {ticket.note}</p>}
      </div>

      <div className="flex gap-2 mt-auto pt-2">
        {ticket.status === 'queued' && (
          <button
            onClick={() => update.mutate('cooking')}
            disabled={update.isPending}
            className="flex-1 bg-amber-500 text-white rounded-2xl py-3 font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            Start Cooking · ማብሰል ጀምር
          </button>
        )}
        {ticket.status === 'cooking' && (
          <button
            onClick={() => update.mutate('done')}
            disabled={update.isPending}
            className="flex-1 btn-accent disabled:opacity-50"
          >
            Done ✓ · ተጠናቀቀ
          </button>
        )}
      </div>
    </div>
  )
}

export default function KitchenDisplayPage() {
  const qc = useQueryClient()
  const { data: tickets = [], isError, isLoading } = useQuery({
    queryKey: ['kitchen-tickets'],
    queryFn: kitchenApi.activeTickets,
    refetchInterval: 5_000,
  })

  useEffect(() => {
    const ws = createKitchenWS('')
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'new_ticket' || msg.type === 'ticket_updated') {
          qc.invalidateQueries({ queryKey: ['kitchen-tickets'] })
        }
      } catch { /* ignore malformed messages */ }
    }
    return () => ws.close()
  }, [qc])

  const queued  = (tickets as KitchenTicket[]).filter(t => t.status === 'queued')
  const cooking = (tickets as KitchenTicket[]).filter(t => t.status === 'cooking')

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Display · ማሳያ</h1>
        <div className="flex gap-3 text-sm">
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-semibold">
            {queued.length} queued · ተሰልፈዋል
          </span>
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
            {cooking.length} cooking · እየተዘጋጀ
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="card-kimsha text-center py-20 text-muted-foreground">
          <p className="text-lg font-semibold">Loading tickets…</p>
        </div>
      ) : isError ? (
        <div className="card-kimsha text-center py-20 text-destructive">
          <p className="text-lg font-semibold">Failed to load tickets</p>
          <p className="text-sm mt-1 text-muted-foreground">Check your connection and try refreshing</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="card-kimsha text-center py-20 text-muted-foreground">
          <p className="text-2xl font-black mb-2">Kitchen Clear ✓</p>
          <p className="text-sm">ምንም ትዕዛዝ የለም · No pending orders</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...cooking, ...queued].map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket as KitchenTicket} />
          ))}
        </div>
      )}
    </div>
  )
}
