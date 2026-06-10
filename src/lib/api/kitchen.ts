import { api } from './client'
import type { KitchenTicket, TicketStatus } from '@/types/kitchen'

export const kitchenApi = {
  activeTickets: () =>
    api.get<{ data: KitchenTicket[] }>('/kitchen/tickets').then(r => r.data.data ?? []),

  updateStatus: (id: string, status: TicketStatus) =>
    api.put(`/kitchen/tickets/${id}/status`, { status }),
}

export function createKitchenWS(tenantId: string): WebSocket {
  const wsUrl = (process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080/api/v1/kitchen/ws')
  const token = localStorage.getItem('kimsha_token') ?? ''
  return new WebSocket(`${wsUrl}?token=${token}`)
}
