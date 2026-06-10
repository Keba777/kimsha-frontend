import Dexie, { type Table } from 'dexie'
import type { MenuItem } from '@/types/menu'
import type { Table as DiningTable } from '@/types/table'
import type { SyncQueueItem } from '@/types/sync'

interface OfflineOrder {
  local_id: string
  server_id?: string
  table_id?: string
  order_type: string
  status: string
  note: string
  subtotal: number
  total: number
  payment_method?: string
  payment_status: string
  is_synced: number
  created_at: string
  updated_at: string
}

interface OfflineOrderItem {
  local_id: string
  order_local_id: string
  item_id: string
  name_snapshot: string
  price_snapshot: number
  quantity: number
  note: string
  status: string
  add_ons: string
  is_synced: number
  created_at: string
}

class KimshaDB extends Dexie {
  menuItems!: Table<MenuItem>
  categories!: Table<{ id: string; name: string; name_am: string; icon: string; sort_order: number }>
  diningTables!: Table<DiningTable>    // renamed to avoid conflict with Dexie.tables
  offlineOrders!: Table<OfflineOrder>
  offlineOrderItems!: Table<OfflineOrderItem>
  syncQueue!: Table<SyncQueueItem>

  constructor() {
    super('kimsha_offline')
    this.version(1).stores({
      menuItems:        'id, category_id, is_available, item_type',
      categories:       'id, sort_order',
      diningTables:     'id, number, status',
      offlineOrders:    'local_id, server_id, status, is_synced',
      offlineOrderItems:'local_id, order_local_id, is_synced',
      syncQueue:        'id, entity, status, created_at',
    })
  }
}

export const db = new KimshaDB()
