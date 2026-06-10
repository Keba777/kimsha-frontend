'use client'

import { db } from '@/lib/db/dexie'
import { syncApi } from '@/lib/api/sync'
import { tablesApi } from '@/lib/api/tables'
import type { SyncOperation } from '@/types/sync'
import { v4 as uuidv4 } from 'uuid'

export function getDeviceId(): string {
  let id = localStorage.getItem('kimsha_device_id')
  if (!id) {
    id = uuidv4()
    localStorage.setItem('kimsha_device_id', id)
  }
  return id
}

export async function pushQueue(): Promise<void> {
  const pending = await db.syncQueue.where('status').equals('pending').toArray()
  if (pending.length === 0) return

  const operations: SyncOperation[] = pending.map(item => ({
    local_id: item.local_id,
    entity: item.entity,
    action: item.action as 'create' | 'update',
    payload: JSON.parse(item.payload),
  }))

  try {
    const results = await syncApi.push(getDeviceId(), operations)
    for (const result of results) {
      const item = pending.find(p => p.local_id === result.local_id)
      if (!item) continue
      await db.syncQueue.update(item.id, { status: result.status })
    }
  } catch {
    // Will retry on next sync
  }
}

export async function pullMenu(): Promise<void> {
  try {
    const snapshot = await syncApi.menuSnapshot() as { items: unknown[]; categories: unknown[] }
    if (snapshot?.items) {
      await db.menuItems.clear()
      await db.menuItems.bulkPut(snapshot.items as never[])
    }
    if (snapshot?.categories) {
      await db.categories.clear()
      await db.categories.bulkPut(snapshot.categories as never[])
    }
    localStorage.setItem('kimsha_menu_synced_at', new Date().toISOString())
  } catch {
    // Serve from cache
  }
}

export async function pullTables(): Promise<void> {
  try {
    const tables = await tablesApi.list()
    await db.diningTables.clear()
    await db.diningTables.bulkPut(tables)
  } catch {
    // Serve from cache
  }
}

export async function runSync(): Promise<void> {
  if (!navigator.onLine) return
  await Promise.all([pushQueue(), pullMenu(), pullTables()])
}
