'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Grid3X3, ShoppingBag, Plus } from 'lucide-react'
import { OfflineBanner } from '@/components/pwa/OfflineBanner'
import { cn } from '@/lib/utils/cn'

const tabs = [
  { href: '/waiter/tables', label: 'Tables', labelAm: 'ጠረጴዛ', icon: Grid3X3 },
  { href: '/waiter/new-order', label: 'New Order', labelAm: 'አዲስ', icon: Plus },
  { href: '/waiter/orders', label: 'My Orders', labelAm: 'ትዕዛዞቼ', icon: ShoppingBag },
]

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-screen bg-background">
      <OfflineBanner />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      {/* Bottom tab bar */}
      <nav className="border-t border-border bg-card safe-area-bottom">
        <div className="flex">
          {tabs.map(({ href, label, labelAm, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            const isNew = href === '/waiter/new-order'
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                  isNew && 'relative'
                )}
              >
                {isNew ? (
                  <div className="w-12 h-12 -mt-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                <span>{label}</span>
                <span className="text-[10px] opacity-60">{labelAm}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
