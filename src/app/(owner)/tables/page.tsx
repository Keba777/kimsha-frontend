'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tablesApi } from '@/lib/api/tables'
import type { Table, TableStatus } from '@/types/table'
import { cn } from '@/lib/utils/cn'
import { Users, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const statusLabel: Record<TableStatus, { en: string; am: string }> = {
  free:     { en: 'Free',     am: 'ነፃ' },
  occupied: { en: 'Occupied', am: 'የተያዘ' },
  cleaning: { en: 'Cleaning', am: 'እየተጸዳ' },
  reserved: { en: 'Reserved', am: 'ተይዟል' },
}

function TableCard({
  table,
  onStatus,
  onDelete,
}: {
  table: Table
  onStatus: (s: TableStatus) => void
  onDelete: () => void
}) {
  const nextStatus: Record<TableStatus, TableStatus> = {
    free: 'occupied', occupied: 'cleaning', cleaning: 'free', reserved: 'free',
  }

  return (
    <div className={cn('card-kimsha select-none table-' + table.status)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl font-black text-foreground">{table.number}</span>
        <span className={cn(
          'text-xs font-semibold px-2 py-0.5 rounded-full',
          table.status === 'free'     && 'bg-green-100 text-green-700',
          table.status === 'occupied' && 'bg-red-100 text-red-700',
          table.status === 'cleaning' && 'bg-amber-100 text-amber-700',
          table.status === 'reserved' && 'bg-blue-100 text-blue-700',
        )}>
          {statusLabel[table.status].en}
        </span>
      </div>

      {table.name && <p className="text-sm font-medium">{table.name}</p>}
      {table.section && <p className="text-xs text-muted-foreground capitalize">{table.section}</p>}

      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <Users className="w-3 h-3" />
        <span>{table.capacity} seats</span>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onStatus(nextStatus[table.status])}
          className="flex-1 text-xs font-semibold py-1.5 rounded-xl bg-muted hover:bg-muted/70 transition-colors"
        >
          → {statusLabel[nextStatus[table.status]].en}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete table"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

const sections = ['indoor', 'outdoor', 'vip', 'bar']

export default function TablesPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ number: '', name: '', name_am: '', capacity: '4', section: 'indoor' })

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.list,
    refetchInterval: 10_000,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      tablesApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  })

  const createTable = useMutation({
    mutationFn: () => tablesApi.create({
      number:   parseInt(form.number),
      name:     form.name,
      name_am:  form.name_am,
      capacity: parseInt(form.capacity) || 4,
      section:  form.section,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Table added · ጠረጴዛ ተጨምሯል')
      setOpen(false)
      setForm({ number: '', name: '', name_am: '', capacity: '4', section: 'indoor' })
    },
    onError: () => toast.error('Failed to add table'),
  })

  const deleteTable = useMutation({
    mutationFn: (id: string) => tablesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Table removed')
    },
    onError: () => toast.error('Failed to delete table'),
  })

  const all = tables as Table[]
  const free     = all.filter(t => t.status === 'free').length
  const occupied = all.filter(t => t.status === 'occupied').length

  // Suggest the next table number
  const nextNumber = all.length > 0 ? Math.max(...all.map(t => t.number)) + 1 : 1

  function handleOpen() {
    setForm(f => ({ ...f, number: String(nextNumber) }))
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Tables · ጠረጴዛዎች</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {free} free · {occupied} occupied · {all.length} total
          </p>
        </div>
        <Button onClick={handleOpen} className="btn-accent border-0 gap-2">
          <Plus className="w-4 h-4" />
          Add Table
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {all.map(table => (
          <TableCard
            key={table.id}
            table={table}
            onStatus={(status) => updateStatus.mutate({ id: table.id, status })}
            onDelete={() => {
              if (confirm(`Delete Table ${table.number}?`)) {
                deleteTable.mutate(table.id)
              }
            }}
          />
        ))}
      </div>

      {all.length === 0 && (
        <div className="card-kimsha text-center py-16 text-muted-foreground">
          <p className="text-lg font-semibold">No tables yet</p>
          <p className="text-sm mt-1">Click "Add Table" to get started · ጠረጴዛ ለማስጨመር ጠቅ ያድርጉ</p>
        </div>
      )}

      {/* Add Table dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Table · ጠረጴዛ ጨምር</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={e => { e.preventDefault(); createTable.mutate() }}
            className="space-y-4 mt-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Table Number *</Label>
                <Input
                  type="number" min="1" required
                  value={form.number}
                  onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                  placeholder="1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Seats (Capacity)</Label>
                <Input
                  type="number" min="1" max="20"
                  value={form.capacity}
                  onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                  placeholder="4"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Window Table, Patio 3"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Amharic Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                value={form.name_am}
                onChange={e => setForm(f => ({ ...f, name_am: e.target.value }))}
                placeholder="e.g. ወጭ ጠረጴዛ"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Section</Label>
              <div className="flex flex-wrap gap-2">
                {sections.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, section: s }))}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-sm font-medium border-2 capitalize transition-colors',
                      form.section === s
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-accent border-0"
              disabled={createTable.isPending || !form.number}
            >
              {createTable.isPending ? 'Adding…' : 'Add Table · ጨምር'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
