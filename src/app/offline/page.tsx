export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-6">
      <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
        <span className="text-3xl">📡</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">You&apos;re Offline</h1>
      <p className="text-muted-foreground mb-1">ኢንተርኔት ግንኙነት የለም</p>
      <p className="text-sm text-muted-foreground max-w-xs mt-2">
        ቅምሻ will continue working with your local data. Orders will sync when you reconnect.
      </p>
      <p className="text-xs text-muted-foreground mt-6">
        ትዕዛዞቹ ከኢንተርኔት ጋር ሲገናኙ ወደ ሰርቨር ይላካሉ
      </p>
    </div>
  )
}
