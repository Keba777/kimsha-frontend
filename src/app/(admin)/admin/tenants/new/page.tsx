'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { tenantsApi } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const defaultForm = {
  tenant_name: '',
  tenant_slug: '',
  owner_name: '',
  email: '',
  password: '',
  plan: 'free',
}

export default function NewTenantPage() {
  const router = useRouter()
  const [form, setForm] = useState(defaultForm)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const create = useMutation({
    mutationFn: tenantsApi.create,
    onSuccess: () => {
      toast.success('Tenant created')
      router.push('/admin/tenants')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Failed to create tenant')
    },
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    create.mutate(form)
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Tenant</h1>
          <p className="text-sm text-muted-foreground">Create a restaurant and its owner account</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="border border-border rounded-2xl p-6 space-y-5">
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Restaurant</p>
          <div className="space-y-1.5">
            <Label>Restaurant name</Label>
            <Input
              placeholder="Addis Kitchen"
              value={form.tenant_name}
              onChange={e => {
                setForm(f => ({
                  ...f,
                  tenant_name: e.target.value,
                  tenant_slug: f.tenant_slug || autoSlug(e.target.value),
                }))
              }}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input
              placeholder="addis-kitchen"
              value={form.tenant_slug}
              onChange={set('tenant_slug')}
              pattern="[a-z0-9\-]+"
              required
            />
            <p className="text-xs text-muted-foreground">Unique URL identifier — lowercase letters, numbers, hyphens only</p>
          </div>
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Select value={form.plan} onValueChange={v => setForm(f => ({ ...f, plan: v ?? 'free' }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t border-border pt-5 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner Account</p>
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input
              placeholder="Abebe Kebede"
              value={form.owner_name}
              onChange={set('owner_name')}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="owner@restaurant.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Temporary password</Label>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={set('password')}
              minLength={8}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={create.isPending}>
          {create.isPending ? 'Creating…' : 'Create Tenant'}
        </Button>
      </form>
    </div>
  )
}
