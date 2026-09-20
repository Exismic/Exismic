"use client";

import { TOOLS, CATEGORIES, ICON_MAP } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import CategoryHeading from "@/components/ui/CategoryHeading";
import CategoryBackground from "@/components/ui/CategoryBackground";
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

  const Icon = ICON_MAP[category.icon] || ICON_MAP.Wand2;

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
    <>
      {/* Dynamic Themed Category Ambient Background */}
      <CategoryBackground categoryId={categoryId} />

      <div className="relative z-10 px-4 sm:px-6 md:px-12 pt-4 sm:pt-6 md:pt-10 pb-3 sm:pb-4 max-w-7xl mx-auto space-y-6 sm:space-y-8 overflow-visible">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 overflow-visible"
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
      </div>
    </>
  );
}
