import { api } from './client'
import type { Tenant } from '@/types/auth'

const unwrap = <T>(p: Promise<{ data: { data: T } }>) => p.then(r => r.data.data)

export interface UpdateTenantPayload {
  name: string
  name_am?: string
  phone?: string
  address?: string
  timezone?: string
  currency?: string
  tax_rate?: number
  service_charge?: number
}

export const tenantApi = {
  get: () => unwrap<Tenant>(api.get('/tenant')),
  update: (data: UpdateTenantPayload) => unwrap<Tenant>(api.put('/tenant', data)),
}
