export type TableStatus = 'free' | 'occupied' | 'reserved' | 'cleaning'

export interface Table {
  id: string
  tenant_id: string
  number: number
  name: string
  name_am: string
  capacity: number
  section: string
  status: TableStatus
  created_at: string
}
