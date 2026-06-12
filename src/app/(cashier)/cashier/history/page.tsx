'use client'

import { useQuery } from '@tanstack/react-query'
import { cashApi } from '@/lib/api/cash'
import { formatETB } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import type { Payment } from '@/types/payment'
import { cn } from '@/lib/utils/cn'
import { Banknote, CreditCard, Smartphone, Receipt } from 'lucide-react'

const methodIcon: Record<string, React.ElementType> = {
  cash:     Banknote,
  card:     CreditCard,
  telebirr: Smartphone,
  cbepay:   Smartphone,
}

const methodColor: Record<string, string> = {
  cash:     'text-emerald-600',
  card:     'text-blue-600',
  telebirr: 'text-violet-600',
  cbepay:   'text-orange-600',
}

export default function PaymentHistoryPage() {
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['payments-today'],
    queryFn: cashApi.paymentsToday,
    refetchInterval: 15_000,
  })

  const total        = payments.reduce((s, p) => s + p.amount, 0)
  const cashTotal    = payments.filter(p => p.method === 'cash').reduce((s, p) => s + p.amount, 0)
  const nonCashTotal = total - cashTotal

  const byMethod: Record<string, number> = {}
  for (const p of payments) {
    byMethod[p.method] = (byMethod[p.method] ?? 0) + p.amount
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black">Payment History · የክፍያ ታሪክ</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Today's collections</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-kimsha">
          <p className="text-xs text-muted-foreground">Total Collected</p>
          <p className="text-2xl font-black mt-1">{formatETB(total)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{payments.length} payment{payments.length !== 1 ? 's' : ''}</p>
        </div>
        {Object.entries(byMethod).map(([method, amount]) => {
          const Icon = methodIcon[method] ?? Receipt
          return (
            <div key={method} className="card-kimsha">
              <div className="flex items-center gap-1.5">
                <Icon className={cn('w-3.5 h-3.5', methodColor[method])} />
                <p className="text-xs text-muted-foreground capitalize">{method}</p>
              </div>
              <p className="text-xl font-black mt-1">{formatETB(amount)}</p>
            </div>
          )
        })}
      </div>

      {/* Transaction list */}
      <div className="card-kimsha">
        <h2 className="font-bold mb-4">Transactions</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="font-semibold text-sm">No payments yet today</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {[...payments].reverse().map(p => {
              const Icon = methodIcon[p.method] ?? Receipt
              return (
                <div key={p.id} className="flex items-center gap-3 py-3">
                  <div className={cn('p-2 rounded-xl bg-muted shrink-0', methodColor[p.method])}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold capitalize">{p.method}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(p.created_at)}</p>
                  </div>
                  <p className="font-black text-sm shrink-0">{formatETB(p.amount)}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
