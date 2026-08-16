export default function ToolsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-64 bg-zinc-900/80 rounded-xl" />
        <div className="h-4 w-96 bg-zinc-900/50 rounded-lg" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-48 rounded-3xl bg-zinc-900/40 border border-white/5 p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-800/60" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 bg-zinc-800/80 rounded-md" />
                <div className="h-3 w-16 bg-zinc-800/40 rounded-md" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-800/40 rounded-md" />
              <div className="h-3 w-3/4 bg-zinc-800/40 rounded-md" />
            </div>
            <div className="h-8 w-full bg-zinc-800/50 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
