import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types/auth'

export const roleHome: Record<UserRole, string> = {
  super_admin: '/admin/dashboard',
  owner:       '/dashboard',
  manager:     '/dashboard',
  waiter:      '/waiter/tables',
  kitchen:     '/kitchen/display',
  cashier:     '/cashier/checkout',
}

/**
 * Guards a layout to a specific set of roles.
 * - Not authenticated → /login
 * - Wrong role → that role's own home page
 * Returns { user, ready } — render nothing until ready is true.
 */
export function useRoleGuard(allowed: UserRole[]) {
  const router = useRouter()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!token || !user) {
      router.replace('/login')
      return
    }
    if (!allowed.includes(user.role)) {
      router.replace(roleHome[user.role] ?? '/login')
    }
  }, [token, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const ready = !!token && !!user && allowed.includes(user.role)
  return { user, ready }
}
