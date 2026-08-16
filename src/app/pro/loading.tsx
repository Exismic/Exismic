export default function ProLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10 animate-pulse">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="h-10 w-64 bg-zinc-900/80 rounded-2xl mx-auto" />
        <div className="h-4 w-96 bg-zinc-900/50 rounded-lg mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="h-[480px] rounded-3xl bg-zinc-900/40 border border-white/5 p-8" />
        <div className="h-[480px] rounded-3xl bg-zinc-900/60 border border-purple-500/20 p-8" />
      </div>
    </div>
  );
}
