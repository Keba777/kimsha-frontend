'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Building2, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils/cn'

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tenants', label: 'Tenants', icon: Building2 },
]

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, token, logout } = useAuthStore()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!token || user?.role !== 'super_admin') router.replace('/login')
  }, [token, user, router])

  if (!token || user?.role !== 'super_admin') return null

  function handleLogout() {
    logout()
    router.push('/login')
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border shrink-0">
        <div className="px-5 py-5 border-b border-border">
          <h1 className="text-xl font-black tracking-tight">ቅምሻ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Admin Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive(href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full px-3 py-2 rounded-xl hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <div>
            <span className="font-black text-lg">ቅምሻ</span>
            <span className="text-xs text-muted-foreground ml-2">Admin</span>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="md:hidden fixed inset-y-0 right-0 z-50 w-64 bg-card border-l border-border flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <p className="font-bold text-sm">Admin Portal</p>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-xl hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {nav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive(href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-border">
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full px-3 py-2.5 rounded-xl hover:bg-muted transition-colors">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
