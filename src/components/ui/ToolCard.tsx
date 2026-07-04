"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ICON_MAP, type IconName } from "@/data/tools";
import { ArrowRight, Crown, Star, Zap } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";
import { useState } from "react";
import { ToolReliabilityBadge } from "@/components/tool/ToolReliability";
import { isToolUnavailable } from "@/lib/tool-reliability";

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: IconName;
  href: string;
  popular?: boolean;
  pro?: boolean;
  index?: number;
  initialFavorited?: boolean;
  isProTool?: boolean;
  proPowerPack?: boolean;
  className?: string;
}

const CATEGORY_STYLES: Record<string, { accent: string, glow: string, bg: string }> = {
  pdf: { 
    accent: "from-orange-500 to-red-600", 
    glow: "group-hover:shadow-[0_20px_50px_-10px_rgba(249,115,22,0.4)]",
    bg: "rgba(249, 115, 22, 0.1)"
  },
  image: { 
    accent: "from-blue-400 to-cyan-500", 
    glow: "group-hover:shadow-[0_20px_50px_-10px_rgba(34,211,238,0.4)]",
    bg: "rgba(34, 211, 238, 0.1)"
  },
  audio: { 
    accent: "from-pink-500 to-magenta-500", 
    glow: "group-hover:shadow-[0_20px_50px_-10px_rgba(236, 72, 153, 0.4)]",
    bg: "rgba(236, 72, 153, 0.1)"
  },
  video: { 
    accent: "from-purple-500 to-violet-600", 
    glow: "group-hover:shadow-[0_20px_50px_-10px_rgba(168, 85, 247, 0.4)]",
    bg: "rgba(168, 85, 247, 0.1)"
  },
  ai: { 
    accent: "from-yellow-400 to-amber-600", 
    glow: "group-hover:shadow-[0_20px_50px_-10px_rgba(250, 204, 21, 0.4)]",
    bg: "rgba(250, 204, 21, 0.1)"
  },
  productivity: { 
    accent: "from-emerald-400 to-green-600", 
    glow: "group-hover:shadow-[0_20px_50px_-10px_rgba(16, 185, 129, 0.4)]",
    bg: "rgba(16, 185, 129, 0.1)"
  },
};

export function ToolCard({ id, name, description, icon, href, popular, pro, isProTool, proPowerPack, category, index = 0, initialFavorited = false, className }: ToolCardProps) {
  const isPro = pro || isProTool;
  const unavailable = isToolUnavailable(id);
  const Icon = ICON_MAP[icon] || ICON_MAP.Wand2;
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.pdf;
  const [isFavorited, setIsFavorited] = useState(initialFavorited);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    const result = await toggleFavorite(id);
    if (result.error) {
      setIsFavorited(isFavorited);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={cn("group relative h-full min-w-0", className)}
    >
      <Link href={href} className="block h-full rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303] sm:rounded-[2.5rem] md:rounded-[3rem]">
        <div className={cn(
          "relative h-full min-h-[260px] flex flex-col p-5 sm:p-6 md:p-8 backdrop-blur-3xl transition-all duration-500 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden touch-manipulation",
          "border border-white/5",
          unavailable && "opacity-85",
          isPro 
            ? "bg-zinc-950/60 border-purple-500/10 shadow-[inset_0_1px_2px_rgba(168,85,247,0.05)] hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]" 
            : "bg-zinc-950/40 hover:bg-zinc-900/60 hover:border-white/20 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]",
          "md:group-hover:scale-[1.03] active:scale-[0.99]"
        )}>
          {/* Shine Animation Layer */}
          <div className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden pointer-events-none z-10">
            <div className={cn(
              "absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/10 to-transparent",
              isPro && "via-purple-500/20"
            )} />
          </div>

          {/* Background Glows */}
          <div className={cn(
            "absolute -inset-px rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-2xl -z-10 bg-linear-to-br",
            isPro ? "from-purple-600/40 to-blue-600/40" : style.accent
          )} />

          {/* Badges & Favorite - Organized Layout */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 flex flex-col items-end gap-2 sm:gap-3 z-20">
            <div className="flex max-w-[calc(100vw-7rem)] flex-wrap justify-end gap-1.5 sm:gap-2">
               {popular && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-[8px] font-black uppercase tracking-widest text-amber-500">
                  <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                  Popular
                </div>
              )}
              {proPowerPack && !isPro && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 backdrop-blur-md border border-cyan-300/20 text-[8px] font-black uppercase tracking-widest text-cyan-200">
                  <Zap size={9} className="fill-cyan-200" />
                  Pro Boost
                </div>
              )}
              {isPro && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 backdrop-blur-md border border-purple-300/20 text-[8px] font-black uppercase tracking-widest text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.12)]">
                  <Crown size={9} className="fill-purple-200" />
                  Pro Only
                </div>
              )}
              <ToolReliabilityBadge toolId={id} />
            </div>
            
            <button 
              onClick={handleFavoriteClick}
              aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
              className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 touch-manipulation",
                "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-90",
                isFavorited ? "text-amber-500 border-amber-500/40 bg-amber-500/10" : "text-zinc-500"
              )}
            >
              <Star 
                size={16} 
                fill={isFavorited ? "currentColor" : "none"} 
                className={cn(
                  "transition-all duration-700 ease-out",
                  isFavorited ? "scale-110 rotate-[72deg]" : "group-hover:scale-125"
                )} 
              />
            </button>
          </div>

          {/* Icon Section */}
          <div className="mb-6 sm:mb-8 relative pr-20 sm:pr-24">
            <div className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center relative overflow-hidden md:group-hover:rotate-6 md:group-hover:scale-110 transition-all duration-500 shadow-2xl",
              "bg-zinc-900 border border-white/5",
              isPro ? "before:absolute before:inset-0 before:bg-linear-to-br before:from-purple-600 before:to-cyan-600 before:opacity-20 group-hover:before:opacity-50" : "before:absolute before:inset-0 before:bg-linear-to-br before:opacity-10 group-hover:before:opacity-30",
              !isPro && style.accent
            )}>
              <Icon className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white transition-all duration-700 z-10",
                "group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]",
                isPro && "group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]"
              )} />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-3">
            <h3 className={cn(
              "text-xl sm:text-2xl font-black tracking-tighter leading-tight transition-colors group-hover:text-white break-words",
              isPro ? "text-transparent bg-clip-text bg-linear-to-r from-white via-purple-100 to-white" : "text-white"
            )}>
              {name}
            </h3>
            <p className="text-xs sm:text-[13px] font-medium text-zinc-500 line-clamp-3 sm:line-clamp-2 leading-relaxed tracking-tight group-hover:text-zinc-300 transition-colors break-words">
              {description}
            </p>
          </div>

          {/* Premium Button CTA */}
          <div className="mt-6 sm:mt-8">
            <div className={cn(
              "w-full min-h-12 py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all duration-500",
              isPro 
                ? "bg-linear-to-r from-purple-600 to-cyan-500 text-white shadow-[0_20px_40px_-10px_rgba(168,85,247,0.3)] group-hover:scale-[1.02] group-hover:shadow-[0_25px_50px_-12px_rgba(168,85,247,0.5)]" 
                : "bg-white/5 border border-white/5 group-hover:bg-white group-hover:text-black group-hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.3)]"
            )}>
              {unavailable ? "View status" : "Try it now"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
            </div>
          </div>

          {/* Ambient Bottom Glow */}
          <div className={cn(
            "absolute inset-x-16 bottom-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-[0.5px]",
            isPro ? "bg-linear-to-r from-transparent via-purple-400 to-transparent" : "bg-linear-to-r from-transparent via-white/50 to-transparent"
          )} />
        </div>
      </Link>
    </motion.div>
  );
}
