export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="text-center max-w-xl mx-auto space-y-4">
        <div className="h-10 w-48 bg-zinc-900/80 rounded-2xl mx-auto" />
        <div className="h-4 w-72 bg-zinc-900/50 rounded-lg mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-96 rounded-3xl bg-zinc-900/40 border border-white/5 p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 mx-auto" />
              <div className="h-6 w-32 bg-zinc-800/80 rounded-lg mx-auto" />
              <div className="h-4 w-48 bg-zinc-800/40 rounded mx-auto" />
            </div>
            <div className="h-12 w-full bg-zinc-800/60 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
