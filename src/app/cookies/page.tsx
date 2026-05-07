"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Cookie, Shield, Eye, Lock } from "lucide-react";
import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32">
      <main className="max-w-4xl mx-auto px-6 pt-32 space-y-20 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Policy / Back
        </Link>

        <header className="space-y-6">
          <div className="flex items-center gap-4 text-accent-purple">
            <Cookie size={32} />
            <div className="h-px w-20 bg-accent-purple/20" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]">
            Cookie <span className="gradient-text">Rules.</span>
          </h1>
          <p className="text-zinc-500 font-medium text-xl max-w-xl">
            How we use small data files to make your experience better.
          </p>
        </header>

        <div className="p-10 md:p-16 rounded-[3rem] glass-dark border border-white/5 space-y-12 text-zinc-400 font-medium leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">1. What are cookies?</h2>
            <p>Cookies are small text files that are stored on your device when you visit a website. They help us remember your preferences and provide a more personalized experience.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">2. How we use them</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <Lock size={20} className="text-accent-purple" />
                <h3 className="text-white font-black text-xs uppercase tracking-widest">Essential</h3>
                <p className="text-[11px] leading-relaxed">Required for the site to function and keep you logged in.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <Eye size={20} className="text-accent-cyan" />
                <h3 className="text-white font-black text-xs uppercase tracking-widest">Analytics</h3>
                <p className="text-[11px] leading-relaxed">Helping us understand how you use Lumora so we can improve it.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">3. Managing Preferences</h2>
            <p>You can manage your cookie preferences at any time through your browser settings. Please note that disabling certain cookies may affect the functionality of the platform.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
