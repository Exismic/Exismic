export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-zinc-900/80 rounded-xl" />
          <div className="h-4 w-80 bg-zinc-900/50 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-zinc-900/60 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-3">
            <div className="h-4 w-24 bg-zinc-800/80 rounded" />
            <div className="h-8 w-16 bg-zinc-800/60 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="h-64 rounded-3xl bg-zinc-900/30 border border-white/5 p-6" />
    </div>
  );
}
