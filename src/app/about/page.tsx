"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Rocket, Sparkles, Shield, Zap, Heart } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 space-y-20 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Mission / Back
        </Link>

        <header className="space-y-6">
          <div className="flex items-center gap-4 text-accent-orange">
            <Rocket size={32} className="animate-bounce" />
            <div className="h-px w-20 bg-accent-orange/20" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]">
            Built for <span className="gradient-text">You.</span>
          </h1>
          <p className="text-zinc-500 font-medium text-xl max-w-xl">
            We are making professional AI tools simple and easy for everyone.
          </p>
        </header>

        <div className="p-10 md:p-16 rounded-[3rem] glass-dark border border-white/5 space-y-16 text-zinc-400 font-medium leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Our Story</h2>
            <p className="text-lg">Lumora was born from a simple idea: the best creative tools shouldn't be hard to use. We built a platform that is powerful, fast, and simple.</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                <Shield size={24} className="text-accent-purple" />
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Total Privacy</h3>
                <p className="text-sm">Your files are yours. We process everything safely and never sell your work.</p>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                <Zap size={24} className="text-accent-cyan" />
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Real Speed</h3>
                <p className="text-sm">We use a powerful global network to make sure your work is done in seconds.</p>
             </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">The Future</h2>
            <p className="text-lg">We're just getting started. Our roadmap is packed with new tools, deeper integrations, and even more powerful AI models to help you realize your creative vision.</p>
          </section>
        </div>

        <div className="flex flex-col items-center justify-center pt-20 space-y-6">
           <div className="flex items-center gap-2 text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px]">
              Made with <Heart size={12} className="text-rose-500 fill-rose-500" /> for the community
           </div>
           <Link href="/auth/login">
              <button className="px-10 py-5 rounded-2xl premium-gradient text-white font-black text-[10px] uppercase tracking-widest shadow-4xl hover:scale-105 active:scale-95 transition-all">
                 Join our Journey
              </button>
           </Link>
        </div>
      </main>
    </div>
  );
}
