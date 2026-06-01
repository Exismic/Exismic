"use client";

import { motion } from "framer-motion";
import { CATEGORIES, ICON_MAP } from "@/data/tools";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

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
          className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6"
        >
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon];
            return (
              <motion.div
                key={cat.id}
                variants={cardVariants}
                whileHover="hover"
                className="group relative"
              >
                <Link href={`/category/${cat.id}`} className="block h-full rounded-[1.75rem] sm:rounded-[2.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/60">
                  <div className={cn(
                    "relative h-full min-h-[190px] flex flex-col items-center justify-center gap-5 sm:gap-6 p-5 sm:p-8 rounded-[1.75rem] sm:rounded-[2.5rem] glass-dark border border-white/5 transition-all duration-500 overflow-hidden touch-manipulation active:scale-[0.99]",
                    "hover:shadow-2xl md:hover:-translate-y-2",
                    "before:absolute before:inset-0 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:-z-10"
                  )}
                   style={{ 
                    // @ts-expect-error - Custom CSS property for neon glow
                    '--glow-color': cat.glow,
                  } as React.CSSProperties}
                  >
                    {/* Floating Neon Glow Background */}
                    <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10" 
                      style={{ background: cat.glow }}
                    />
                    
                    {/* Multi-layered Icon Container */}
                    <div className="relative group/icon">
                      <div className={cn(
                        "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/5 flex items-center justify-center transition-all duration-500",
                        "group-hover:bg-white/10 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:rotate-6"
                      )}>
                        <motion.div
                          variants={iconAnimation}
                          initial="initial"
                          animate="animate"
                          className={cn("transition-all duration-500 drop-shadow-[0_0_10px_var(--glow-color)]")}
                        >
                          {/* Use solid color for icons to ensure visibility, with glow */}
                          <Icon 
                            size={34} 
                            className="sm:w-10 sm:h-10"
                            style={{ 
                              color: cat.glow.replace('0.5', '1'),
                            }}
                          />
                        </motion.div>
                      </div>
                      
                      {/* Secondary glowing orb behind icon */}
                      <div className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none -z-10",
                        cat.color.replace('from-', 'bg-').split(' ')[0]
                      )} />
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2 group-hover:scale-105 transition-transform break-words">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-medium text-zinc-400 leading-relaxed max-w-[180px] sm:max-w-[140px] group-hover:text-zinc-200 transition-all uppercase tracking-wider break-words">
                        {cat.description}
                      </p>
                    </div>

                    {/* Neon Border Glow */}
                    <div className="absolute inset-x-0 bottom-0 h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-[2px]"
                      style={{ background: `linear-gradient(to right, transparent, ${cat.glow}, transparent)` }}
                    />
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
