"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Rocket, Sparkles, Shield, Zap, Heart, Globe, Cpu, Layers } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 overflow-hidden" suppressHydrationWarning>
      {/* Cinematic Background Architecture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1200px] bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08)_0%,transparent_70%)]" />
        <div className="absolute top-[20%] right-[-10%] w-[800px] h-[800px] bg-accent-orange/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] left-[-10%] w-[800px] h-[800px] bg-accent-purple/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]" />
      </div>
      
      <main className="max-w-6xl mx-auto px-6 pt-32 space-y-32 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Mission / Back
        </Link>

        {/* Cinematic Hero Section */}
        <header className="relative w-full rounded-[4rem] bg-[#0b0c12]/80 backdrop-blur-3xl border border-white/5 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-12 md:p-24 flex flex-col items-center text-center group transition-all duration-700 hover:border-accent-orange/30">
          {/* Glowing backdrops */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-accent-orange/20 blur-[120px] rounded-full pointer-events-none transition-all duration-1000 group-hover:bg-accent-orange/30 group-hover:scale-110" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center space-y-10"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-accent-orange/30 bg-accent-orange/10 text-accent-orange shadow-[0_0_30px_rgba(249,115,22,0.2)]">
              <Rocket size={16} className="animate-bounce" />
              <span className="text-xs font-black uppercase tracking-[0.4em]">Our Mission</span>
            </div>
            
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter uppercase italic leading-[0.8] select-none drop-shadow-2xl">
              Built <br/> <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,#fdba74_0%,#ffffff_45%,#f97316_55%,#ffffff_100%)] bg-[length:200%_100%] animate-[shine_4s_linear_infinite]">For You.</span>
            </h1>
            
            <p className="text-zinc-400 font-medium text-xl md:text-3xl max-w-4xl leading-relaxed">
              We are democratizing access to high-performance AI tools, making elite capabilities <span className="text-white">simple, intuitive, and available for everyone.</span>
            </p>
          </motion.div>
          
          {/* Bottom structural trim */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-orange/50 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-accent-orange/50 blur-sm rounded-t-full" />
        </header>

        {/* Story Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group p-10 md:p-16 rounded-[4rem] bg-[#0b0c12]/80 backdrop-blur-3xl border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-700 hover:border-accent-orange/30"
        >
          <div className="absolute inset-0 bg-linear-to-br from-accent-orange/5 via-transparent to-accent-purple/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-12 md:gap-20 items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">Our Story</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-accent-orange to-transparent rounded-full" />
              <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed">
                Exismic was born from a simple but powerful idea: the most advanced creative tools shouldn't require an engineering degree to operate. We built a platform that strips away the complexity, leaving you with raw power, blinding speed, and ultimate simplicity.
              </p>
            </div>
            
            <div className="w-full md:w-1/3 aspect-square rounded-[3rem] relative overflow-hidden border border-white/5 shrink-0 group/core bg-[#0b0c12]">
               {/* Background glows */}
               <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/10 to-accent-purple/10" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-orange/20 blur-[80px] rounded-full group-hover/core:scale-150 transition-transform duration-1000" />
               
               {/* Grid Pattern */}
               <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_1px,transparent_1px)] bg-[length:24px_24px]" />
               
               <div className="absolute inset-0 flex items-center justify-center">
                 {/* Outer rotating ring */}
                 <div className="absolute w-64 h-64 rounded-full border border-accent-orange/20 border-l-accent-orange/60 animate-[spin_10s_linear_infinite]" />
                 {/* Middle counter-rotating dashed ring */}
                 <div className="absolute w-48 h-48 rounded-full border-2 border-dashed border-accent-purple/30 animate-[spin_15s_linear_infinite_reverse]" />
                 
                 {/* Center glowing core */}
                 <div className="relative w-32 h-32 rounded-3xl bg-[#0b0c12] border border-white/10 shadow-[0_0_40px_rgba(249,115,22,0.3)] flex items-center justify-center rotate-45 overflow-hidden group-hover/core:shadow-[0_0_60px_rgba(168,85,247,0.5)] transition-shadow duration-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/20 to-accent-purple/20" />
                    <Cpu size={48} className="text-white -rotate-45 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                 </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Pillars Grid */}
        <section className="space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-600">Our Core Pillars</h2>
            <div className="h-px flex-1 mx-12 bg-gradient-to-r from-white/5 to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
             {[
               { icon: Shield, title: "Total Privacy", desc: "Your files are yours. We process everything securely in memory. Nothing is ever sold, analyzed, or permanently stored.", color: "text-emerald-400", bg: "bg-emerald-400" },
               { icon: Zap, title: "Real Speed", desc: "Powered by a massive global GPU network, our tools execute heavy AI workloads in seconds, not minutes.", color: "text-accent-cyan", bg: "bg-accent-cyan" },
               { icon: Layers, title: "Raw Power", desc: "Under the hood lies a sophisticated microservices architecture orchestrating state-of-the-art foundation models.", color: "text-accent-purple", bg: "bg-accent-purple" },
             ].map((pillar, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1, duration: 0.6 }}
                 className="group relative p-8 md:p-10 rounded-[3rem] bg-[#0b0c12]/50 backdrop-blur-xl border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
               >
                 <div className={`absolute top-0 right-0 w-32 h-32 ${pillar.bg}/10 blur-3xl rounded-full transition-all duration-700 group-hover:scale-150`} />
                 <div className="relative z-10 space-y-6">
                   <div className={`w-16 h-16 rounded-2xl ${pillar.bg}/10 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                     <pillar.icon size={28} className={pillar.color} />
                   </div>
                   <div className="space-y-3">
                     <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{pillar.title}</h3>
                     <p className="text-zinc-500 text-sm md:text-base font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">{pillar.desc}</p>
                   </div>
                 </div>
               </motion.div>
             ))}
          </div>
        </section>

        {/* Future Vision */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[4rem] border border-white/5 bg-[#0b0c12]/80 overflow-hidden text-center p-16 md:p-24"
        >
          {/* Animated network background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <Globe size={48} className="mx-auto text-white/20 animate-[spin_20s_linear_infinite]" />
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">The Future</h2>
            <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed">
              We're just getting started. Our roadmap is packed with revolutionary new tools, deeper ecosystem integrations, and massive scale upgrades to help you realize your ultimate creative vision.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <div className="flex flex-col items-center justify-center pt-10 pb-20 space-y-10">
           <div className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px] md:text-xs bg-white/5 px-6 py-3 rounded-full border border-white/10">
              Made with <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse" /> for the community
           </div>
           
           <Link href="/auth/login" className="relative group">
              {/* Outer glowing aura */}
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-orange to-accent-purple rounded-[3rem] blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
              
              <button className="relative px-12 py-6 rounded-[2.5rem] bg-[#0b0c12] border border-white/10 text-white font-black text-sm uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                 <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0)_100%)] bg-[length:200%_100%] animate-[shine_2s_linear_infinite]" />
                 <span className="relative z-10 flex items-center gap-3">
                   Join our Journey <ArrowLeft size={16} className="rotate-135 opacity-50" />
                 </span>
              </button>
           </Link>
        </div>
      </main>
    </div>
  );
}
