'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { menuApi } from '@/lib/api/menu'
import { ordersApi } from '@/lib/api/orders'
import { useCartStore } from '@/store/cart.store'
import { formatETB } from '@/lib/utils/currency'
import type { MenuItem, Category } from '@/types/menu'
import { Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function MenuItemCard({ item }: { item: MenuItem }) {
  const { items, addItem, updateQty } = useCartStore()
  const cartItem = items.find(i => i.menu_item.id === item.id)

  return (
    <div className="card-kimsha p-3 lg:p-4 flex flex-col gap-2">
      <p className="font-bold text-sm lg:text-base leading-tight">{item.name}</p>
      {item.name_am && <p className="text-xs text-muted-foreground">{item.name_am}</p>}
      <p className="text-primary font-black text-sm">{formatETB(item.price)}</p>
      {cartItem ? (
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={() => updateQty(item.id, cartItem.quantity - 1)}
            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="font-bold text-sm flex-1 text-center">{cartItem.quantity}</span>
          <button
            onClick={() => addItem(item)}
            className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => addItem(item)}
          className="mt-auto w-full bg-muted hover:bg-muted/80 rounded-2xl py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      )}
    </div>
  )
}

function CartPanel({ onSubmit, isPending }: { onSubmit: () => void; isPending: boolean }) {
  const { items, updateQty, clear, total } = useCartStore()
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 p-8">
        <ShoppingBag className="w-12 h-12 opacity-20" />
        <p className="font-semibold text-sm">Cart is empty</p>
        <p className="text-xs">Add items from the menu · ምናሌ ውስጥ ይምረጡ</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map(ci => (
          <div key={ci.menu_item.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{ci.menu_item.name}</p>
              <p className="text-xs text-muted-foreground">{formatETB(ci.menu_item.price)} each</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => updateQty(ci.menu_item.id, ci.quantity - 1)}
                className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-sm font-bold">{ci.quantity}</span>
              <button
                onClick={() => updateQty(ci.menu_item.id, ci.quantity + 1)}
                className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <p className="w-20 text-right text-sm font-black shrink-0">
              {formatETB(ci.menu_item.price * ci.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{totalQty} item{totalQty !== 1 ? 's' : ''}</span>
          <span className="font-black text-xl">{formatETB(total())}</span>
        </div>
        <Button
          className="w-full btn-accent border-0"
          onClick={onSubmit}
          disabled={isPending}
        >
          {isPending ? 'Sending…' : 'Send to Kitchen · ወደ ኩሽና ላክ'}
        </Button>
        <button
          onClick={clear}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors py-1"
        >
          <Trash2 className="w-3 h-3" /> Clear cart
        </button>
      </div>
    </div>
  )
}

export default function NewOrderPage() {
  const router = useRouter()
  const [catId, setCatId] = useState('')
  const { items, addItem, updateQty, clear, total } = useCartStore()

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
      router.push(`/waiter/orders/${order.id}`)
    },
    onError: () => toast.error('Failed to place order'),
  })

  const cats = categories as Category[]
  const menu = menuItems as MenuItem[]
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  return (
    /* ── Large screen: side-by-side panels ── */
    <div className="flex flex-col lg:flex-row h-full">

      {/* ── Menu panel ── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <div className="p-4 lg:px-8 lg:py-6 border-b border-border">
          <h1 className="text-2xl lg:text-3xl font-black">New Order · አዲስ ትዕዛዝ</h1>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto px-4 lg:px-8 py-3 border-b border-border shrink-0">
          <button
            className={cn('tab-pill whitespace-nowrap', catId === '' && 'tab-pill-active')}
            onClick={() => setCatId('')}
          >
            All
          </button>
          {cats.map(c => (
            <button
              key={c.id}
              className={cn('tab-pill whitespace-nowrap', catId === c.id && 'tab-pill-active')}
              onClick={() => setCatId(c.id)}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {menu.map(item => <MenuItemCard key={item.id} item={item} />)}
          </div>
          {menu.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="font-semibold">No items found</p>
              <p className="text-sm mt-1">Try a different category · ሌላ ምድብ ይምረጡ</p>
            </div>
          )}
        </div>

        {/* Mobile cart bar (only shown on small screens) */}
        {items.length > 0 && (
          <div className="lg:hidden p-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span className="font-semibold">{totalQty} item{totalQty !== 1 ? 's' : ''}</span>
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

      {/* ── Cart panel (large screens only) ── */}
      <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 border-l border-border bg-card">
        <div className="px-5 py-5 border-b border-border flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          <h2 className="font-bold text-lg">Cart</h2>
          {totalQty > 0 && (
            <span className="ml-auto w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {totalQty}
            </span>
          )}
        </div>
        <div className="flex-1 min-h-0">
          <CartPanel onSubmit={() => submitOrder.mutate()} isPending={submitOrder.isPending} />
        </div>
      </aside>
    </div>
  )
}
