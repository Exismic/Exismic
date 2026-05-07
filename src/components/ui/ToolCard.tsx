"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ICON_MAP, type IconName } from "@/data/tools";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GradientText from "./GradientText";

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

import { Crown } from "lucide-react";

export function ToolCard({ id, name, description, icon, href, popular, pro, isProTool, category, index = 0, initialFavorited = false }: ToolCardProps) {
  const isPro = pro || isProTool;
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
      className="group relative h-full"
    >
      <Link href={href} className="block h-full">
        <div className={cn(
          "relative h-full flex flex-col p-8 backdrop-blur-3xl transition-all duration-500 rounded-[3rem] overflow-hidden",
          "border border-white/5",
          isPro 
            ? "bg-zinc-950/60 border-purple-500/10 shadow-[inset_0_1px_2px_rgba(168,85,247,0.05)] hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]" 
            : "bg-zinc-950/40 hover:bg-zinc-900/60 hover:border-white/20 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]",
          "group-hover:scale-[1.03]"
        )}>
          {/* Shine Animation Layer */}
          <div className="absolute inset-0 rounded-[3rem] overflow-hidden pointer-events-none z-10">
            <div className={cn(
              "absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/10 to-transparent",
              isPro && "via-purple-500/20"
            )} />
          </div>

          {/* Background Glows */}
          <div className={cn(
            "absolute -inset-px rounded-[3rem] opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-2xl -z-10 bg-linear-to-br",
            isPro ? "from-purple-600/40 to-blue-600/40" : style.accent
          )} />

          {/* Badges & Favorite - Organized Layout */}
          <div className="absolute top-6 right-6 flex flex-col items-end gap-3 z-20">
            <div className="flex items-center gap-2">
               {popular && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-[8px] font-black uppercase tracking-widest text-amber-500">
                  <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                  Popular
                </div>
              )}
              {isPro && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/20 backdrop-blur-md border border-purple-500/30 text-[8px] font-black uppercase tracking-widest text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <Crown size={8} className="fill-purple-400" />
                  PRO
                </div>
              )}
            </div>
            
            <button 
              onClick={handleFavoriteClick}
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
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
          <div className="mb-8 relative">
            <div className={cn(
              "w-20 h-20 rounded-[2rem] flex items-center justify-center relative overflow-hidden group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-2xl",
              "bg-zinc-900 border border-white/5",
              isPro ? "before:absolute before:inset-0 before:bg-linear-to-br before:from-purple-600 before:to-cyan-600 before:opacity-20 group-hover:before:opacity-50" : "before:absolute before:inset-0 before:bg-linear-to-br before:opacity-10 group-hover:before:opacity-30",
              !isPro && style.accent
            )}>
              <Icon className={cn(
                "w-9 h-9 text-white transition-all duration-700 z-10",
                "group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]",
                isPro && "group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]"
              )} />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 space-y-3">
            <h3 className={cn(
              "text-2xl font-black tracking-tighter transition-colors group-hover:text-white",
              isPro ? "text-transparent bg-clip-text bg-linear-to-r from-white via-purple-100 to-white" : "text-white"
            )}>
              {name}
            </h3>
            <p className="text-[13px] font-medium text-zinc-500 line-clamp-2 leading-relaxed tracking-tight group-hover:text-zinc-300 transition-colors">
              {description}
            </p>
          </div>

          {/* Premium Button CTA */}
          <div className="mt-8">
            <div className={cn(
              "w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all duration-500",
              isPro 
                ? "bg-linear-to-r from-purple-600 to-cyan-500 text-white shadow-[0_20px_40px_-10px_rgba(168,85,247,0.3)] group-hover:scale-[1.02] group-hover:shadow-[0_25px_50px_-12px_rgba(168,85,247,0.5)]" 
                : "bg-white/5 border border-white/5 group-hover:bg-white group-hover:text-black group-hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.3)]"
            )}>
              Try it now
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





