'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '@/lib/api/menu'
import { formatETB } from '@/lib/utils/currency'
import type { MenuItem, Category } from '@/types/menu'
import { Plus, ToggleLeft, ToggleRight, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function ItemCard({ item }: { item: MenuItem }) {
  const qc = useQueryClient()
  const toggle = useMutation({
    mutationFn: () => menuApi.toggleItem(item.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-items'] }),
  })

  return (
    <div className={cn('card-kimsha', !item.is_available && 'opacity-50')}>
      {item.image_url && (
        <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded-2xl mb-3" />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{item.name}</p>
          {item.name_am && <p className="text-xs text-muted-foreground truncate">{item.name_am}</p>}
          <p className="text-primary font-black mt-1">{formatETB(item.price)}</p>
        </div>
        <button
          onClick={() => toggle.mutate()}
          className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
        >
          {item.is_available
            ? <ToggleRight className="w-5 h-5 text-primary" />
            : <ToggleLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}

export default function MenuPage() {
  const [catId, setCatId] = useState<string>('')
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: menuApi.listCategories })
  const { data: items = [] } = useQuery({
    queryKey: ['menu-items', catId],
    queryFn: () => menuApi.listItems(catId ? { category_id: catId } : {}),
  })

  const cats = categories as Category[]
  const menuItems = items as MenuItem[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Menu · ምናሌ</h1>
          <p className="text-sm text-muted-foreground">{menuItems.length} items</p>
        </div>
        <Link href="/menu/items/new">
          <Button className="btn-accent border-0 gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setCatId('')}
          className={cn('tab-pill whitespace-nowrap', catId === '' && 'tab-pill-active')}
        >
          All
        </button>
        {cats.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCatId(cat.id)}
            className={cn('tab-pill whitespace-nowrap', catId === cat.id && 'tab-pill-active')}
          >
            {cat.icon && <span className="mr-1">{cat.icon}</span>}
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {menuItems.map(item => <ItemCard key={item.id} item={item} />)}
      </div>

      {menuItems.length === 0 && (
        <div className="card-kimsha text-center py-16 text-muted-foreground">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No items yet</p>
          <p className="text-sm mt-1">ምንም ምናሌ አልተጨመረም</p>
        </div>
      )}
    </div>
  )
}
