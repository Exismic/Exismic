export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] pointer-events-none flex flex-col justify-between">
      {/* Top Instant Navigation Progress Bar */}
      <div className="w-full h-1 bg-zinc-900/60 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-2/3 bg-linear-to-r from-purple-500 via-cyan-400 to-amber-300 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-[routeProgress_1.2s_ease-in-out_infinite]" />
      </div>

      {/* Subtle Central Loading Indicator */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl shadow-2xl animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-300">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
}
