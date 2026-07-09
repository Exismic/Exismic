"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { CATEGORY_ANIM_STYLES } from "@/lib/category-styles";

interface CategoryHeadingProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  categoryId: string;
  isPro?: boolean;
  className?: string;
}

const CategoryHeading: React.FC<CategoryHeadingProps> = ({
  icon: Icon,
  title,
  subtitle,
  categoryId,
  isPro = false,
  className
}) => {
  const animStyle = CATEGORY_ANIM_STYLES[categoryId] || CATEGORY_ANIM_STYLES.pdf;

  return (
    <div className={cn("relative space-y-12", className)}>
      <div className="flex flex-col gap-8">
        {/* Integrated Studio Badge - Static & Professional */}
        <div className="flex items-center gap-4">
          <div className="relative group flex h-14 w-14 shrink-0 items-center justify-center">
             <div className={cn("absolute -inset-3 rounded-full blur-xl animate-pulse", isPro ? "bg-amber-500/25" : animStyle.aura)} />
             <div className={cn("absolute inset-0 rounded-xl animate-[spin_4s_linear_infinite]",
               isPro ? "bg-[conic-gradient(from_0deg,rgba(251,191,36,1)_0%,rgba(245,158,11,1)_33%,rgba(253,230,138,1)_66%,rgba(251,191,36,1)_100%)]"
                     : animStyle.spinIdle
             )} />
             <div className="absolute inset-[1.5px] rounded-[10px] bg-[#0b0c12] flex items-center justify-center overflow-hidden z-10 transition-transform duration-300 group-hover:scale-[0.98]">
                <Icon size={24} className={cn("relative z-20 transition-transform duration-300 group-hover:scale-110", isPro ? "text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" : animStyle.iconGlow)} />
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_3s_linear_infinite]" />
             </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className={isPro ? "text-amber-400" : "text-white/50"} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                {isPro ? "Premium Pro Series" : "Essential Creative Suite"}
              </p>
            </div>
            {isPro && (
              <div className="flex mt-1">
                <span className="text-[9px] font-black text-accent-purple uppercase tracking-widest bg-accent-purple/10 px-2 py-0.5 rounded border border-accent-purple/20">Elite Studio</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero Title - Engineered for Zero Clipping */}
        <div className="space-y-6">
          <div className="relative py-2 pr-12 overflow-visible inline-block"> 
            <h1 
              className={cn(
                "text-5xl md:text-7xl xl:text-8xl font-black tracking-tighter uppercase italic leading-none select-none px-8 -mx-8 bg-clip-text text-transparent bg-[length:200%_100%] animate-[shine_4s_linear_infinite]",
                isPro ? "bg-[linear-gradient(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]" : animStyle.textGrad,
                className
              )}
            >
              {title}
            </h1>
            {/* Soft Ambient Depth */}
            <span 
              className="absolute inset-0 text-white/5 blur-3xl -z-10 select-none uppercase italic font-black text-5xl md:text-7xl xl:text-8xl tracking-tighter leading-none px-8 -mx-8"
            >
              {title}
            </span>
          </div>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-4xl leading-relaxed font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Cinematic Divider */}
      <div className="relative h-px w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent" />
        <motion.div 
           animate={{ x: ['-100%', '200%'] }}
           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
           className={cn("absolute inset-y-0 w-40 bg-linear-to-r from-transparent via-white to-transparent opacity-20")} 
        />
      </div>
    </div>
  );
};

export default CategoryHeading;
