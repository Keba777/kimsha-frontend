'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { menuApi } from '@/lib/api/menu'
import { api } from '@/lib/api/client'
import { formatETB } from '@/lib/utils/currency'
import type { MenuItem, Category } from '@/types/menu'
import { Plus, ToggleLeft, ToggleRight, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/ui/image-upload'

const emptyForm = {
  name: '', name_am: '', description: '', description_am: '',
  price: '', category_id: '', item_type: 'food', prep_time_min: '0',
  is_featured: false,
}

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
        <button onClick={() => toggle.mutate()} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
          {item.is_available
            ? <ToggleRight className="w-5 h-5 text-primary" />
            : <ToggleLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}

export default function MenuPage() {
  const qc = useQueryClient()
  const [catId, setCatId] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: menuApi.listCategories })
  const { data: items = [] } = useQuery({
    queryKey: ['menu-items', catId],
    queryFn: () => menuApi.listItems(catId ? { category_id: catId } : {}),
  })

  const cats = categories as Category[]
  const menuItems = items as MenuItem[]

  const create = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('name_am', form.name_am)
      fd.append('description', form.description)
      fd.append('description_am', form.description_am)
      fd.append('price', form.price)
      fd.append('item_type', form.item_type)
      fd.append('prep_time_min', form.prep_time_min)
      fd.append('is_featured', String(form.is_featured))
      if (form.category_id) fd.append('category_id', form.category_id)
      if (imageFile) fd.append('image', imageFile)
      return api.post('/menu/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success('Item added')
      closeDialog()
    },
    onError: () => toast.error('Failed to create item'),
  })

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.name_am.trim()) e.name_am = 'Amharic name is required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Valid price required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) create.mutate()
  }

  function closeDialog() {
    setOpen(false)
    setForm(emptyForm)
    setImageFile(null)
    setErrors({})
  }

  const set = (k: keyof typeof emptyForm) => (v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Menu</h1>
          <p className="text-sm text-muted-foreground">{menuItems.length} items</p>
        </div>
        <Button className="btn-accent border-0 gap-2" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        <button onClick={() => setCatId('')} className={cn('tab-pill whitespace-nowrap', catId === '' && 'tab-pill-active')}>
          All
        </button>
        {cats.map(cat => (
          <button key={cat.id} onClick={() => setCatId(cat.id)} className={cn('tab-pill whitespace-nowrap', catId === cat.id && 'tab-pill-active')}>
            {cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.name}
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
          <p className="text-sm mt-1">Click Add Item to get started</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={v => { if (!v) closeDialog() }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Menu Item</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-5 mt-2">
            <div className="space-y-1.5">
              <Label>Image</Label>
              <ImageUpload onChange={setImageFile} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name (EN)</Label>
                <Input placeholder="e.g. Tibs" value={form.name} onChange={e => set('name')(e.target.value)} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Name (AM)</Label>
                <Input placeholder="ለምሳሌ ጥብስ" value={form.name_am} onChange={e => set('name_am')(e.target.value)} />
                {errors.name_am && <p className="text-xs text-destructive">{errors.name_am}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Description (EN)</Label>
                <textarea rows={2} placeholder="Short description…" value={form.description}
                  onChange={e => set('description')(e.target.value)}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Description (AM)</Label>
                <textarea rows={2} placeholder="አጭር መግለጫ…" value={form.description_am}
                  onChange={e => set('description_am')(e.target.value)}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Price (ETB)</Label>
                <Input type="number" step="0.01" min="0" placeholder="0.00"
                  value={form.price} onChange={e => set('price')(e.target.value)} />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Prep time (min)</Label>
                <Input type="number" min="0" placeholder="15"
                  value={form.prep_time_min} onChange={e => set('prep_time_min')(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select value={form.item_type} onChange={e => set('item_type')(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
                  <option value="food">Food</option>
                  <option value="drink">Drink</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select value={form.category_id} onChange={e => set('category_id')(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
                  <option value="">— None —</option>
                  {cats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" className="rounded border-input w-4 h-4 accent-primary"
                checked={form.is_featured} onChange={e => set('is_featured')(e.target.checked)} />
              <span className="text-sm font-medium">Featured item</span>
            </label>

            <div className="flex gap-3 pt-1">
              <Button type="submit" className="btn-accent border-0 flex-1" disabled={create.isPending}>
                {create.isPending ? 'Saving…' : 'Add Item'}
              </Button>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
