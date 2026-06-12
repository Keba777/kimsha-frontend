'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ordersApi } from '@/lib/api/orders'
import { formatETB } from '@/lib/utils/currency'
import { formatTime, formatDate } from '@/lib/utils/date'
import type { Order, OrderItem, OrderStatus } from '@/types/order'
import { cn } from '@/lib/utils/cn'
import {
  ArrowLeft, ChefHat, CheckCircle2, Clock, Ban,
  CreditCard, Banknote, Smartphone, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const itemStatusIcon: Record<string, React.ReactNode> = {
  pending:   <Clock className="w-3.5 h-3.5 text-muted-foreground" />,
  cooking:   <ChefHat className="w-3.5 h-3.5 text-amber-500" />,
  ready:     <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
  served:    <CheckCircle2 className="w-3.5 h-3.5 opacity-40" />,
  cancelled: <Ban className="w-3.5 h-3.5 text-red-500" />,
}

const orderStatusColor: Record<string, string> = {
  open:       'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',
  in_kitchen: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300',
  ready:      'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300',
  served:     'bg-muted      text-muted-foreground',
  paid:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  cancelled:  'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-300',
}

const paymentMethods = [
  { value: 'cash',      label: 'Cash',      labelAm: 'ጥሬ ገንዘብ',  icon: Banknote },
  { value: 'card',      label: 'Card',      labelAm: 'ካርድ',       icon: CreditCard },
  { value: 'telebirr',  label: 'Telebirr',  labelAm: 'ቴሌብር',     icon: Smartphone },
  { value: 'cbepay',    label: 'CBEPay',    labelAm: 'ሲቢኢ ፔይ',  icon: Smartphone },
]

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  open:       'in_kitchen',
  in_kitchen: 'ready',
  ready:      'served',
}

const nextStatusLabel: Partial<Record<OrderStatus, string>> = {
  open:       'Send to Kitchen',
  in_kitchen: 'Mark Ready',
  ready:      'Mark Served',
}

function ItemRow({ item }: { item: OrderItem }) {
  return (
    <div className={cn(
      'flex items-center gap-3 py-3 border-b border-border last:border-0',
      item.status === 'cancelled' && 'opacity-40 line-through'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {itemStatusIcon[item.status]}
          <p className="text-sm font-semibold">{item.name_snapshot}</p>
        </div>
        {item.note && (
          <p className="text-xs text-muted-foreground mt-0.5 pl-5">Note: {item.note}</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0 text-sm">
        <span className="text-muted-foreground">×{item.quantity}</span>
        <span className="text-xs capitalize text-muted-foreground w-16 text-right">
          {item.status}
        </span>
        <span className="font-bold w-20 text-right">
          {formatETB(item.price_snapshot * item.quantity)}
        </span>
      </div>
    </div>
  )
}

export default function OwnerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const [payMethod, setPayMethod] = useState('cash')

  const { data: order, isLoading, isError } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
    refetchInterval: 10_000,
  })

  const updateStatus = useMutation({
    mutationFn: (status: OrderStatus) => ordersApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order', id] }),
    onError: () => toast.error('Failed to update status'),
  })

  const processPayment = useMutation({
    mutationFn: () => ordersApi.pay(id, { method: payMethod }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Payment recorded · ክፍያ ተመዝግቧል')
    },
    onError: () => toast.error('Payment failed'),
  })

  const cancelOrder = useMutation({
    mutationFn: () => ordersApi.updateStatus(id, 'cancelled'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      router.push('/orders')
    },
    onError: () => toast.error('Failed to cancel order'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="text-center space-y-4 py-20">
        <p className="font-semibold text-destructive">Order not found</p>
        <Button variant="outline" onClick={() => router.back()}>Go back</Button>
      </div>
    )
  }

  const canAdvance = nextStatus[order.status] !== undefined && order.status !== 'paid'
  const canPay     = order.payment_status === 'unpaid' && order.status !== 'cancelled'
  const canCancel  = !['paid', 'cancelled'].includes(order.status)

  return (
    /* Two-column on large screens: details left, actions right */
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl lg:text-3xl font-black truncate">
            {order.table ? `Table ${order.table.number}` : 'Takeaway'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.created_at)} · {formatTime(order.created_at)}
            {order.waiter && ` · ${order.waiter.name}`}
          </p>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-xs font-bold capitalize shrink-0', orderStatusColor[order.status])}>
          {order.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left / main column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="card-kimsha">
            <h2 className="font-bold mb-3">Items · ምግቦች</h2>
            {(order.items ?? []).map(item => (
              <ItemRow key={item.id} item={item} />
            ))}
            {(order.items ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No items</p>
            )}
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
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span><span>−{formatETB(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-lg pt-2 border-t border-border">
              <span>Total</span><span>{formatETB(order.total)}</span>
            </div>
          </div>
        </div>

        {/* ── Right / actions column ── */}
        <div className="space-y-4">
          {/* Status advance */}
          {canAdvance && (
            <div className="card-kimsha space-y-3">
              <h2 className="font-bold text-sm">Order Status</h2>
              <Button
                className="w-full btn-accent border-0"
                onClick={() => updateStatus.mutate(nextStatus[order.status]!)}
                disabled={updateStatus.isPending}
              >
                <RefreshCw className={cn('w-4 h-4 mr-2', updateStatus.isPending && 'animate-spin')} />
                {nextStatusLabel[order.status]}
              </Button>
            </div>
          )}

          {/* Payment */}
          {canPay && (
            <div className="card-kimsha space-y-3">
              <h2 className="font-bold text-sm">Payment · ክፍያ</h2>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setPayMethod(value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 text-xs font-semibold transition-colors',
                      payMethod === value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
              <Button
                className="w-full btn-accent border-0"
                onClick={() => processPayment.mutate()}
                disabled={processPayment.isPending}
              >
                {processPayment.isPending ? 'Processing…' : `Collect ${formatETB(order.total)}`}
              </Button>
            </div>
          )}

          {/* Paid confirmation */}
          {order.payment_status === 'paid' && (
            <div className="card-kimsha bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-center py-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
              <p className="font-bold text-emerald-700 dark:text-emerald-300">Paid</p>
              {order.payment_method && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 capitalize">
                  via {order.payment_method}
                </p>
              )}
            </div>
          )}

          {/* Cancel */}
          {canCancel && (
            <button
              onClick={() => {
                if (confirm('Cancel this order?')) cancelOrder.mutate()
              }}
              className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors py-2"
            >
              Cancel order · ትዕዛዝ ሰርዝ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
