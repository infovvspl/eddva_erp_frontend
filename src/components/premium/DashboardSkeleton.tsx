// Loading placeholder matching the dashboard's bento layout, so the page doesn't jump on load.
export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <div className="h-40 rounded-3xl bg-slate-200/70" />
          <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-3xl bg-slate-200/70" />
            ))}
          </div>
        </div>
        <div className="h-80 rounded-3xl bg-slate-200/70 lg:col-span-4" />
      </div>
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="h-64 rounded-3xl bg-slate-200/70 lg:col-span-7" />
        <div className="h-64 rounded-3xl bg-slate-200/70 lg:col-span-5" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-3xl bg-slate-200/70" />
        ))}
      </div>
    </div>
  );
}
