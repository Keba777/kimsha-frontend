'use client'

import { useEffect } from 'react'
import { useSyncStore } from '@/store/sync.store'
import { runSync } from '@/lib/sync/engine'

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { setOnline, setSyncing, setLastSync } = useSyncStore()

  useEffect(() => {
    const onOnline = () => {
      setOnline(true)
      doSync()
    }
    const onOffline = () => setOnline(false)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    setOnline(navigator.onLine)

    // Sync on mount if online
    if (navigator.onLine) doSync()

    // Background sync every 30s
    const interval = setInterval(() => {
      if (navigator.onLine) doSync()
    }, 30_000)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      clearInterval(interval)
    }

    async function doSync() {
      setSyncing(true)
      await runSync()
      setSyncing(false)
      setLastSync(new Date().toISOString())
    }
  }, [setOnline, setSyncing, setLastSync])

  return <>{children}</>
}
