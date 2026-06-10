'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { menuApi } from '@/lib/api/menu'
import { ordersApi } from '@/lib/api/orders'
import { useCartStore } from '@/store/cart.store'
import { formatETB } from '@/lib/utils/currency'
import type { MenuItem, Category } from '@/types/menu'
import { Plus, Minus, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function NewOrderPage() {
  const router = useRouter()
  const [catId, setCatId] = useState('')
  const { items, addItem, removeItem, updateQty, clear, total } = useCartStore()

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: menuApi.listCategories })
  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items-available', catId],
    queryFn: () => menuApi.listItems({ available: true, ...(catId ? { category_id: catId } : {}) }),
  })

  const submitOrder = useMutation({
    mutationFn: async () => {
      const order = await ordersApi.create({ order_type: 'dine_in' })
      for (const ci of items) {
        await ordersApi.addItem(order.id, { item_id: ci.menu_item.id, quantity: ci.quantity, note: ci.note })
      }
      return order
    },
    onSuccess: (order) => {
      clear()
      toast.success('Order sent to kitchen!')
      router.push(`/orders/${order.id}`)
    },
    onError: () => toast.error('Failed to place order'),
  })

  const cats = categories as Category[]
  const menu = menuItems as MenuItem[]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-black">New Order · አዲስ ትዕዛዝ</h1>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto px-4 py-2 border-b border-border">
        <button className={cn('tab-pill whitespace-nowrap', catId === '' && 'tab-pill-active')} onClick={() => setCatId('')}>All</button>
        {cats.map(c => (
          <button key={c.id} className={cn('tab-pill whitespace-nowrap', catId === c.id && 'tab-pill-active')} onClick={() => setCatId(c.id)}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
        {menu.map(item => {
          const cartItem = items.find(i => i.menu_item.id === item.id)
          return (
            <div key={item.id} className="card-kimsha p-3 flex flex-col gap-2">
              <p className="font-bold text-sm leading-tight">{item.name}</p>
              {item.name_am && <p className="text-xs text-muted-foreground">{item.name_am}</p>}
              <p className="text-primary font-black text-sm">{formatETB(item.price)}</p>
              {cartItem ? (
                <div className="flex items-center gap-2 mt-auto">
                  <button onClick={() => updateQty(item.id, cartItem.quantity - 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-sm flex-1 text-center">{cartItem.quantity}</span>
                  <button onClick={() => addItem(item)} className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={() => addItem(item)} className="mt-auto w-full bg-muted hover:bg-muted/80 rounded-2xl py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Cart summary */}
      {items.length > 0 && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="font-semibold">{items.reduce((s, i) => s + i.quantity, 0)} items</span>
            </div>
            <span className="font-black text-lg">{formatETB(total())}</span>
          </div>
          <Button
            className="w-full btn-accent border-0"
            onClick={() => submitOrder.mutate()}
            disabled={submitOrder.isPending}
          >
            {submitOrder.isPending ? 'Sending…' : 'Send to Kitchen · ወደ ኩሽና ላክ'}
          </Button>
        </div>
      )}
    </div>
  )
}
