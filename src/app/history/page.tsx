import { History, Clock, Layers, Cloud } from "lucide-react";
import Link from "next/link";
import { RecentlyProcessed } from "@/components/tool/RecentlyProcessed";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";

export default function HistoryPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030306] px-4 py-8 text-white sm:px-6 md:px-12 md:py-12 selection:bg-purple-500/30">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-purple-600/15 via-indigo-600/10 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent blur-[150px]" />
        <div className="absolute bottom-10 left-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-fuchsia-600/10 via-purple-600/10 to-transparent blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 md:space-y-10">
        <PageBreadcrumb items={[{ label: "Files & Activity History" }]} />

        {/* Hero Header Banner Card */}
        <header className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.12] bg-[linear-gradient(135deg,#0d0e20_0%,#090a16_50%,#060812_100%)] p-8 sm:p-10 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]">
          {/* Top Neon Laser Beam */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 via-purple-500 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
          
          {/* Ambient Glows Inside Card */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl opacity-60" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl opacity-40" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-5">
              <div className="flex w-fit items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <History size={14} className="text-purple-400" />
                <span>Unified Archive</span>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white sm:text-5xl md:text-7xl">
                  Processing <span className="bg-[linear-gradient(110deg,#fff_15%,#a5f3fc_50%,#38bdf8_85%,#fff_100%)] bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">History</span>
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-relaxed text-zinc-400 sm:text-base">
                  Every saved output now lives in one unified archive with direct downloads, quick retry actions, and full media previews.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/library"
                className="flex min-h-11 items-center gap-2 rounded-2xl border border-purple-400/40 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-cyan-500/20 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:brightness-125 transition-all"
              >
                <Cloud size={15} className="text-cyan-400" />
                <span>Open Cloud Drive</span>
              </Link>
              <div className="flex min-h-11 w-fit items-center gap-2.5 rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent px-5 py-2.5 text-xs font-black uppercase tracking-wider text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <Clock size={15} className="text-cyan-400" />
                <span>Last 50 Results</span>
              </div>
            </div>
          </div>
        </header>

        <RecentlyProcessed limit={50} fullPage />
      </div>
    </div>
  );
}
