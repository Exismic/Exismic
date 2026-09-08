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

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <PageBreadcrumb items={[{ label: "Creation History" }]} />

        {/* Clean Modern Studio Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
              <History size={13} className="text-cyan-400" />
              <span>Personal Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Creation History
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              All processed outputs, prompts, and settings. Re-run or edit any previous creation with 1 click.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/library"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <Cloud size={14} className="text-cyan-400" />
              <span>Cloud Drive</span>
            </Link>
          </div>
        </div>

        <RecentlyProcessed limit={50} fullPage />
      </div>
    </div>
  );
}
