"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Share2, Star, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ToolReliabilityBadge } from "@/components/tool/ToolReliability";

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
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.09] bg-[#0b0c12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_14px_35px_rgba(0,0,0,0.35)] sm:h-16 sm:w-16">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-fuchsia-400/60 via-violet-400/60 to-cyan-300/60" />
            <Icon size={27} className={cn("relative z-10", isPro ? "text-violet-300" : "text-cyan-100")} />
          </div>

          <div className="min-w-0 pt-0.5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-cyan-200/70">
                {categoryName} workspace
              </span>
              {isPro && (
                <span className="rounded-full border border-violet-300/20 bg-violet-300/[0.08] px-2 py-1 text-[7px] font-black uppercase tracking-[0.16em] text-violet-200">
                  Pro
                </span>
              )}
              <ToolReliabilityBadge toolId={toolId} />
            </div>
            <h1 className="break-words text-[clamp(1.75rem,4vw,2.75rem)] font-black leading-[1.02] tracking-tight text-white">
              {name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-zinc-500 sm:text-[15px]">
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
