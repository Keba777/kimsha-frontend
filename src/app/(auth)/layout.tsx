export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-foreground tracking-tight">ቅምሻ</h1>
          <p className="text-sm text-muted-foreground mt-1">Kimsha · Restaurant Operations</p>
        </div>
        {children}
      </div>
    </div>
  )
}
