import { api } from './client'
import type { Order, OrderItem, OrderStatus, OrderItemStatus, OrderType } from '@/types/order'

export const ordersApi = {
  list: (params?: { status?: OrderStatus; page?: number; limit?: number }) =>
    api.get<{ data: Order[]; meta: unknown }>('/orders', { params }).then(r => r.data),

  get: (id: string) =>
    api.get<{ data: Order }>(`/orders/${id}`).then(r => r.data.data!),

  create: (data: { table_id?: string; order_type?: OrderType; note?: string; local_id?: string }) =>
    api.post<{ data: Order }>('/orders', data).then(r => r.data.data!),

  updateStatus: (id: string, status: OrderStatus) =>
    api.put(`/orders/${id}/status`, { status }),

  addItem: (orderId: string, data: { item_id: string; quantity: number; note?: string }) =>
    api.post<{ data: OrderItem }>(`/orders/${orderId}/items`, data).then(r => r.data.data!),

  updateItemStatus: (orderId: string, itemId: string, status: OrderItemStatus) =>
    api.put(`/orders/${orderId}/items/${itemId}/status`, { status }),

  removeItem: (orderId: string, itemId: string) =>
    api.delete(`/orders/${orderId}/items/${itemId}`),

  pay: (orderId: string, data: { method: string; cashier_id?: string }) =>
    api.post(`/orders/${orderId}/pay`, data),
}
