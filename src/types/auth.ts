export type UserRole = 'super_admin' | 'owner' | 'manager' | 'waiter' | 'kitchen' | 'cashier'

export interface User {
  id: string
  tenant_id: string
  name: string
  name_am: string
  email: string
  phone: string
  role: UserRole
  is_active: boolean
  last_login?: string
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Tenant {
  id: string
  name: string
  name_am: string
  slug: string
  phone: string
  address: string
  timezone: string
  currency: string
  tax_rate: number
  service_charge: number
  plan: string
  is_active: boolean
  created_at: string
}
