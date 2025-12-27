import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation Skeleton */}
      <div className="glass-nav h-16 border-b border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 bg-[var(--glass-bg)]" />
            <Skeleton className="h-5 w-24 bg-[var(--glass-bg)]" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full bg-[var(--glass-bg)]" />
            <Skeleton className="h-8 w-32 bg-[var(--glass-bg)]" />
          </div>
        </div>
      </div>

      {/* Hero Banner Skeleton */}
      <div className="border-b border-[var(--glass-border)] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-8 w-64 mb-2 bg-[var(--glass-bg)]" />
          <Skeleton className="h-5 w-96 bg-[var(--glass-bg)]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl bg-[var(--glass-bg)]" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-[var(--glass-bg)]" />
                  <Skeleton className="h-3 w-16 bg-[var(--glass-bg)]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-10 w-10 rounded-xl bg-[var(--glass-bg)]" />
                <Skeleton className="h-6 w-40 bg-[var(--glass-bg)]" />
              </div>
              <Skeleton className="h-40 w-full rounded-xl bg-[var(--glass-bg)]" />
              <div className="mt-6 flex gap-3">
                <Skeleton className="h-10 flex-1 bg-[var(--glass-bg)]" />
                <Skeleton className="h-10 flex-1 bg-[var(--glass-bg)]" />
              </div>
            </div>

            <div className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-10 w-10 rounded-xl bg-[var(--glass-bg)]" />
                <Skeleton className="h-6 w-36 bg-[var(--glass-bg)]" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg bg-[var(--glass-bg)]" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-10 w-10 rounded-xl bg-[var(--glass-bg)]" />
                <Skeleton className="h-6 w-28 bg-[var(--glass-bg)]" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl bg-[var(--glass-bg)]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <Skeleton className="h-6 w-48 bg-[var(--glass-bg)]" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-[var(--glass-bg)]" />
        <Skeleton className="h-4 w-5/6 bg-[var(--glass-bg)]" />
        <Skeleton className="h-4 w-4/6 bg-[var(--glass-bg)]" />
      </div>
      <Skeleton className="h-10 w-32 bg-[var(--glass-bg)]" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full bg-[var(--glass-bg)]" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full bg-[var(--glass-bg)]" />
      ))}
    </div>
  );
}
