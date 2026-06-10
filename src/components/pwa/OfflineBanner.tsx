'use client'

import { useSyncStore } from '@/store/sync.store'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const { isOnline } = useSyncStore()
  if (isOnline) return null

  return (
    <div className="bg-amber-500 text-white text-xs font-medium text-center py-2 px-4 flex items-center justify-center gap-2">
      <WifiOff className="w-3 h-3" />
      <span>Offline mode — orders save locally and sync when connected / ከኢንተርኔት ጋር ሲገናኙ ይሳካሉ</span>
    </div>
  )
}
