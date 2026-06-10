import { api } from './client'

export const reportsApi = {
  daily: (date?: string) =>
    api.get('/reports/daily', { params: date ? { date } : {} }).then(r => r.data.data),

  topItems: (from?: string, to?: string) =>
    api.get('/reports/items', { params: { from, to } }).then(r => r.data.data ?? []),

  hourly: (date?: string) =>
    api.get('/reports/hourly', { params: date ? { date } : {} }).then(r => r.data.data ?? []),

  waiters: (from?: string, to?: string) =>
    api.get('/reports/waiters', { params: { from, to } }).then(r => r.data.data ?? []),
}
