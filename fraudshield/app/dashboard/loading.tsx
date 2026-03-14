export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-3xl border border-white/8 bg-white/[0.03]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl border border-white/8 bg-white/[0.03]"
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-[320px] animate-pulse rounded-3xl border border-white/8 bg-white/[0.03]" />
        <div className="h-[320px] animate-pulse rounded-3xl border border-white/8 bg-white/[0.03]" />
      </div>
    </div>
  );
}
