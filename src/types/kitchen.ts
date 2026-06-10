export type TicketStatus = 'queued' | 'cooking' | 'done' | 'cancelled'

export interface KitchenTicket {
  id: string
  tenant_id: string
  order_id: string
  item_id?: string
  table_ref: string
  item_name: string
  quantity: number
  note: string
  priority: number
  status: TicketStatus
  started_at?: string
  done_at?: string
  created_at: string
}
