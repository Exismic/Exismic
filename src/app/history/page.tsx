import { History, Sparkles } from "lucide-react";
import { RecentlyProcessed } from "@/components/tool/RecentlyProcessed";

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-[#030303] px-4 py-8 text-white sm:px-6 md:px-12 md:py-14">
      <div className="mx-auto max-w-7xl space-y-10 md:space-y-14">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8 md:rounded-[3rem] md:p-10">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-accent-purple/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-5">
              <div className="flex w-fit min-h-10 items-center gap-2 rounded-full border border-accent-purple/20 bg-accent-purple/10 px-4 text-[10px] font-black uppercase tracking-widest text-accent-purple">
                <History size={14} />
                Unified Results
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white sm:text-5xl md:text-7xl">
                  Processing <span className="gradient-text">History</span>
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-relaxed text-zinc-500 sm:text-base">
                  Every saved output now lives in one premium archive with direct downloads, retry links, and clean tool labels.
                </p>
              </div>
            </div>
            <div className="flex min-h-12 w-fit items-center gap-2 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 px-5 text-[10px] font-black uppercase tracking-widest text-cyan-200">
              <Sparkles size={14} />
              Last 50 Results
            </div>
          </div>
        </header>

        <RecentlyProcessed limit={50} fullPage />
      </div>
    </div>
  );
}
