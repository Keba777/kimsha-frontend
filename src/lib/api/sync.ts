import { api } from './client'
import type { SyncOperation, SyncResult } from '@/types/sync'

export const syncApi = {
  push: (deviceId: string, operations: SyncOperation[]) =>
    api.post<{ data: SyncResult[] }>('/sync/push', { device_id: deviceId, operations }).then(r => r.data.data ?? []),

  menuSnapshot: () =>
    api.get('/sync/menu').then(r => r.data.data),

  tableSnapshot: () =>
    api.get<{ data: unknown[] }>('/sync/tables').then(r => r.data.data ?? []),
}
