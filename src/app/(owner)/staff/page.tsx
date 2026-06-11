'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersApi, type CreateUserPayload, type UpdateUserPayload } from '@/lib/api/users'
import type { User, UserRole } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'

const ROLES: UserRole[] = ['owner', 'manager', 'waiter', 'kitchen', 'cashier']

const roleColors: Record<string, string> = {
  owner: 'bg-primary/10 text-primary',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  waiter: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  kitchen: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  cashier: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const emptyForm = { name: '', name_am: '', email: '', phone: '', password: '', role: 'waiter' as UserRole, pin: '' }

export default function StaffPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data: staff = [], isLoading } = useQuery<User[]>({
    queryKey: ['staff'],
    queryFn: usersApi.list,
  })

  const createMut = useMutation({
    mutationFn: (data: CreateUserPayload) => usersApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); closeSheet(); toast.success('Staff member added') },
    onError: () => toast.error('Could not add staff member'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) => usersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); closeSheet(); toast.success('Updated') },
    onError: () => toast.error('Could not update'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); toast.success('Removed') },
    onError: () => toast.error('Could not remove'),
  })

  function openCreate() { setEditing(null); setForm(emptyForm); setOpen(true) }
  function openEdit(u: User) {
    setEditing(u)
    setForm({ name: u.name, name_am: u.name_am ?? '', email: u.email, phone: u.phone ?? '', password: '', role: u.role, pin: '' })
    setOpen(true)
  }
  function closeSheet() { setOpen(false); setEditing(null) }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      updateMut.mutate({ id: editing.id, data: { name: form.name, name_am: form.name_am, phone: form.phone, role: form.role } })
    } else {
      createMut.mutate({ name: form.name, name_am: form.name_am, email: form.email, phone: form.phone, password: form.password, role: form.role, pin: form.pin || undefined })
    }
  }

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Staff</h1>
          <p className="text-sm text-muted-foreground">{staff.length} team members</p>
        </div>
        <Button className="btn-accent border-0 gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Staff
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-kimsha h-20 animate-pulse bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && staff.length === 0 && (
        <div className="card-kimsha text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No staff yet</p>
          <p className="text-sm mt-1">Add your first team member</p>
        </div>
      )}

      <div className="space-y-3">
        {staff.map(u => (
          <div key={u.id} className="card-kimsha flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center font-bold text-sm shrink-0">
              {u.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm">{u.name}</p>
                {u.name_am && <p className="text-xs text-muted-foreground">{u.name_am}</p>}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[u.role] ?? ''}`}>
                  {u.role}
                </span>
                {!u.is_active && <Badge variant="secondary">Inactive</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{u.email}{u.phone && ` · ${u.phone}`}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(u)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => { if (confirm(`Remove ${u.name}?`)) deleteMut.mutate(u.id) }}
                className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Name (Amharic)</Label>
              <Input value={form.name_am} placeholder="ስም" onChange={e => setForm(f => ({ ...f, name_am: e.target.value }))} />
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} placeholder="+251..." onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label>PIN (4 digits, optional)</Label>
                <Input value={form.pin} maxLength={4} placeholder="1234" onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))} />
              </div>
            )}
            <Button type="submit" className="w-full btn-accent border-0" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Staff Member'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
