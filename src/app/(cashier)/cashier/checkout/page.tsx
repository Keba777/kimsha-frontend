'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api/orders'
import { formatETB } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import type { Order } from '@/types/order'
import type { PaymentMethod } from '@/types/payment'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { CheckCircle2, Banknote, CreditCard, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

const payMethods: { value: PaymentMethod; label: string; labelAm: string; icon: React.ElementType }[] = [
  { value: 'cash',     label: 'Cash',     labelAm: 'ናቅፋ',     icon: Banknote },
  { value: 'telebirr', label: 'Telebirr', labelAm: 'ቴሌቢር',   icon: Smartphone },
  { value: 'cbepay',   label: 'CBE Pay',  labelAm: 'ሲቢኢ ፔይ', icon: Smartphone },
  { value: 'card',     label: 'Card',     labelAm: 'ካርድ',     icon: CreditCard },
]

export default function CheckoutPage() {
  const qc = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('cash')

  const { data } = useQuery({
    queryKey: ['orders-unpaid'],
    queryFn: () => ordersApi.list({ status: 'ready,served', limit: 50 }),
    refetchInterval: 8_000,
  })

  const orders = (data?.data ?? []) as Order[]

  const pay = useMutation({
    mutationFn: () => ordersApi.pay(selectedOrder!.id, { method }),
    onSuccess: () => {
      toast.success('Payment recorded · ክፍያ ተመዝግቧል')
      setSelectedOrder(null)
      qc.invalidateQueries({ queryKey: ['orders-unpaid'] })
      qc.invalidateQueries({ queryKey: ['payments-today'] })
    },
    onError: () => toast.error('Payment failed'),
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black">Checkout · ክፍያ</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {orders.length} order{orders.length !== 1 ? 's' : ''} waiting for payment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── Order list ── */}
        <div className="card-kimsha space-y-2">
          <h2 className="font-bold mb-3">Select Order · ትዕዛዝ ምረጥ</h2>
          {orders.map(o => (
            <div
              key={o.id}
              onClick={() => setSelectedOrder(o)}
              className={cn(
                'flex items-center justify-between p-3 rounded-2xl cursor-pointer border-2 transition-all',
                selectedOrder?.id === o.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              )}
            >
              <div>
                <p className="font-bold">{o.table ? `Table ${o.table.number}` : 'Takeaway'}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(o.created_at)} · {o.items?.length ?? 0} items
                </p>
              </div>
              <div className="text-right">
                <p className="font-black">{formatETB(o.total)}</p>
                <p className={cn(
                  'text-xs font-semibold capitalize',
                  o.status === 'ready'  && 'text-green-600',
                  o.status === 'served' && 'text-blue-600',
                )}>
                  {o.status}
                </p>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="font-semibold text-sm">All caught up!</p>
              <p className="text-xs mt-0.5">No orders waiting for payment</p>
            </div>
          )}
        </div>

        {/* ── Payment panel ── */}
        {selectedOrder ? (
          <div className="card-kimsha space-y-4">
            <h2 className="font-bold">
              Payment — {selectedOrder.table ? `Table ${selectedOrder.table.number}` : 'Takeaway'}
            </h2>

            {/* Items summary */}
            <div className="space-y-1 text-sm">
              {selectedOrder.items?.map(item => (
                <div key={item.id} className="flex justify-between text-muted-foreground">
                  <span>{item.quantity}× {item.name_snapshot}</span>
                  <span>{formatETB(item.price_snapshot * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-black">{formatETB(selectedOrder.total)}</span>
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-2 gap-2">
              {payMethods.map(({ value, label, labelAm, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setMethod(value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all',
                    method === value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <p className="text-sm font-bold">{label}</p>
                  <p className="text-[11px] opacity-70">{labelAm}</p>
                </button>
              ))}
            </div>

            <Button
              className="w-full btn-accent border-0 h-12 text-base"
              onClick={() => pay.mutate()}
              disabled={pay.isPending}
            >
              {pay.isPending ? 'Processing…' : `Collect ${formatETB(selectedOrder.total)}`}
            </Button>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Cancel · ሰርዝ
            </button>
          </div>
        ) : (
          <div className="card-kimsha text-center py-16 text-muted-foreground hidden lg:block">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-sm">Select an order to process payment</p>
          </div>
        )}
      </div>
    </div>
  )
}
