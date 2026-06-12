'use client'

import { use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ordersApi } from '@/lib/api/orders'
import { formatETB } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import type { Order, OrderItem } from '@/types/order'
import { cn } from '@/lib/utils/cn'
import { ArrowLeft, Plus, ChefHat, CheckCircle2, Clock, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const itemStatusIcon: Record<string, React.ReactNode> = {
  pending:   <Clock className="w-3.5 h-3.5 text-muted-foreground" />,
  cooking:   <ChefHat className="w-3.5 h-3.5 text-amber-500" />,
  ready:     <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
  served:    <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground opacity-50" />,
  cancelled: <Ban className="w-3.5 h-3.5 text-red-500" />,
}

const orderStatusColor: Record<string, string> = {
  open:       'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',
  in_kitchen: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300',
  ready:      'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300',
  served:     'bg-muted      text-muted-foreground',
  paid:       'bg-muted      text-muted-foreground',
  cancelled:  'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-300',
}

function ItemRow({ item, orderId }: { item: OrderItem; orderId: string }) {
  const qc = useQueryClient()
  const markServed = useMutation({
    mutationFn: () => ordersApi.updateItemStatus(orderId, item.id, 'served'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order', orderId] }),
    onError: () => toast.error('Failed to update item'),
  })

  return (
    <div className={cn(
      'flex items-center gap-3 py-3 border-b border-border last:border-0',
      item.status === 'cancelled' && 'opacity-40'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {itemStatusIcon[item.status]}
          <p className="font-semibold text-sm">{item.name_snapshot}</p>
        </div>
        {item.note && (
          <p className="text-xs text-muted-foreground mt-0.5 pl-5">Note: {item.note}</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm text-muted-foreground">×{item.quantity}</span>
        <span className="font-bold text-sm w-20 text-right">
          {formatETB(item.price_snapshot * item.quantity)}
        </span>
        {item.status === 'ready' && (
          <button
            onClick={() => markServed.mutate()}
            disabled={markServed.isPending}
            className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
          >
            Served
          </button>
        )}
      </div>
    </div>
  )
}

export default function WaiterOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()

  const { data: order, isLoading, isError } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
    refetchInterval: 8_000,
  })

  const sendToKitchen = useMutation({
    mutationFn: () => ordersApi.updateStatus(id, 'in_kitchen'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] })
      toast.success('Sent to kitchen · ወደ ኩሽና ተልኳል')
    },
    onError: () => toast.error('Failed to update order'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-32 text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="font-semibold text-destructive">Order not found</p>
        <Button variant="outline" onClick={() => router.back()}>Go back</Button>
      </div>
    )
  }

  const activeItems  = order.items?.filter(i => i.status !== 'cancelled') ?? []
  const pendingItems = activeItems.filter(i => i.status === 'pending')
  const readyItems   = activeItems.filter(i => i.status === 'ready')

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-black">
            {order.table ? `Table ${order.table.number}` : 'Takeaway'}
          </h1>
          <p className="text-sm text-muted-foreground">{formatTime(order.created_at)}</p>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-xs font-bold capitalize', orderStatusColor[order.status])}>
          {order.status.replace('_', ' ')}
        </span>
      </div>

      {/* Alerts */}
      {readyItems.length > 0 && (
        <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
            {readyItems.length} item{readyItems.length !== 1 ? 's' : ''} ready to serve · ዝግጁ ናቸው
          </p>
        </div>
      )}

      {/* Items */}
      <div className="card-kimsha">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold">Items · ምግቦች</h2>
          <Link
            href={`/waiter/new-order?order_id=${order.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> Add items
          </Link>
        </div>

        <div className="divide-y divide-border">
          {(order.items ?? []).map(item => (
            <ItemRow key={item.id} item={item} orderId={order.id} />
          ))}
          {(order.items ?? []).length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No items yet</p>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="card-kimsha space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span><span>{formatETB(order.subtotal)}</span>
        </div>
        {order.tax_amount > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span><span>{formatETB(order.tax_amount)}</span>
          </div>
        )}
        {order.service_charge > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Service charge</span><span>{formatETB(order.service_charge)}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-base pt-2 border-t border-border">
          <span>Total</span><span>{formatETB(order.total)}</span>
        </div>
      </div>

      {/* Actions */}
      {order.status === 'open' && pendingItems.length > 0 && (
        <Button
          className="w-full btn-accent border-0"
          onClick={() => sendToKitchen.mutate()}
          disabled={sendToKitchen.isPending}
        >
          <ChefHat className="w-4 h-4 mr-2" />
          {sendToKitchen.isPending ? 'Sending…' : 'Send to Kitchen · ወደ ኩሽና ላክ'}
        </Button>
      )}

      {order.status === 'ready' && (
        <div className="card-kimsha bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-center py-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-bold text-green-700 dark:text-green-300">Order is ready!</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">ትዕዛዙ ተዘጋጅቷል</p>
        </div>
      )}

      {order.payment_status === 'unpaid' && order.status !== 'cancelled' && (
        <p className="text-center text-xs text-muted-foreground">
          Payment: unpaid · ክፍያ: አልተፈፀመም — direct customer to cashier
        </p>
      )}
    </div>
  )
}
