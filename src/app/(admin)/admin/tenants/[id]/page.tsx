'use client'

import { use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { tenantsApi } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/types/auth'

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['admin-tenant', id],
    queryFn: () => tenantsApi.get(id),
  })

  const toggleStatus = useMutation({
    mutationFn: (active: boolean) => tenantsApi.setStatus(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenant', id] })
      qc.invalidateQueries({ queryKey: ['admin-tenants'] })
      toast.success('Status updated')
    },
    onError: () => toast.error('Failed to update status'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-40 bg-muted rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!tenant) return <p className="text-muted-foreground">Tenant not found</p>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{tenant.name}</h1>
            {tenant.is_active
              ? <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="w-4 h-4" />Active</span>
              : <span className="flex items-center gap-1 text-sm text-destructive"><XCircle className="w-4 h-4" />Suspended</span>
            }
          </div>
          <p className="text-sm text-muted-foreground">{tenant.slug}</p>
        </div>
        <Button
          variant={tenant.is_active ? 'destructive' : 'default'}
          size="sm"
          disabled={toggleStatus.isPending}
          onClick={() => toggleStatus.mutate(!tenant.is_active)}
        >
          {tenant.is_active ? 'Suspend' : 'Activate'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Users</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{tenant.user_count}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Orders</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{tenant.order_count}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ETB {(tenant.revenue ?? 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Restaurant Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted-foreground">Plan</p><Badge variant="outline" className="capitalize mt-0.5">{tenant.plan}</Badge></div>
          <div><p className="text-muted-foreground">Currency</p><p className="font-medium">{tenant.currency}</p></div>
          <div><p className="text-muted-foreground">Timezone</p><p className="font-medium">{tenant.timezone}</p></div>
          <div><p className="text-muted-foreground">Tax rate</p><p className="font-medium">{tenant.tax_rate}%</p></div>
          {tenant.phone && <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{tenant.phone}</p></div>}
          {tenant.address && <div><p className="text-muted-foreground">Address</p><p className="font-medium">{tenant.address}</p></div>}
        </CardContent>
      </Card>

      {tenant.owner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Owner</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{tenant.owner.name}</p>
            <p className="text-muted-foreground">{tenant.owner.email}</p>
            {tenant.owner.phone && <p className="text-muted-foreground">{tenant.owner.phone}</p>}
          </CardContent>
        </Card>
      )}

      {tenant.users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">All Staff ({tenant.users.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium">Email</th>
                  <th className="text-left px-4 py-2.5 font-medium">Role</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tenant.users.map((u: User) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2.5 font-medium">{u.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="capitalize">{u.role}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      {u.is_active
                        ? <span className="text-green-600">Active</span>
                        : <span className="text-muted-foreground">Inactive</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
