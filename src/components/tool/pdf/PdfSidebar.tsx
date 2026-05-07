"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  desc: string;
}

interface PdfSidebarProps {
  steps: Step[];
  stats?: { label: string; value: string | number }[];
  accentColor?: string;
}

export function PdfSidebar({ steps, stats, accentColor = "text-emerald-400" }: PdfSidebarProps) {
  return (
    <aside className="space-y-8 h-fit">
      {/* Configuration & Stats */}
      {stats && stats.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-[3.5rem] p-10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black uppercase tracking-tight italic">Studio Setup</h3>
            <CheckCircle2 className={cn("w-6 h-6", accentColor)} />
          </div>
          
          <div className="space-y-6">
            <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Live Stats</label>
            <div className="grid grid-cols-1 gap-3">
              {stats.map((stat, i) => (
                <div key={i} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:bg-white/[0.05] transition-all">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">{stat.label}</span>
                  <span className="text-sm font-black text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[3.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
        
        <div className="flex items-center gap-4 mb-10">
           <div className="p-3 bg-white/5 rounded-2xl">
              <Info className={cn("w-6 h-6", accentColor)} />
           </div>
           <h3 className="text-xl font-black uppercase italic tracking-tight">How it works</h3>
        </div>

        <div className="space-y-10">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 group">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 text-white font-black italic group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-all">
                  {i + 1}
                </div>
                {i < steps.length - 1 && <div className="w-px flex-1 bg-zinc-800" />}
              </div>
              <div className="space-y-2 pb-8">
                <h4 className="text-sm font-black text-white uppercase italic tracking-tight group-hover:translate-x-1 transition-transform">{step.title}</h4>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Badge */}
      <div className="p-8 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 flex gap-5 items-center">
         <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <Shield className="w-6 h-6" />
         </div>
         <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Secure Cloud</h4>
            <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Files deleted after 1hr</p>
         </div>
      </div>
    </aside>
  );
}
