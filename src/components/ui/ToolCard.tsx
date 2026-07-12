"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ICON_MAP, type IconName } from "@/data/tools";
import { ArrowRight, Crown, Star, Zap } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FAVORITES_CHANGED_EVENT } from "@/lib/favorites";
import { ToolReliabilityBadge } from "@/components/tool/ToolReliability";
import { CATEGORY_ANIM_STYLES } from "@/lib/category-styles";
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



export function ToolCard({ id, name, description, icon, href, popular, pro, isProTool, proPowerPack, category, index = 0, initialFavorited = false, className }: ToolCardProps) {
  const isPro = pro || isProTool;
  const unavailable = isToolUnavailable(id);
  const Icon = ICON_MAP[icon] || ICON_MAP.Wand2;
  const style = CATEGORY_ANIM_STYLES[category] || CATEGORY_ANIM_STYLES.pdf;
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSavingFavorite) return;
    const previousState = isFavorited;
    setIsFavorited(!previousState);
    setIsSavingFavorite(true);

    try {
      const result = await toggleFavorite(id);
      if (result.error) throw new Error(result.error);

      setIsFavorited(result.isFavorited === true);
      window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT, {
        detail: { favorites: result.favorites },
      }));
      router.refresh();
    } catch (error) {
      setIsFavorited(previousState);
      alert(error instanceof Error ? error.message : "Could not update favorites.");
    } finally {
      setIsSavingFavorite(false);
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
            ? "bg-zinc-950/60 border-amber-500/20 shadow-[inset_0_1px_2px_rgba(245,158,11,0.1),0_0_15px_rgba(245,158,11,0.05)] hover:border-amber-400/60 hover:shadow-[0_0_50px_rgba(245,158,11,0.25)]" 
            : cn("bg-zinc-950/50 hover:bg-zinc-900/60 transition-all duration-500 border", style.cardBorder),
          "md:group-hover:scale-[1.03] active:scale-[0.99]"
        )}>
          {/* Shine Animation Layer */}
          <div className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden pointer-events-none z-10">
            <div className={cn(
              "absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/10 to-transparent",
              isPro && "via-amber-500/20"
            )} />
          </div>

          {/* Background Glows removed for cleaner look, handled by card border shadow */}

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
                <div className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 backdrop-blur-md border border-amber-400/40 text-[8px] font-black uppercase tracking-widest text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_3s_linear_infinite]" />
                  <Crown size={9} className="relative z-10 fill-amber-200 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                  <span className="relative z-10">Pro</span>
                </div>
              )}
              <ToolReliabilityBadge toolId={id} />
            </div>
            
            <button 
              onClick={handleFavoriteClick}
              disabled={isSavingFavorite}
              aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
              className={cn(
                "relative overflow-hidden w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 touch-manipulation backdrop-blur-md shadow-lg border group/star",
                isFavorited 
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:bg-amber-500/20 hover:border-amber-400/60" 
                  : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.06] hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
                "active:scale-90 disabled:cursor-wait disabled:opacity-60"
              )}
            >
              {!isFavorited && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/star:opacity-100 transition-opacity duration-500" />
              )}
              {isFavorited && (
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(245,158,11,0.2)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_3s_linear_infinite]" />
              )}
              <Star 
                size={16} 
                fill={isFavorited ? "currentColor" : "none"} 
                strokeWidth={isFavorited ? 1.5 : 2}
                className={cn(
                  "relative z-10 transition-all duration-700 ease-out",
                  isFavorited ? "scale-110 rotate-[72deg] drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" : "group-hover/star:scale-125"
                )} 
              />
            </button>
          </div>

          {/* Icon Section */}
          <div className="mb-6 sm:mb-8 relative pr-20 sm:pr-24">
            <div className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center relative overflow-hidden md:group-hover:rotate-6 md:group-hover:scale-110 transition-all duration-500 shadow-2xl",
              "bg-[#0b0c12] border border-white/5",
            )}>
              <div className={cn("absolute inset-0 blur-xl animate-pulse transition-colors duration-500", isPro ? "bg-amber-500/20 group-hover:bg-amber-400/40" : style.aura)} />
              <div className={cn("absolute inset-[-100%] animate-[spin_3s_linear_infinite] transition-colors duration-500", isPro ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.4)_25%,transparent_50%)] group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.9)_25%,transparent_50%)]" : cn(style.spinIdle, style.spinHover))} />
              <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] md:rounded-[calc(2rem-1.5px)] bg-[#0b0c12] z-0 overflow-hidden">
                <div className={cn("absolute inset-0 bg-gradient-to-br from-white/5 to-transparent", isPro && "from-amber-500/10")} />
                <motion.div
                  className={cn("absolute top-0 left-[-100%] h-full w-[50%] skew-x-[-20deg]", isPro ? "bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" : "bg-gradient-to-r from-transparent via-white/10 to-transparent")}
                  animate={{ left: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1 }}
                />
              </div>
              <Icon className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 transition-all duration-700 z-10",
                "group-hover:scale-110",
                isPro ? "text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] group-hover:text-amber-200 group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.9)]" : style.iconGlow
              )} />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-3">
            <h3 className={cn(
              "text-xl sm:text-2xl font-black tracking-tighter leading-tight transition-colors break-words text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]",
              isPro ? "bg-[linear-gradient(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(245,158,11,0.2)]" : style.textGrad
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
              "w-full min-h-12 py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all duration-500 relative overflow-hidden",
              isPro 
                ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-[1.02] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] border border-amber-300/50" 
                : cn("group-hover:scale-[1.02] border shadow-lg", style.buttonGrad)
            )}>
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_2s_linear_infinite]" />
              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                {unavailable ? "View status" : "Launch Tool"}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
              </span>
            </div>
          </div>

          {/* Ambient Bottom Glow */}
          <div className={cn(
            "absolute inset-x-16 bottom-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-[0.5px]",
            isPro ? "bg-linear-to-r from-transparent via-amber-400 to-transparent" : "bg-linear-to-r from-transparent via-white/50 to-transparent"
          )} />
        </div>
      </Link>
    </motion.div>
  );
}
