import { create } from 'zustand'
import type { MenuItem } from '@/types/menu'

interface CartItem {
  menu_item: MenuItem
  quantity: number
  note: string
}

interface CartState {
  orderId: string | null
  tableId: string | null
  items: CartItem[]
  setOrder: (orderId: string, tableId?: string) => void
  addItem: (item: MenuItem, quantity?: number, note?: string) => void
  removeItem: (itemId: string) => void
  updateQty: (itemId: string, quantity: number) => void
  clear: () => void
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  orderId: null,
  tableId: null,
  items: [],

  setOrder: (orderId, tableId) => set({ orderId, tableId }),

  addItem: (item, quantity = 1, note = '') => {
    const existing = get().items.find(i => i.menu_item.id === item.id)
    if (existing) {
      set(s => ({ items: s.items.map(i => i.menu_item.id === item.id ? { ...i, quantity: i.quantity + quantity } : i) }))
    } else {
      set(s => ({ items: [...s.items, { menu_item: item, quantity, note }] }))
    }
  },

  removeItem: (itemId) => set(s => ({ items: s.items.filter(i => i.menu_item.id !== itemId) })),

  updateQty: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId)
      return
    }
    set(s => ({ items: s.items.map(i => i.menu_item.id === itemId ? { ...i, quantity } : i) }))
  },

  clear: () => set({ orderId: null, tableId: null, items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.menu_item.price * i.quantity, 0),
}))
