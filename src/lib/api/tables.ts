import { api } from './client'
import type { Table, TableStatus } from '@/types/table'

export const tablesApi = {
  list: () =>
    api.get<{ data: Table[] }>('/tables').then(r => r.data.data ?? []),

  create: (data: Partial<Table>) =>
    api.post<{ data: Table }>('/tables', data).then(r => r.data.data!),

  update: (id: string, data: Partial<Table>) =>
    api.put<{ data: Table }>(`/tables/${id}`, data).then(r => r.data.data!),

  delete: (id: string) =>
    api.delete(`/tables/${id}`),

  updateStatus: (id: string, status: TableStatus) =>
    api.put(`/tables/${id}/status`, { status }),
}
