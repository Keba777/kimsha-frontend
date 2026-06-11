import { api } from './client'
import type { User } from '@/types/auth'

export interface CreateUserPayload {
  name: string
  name_am?: string
  email: string
  phone?: string
  password: string
  role: string
  pin?: string
}

export interface UpdateUserPayload {
  name: string
  name_am?: string
  phone?: string
  role: string
}

const unwrap = <T>(p: Promise<{ data: { data: T } }>) => p.then(r => r.data.data)

export const usersApi = {
  list: () => unwrap<User[]>(api.get('/users')),
  create: (data: CreateUserPayload) => unwrap<User>(api.post('/users', data)),
  update: (id: string, data: UpdateUserPayload) => unwrap<User>(api.put(`/users/${id}`, data)),
  remove: (id: string) => api.delete(`/users/${id}`),
  setPin: (id: string, pin: string) => api.put(`/users/${id}/pin`, { pin }),
}
