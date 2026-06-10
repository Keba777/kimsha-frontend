import { api } from './client'
import type { AuthResponse } from '@/types/auth'

export const authApi = {
  register: (data: { tenant_name: string; tenant_slug: string; owner_name: string; email: string; password: string }) =>
    api.post<{ data: AuthResponse }>('/auth/register', data).then(r => r.data.data!),

  login: (data: { email: string; password: string }) =>
    api.post<{ data: AuthResponse }>('/auth/login', data).then(r => r.data.data!),

  pinLogin: (data: { tenant_slug: string; pin: string }) =>
    api.post<{ data: AuthResponse }>('/auth/pin-login', data).then(r => r.data.data!),
}
