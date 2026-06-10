export type PaymentMethod = 'cash' | 'card' | 'telebirr' | 'cbepay'

export interface Payment {
  id: string
  tenant_id: string
  order_id: string
  cashier_id?: string
  amount: number
  method: PaymentMethod
  reference: string
  status: string
  notes: string
  created_at: string
}

export interface CashTransaction {
  id: string
  tenant_id: string
  user_id?: string
  type: string
  amount: number
  note: string
  balance: number
  shift_date: string
  created_at: string
}
