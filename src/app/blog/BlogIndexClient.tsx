"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AvatarWithFrame } from '@/components/ui/AvatarWithFrame';
import { PremiumName } from '@/components/ui/PremiumName';

interface BlogIndexClientProps {
  posts: any[];
}

export function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 selection:bg-purple-500/30 overflow-x-hidden font-sans relative flex flex-col items-center">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/[0.02] blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-24 relative z-10 w-full flex flex-col items-center">
        
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/')}
          className="self-start flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all mb-16 group"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </motion.button>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-xl"
        >
          <BookOpen size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">The Exismic Journal</span>
        </motion.div>
        
        <div className="text-center space-y-6 mb-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic"
          >
            Insights & <br />
            <span className="gradient-text">Inspiration.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-zinc-500 text-lg md:text-xl font-medium leading-relaxed"
          >
            Tutorials, latest updates, and expert deep-dives into the future of AI tools and creativity.
          </motion.p>
        </div>

        <div className="w-full flex flex-col gap-12">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
              onClick={() => router.push(`/blog/${post.slug}`)}
              className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border border-white/[0.05] bg-[#050508]/60 p-8 sm:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-500 hover:border-cyan-500/30 hover:bg-[#0a0a0f]/80 hover:shadow-[0_30px_60px_rgba(34,211,238,0.15)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} className="fill-cyan-400/20" />
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                    <Calendar size={12} /> {post.publishedAt}
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                    <Clock size={12} /> {post.readTime}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-cyan-200 transition-all duration-300">
                    {post.title}
                  </h2>
                  <p className="text-zinc-400 text-sm md:text-base font-medium leading-relaxed max-w-3xl">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.05]">
                  <div className="flex items-center gap-4 group/author">
                    <AvatarWithFrame 
                      avatarUrl={post.author.avatar}
                      displayName={post.author.name}
                      isPro={post.author.plan === 'pro'}
                      frameId={post.author.avatarFrame}
                      size="sm"
                    />
                    <div className="flex flex-col">
                      <PremiumName 
                        name={post.author.name} 
                        isPro={post.author.plan === 'pro'} 
                        gradientId={post.author.nameGradient} 
                        className="text-sm"
                      />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mt-0.5">Author</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all bg-cyan-400/10 px-5 py-2.5 rounded-full border border-cyan-400/20">
                    Read Article <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
