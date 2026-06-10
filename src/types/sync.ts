export interface SyncOperation {
  local_id: string
  entity: string
  action: 'create' | 'update'
  payload: Record<string, unknown>
}

export interface SyncResult {
  local_id: string
  server_id?: string
  status: 'synced' | 'failed'
  error?: string
}

export interface SyncQueueItem {
  id: string
  entity: string
  local_id: string
  action: string
  payload: string
  attempts: number
  status: 'pending' | 'synced' | 'failed'
  created_at: string
}
