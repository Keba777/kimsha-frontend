'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login(form)
      setAuth(res.token, res.user)
      const role = res.user.role
      // Keep loading=true through the navigation so the button never flips back
      if (role === 'super_admin') router.push('/admin/dashboard')
      else if (role === 'kitchen') router.push('/kitchen/display')
      else if (role === 'waiter') router.push('/waiter/tables')
      else if (role === 'cashier') router.push('/cashier/checkout')
      else router.push('/dashboard')
      // intentionally no setLoading(false) on success — page unmounts during redirect
    } catch {
      toast.error('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div className="card-kimsha">
      <h2 className="text-xl font-bold mb-6">Sign in</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@restaurant.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full btn-accent border-0" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        New restaurant?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Create account
        </Link>
      </div>
      <div className="mt-2 text-center">
        <Link href="/pin" className="text-sm text-muted-foreground hover:text-foreground">
          PIN Login (Staff)
        </Link>
      </div>
    </div>
  )
}
