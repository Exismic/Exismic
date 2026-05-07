"use client";

import { use } from "react";
import { TOOLS, CATEGORIES, ICON_MAP } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: categoryId } = use(params);
  const [favorites, setFavorites] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: favs } = await supabase
          .from('Favorite')
          .select('toolId')
          .eq('userId', session.user.id);
        
        if (favs) {
          setFavorites(favs.map(f => f.toolId));
        }
      }
    };
    fetchFavorites();
  }, [supabase]);

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
    <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-16 pb-32">
      <div className="space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to all tools
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[1.5rem] glass-dark border border-white/10 flex items-center justify-center shadow-2xl">
                <Icon size={32} style={{ color: category.glow?.replace('0.5', '1') }} className="animate-float" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                  {category.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                   <Sparkles size={14} className="text-accent-purple" />
                   <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Premium Pro Series</p>
                </div>
              </div>
            </div>
            <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed font-medium">
              Browse our collection of professional {category.name.toLowerCase()} architected for high-performance workflows.
            </p>
          </div>
          
          <div className="flex items-center gap-4 px-6 py-4 rounded-[2rem] glass-dark border border-white/5">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Total Available</p>
              <p className="text-2xl font-black text-white">{categoryTools.length} Tools</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
          className="py-32 text-center glass-dark border border-dashed border-white/10 rounded-[3rem]"
        >
          <p className="text-zinc-600 font-bold uppercase tracking-widest">No tools found for this category yet.</p>
        </motion.div>
      )}

      {/* Decorative Background Accents */}
      <div className="fixed top-0 right-0 w-[50%] h-[50%] bg-accent-purple/5 blur-[150px] -z-10 rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[50%] h-[50%] bg-accent-blue/5 blur-[150px] -z-10 rounded-full pointer-events-none" />
    </div>
  );
}

