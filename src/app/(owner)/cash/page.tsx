'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cashApi } from '@/lib/api/cash'
import { formatETB } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import type { CashTransaction } from '@/types/payment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowDownLeft, ArrowUpRight, Wallet, Lock, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type TxAction = 'open' | 'close' | 'in' | 'out'

const txTypeColors: Record<string, string> = {
  open: 'text-blue-600',
  close: 'text-slate-500',
  in: 'text-green-600',
  out: 'text-red-500',
}

const txTypeIcons: Record<string, React.ElementType> = {
  open: Unlock,
  close: Lock,
  in: ArrowDownLeft,
  out: ArrowUpRight,
}

export default function CashPage() {
  const qc = useQueryClient()
  const [action, setAction] = useState<TxAction | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const { data: transactions = [] } = useQuery<CashTransaction[]>({
    queryKey: ['cash-summary'],
    queryFn: cashApi.summary,
    refetchInterval: 30_000,
  })

  const mut = useMutation({
    mutationFn: () => {
      const amt = parseFloat(amount)
      if (!action || isNaN(amt) || amt <= 0) throw new Error('invalid')
      const fns: Record<TxAction, () => Promise<CashTransaction>> = {
        open: () => cashApi.openShift(amt, note),
        close: () => cashApi.closeShift(amt, note),
        in: () => cashApi.cashIn(amt, note),
        out: () => cashApi.cashOut(amt, note),
      }
      return fns[action]()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-summary'] })
      toast.success('Transaction recorded')
      setAction(null); setAmount(''); setNote('')
    },
    onError: () => toast.error('Transaction failed'),
  })

  const balance = transactions.length > 0 ? transactions[transactions.length - 1].balance : 0
  const totalIn = transactions.filter(t => t.type === 'in' || t.type === 'open').reduce((s, t) => s + t.amount, 0)
  const totalOut = transactions.filter(t => t.type === 'out' || t.type === 'close').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Cash</h1>

      {/* Balance card */}
      <div className="card-kimsha bg-primary text-primary-foreground">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6" />
          <span className="font-semibold">Today's Register</span>
        </div>
        <p className="text-4xl font-black">{formatETB(balance)}</p>
        <div className="flex gap-6 mt-4 text-sm opacity-80">
          <span>In: {formatETB(totalIn)}</span>
          <span>Out: {formatETB(totalOut)}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { key: 'open', label: 'Open Shift', icon: Unlock, variant: 'blue' },
          { key: 'in', label: 'Cash In', icon: ArrowDownLeft, variant: 'green' },
          { key: 'out', label: 'Cash Out', icon: ArrowUpRight, variant: 'red' },
          { key: 'close', label: 'Close Shift', icon: Lock, variant: 'slate' },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setAction(key)}
            className="card-kimsha flex flex-col items-center gap-2 py-4 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <Icon className={cn('w-5 h-5', txTypeColors[key])} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Transaction log */}
      <div className="card-kimsha">
        <h2 className="font-bold text-lg mb-4">Today's Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions today</p>
        ) : (
          <div className="space-y-0 divide-y divide-border">
            {[...transactions].reverse().map(tx => {
              const Icon = txTypeIcons[tx.type] ?? Wallet
              return (
                <div key={tx.id} className="flex items-center gap-3 py-3">
                  <Icon className={cn('w-4 h-4 shrink-0', txTypeColors[tx.type])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{tx.type}</p>
                    {tx.note && <p className="text-xs text-muted-foreground truncate">{tx.note}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn('text-sm font-bold', tx.type === 'out' || tx.type === 'close' ? 'text-red-500' : 'text-green-600')}>
                      {tx.type === 'out' || tx.type === 'close' ? '-' : '+'}{formatETB(tx.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatTime(tx.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Action dialog */}
      <Dialog open={!!action} onOpenChange={open => { if (!open) { setAction(null); setAmount(''); setNote('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{action?.replace('-', ' ')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); mut.mutate() }} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Amount (ETB)</Label>
              <Input
                type="number" min="0.01" step="0.01"
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" required autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Note (optional)</Label>
              <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Reason…" />
            </div>
            <Button type="submit" className="w-full btn-accent border-0" disabled={mut.isPending}>
              {mut.isPending ? 'Saving…' : 'Confirm'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
