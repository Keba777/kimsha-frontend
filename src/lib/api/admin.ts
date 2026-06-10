import axios from 'axios'
import type { PlatformStats, TenantListItem, TenantDetail, CreateTenantPayload } from '@/types/admin'
import type { AuthResponse } from '@/types/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

export const adminApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

adminApi.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('kimsha_admin_token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kimsha_admin_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

const unwrap = <T>(p: Promise<{ data: { data: T } }>) => p.then(r => r.data.data)

export const adminAuthApi = {
  login: (email: string, password: string) =>
    unwrap<AuthResponse>(adminApi.post('/admin/login', { email, password })),
}

export const tenantsApi = {
  list: () => unwrap<TenantListItem[]>(adminApi.get('/admin/tenants')),
  get: (id: string) => unwrap<TenantDetail>(adminApi.get(`/admin/tenants/${id}`)),
  create: (data: CreateTenantPayload) =>
    unwrap<{ tenant: TenantListItem; owner: unknown }>(adminApi.post('/admin/tenants', data)),
  setStatus: (id: string, active: boolean) =>
    unwrap<{ active: boolean }>(adminApi.patch(`/admin/tenants/${id}/status`, { active })),
}

export const statsApi = {
  get: () => unwrap<PlatformStats>(adminApi.get('/admin/stats')),
}
