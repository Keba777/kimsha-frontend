'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Grid3X3, UtensilsCrossed,
  BarChart3, Users, Wallet, Settings, LogOut
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'
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

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-sidebar shrink-0">
        <div className="px-6 py-5 border-b border-border">
          <h1 className="text-2xl font-black text-foreground tracking-tight">ቅምሻ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.name}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, labelAm, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                <span className="ml-auto text-xs opacity-60">{labelAm}</span>
              </Link>
            )
          })}
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <OfflineBanner />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
