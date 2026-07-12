"use client";

import { TOOLS, CATEGORIES, ICON_MAP } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import CategoryHeading from "@/components/ui/CategoryHeading";
import { useState, useEffect } from "react";
import { FAVORITES_CHANGED_EVENT } from "@/lib/favorites";

interface CategoryClientProps {
  categoryId: string;
}

export function CategoryClient({ categoryId }: CategoryClientProps) {
  const [favorites, setFavorites] = useState<string[]>([]);

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

      {categoryTools.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 sm:py-28 md:py-32 px-5 text-center glass-dark border border-dashed border-white/10 rounded-[2rem] md:rounded-[3rem]"
        >
          <p className="text-zinc-600 font-bold uppercase tracking-widest">No tools found for this category yet.</p>
        </motion.div>
      )}

      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#020202]">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.25),transparent_70%)] blur-[100px] mix-blend-screen" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.25),transparent_70%)] blur-[100px] mix-blend-screen" />
        <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.15),transparent_70%)] blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
      </div>
    </div>
  );
}
