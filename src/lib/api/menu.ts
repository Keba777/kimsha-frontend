import { api } from './client'
import type { Category, MenuItem } from '@/types/menu'

export const menuApi = {
  listCategories: () =>
    api.get<{ data: Category[] }>('/menu/categories').then(r => r.data.data ?? []),

  createCategory: (data: Partial<Category>) =>
    api.post<{ data: Category }>('/menu/categories', data).then(r => r.data.data!),

  updateCategory: (id: string, data: Partial<Category>) =>
    api.put<{ data: Category }>(`/menu/categories/${id}`, data).then(r => r.data.data!),

  deleteCategory: (id: string) =>
    api.delete(`/menu/categories/${id}`),

  listItems: (params?: { category_id?: string; available?: boolean }) =>
    api.get<{ data: MenuItem[] }>('/menu/items', { params }).then(r => r.data.data ?? []),

  getItem: (id: string) =>
    api.get<{ data: MenuItem }>(`/menu/items/${id}`).then(r => r.data.data!),

  createItem: (data: Partial<MenuItem>) =>
    api.post<{ data: MenuItem }>('/menu/items', data).then(r => r.data.data!),

  updateItem: (id: string, data: Partial<MenuItem>) =>
    api.put<{ data: MenuItem }>(`/menu/items/${id}`, data).then(r => r.data.data!),

  deleteItem: (id: string) =>
    api.delete(`/menu/items/${id}`),

  toggleItem: (id: string) =>
    api.put<{ data: MenuItem }>(`/menu/items/${id}/toggle`).then(r => r.data.data!),
}
