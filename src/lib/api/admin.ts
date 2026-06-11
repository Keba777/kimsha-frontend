import type { PlatformStats, TenantListItem, TenantDetail, CreateTenantPayload } from '@/types/admin'
import { api } from './client'

const unwrap = <T>(p: Promise<{ data: { data: T } }>) => p.then(r => r.data.data)

export const tenantsApi = {
  list: () => unwrap<TenantListItem[]>(api.get('/admin/tenants')),
  get: (id: string) => unwrap<TenantDetail>(api.get(`/admin/tenants/${id}`)),
  create: (data: CreateTenantPayload) =>
    unwrap<{ tenant: TenantListItem; owner: unknown }>(api.post('/admin/tenants', data)),
  setStatus: (id: string, active: boolean) =>
    unwrap<{ active: boolean }>(api.patch(`/admin/tenants/${id}/status`, { active })),
}

export const statsApi = {
  get: () => unwrap<PlatformStats>(api.get('/admin/stats')),
}
