import type { Tenant, User } from './auth'

export interface TenantListItem extends Tenant {
  owner_name: string
  owner_email: string
  user_count: number
  order_count: number
}

export interface TenantDetail extends Tenant {
  owner: User | null
  users: User[]
  user_count: number
  order_count: number
  revenue: number
}

export interface PlatformStats {
  total_tenants: number
  active_tenants: number
  total_users: number
  total_orders: number
  total_revenue: number
}

export interface CreateTenantPayload {
  tenant_name: string
  tenant_slug: string
  owner_name: string
  email: string
  password: string
  plan?: string
}
