'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Grid3X3, UtensilsCrossed,
  BarChart3, Users, Wallet, Settings, LogOut, Menu, X
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { SyncIndicator } from '@/components/layout/SyncIndicator'
import { OfflineBanner } from '@/components/pwa/OfflineBanner'
import { cn } from '@/lib/utils/cn'

const nav = [
  { href: '/dashboard', label: 'Dashboard', labelAm: 'ዳሽቦርድ', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders', labelAm: 'ትዕዛዞች', icon: ShoppingBag },
  { href: '/tables', label: 'Tables', labelAm: 'ጠረጴዛዎች', icon: Grid3X3 },
  { href: '/menu', label: 'Menu', labelAm: 'ምናሌ', icon: UtensilsCrossed },
  { href: '/reports', label: 'Reports', labelAm: 'ሪፖርቶች', icon: BarChart3 },
  { href: '/staff', label: 'Staff', labelAm: 'ሠራተኞች', icon: Users },
  { href: '/cash', label: 'Cash', labelAm: 'ገንዘብ', icon: Wallet },
  { href: '/settings', label: 'Settings', labelAm: 'ቅንብሮች', icon: Settings },
]

// First 5 shown in mobile bottom bar; rest accessible via "More" drawer
const bottomNav = nav.slice(0, 4)

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleLogout() {
    logout()
    router.push('/login')
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-sidebar shrink-0">
        <div className="px-6 py-5 border-b border-border">
          <h1 className="text-2xl font-black text-foreground tracking-tight">ቅምሻ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.name}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, labelAm, icon: Icon }) => (
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
              <span>{label}</span>
              <span className="ml-auto text-xs opacity-60">{labelAm}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-border space-y-2">
          <SyncIndicator />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full px-3 py-2 rounded-xl hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <h1 className="text-xl font-black tracking-tight">ቅምሻ</h1>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <OfflineBanner />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* ── Mobile bottom tab bar ── */}
        <nav className="md:hidden border-t border-border bg-card shrink-0">
          <div className="flex items-stretch">
            {bottomNav.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[11px] font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className={cn('w-5 h-5', active && 'text-primary')} />
                  {label}
                </Link>
              )
            })}
            {/* "More" button opens the full nav drawer */}
            <button
              onClick={() => setDrawerOpen(true)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[11px] font-medium transition-colors',
                nav.slice(4).some(n => isActive(n.href)) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Menu className="w-5 h-5" />
              More
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile full-nav drawer ── */}
      {drawerOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 right-0 z-50 w-72 bg-card border-l border-border flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="font-bold">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-xl hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {nav.map(({ href, label, labelAm, icon: Icon }) => (
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
                  <span>{label}</span>
                  <span className="ml-auto text-xs opacity-60">{labelAm}</span>
                </Link>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-border space-y-2">
              <SyncIndicator />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
              >
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
