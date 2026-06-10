'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/admin/login') return
    const token = localStorage.getItem('kimsha_admin_token')
    if (!token) router.replace('/admin/login')
  }, [pathname, router])

  return <>{children}</>
}
