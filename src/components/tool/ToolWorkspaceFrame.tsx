"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Share2, Star, FlaskConical, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ToolReliabilityBadge } from "@/components/tool/ToolReliability";
import { CATEGORY_ANIM_STYLES, type CategoryAnimStyle } from "@/lib/category-styles";

export function ToolWorkspaceHeader({
  name,
  description,
  categoryName,
  categoryId,
  toolId,
  icon: Icon,
  isPro,
  isFavorited,
  showShareToast,
  onShare,
  onFavorite,
}: {
  name: string;
  description: string;
  categoryName: string;
  categoryId: string;
  toolId: string;
  icon: LucideIcon;
  isPro: boolean;
  isFavorited: boolean;
  showShareToast: boolean;
  onShare: () => void;
  onFavorite: () => void;
}) {
  return (
    <header className="border-b border-white/[0.07] pb-6 sm:pb-8">
      <Link
        href={`/category/${categoryId}`}
        className="group mb-5 inline-flex min-h-11 items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500 transition hover:text-white"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
        {categoryName}
      </Link>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-start gap-5 sm:gap-7">
          {/* Logo Box Container */}
          <div className="relative group flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center">
             {/* Idle ambient breathing aura */}
             <div className={cn("absolute -inset-4 rounded-full blur-2xl animate-pulse", isPro ? "bg-amber-500/25" : (CATEGORY_ANIM_STYLES[categoryId]?.aura || "bg-cyan-500/20"))} />
             
             {/* Spinning gradient border (idle) */}
             <div className={cn("absolute inset-0 rounded-2xl animate-[spin_4s_linear_infinite]",
               isPro ? "bg-[conic-gradient(from_0deg,rgba(251,191,36,1)_0%,rgba(245,158,11,1)_33%,rgba(253,230,138,1)_66%,rgba(251,191,36,1)_100%)]"
                     : (CATEGORY_ANIM_STYLES[categoryId]?.spinIdle || CATEGORY_ANIM_STYLES.pdf.spinIdle)
             )} />
             
             {/* Inner glass box to cover the middle of the spinning gradient, leaving only the border */}
             <div className="absolute inset-[2px] rounded-[14px] bg-[#0b0c12] flex items-center justify-center overflow-hidden z-10 transition-transform duration-300 group-hover:scale-[0.98]">
                {/* Subtle glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                
                {/* Floating icon */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <Icon size={32} className={cn("relative z-20 transition-transform duration-300 group-hover:scale-110", isPro ? "text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" : (CATEGORY_ANIM_STYLES[categoryId]?.iconGlow || CATEGORY_ANIM_STYLES.pdf.iconGlow))} />
                </motion.div>

                {/* Shimmer sweep effect (idle) */}
                <motion.div
                  className="absolute top-0 left-[-100%] h-full w-[50%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] z-30"
                  animate={{ left: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
                />
             </div>
          </div>

          <div className="min-w-0 pt-1 sm:pt-2">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] shadow-lg", isPro ? "border border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : (CATEGORY_ANIM_STYLES[categoryId]?.badge || CATEGORY_ANIM_STYLES.pdf.badge))}>
                {categoryName} workspace
              </span>
              {isPro && (
                <span className="relative overflow-hidden rounded-full border border-amber-400/50 bg-amber-400/20 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-amber-200 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.4)_50%,transparent_80%)] bg-[length:200%_100%] animate-[shine_2s_linear_infinite]" />
                  <span className="relative z-10">Pro</span>
                </span>
              )}
              <ToolReliabilityBadge toolId={toolId} />
            </div>
            
            <div className="relative inline-block">
               {/* Background glow for the text */}
               <h1 className={cn("absolute inset-0 break-words text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-[1.05] tracking-tight blur-xl opacity-30 select-none pointer-events-none", isPro ? "text-amber-400" : "text-white")}>
                 {name}
               </h1>
               <div className="relative flex items-center gap-4">
                 <h1 className={cn("relative break-words text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-[1.05] tracking-tight text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]",
                   isPro ? "bg-[linear-gradient(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]"
                         : (CATEGORY_ANIM_STYLES[categoryId]?.textGrad || CATEGORY_ANIM_STYLES.pdf.textGrad)
                 )}>
                   {name}
                 </h1>
                 {toolId === 'image-minecraft-skin' && (
                   <div className="group relative flex cursor-help items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-300 backdrop-blur-md transition hover:bg-cyan-400/20">
                     <FlaskConical size={14} className="mr-1.5" /> BETA
                     <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#0b0c12] px-3 py-2 text-[10px] font-medium normal-case tracking-normal text-zinc-300 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                       This tool is currently under testing.
                     </div>
                   </div>
                 )}
               </div>
            </div>
            
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-zinc-400 sm:text-base">
              {description}
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2 self-start lg:self-auto">
          <AnimatePresence>
            {showShareToast && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg border border-cyan-300/20 bg-[#0b1017] px-3 py-2 text-[8px] font-black uppercase tracking-[0.14em] text-cyan-100 shadow-xl"
              >
                Link copied
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onShare}
            title="Share tool"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-zinc-500 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.06] hover:text-cyan-100 active:scale-95"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={onFavorite}
            title={isFavorited ? "Remove from favorites" : "Save to favorites"}
            className={cn(
              "flex min-h-11 min-w-11 items-center justify-center rounded-lg border transition active:scale-95",
              isFavorited
                ? "border-violet-300/25 bg-violet-300/[0.09] text-violet-200"
                : "border-white/[0.07] bg-white/[0.025] text-zinc-500 hover:border-violet-300/20 hover:bg-violet-300/[0.06] hover:text-violet-100"
            )}
          >
            <Star size={16} className={cn(isFavorited && "fill-current")} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function WorkspaceSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/[0.08] bg-[#090a0f]/78 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </section>
  );
}

export function WorkspaceSectionLabel({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-4 py-3.5 sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-cyan-200">
          <Icon size={15} />
        </div>
        <div className="min-w-0">
          <h2 className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-100">{title}</h2>
          {description && <p className="mt-1 text-[11px] font-medium leading-relaxed text-zinc-600">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
