'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useRoleGuard } from '@/lib/hooks/useRoleGuard'
import { OfflineBanner } from '@/components/pwa/OfflineBanner'

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { logout } = useAuthStore()
  const { user, ready } = useRoleGuard(['kitchen'])

  if (!ready) return null

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div>
          <span className="font-black text-xl tracking-tight">ቅምሻ</span>
          <span className="text-xs text-muted-foreground ml-2">Kitchen · ኩሽና</span>
        </div>
        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-muted-foreground">{user.name}</span>}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign out · ውጣ</span>
          </button>
        </div>
      </header>
      <OfflineBanner />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
