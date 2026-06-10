import type { MenuItem } from './menu'
import type { Table } from './table'
import type { User } from './auth'

export type OrderType = 'dine_in' | 'takeaway' | 'delivery'
export type OrderStatus = 'open' | 'in_kitchen' | 'ready' | 'served' | 'paid' | 'cancelled'
export type OrderItemStatus = 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export interface AddOnSnapshot {
  id: string
  name: string
  price: number
}

export interface OrderItem {
  id: string
  order_id: string
  item_id: string
  menu_item?: MenuItem
  name_snapshot: string
  price_snapshot: number
  quantity: number
  note: string
  status: OrderItemStatus
  add_ons: AddOnSnapshot[]
  created_at: string
}

export interface Order {
  id: string
  tenant_id: string
  table_id?: string
  table?: Table
  waiter_id?: string
  waiter?: User
  order_type: OrderType
  status: OrderStatus
  note: string
  subtotal: number
  tax_amount: number
  service_charge: number
  discount_amount: number
  total: number
  payment_method?: string
  payment_status: PaymentStatus
  paid_at?: string
  local_id?: string
  items?: OrderItem[]
  created_at: string
  updated_at: string
}
