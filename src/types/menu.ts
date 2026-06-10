export type ItemType = 'food' | 'drink' | 'other'

export interface Category {
  id: string
  tenant_id: string
  name: string
  name_am: string
  icon: string
  sort_order: number
  is_active: boolean
  items?: MenuItem[]
}

export interface AddOn {
  id: string
  item_id: string
  name: string
  name_am: string
  price: number
  is_required: boolean
  max_select: number
}

export interface MenuItem {
  id: string
  tenant_id: string
  category_id?: string
  category?: Category
  name: string
  name_am: string
  description: string
  description_am: string
  price: number
  image_url: string
  item_type: ItemType
  is_available: boolean
  is_featured: boolean
  prep_time_min: number
  sort_order: number
  add_ons?: AddOn[]
}
