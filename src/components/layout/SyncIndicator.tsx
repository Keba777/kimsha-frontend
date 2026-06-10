'use client'

import { useSyncStore } from '@/store/sync.store'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function SyncIndicator() {
  const { isOnline, isSyncing, pendingCount } = useSyncStore()

  return (
    <div className={cn(
      'flex items-center gap-1.5 text-xs px-2 py-1 rounded-full',
      isOnline ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
    )}>
      {isSyncing ? (
        <RefreshCw className="w-3 h-3 animate-spin" />
      ) : isOnline ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      <span>
        {isSyncing ? 'Syncing…' : isOnline ? 'Online' : 'Offline'}
        {pendingCount > 0 && ` · ${pendingCount} pending`}
      </span>
    </div>
  )
}
