"use client";

import { motion } from "framer-motion";
import { CATEGORIES, ICON_MAP } from "@/data/tools";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LayoutGrid, ArrowRight } from "lucide-react";
import { CATEGORY_ANIM_STYLES } from "@/lib/category-styles";

export function CategorySection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  const iconAnimation = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.25, 
      rotate: 8,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    },
    animate: {
      y: [0, -4, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative py-14 sm:py-20 md:py-24 px-0 sm:px-4 overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-10 sm:mb-14 md:mb-16 space-y-4 px-1">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex min-h-9 items-center gap-2 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple shadow-[0_0_15px_rgba(124,58,237,0.2)]"
          >
            <LayoutGrid size={16} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Curated Universe</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white text-center">
            Explore <span className="gradient-text">Categories</span>
          </h2>
          <p className="text-zinc-500 max-w-lg text-center font-medium text-sm sm:text-base leading-relaxed">
            Discover a wide range of AI-powered utilities tailored for every creative and professional need.
          </p>
        </div>

        {/* Categories Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon];
            const style = CATEGORY_ANIM_STYLES[cat.id] || CATEGORY_ANIM_STYLES.ai;
            return (
              <motion.div
                key={cat.id}
                variants={cardVariants}
                whileHover="hover"
                className="group relative"
              >
                <Link href={`/category/${cat.id}`} className="block h-full rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303] sm:rounded-[2.5rem] md:rounded-[3rem]">
                  <div className={cn(
                    "relative h-full min-h-[260px] flex flex-col items-center text-center p-5 sm:p-6 md:p-8 backdrop-blur-3xl transition-all duration-500 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden touch-manipulation",
                    "border", style.cardBorder,
                    "bg-zinc-950/50 hover:bg-zinc-900/60",
                    "md:group-hover:scale-[1.03] active:scale-[0.99]"
                  )}>
                    {/* Shine Animation Layer */}
                    <div className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden pointer-events-none z-10">
                      <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.1),transparent)]" />
                    </div>

                    {/* Icon Section */}
                    <div className="mb-6 sm:mb-8 relative flex justify-center w-full">
                      <div className={cn(
                        "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center relative overflow-hidden md:group-hover:rotate-6 md:group-hover:scale-110 transition-all duration-500 shadow-2xl",
                        "bg-[#0b0c12] border border-white/5",
                      )}>
                        <div className={cn("absolute inset-0 blur-xl animate-pulse transition-colors duration-500", style.aura)} />
                        <div className={cn("absolute inset-[-100%] animate-[spin_3s_linear_infinite] transition-colors duration-500", style.spinIdle, style.spinHover)} />
                        <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] md:rounded-[calc(2rem-1.5px)] bg-[#0b0c12] z-0 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                          <motion.div
                            className="absolute top-0 left-[-100%] h-full w-[50%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={{ left: ["-100%", "200%"] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatType: "mirror" }}
                          />
                        </div>
                        <Icon className={cn(
                          "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 transition-all duration-700 z-10",
                          "group-hover:scale-110",
                          style.iconGlow
                        )} />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-3 w-full">
                      <h3 className={cn(
                        "text-xl sm:text-2xl font-black tracking-tighter leading-tight transition-colors break-words text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]",
                        style.textGrad
                      )}>
                        {cat.name}
                      </h3>
                      <p className="text-xs sm:text-[13px] font-medium text-zinc-500 line-clamp-3 sm:line-clamp-2 leading-relaxed tracking-tight group-hover:text-zinc-300 transition-colors break-words mx-auto">
                        {cat.description}
                      </p>
                    </div>

                    {/* Premium Button CTA */}
                    <div className="mt-6 sm:mt-8 w-full">
                      <div className={cn(
                        "w-full min-h-12 py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all duration-500 relative overflow-hidden group-hover:scale-[1.02] border shadow-lg",
                        style.buttonGrad
                      )}>
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_2s_linear_infinite]" />
                        <span className="relative z-10 flex items-center gap-2 sm:gap-3 text-white">
                          View Tools
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5 text-white" />
                        </span>
                      </div>
                    </div>

                    {/* Ambient Bottom Glow */}
                    <div className="absolute inset-x-16 bottom-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-[0.5px]" style={{ background: `linear-gradient(to right, transparent, ${cat.glow}, transparent)` }} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] bg-accent-blue/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}
