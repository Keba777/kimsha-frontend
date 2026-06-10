import { create } from 'zustand'

interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncAt: string | null
  pendingCount: number
  setOnline: (v: boolean) => void
  setSyncing: (v: boolean) => void
  setLastSync: (ts: string) => void
  setPending: (n: number) => void
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  isSyncing: false,
  lastSyncAt: null,
  pendingCount: 0,
  setOnline: (v) => set({ isOnline: v }),
  setSyncing: (v) => set({ isSyncing: v }),
  setLastSync: (ts) => set({ lastSyncAt: ts }),
  setPending: (n) => set({ pendingCount: n }),
}))
