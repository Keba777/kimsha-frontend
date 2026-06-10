'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    tenant_name: '',
    tenant_slug: '',
    owner_name: '',
    email: '',
    password: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.register(form)
      setAuth(res.token, res.user)
      router.push('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-kimsha">
      <h2 className="text-xl font-bold mb-6">Create your restaurant</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Restaurant name</Label>
          <Input placeholder="Addis Kitchen" value={form.tenant_name} onChange={set('tenant_name')} required />
        </div>
        <div className="space-y-1.5">
          <Label>Slug (URL-safe ID)</Label>
          <Input placeholder="addis-kitchen" value={form.tenant_slug} onChange={set('tenant_slug')} required pattern="[a-z0-9\-]+" />
        </div>
        <div className="space-y-1.5">
          <Label>Your name</Label>
          <Input placeholder="Abebe Kebede" value={form.owner_name} onChange={set('owner_name')} required />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" placeholder="you@restaurant.com" value={form.email} onChange={set('email')} required />
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
        </div>
        <Button type="submit" className="w-full btn-accent border-0" disabled={loading}>
          {loading ? 'Creating…' : 'Create Restaurant'}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </div>
    </div>
  )
}
