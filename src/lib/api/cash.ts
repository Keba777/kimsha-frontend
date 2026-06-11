import { api } from './client'
import type { CashTransaction } from '@/types/payment'

const unwrap = <T>(p: Promise<{ data: { data: T } }>) => p.then(r => r.data.data)

export const cashApi = {
  summary: () => unwrap<CashTransaction[]>(api.get('/cash/summary')),
  openShift: (amount: number, note?: string) =>
    unwrap<CashTransaction>(api.post('/cash/open', { amount, note })),
  closeShift: (amount: number, note?: string) =>
    unwrap<CashTransaction>(api.post('/cash/close', { amount, note })),
  cashIn: (amount: number, note?: string) =>
    unwrap<CashTransaction>(api.post('/cash/in', { amount, note })),
  cashOut: (amount: number, note?: string) =>
    unwrap<CashTransaction>(api.post('/cash/out', { amount, note })),
}
