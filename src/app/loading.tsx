export default function Loading() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 overflow-x-hidden relative">
      {/* Top Instant Navigation Progress Laser */}
      <div className="fixed top-0 inset-x-0 z-[9999] h-[2px] bg-zinc-900 overflow-hidden pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-300 shadow-[0_0_15px_rgba(34,211,238,0.9)] animate-[routeProgress_1.2s_ease-in-out_infinite]" />
      </div>

      {/* Main Skeleton Layout (Matches Dashboard max-w-7xl) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-8 md:pt-14 pb-36 md:pb-32 space-y-12 md:space-y-16 animate-pulse">
        
        {/* 1. Hero Greeting Skeleton */}
        <div className="space-y-4">
          <div className="w-36 h-7 rounded-full bg-white/[0.06] border border-white/[0.08]" />
          <div className="w-80 sm:w-96 h-12 rounded-2xl bg-white/[0.07]" />
          <div className="w-64 sm:w-80 h-5 rounded-xl bg-white/[0.04]" />
          
          {/* Quick Launch Pods Skeleton (6 tiles) */}
          <div className="pt-6 space-y-4">
            <div className="w-40 h-4 rounded-lg bg-white/[0.05]" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-24 sm:h-28 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3.5 flex flex-col justify-between"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/[0.06]" />
                  <div className="w-20 h-3.5 rounded-md bg-white/[0.06]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Stats Row Skeleton (4 widgets) */}
        <div className="grid gap-4 sm:gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="h-44 rounded-[2.25rem] bg-white/[0.03] border border-white/[0.06] p-6 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06]" />
                <div className="w-16 h-6 rounded-full bg-white/[0.05]" />
              </div>
              <div className="space-y-2">
                <div className="w-24 h-3 rounded-md bg-white/[0.04]" />
                <div className="w-32 h-8 rounded-xl bg-white/[0.07]" />
              </div>
            </div>
          ))}
        </div>

        {/* 3. Catalog Grid Skeleton */}
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
