'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api/orders'
import { formatETB } from '@/lib/utils/currency'
import type { Order } from '@/types/order'
import type { PaymentMethod } from '@/types/payment'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

const payMethods: { value: PaymentMethod; label: string; labelAm: string }[] = [
  { value: 'cash',     label: 'Cash',     labelAm: 'ናቅፋ' },
  { value: 'telebirr', label: 'Telebirr', labelAm: 'ቴሌቢር' },
  { value: 'cbepay',   label: 'CBE Pay',  labelAm: 'ሲቢኢ ፔይ' },
  { value: 'card',     label: 'Card',     labelAm: 'ካርድ' },
]

export default function CheckoutPage() {
  const qc = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('cash')

  const { data } = useQuery({
    queryKey: ['orders-ready'],
    queryFn: () => ordersApi.list({ status: 'ready', limit: 30 }),
    refetchInterval: 10_000,
  })

  const orders = (data?.data ?? []).concat((data as unknown as { data: Order[] })?.data ?? []).filter(
    (o, i, a) => a.findIndex(x => x.id === o.id) === i
  ) as Order[]

  const pay = useMutation({
    mutationFn: () => ordersApi.pay(selectedOrder!.id, { method }),
    onSuccess: () => {
      toast.success('Payment recorded')
      setSelectedOrder(null)
      qc.invalidateQueries({ queryKey: ['orders-ready'] })
    },
    onError: () => toast.error('Payment failed'),
  })

  return (
    <div className="space-y-6">
      {/* Order list */}
      <div className="card-kimsha">
        <h2 className="font-bold mb-4">Ready Orders · ዝግጁ ትዕዛዞች</h2>
        <div className="space-y-2">
          {orders.map(o => (
            <div
              key={o.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-2xl cursor-pointer border-2 transition-all',
                selectedOrder?.id === o.id ? 'border-primary bg-red-50 dark:bg-red-950/10' : 'border-border hover:border-muted-foreground'
              )}
              onClick={() => setSelectedOrder(o)}
            >
              <div>
                <p className="font-bold">{o.table ? `Table ${o.table.number}` : 'Takeaway'}</p>
                <p className="text-xs text-muted-foreground">{o.items?.length ?? 0} items</p>
              </div>
              <p className="font-black">{formatETB(o.total)}</p>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-6">No ready orders</p>
          )}
        </div>
      </div>

      {/* Payment panel */}
      {selectedOrder && (
        <div className="card-kimsha space-y-4">
          <h2 className="font-bold">Payment · ክፍያ</h2>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-black">{formatETB(selectedOrder.total)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {payMethods.map(m => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                className={cn(
                  'rounded-2xl p-3 border-2 text-left transition-all',
                  method === m.value ? 'border-primary bg-red-50 dark:bg-red-950/10' : 'border-border'
                )}
              >
                <p className="font-bold text-sm">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.labelAm}</p>
              </button>
            ))}
          </div>

          <button
            className="w-full btn-accent"
            onClick={() => pay.mutate()}
            disabled={pay.isPending}
          >
            {pay.isPending ? 'Processing…' : `Confirm Payment · ክፍያ አረጋግጥ`}
          </button>
        </div>
      )}
    </div>
  )
}
