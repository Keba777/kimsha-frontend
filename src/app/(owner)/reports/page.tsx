'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/lib/api/reports'
import { formatETB } from '@/lib/utils/currency'
import { todayISO } from '@/lib/utils/date'
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react'

interface DailyStats { total_revenue: number; total_orders: number; paid_orders: number; avg_order: number }
interface TopItem { item_id: string; name: string; quantity: number; revenue: number }
interface HourlySale { hour: number; revenue: number; orders: number }
interface WaiterStat { waiter_id: string; name: string; orders: number; revenue: number }

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 truncate shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function ReportsPage() {
  const [date, setDate] = useState(todayISO())
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(todayISO())

  const { data: daily } = useQuery<DailyStats>({
    queryKey: ['reports-daily', date],
    queryFn: () => reportsApi.daily(date),
  })
  const { data: topItems = [] } = useQuery<TopItem[]>({
    queryKey: ['reports-items', from, to],
    queryFn: () => reportsApi.topItems(from, to),
  })
  const { data: hourly = [] } = useQuery<HourlySale[]>({
    queryKey: ['reports-hourly', date],
    queryFn: () => reportsApi.hourly(date),
  })
  const { data: waiters = [] } = useQuery<WaiterStat[]>({
    queryKey: ['reports-waiters', from, to],
    queryFn: () => reportsApi.waiters(from, to),
  })

  const maxItemQty = Math.max(...topItems.map(i => i.quantity), 1)
  const maxHourlyRev = Math.max(...hourly.map(h => h.revenue), 1)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black">Reports</h1>

      {/* Daily KPIs */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Date</label>
          <input
            type="date" value={date} max={todayISO()}
            onChange={e => setDate(e.target.value)}
            className="text-sm border border-border rounded-xl px-3 py-1.5 bg-background"
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', value: formatETB(daily?.total_revenue ?? 0), icon: DollarSign, accent: true },
            { label: 'Orders', value: String(daily?.total_orders ?? 0), icon: ShoppingBag },
            { label: 'Paid', value: String(daily?.paid_orders ?? 0), icon: TrendingUp },
            { label: 'Avg Order', value: formatETB(daily?.avg_order ?? 0), icon: DollarSign },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className="card-kimsha">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${accent ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Date range for items + waiters */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium">Range</span>
        <input type="date" value={from} max={to}
          onChange={e => setFrom(e.target.value)}
          className="border border-border rounded-xl px-3 py-1.5 bg-background" />
        <span className="text-muted-foreground">to</span>
        <input type="date" value={to} min={from} max={todayISO()}
          onChange={e => setTo(e.target.value)}
          className="border border-border rounded-xl px-3 py-1.5 bg-background" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Items */}
        <div className="card-kimsha space-y-4">
          <h2 className="font-bold text-lg">Top Menu Items</h2>
          {topItems.length === 0
            ? <p className="text-sm text-muted-foreground py-6 text-center">No data for this period</p>
            : topItems.map(item => (
              <div key={item.item_id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium truncate">{item.name}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{item.quantity} sold · {formatETB(item.revenue)}</span>
                </div>
                <Bar value={item.quantity} max={maxItemQty} label="" />
              </div>
            ))}
        </div>

        {/* Waiter Stats */}
        <div className="card-kimsha space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2"><Users className="w-4 h-4" />Waiter Performance</h2>
          {waiters.length === 0
            ? <p className="text-sm text-muted-foreground py-6 text-center">No data for this period</p>
            : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-left pb-2">Name</th>
                    <th className="text-right pb-2">Orders</th>
                    <th className="text-right pb-2">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {waiters.map(w => (
                    <tr key={w.waiter_id}>
                      <td className="py-2 font-medium">{w.name}</td>
                      <td className="py-2 text-right">{w.orders}</td>
                      <td className="py-2 text-right font-semibold">{formatETB(w.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>

      {/* Hourly Sales */}
      <div className="card-kimsha">
        <h2 className="font-bold text-lg mb-6">Hourly Sales</h2>
        {hourly.length === 0
          ? <p className="text-sm text-muted-foreground text-center py-6">No sales data for this date</p>
          : (
            <div className="flex items-end gap-1 h-32">
              {Array.from({ length: 24 }, (_, hour) => {
                const entry = hourly.find(h => h.hour === hour)
                const height = entry ? Math.max(8, Math.round((entry.revenue / maxHourlyRev) * 100)) : 0
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-primary/20 hover:bg-primary rounded-t transition-colors cursor-default"
                      style={{ height: `${height}%`, minHeight: height > 0 ? 4 : 0 }}
                      title={entry ? `${formatETB(entry.revenue)} · ${entry.orders} orders` : ''}
                    />
                    {hour % 4 === 0 && (
                      <span className="text-[10px] text-muted-foreground absolute -bottom-5">{hour}h</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
      </div>
    </div>
  )
}
