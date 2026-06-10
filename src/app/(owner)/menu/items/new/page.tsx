'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Resolver } from 'react-hook-form'

import { menuApi } from '@/lib/api/menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/image-upload'
import type { Category } from '@/types/menu'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  name_am: z.string().min(1, 'Amharic name is required'),
  description: z.string(),
  description_am: z.string(),
  price: z.number().positive('Price must be greater than 0'),
  category_id: z.string().optional(),
  item_type: z.enum(['food', 'drink', 'other']),
  prep_time_min: z.number().int().min(0),
  is_featured: z.boolean(),
  image_url: z.string(),
})

type FormValues = z.infer<typeof schema>

export default function NewItemPage() {
  const router = useRouter()
  const qc = useQueryClient()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: menuApi.listCategories,
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      item_type: 'food',
      prep_time_min: 0,
      is_featured: false,
      description: '',
      description_am: '',
      image_url: '',
    },
  })

  const create = useMutation({
    mutationFn: (data: FormValues) => menuApi.createItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success('Item added to menu')
      router.push('/menu')
    },
    onError: () => toast.error('Failed to create item — please try again'),
  })

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/menu">
          <button type="button" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black">New Item · አዲስ ምናሌ</h1>
          <p className="text-sm text-muted-foreground">Add a new item to your menu</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => create.mutate(data))} className="card-kimsha space-y-5">

        {/* Image */}
        <div className="space-y-1.5">
          <Label>Image · ምስል</Label>
          <Controller
            name="image_url"
            control={control}
            render={({ field }) => (
              <ImageUpload value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Names */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name (EN)</Label>
            <Input id="name" placeholder="e.g. Tibs" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name_am">Name (AM) · ስም</Label>
            <Input id="name_am" placeholder="ለምሳሌ ጥብስ" {...register('name_am')} />
            {errors.name_am && <p className="text-xs text-destructive">{errors.name_am.message}</p>}
          </div>
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">Description (EN)</Label>
            <textarea
              id="description"
              rows={2}
              placeholder="Short description…"
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none"
              {...register('description')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description_am">Description (AM)</Label>
            <textarea
              id="description_am"
              rows={2}
              placeholder="አጭር መግለጫ…"
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none"
              {...register('description_am')}
            />
          </div>
        </div>

        {/* Price + Prep time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (ETB) · ዋጋ</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prep_time_min">Prep time (min)</Label>
            <Input
              id="prep_time_min"
              type="number"
              min="0"
              placeholder="15"
              {...register('prep_time_min', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Type + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="item_type">Type · ዓይነት</Label>
            <select
              id="item_type"
              className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              {...register('item_type')}
            >
              <option value="food">Food · ምግብ</option>
              <option value="drink">Drink · መጠጥ</option>
              <option value="other">Other · ሌላ</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category_id">Category · ምድብ</Label>
            <select
              id="category_id"
              className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              {...register('category_id')}
            >
              <option value="">— None —</option>
              {(categories as Category[]).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-input w-4 h-4 accent-primary"
            {...register('is_featured')}
          />
          <span className="text-sm font-medium">Featured item · ተመራጭ ምናሌ</span>
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            className="btn-accent border-0 flex-1"
            disabled={create.isPending}
          >
            {create.isPending ? 'Saving…' : 'Add Item · ጨምር'}
          </Button>
          <Link href="/menu" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
