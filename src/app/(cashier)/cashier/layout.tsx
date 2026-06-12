'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CreditCard, Clock, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useRoleGuard } from '@/lib/hooks/useRoleGuard'
import { OfflineBanner } from '@/components/pwa/OfflineBanner'
import { cn } from '@/lib/utils/cn'

const tabs = [
  { href: '/cashier/checkout', label: 'Checkout',  labelAm: 'ክፍያ',  icon: CreditCard },
  { href: '/cashier/history',  label: 'History',   labelAm: 'ታሪክ',  icon: Clock },
]

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { logout } = useAuthStore()
  const { user, ready } = useRoleGuard(['cashier'])

  if (!ready) return null

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar (lg+) ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-card">
        <div className="px-6 py-5 border-b border-border">
          <p className="font-black text-xl tracking-tight">ቅምሻ</p>
          <p className="text-xs text-muted-foreground mt-0.5">Cashier · ካሸሪ</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(({ href, label, labelAm, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-sm leading-tight">{label}</p>
                  <p className="text-[11px] opacity-70 leading-tight">{labelAm}</p>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border space-y-1">
          {user && <p className="px-4 pb-2 text-xs text-muted-foreground truncate">{user.name}</p>}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm leading-tight">Sign out</p>
              <p className="text-[11px] opacity-70 leading-tight">ውጣ</p>
            </div>
          </button>
        </div>
      </aside>

      {/* ── Content ───────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <div>
            <span className="font-black text-lg tracking-tight">ቅምሻ</span>
            {user && <span className="text-xs text-muted-foreground ml-2">{user.name}</span>}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <OfflineBanner />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>

        {/* ── Bottom tab bar (mobile only) ──────────── */}
        <nav className="lg:hidden border-t border-border bg-card safe-area-bottom">
          <div className="flex">
            {tabs.map(({ href, label, labelAm, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                  <span className="text-[10px] opacity-60">{labelAm}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
