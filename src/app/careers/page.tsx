"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Users, Sparkles, Globe, Zap, Cpu } from "lucide-react";
import Link from "next/link";

const OPEN_ROLES: any[] = [];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 overflow-hidden">
      {/* Cinematic Background Accents */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-accent-cyan/5 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-accent-purple/5 blur-[120px] rounded-full -translate-x-1/4 translate-y-1/4" />
        <div className="absolute inset-0 scanline opacity-10" />
      </div>
      
      <main className="max-w-4xl mx-auto px-6 pt-32 space-y-24 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-zinc-800 group-hover:text-white" />
          Home / Careers
        </Link>

        <header className="space-y-10">
          <div className="flex items-center gap-6">
             <div className="w-16 h-px bg-linear-to-r from-accent-cyan to-transparent" />
             <div className="p-3 bg-accent-cyan/10 rounded-2xl">
                <Users size={24} className="text-accent-cyan animate-pulse" />
             </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8] pr-10 px-4 -mx-4">
              Work with <span className="gradient-text">Us.</span>
            </h1>
            <p className="text-zinc-500 font-medium text-xl md:text-2xl max-w-2xl leading-relaxed">
              We're building the infrastructure for a simpler, AI-powered future. Join us in making complex tools accessible to everyone.
            </p>
          </div>
        </header>

        {/* Empty State / No Jobs */}
        <section className="space-y-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-700">Current Openings</h2>
            <div className="h-px flex-1 ml-10 bg-white/5" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group rounded-[3rem] p-[1px] overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/10 via-transparent to-white/10 opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative bg-zinc-950/80 backdrop-blur-3xl rounded-[3rem] p-12 md:p-20 text-center space-y-10">
               <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
                  <div className="absolute inset-0 shimmer opacity-10" />
                  <Sparkles size={40} className="text-zinc-700 group-hover:text-accent-cyan transition-colors" />
               </div>
               
               <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">No active jobs currently.</h3>
                  <p className="text-zinc-500 font-medium max-w-md mx-auto leading-relaxed">
                    Our team is currently at capacity, but we're always expanding. Check back soon for new opportunities.
                  </p>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Reach Out Section */}
        <section className="pt-20 border-t border-white/5">
           <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-12 p-12 md:p-16 rounded-[3.5rem] glass-dark border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-accent-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="space-y-6 relative z-10">
                 <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                    Think you're a good fit?
                 </h3>
                 <p className="text-zinc-500 font-medium max-w-lg leading-relaxed">
                    If you believe you have what it takes to contribute to Lumora's mission, don't wait for a listing. Send your portfolio and resume to our team.
                 </p>
                 <div className="flex items-center gap-3 pt-4">
                    <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan">Open for inquiries</span>
                 </div>
              </div>
              
              <Link href="mailto:carrers@lumoratools.xyz" className="relative group/btn z-10">
                 <div className="absolute -inset-1 bg-linear-to-r from-accent-purple to-accent-cyan rounded-2xl blur-lg opacity-40 group-hover/btn:opacity-100 transition duration-500" />
                 <button className="relative px-10 py-6 bg-white text-black rounded-xl font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl">
                    carrers@lumoratools.xyz
                 </button>
              </Link>
           </div>
        </section>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
           <ValueCard icon={Zap} title="Hyper-Growth" desc="Work at the speed of thought. We ship features daily and optimize constantly." />
           <ValueCard icon={Globe} title="Remote First" desc="Our team is global. Work from wherever you feel most inspired." />
           <ValueCard icon={Sparkles} title="Design Driven" desc="We believe beauty is a feature. We obsess over every pixel and interaction." />
        </div>
      </main>
    </div>
  );
}

function ValueCard({ icon: Icon, title, desc }: any) {
   return (
      <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6 hover:bg-white/[0.04] transition-colors group">
         <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-600 group-hover:text-accent-cyan transition-colors">
            <Icon size={24} />
         </div>
         <div className="space-y-3">
            <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">{title}</h4>
            <p className="text-zinc-600 text-xs font-medium leading-relaxed">{desc}</p>
         </div>
      </div>
   );
}
