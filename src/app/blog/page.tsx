"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Sparkles, Newspaper, Zap } from "lucide-react";
import Link from "next/link";

const BLOG_POSTS = [
  {
    title: "Introducing Lumora: The Future of Creative Work",
    excerpt: "Today, we're excited to share our vision for the next generation of AI-powered creative tools...",
    date: "May 15, 2026",
    category: "Product"
  },
  {
    title: "Optimizing Video Processing for the Web",
    excerpt: "How our distributed node network ensures 12ms latency and lightning-fast renders...",
    date: "May 10, 2026",
    category: "Engineering"
  },
  {
    title: "The Art of AI Prompting",
    excerpt: "A comprehensive guide to getting the most out of our state-of-the-art image generation models...",
    date: "May 05, 2026",
    category: "Tutorial"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 space-y-20 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Home / Back
        </Link>

        <header className="space-y-6">
          <div className="flex items-center gap-4 text-accent-purple">
            <Newspaper size={32} className="animate-pulse" />
            <div className="h-px w-20 bg-accent-purple/20" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]">
            Our <span className="gradient-text">Blog.</span>
          </h1>
          <p className="text-zinc-500 font-medium text-xl max-w-xl">
            News and updates from the team at Lumora.
          </p>
        </header>

        <div className="space-y-10">
          {BLOG_POSTS.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[3rem] glass-dark border border-white/5 hover:border-white/10 transition-all group cursor-pointer"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-[9px] font-black uppercase tracking-widest text-accent-purple">
                    {post.category}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{post.date}</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white group-hover:text-accent-purple transition-colors">{post.title}</h2>
                <p className="text-zinc-500 font-medium leading-relaxed text-lg">{post.excerpt}</p>
                <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-all">
                  Read Article <Sparkles size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
