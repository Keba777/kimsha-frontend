'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function PINPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [slug, setSlug] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.pinLogin({ tenant_slug: slug, pin })
      setAuth(res.token, res.user)
      const role = res.user.role
      if (role === 'kitchen') router.push('/kitchen/display')
      else if (role === 'cashier') router.push('/cashier/checkout')
      else router.push('/waiter/tables')
    } catch {
      toast.error('Invalid PIN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-kimsha">
      <h2 className="text-xl font-bold mb-2">Staff PIN Login</h2>
      <p className="text-sm text-muted-foreground mb-6">የሰራተኛ PIN ግባ</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Restaurant ID</Label>
          <Input placeholder="addis-kitchen" value={slug} onChange={e => setSlug(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>4-Digit PIN</Label>
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
            className="text-center text-2xl tracking-widest"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            required
          />
        </div>
        <Button type="submit" className="w-full btn-accent border-0" disabled={loading}>
          {loading ? 'Signing in…' : 'Enter'}
        </Button>
      </form>
    </div>
  )
}
