export default function ChatLoading() {
  return (
    <div className="h-[calc(100vh-5rem)] flex items-center justify-center p-6 bg-[#030305] animate-pulse">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-2xl border-2 border-purple-500/40 border-t-purple-400 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Initializing AI Studio...
        </span>
      </div>
    </div>
  );
}
