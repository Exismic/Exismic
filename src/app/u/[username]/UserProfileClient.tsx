"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Code2, Sparkles, Activity, Zap, Hexagon, Fingerprint, Award, Layers } from "lucide-react";
import { AvatarWithFrame } from "@/components/ui/AvatarWithFrame";
import { PremiumName } from "@/components/ui/PremiumName";

interface UserProfileClientProps {
  user: any; // Using any for simplicity in this specific context, normally we'd type this.
}

export function UserProfileClient({ user }: UserProfileClientProps) {
  const avatar = user.customAvatarUrl || user.image || "https://i.pravatar.cc/150?u=" + user.id;
  const isDeveloper = user.email?.toLowerCase() === 'syedrayangames@gmail.com';
  const isPro = user.plan === 'pro';
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // Mocked data for premium feel
  const mockedToolsUsed = isPro ? 42 : 14;
  const mockedGenerations = isPro ? "12.4k" : "850";
  const mockedRank = isPro ? "Top 5%" : "Top 30%";

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 font-sans relative flex flex-col overflow-x-hidden selection:bg-purple-500/30">
      
      {/* Immersive Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-30%] left-[-10%] w-[80%] h-[80%] bg-purple-600/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/[0.02] blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-24 relative z-10">
        
        {/* Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <Link href="/" className="group flex w-fit items-center gap-3 text-zinc-500 hover:text-white transition-all">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:border-white/20 group-hover:bg-white/[0.05] transition-all">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back Home</span>
          </Link>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col xl:flex-row gap-8 lg:gap-12"
        >
          {/* Left Column: Identity Block */}
          <motion.div variants={itemVariants} className="w-full xl:w-[400px] shrink-0 space-y-6">
            <div className="rounded-[2.5rem] bg-[#050508]/60 border border-white/[0.05] shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl p-8 relative overflow-hidden group/identity">
              {/* Banner/Header Graphic inside the card */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-full blur-2xl opacity-20 group-hover/identity:opacity-40 transition-opacity duration-700" />
                  <AvatarWithFrame 
                    avatarUrl={avatar}
                    displayName={user.name || user.username || "Anonymous"}
                    isPro={isPro}
                    frameId={user.avatarFrame || undefined}
                    size="xl"
                  />
                </div>
                
                <h1 className="text-3xl font-black tracking-tight mb-2">
                  <PremiumName 
                    name={user.name || user.username || "Anonymous Creator"} 
                    isPro={isPro} 
                    gradientId={user.nameGradient} 
                  />
                </h1>
                
                {user.username && (
                  <p className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase mb-8">@{user.username}</p>
                )}

                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Joined</span>
                    </div>
                    <span className="text-xs font-bold text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>

                  {isPro && (
                    <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-cyan-500/[0.05] border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Sparkles size={14} className="fill-cyan-400/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                        <span className="text-xs font-black text-cyan-300">PRO</span>
                      </div>
                    </div>
                  )}

                  {isDeveloper && (
                    <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-purple-500/[0.05] border border-purple-500/20 shadow-[inset_0_0_20px_rgba(168,85,247,0.05)] relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                      <div className="flex items-center gap-2 text-purple-400 relative z-10">
                        <Code2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Role</span>
                      </div>
                      <div className="flex items-center gap-2 relative z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.9)] animate-pulse" />
                        <span className="text-xs font-black text-purple-400 tracking-wider">DEVELOPER</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Bio / Tagline */}
            <div className="rounded-[2rem] bg-white/[0.01] border border-white/[0.05] p-6 backdrop-blur-sm">
              <p className="text-sm font-medium text-zinc-400 leading-relaxed italic text-center">
                "{isDeveloper ? 'Architect of Exismic. Shaping the future of AI tools.' : (isPro ? 'Pro Creator pushing the boundaries of AI.' : 'Exploring the Exismic ecosystem.')}"
              </p>
            </div>
          </motion.div>

          {/* Right Column: Bento Grid Activity & Stats */}
          <motion.div variants={itemVariants} className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Wide Banner */}
            <div className="md:col-span-2 rounded-[2.5rem] bg-gradient-to-br from-[#0c0c12] to-[#050508] border border-white/[0.05] p-8 relative overflow-hidden group/card shadow-2xl">
              <div className="absolute right-0 top-0 w-64 h-64 bg-fuchsia-500/5 blur-[80px] pointer-events-none transition-all duration-700 group-hover/card:bg-fuchsia-500/10 group-hover/card:scale-110" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-fuchsia-400 mb-2">
                    <Activity size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Lifetime Activity</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Ecosystem Explorer</h3>
                  <p className="text-sm font-medium text-zinc-500 mt-2 max-w-sm">
                    Actively leveraging the Exismic tool suite to build and create at lightning speed.
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center relative">
                    <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    <Hexagon size={24} className="text-zinc-600" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center relative shadow-[0_0_20px_rgba(217,70,239,0.1)]">
                    <Zap size={24} className="text-fuchsia-400 fill-fuchsia-400/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Grid Item 1 */}
            <div className="rounded-[2.5rem] bg-[#050508]/60 border border-white/[0.05] p-8 relative overflow-hidden group/stat hover:bg-white/[0.02] transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Layers size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Rank</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-white tracking-tighter">{mockedRank}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-2">Global Standing</p>
                </div>
              </div>
            </div>

            {/* Bento Grid Item 2 */}
            <div className="rounded-[2.5rem] bg-[#050508]/60 border border-white/[0.05] p-8 relative overflow-hidden group/stat hover:bg-white/[0.02] transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Fingerprint size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Tools</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-white tracking-tighter">{mockedToolsUsed}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-2">Tools Explored</p>
                </div>
              </div>
            </div>

            {/* Bottom Wide Banner (Visual Graph Mockup) */}
            <div className="md:col-span-2 rounded-[2.5rem] bg-[#050508]/60 border border-white/[0.05] p-8 relative overflow-hidden hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Award size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Generations</span>
                </div>
                <span className="text-xs font-bold text-white bg-white/5 px-3 py-1 rounded-full">{mockedGenerations} Tasks</span>
              </div>
              
              {/* Aesthetic Mocked Graph */}
              <div className="h-32 w-full flex items-end gap-2 relative z-10">
                {Array.from({ length: 24 }).map((_, i) => {
                  const height = Math.max(20, Math.random() * 100);
                  const isActive = i > 16 && i < 22;
                  return (
                    <div 
                      key={i} 
                      className="flex-1 rounded-t-sm transition-all duration-1000 ease-out"
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: isActive ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                        boxShadow: isActive ? '0 0 10px rgba(168, 85, 247, 0.5)' : 'none'
                      }}
                    />
                  );
                })}
              </div>
              {/* Graph fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none z-20" />
            </div>

          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
