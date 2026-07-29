"use client";

import { TOOLS, CATEGORIES, ICON_MAP } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";
import Link from "next/link";
import { ArrowLeft, Sparkles, Rocket, Clock, MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import CategoryHeading from "@/components/ui/CategoryHeading";
import CategoryBackground from "@/components/ui/CategoryBackground";
import { useState, useEffect } from "react";
import { FAVORITES_CHANGED_EVENT } from "@/lib/favorites";
import { CATEGORY_ANIM_STYLES } from "@/lib/category-styles";
import { cn } from "@/lib/utils";
import { SuggestToolModal } from "@/components/modals/SuggestToolModal";

interface CategoryClientProps {
  categoryId: string;
}

export function CategoryClient({ categoryId }: CategoryClientProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      const response = await fetch('/api/user/favorites', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
    };
    void fetchFavorites();

    const handleFavoritesChanged = (event: Event) => {
      const favorites = (event as CustomEvent<{ favorites?: string[] }>).detail?.favorites;
      if (Array.isArray(favorites)) setFavorites(favorites);
    };
    window.addEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesChanged);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesChanged);
  }, []);

  const category = CATEGORIES.find(c => c.id === categoryId);
  const categoryTools = TOOLS.filter(t => t.category === categoryId);

  if (!category) {
    return (
      <div className="p-8 text-center mt-20">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link href="/" className="text-accent-purple hover:text-white mt-4 inline-block font-bold">Back home</Link>
      </div>
    );
  }

  const Icon = ICON_MAP[category.icon];
  const animStyle = CATEGORY_ANIM_STYLES[categoryId] || CATEGORY_ANIM_STYLES.pdf;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto space-y-10 sm:space-y-12 md:space-y-16 pb-28 md:pb-32 overflow-x-hidden">
      <div className="space-y-6 sm:space-y-8">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.2em] text-zinc-500 hover:text-white transition-all group touch-manipulation">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to all tools
        </Link>
        
        <CategoryHeading 
          icon={Icon}
          title={category.name}
          subtitle={`Browse our collection of professional ${category.name.toLowerCase()} architected for high-performance workflows.`}
          categoryId={categoryId}
          isPro={categoryId === 'ai'}
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
      >
        {categoryTools.map((tool, idx) => (
          <ToolCard 
            key={tool.id} 
            {...tool} 
            index={idx} 
            initialFavorited={favorites.includes(tool.id)}
          />
        ))}
      </motion.div>

      {/* MORE TO COME SHOWCASE BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative overflow-hidden p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-[#07070e]/80 backdrop-blur-2xl transition-all duration-500 group mt-10 sm:mt-14 border",
          animStyle.cardBorder
        )}
      >
        {/* Dynamic Category Ambient Aura */}
        <div className={cn("pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-[90px] transition-all duration-700 opacity-60 group-hover:opacity-100", animStyle.aura)} />
        <div className={cn("pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-[90px] transition-all duration-700 opacity-40 group-hover:opacity-75", animStyle.aura)} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between lg:gap-10">
          <div className="space-y-3.5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={cn("inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg", animStyle.badge)}>
                <Sparkles size={11} className="animate-pulse" />
                More To Come
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {category.name} Suite
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic leading-snug">
                More tools on the <span className={cn("inline-block pr-3 text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]", animStyle.textGrad)}>horizon.</span>
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
                We continuously drop new tools, creators, and workflow enhancements. Have a specific generator or feature you want to see here next?
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold text-zinc-300 flex items-center gap-1.5">
                <Rocket size={11} className="text-purple-400" /> Community Driven
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold text-zinc-300 flex items-center gap-1.5">
                <Clock size={11} className="text-cyan-400" /> Frequent Updates
              </span>
            </div>
          </div>

          <div className="shrink-0 pt-2 md:pt-0">
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className={cn(
                "group/btn relative inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl sm:rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all overflow-hidden touch-manipulation hover:scale-[1.02] active:scale-[0.98]",
                animStyle.buttonGrad
              )}
            >
              <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />
              <MessageSquare size={15} className="relative z-10 text-white" />
              <span className="relative z-10">Suggest A Tool</span>
              <ArrowRight size={14} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Suggest Tool Interactive Modal */}
      <SuggestToolModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        defaultCategory={categoryId}
      />

      {/* Dynamic Themed Category Ambient Background */}
      <CategoryBackground categoryId={categoryId} />
    </div>
  );
}
