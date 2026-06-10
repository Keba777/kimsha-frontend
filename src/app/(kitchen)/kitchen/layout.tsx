import { OfflineBanner } from '@/components/pwa/OfflineBanner'

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background dark">
      <OfflineBanner />
      {children}
    </div>
  )
}
