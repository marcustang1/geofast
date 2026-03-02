export default function ReportLoading() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Top Bar Skeleton */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="flex gap-3">
            <div className="h-9 w-28 animate-pulse rounded bg-muted" />
            <div className="h-9 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </header>

      <main className="container max-w-4xl space-y-10 py-10">
        {/* Header Skeleton */}
        <section>
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-5 w-80 animate-pulse rounded bg-muted" />
          <div className="mt-3 flex gap-2">
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
          </div>
        </section>

        {/* Score Overview Skeleton */}
        <section className="flex flex-col items-center gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:p-8">
          <div className="h-[140px] w-[140px] animate-pulse rounded-full bg-muted" />
          <div className="grid w-full flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-lg border-l-4 border-l-muted bg-secondary/50 px-4 py-3"
              >
                <div className="h-8 w-12 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </section>

        {/* Tabs Skeleton */}
        <div>
          <div className="flex h-11 gap-2 rounded-lg bg-secondary/50 p-1">
            <div className="h-9 w-24 animate-pulse rounded bg-muted" />
            <div className="h-9 w-20 animate-pulse rounded bg-muted" />
            <div className="h-9 w-28 animate-pulse rounded bg-muted" />
          </div>
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
