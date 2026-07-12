import { constructMetadata, SITE_URL } from "@/lib/seo";
import { Metadata } from "next";
import { Sparkles, Play, MonitorSmartphone } from "lucide-react";
import Link from "next/link";
import { CATEGORY_ANIM_STYLES } from "@/lib/category-styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "AI Screenshot to Code - Convert UI Designs to React & Tailwind",
  description: "Transform your UI screenshots into clean, production-ready React and Tailwind CSS code instantly using advanced AI vision models.",
  canonicalUrl: `${SITE_URL}/tools/screenshot-to-code`,
  noIndex: true,
});

export default function ScreenshotToCodePage() {
  const isGold = true;
  const animStyle = CATEGORY_ANIM_STYLES['ai'];

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 pt-24">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-[#0b0c12] p-10 sm:p-16 lg:p-24 flex flex-col items-center justify-center text-center shadow-2xl group max-w-4xl w-full">
        <div className={cn("absolute inset-0 blur-[100px] opacity-40 animate-pulse transition-all duration-1000", isGold ? "bg-amber-500/20" : animStyle.aura)} />
        <div className={cn("absolute inset-[-50%] animate-[spin_8s_linear_infinite] opacity-30", isGold ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.3)_25%,transparent_50%)]" : animStyle.spinIdle)} />
        <div className="absolute inset-0 bg-[#0b0c12]/80 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_4s_linear_infinite]" />
        
        <div className="relative z-10 flex flex-col items-center max-w-2xl space-y-10">
          <div className="flex size-24 sm:size-32 items-center justify-center rounded-[2.5rem] bg-[#0b0c12] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
            <div className={cn("absolute inset-0 blur-xl animate-pulse", isGold ? "bg-amber-500/30" : animStyle.aura)} />
            <div className={cn("absolute inset-[-100%] animate-[spin_3s_linear_infinite]", isGold ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.6)_25%,transparent_50%)]" : animStyle.spinHover)} />
            <div className="absolute inset-[2px] rounded-[calc(2.5rem-2px)] bg-[#0b0c12] flex items-center justify-center z-10">
              <MonitorSmartphone size={56} className={cn("relative z-20 transition-all duration-500", isGold ? "text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" : animStyle.iconGlow)} />
            </div>
          </div>
          
          <div className="space-y-6 flex flex-col items-center">
            <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-opacity-10 backdrop-blur-md shadow-lg text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]", isGold ? "border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : animStyle.badge)}>
              <Sparkles size={14} className={isGold ? "text-amber-400" : "opacity-80"} />
              In Development
            </div>
            <h2 className={cn("text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]", isGold ? "bg-[linear-gradient(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]" : animStyle.textGrad)}>
              Screenshot to Code
            </h2>
            <p className="text-sm sm:text-base font-medium leading-relaxed text-zinc-400 px-4">
              We are currently engineering the high-performance backend for this tool. It will be available very soon.
            </p>
          </div>

          <div className="pt-6 w-full sm:w-auto">
            <Link href="/tools" className={cn("relative overflow-hidden flex min-h-14 items-center justify-center rounded-2xl px-12 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border", isGold ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] border-amber-300/50" : animStyle.buttonGrad)}>
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_2s_linear_infinite]" />
              <span className="relative z-10 flex items-center gap-3">Explore Live Tools <Play size={14} className="fill-current" /></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
