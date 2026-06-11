'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tenantApi, type UpdateTenantPayload } from '@/lib/api/tenant'
import { useAuthStore } from '@/store/auth.store'
import type { Tenant } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Building2, User } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()

  const { data: tenant } = useQuery<Tenant>({
    queryKey: ['tenant'],
    queryFn: tenantApi.get,
  })

  const [form, setForm] = useState<UpdateTenantPayload>({
    name: '', name_am: '', phone: '', address: '',
    timezone: 'Africa/Addis_Ababa', currency: 'ETB',
    tax_rate: 0, service_charge: 0,
  })

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name,
        name_am: tenant.name_am ?? '',
        phone: tenant.phone ?? '',
        address: tenant.address ?? '',
        timezone: tenant.timezone ?? 'Africa/Addis_Ababa',
        currency: tenant.currency ?? 'ETB',
        tax_rate: tenant.tax_rate ?? 0,
        service_charge: tenant.service_charge ?? 0,
      })
    }
  }, [tenant])

  const updateMut = useMutation({
    mutationFn: () => tenantApi.update(form),
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Could not save settings'),
  })

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-3xl font-black">Settings</h1>

      {/* Profile (read-only) */}
      <div className="card-kimsha space-y-4">
        <div className="flex items-center gap-2 font-bold">
          <User className="w-4 h-4" /> Your Account
        </div>
        <Separator />
        <div className="space-y-1">
          <p className="text-sm font-medium">{user?.name}</p>
          {user?.name_am && <p className="text-xs text-muted-foreground">{user.name_am}</p>}
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Restaurant settings */}
      <form
        onSubmit={e => { e.preventDefault(); updateMut.mutate() }}
        className="card-kimsha space-y-5"
      >
        <div className="flex items-center gap-2 font-bold">
          <Building2 className="w-4 h-4" /> Restaurant
        </div>
        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label>Name (Amharic)</Label>
            <Input value={form.name_am} placeholder="ስም" onChange={e => setForm(f => ({ ...f, name_am: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} placeholder="+251..." onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Address</Label>
          <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Tax Rate (%)</Label>
            <Input type="number" min="0" max="100" step="0.1"
              value={form.tax_rate}
              onChange={e => setForm(f => ({ ...f, tax_rate: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Service Charge (%)</Label>
            <Input type="number" min="0" max="100" step="0.1"
              value={form.service_charge}
              onChange={e => setForm(f => ({ ...f, service_charge: parseFloat(e.target.value) || 0 }))} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Timezone</Label>
          <Input value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} />
        </div>

        <Button type="submit" className="btn-accent border-0" disabled={updateMut.isPending}>
          {updateMut.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}
