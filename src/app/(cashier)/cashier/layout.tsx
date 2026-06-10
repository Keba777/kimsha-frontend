import { OfflineBanner } from '@/components/pwa/OfflineBanner'

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-black mb-6">Cashier · ካሸሪ</h1>
        {children}
      </div>
    </div>
  )
}
