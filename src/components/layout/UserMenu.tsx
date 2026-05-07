"use client";

import { User, LogOut, LogIn, Sparkles, CreditCard, Settings, ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GradientText from "../ui/GradientText";
import PremiumButton from "../ui/PremiumButton";
import { usePro } from "@/hooks/usePro";

export function UserMenu() {
  const { isPro, user: dbUser, isLoading } = usePro();
  const [session, setSession] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth Session management
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse border border-white/10" />;
  }

  if (!session) {
    return (
      <button 
        onClick={() => router.push('/auth/login')}
        className="flex items-center gap-3 px-6 py-2.5 rounded-2xl premium-gradient text-white shadow-lg hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
      >
        <LogIn size={14} />
        Sign In
      </button>
    );
  }

  const user = session.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Explorer";
  const avatarUrl = user?.user_metadata?.avatar_url;
  
  // Real usage data from DB
  const usageCount = dbUser?.aiGenerationsUsed ?? 0;
  const totalLimit = dbUser?.aiGenerationsLimit ?? 50;
  const currentPlan = dbUser?.plan || dbUser?.planType || "free";
  const plan = currentPlan.toLowerCase();
  
  const nextReset = (isMounted && dbUser?.nextResetDate) 
    ? new Date(dbUser.nextResetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
    : "May 1st, 2026";

  const progressPercent = Math.min((usageCount / totalLimit) * 100, 100);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 p-1 rounded-full border transition-all duration-300 group",
          isOpen ? "bg-white/10 border-accent-purple/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]" : "bg-white/[0.02] border-white/5 hover:border-white/10"
        )}
      >
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-accent-purple/30 transition-colors">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-accent-purple to-accent-blue flex items-center justify-center">
              <span className="text-sm font-black text-white">{fullName[0].toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="pr-4 hidden md:block text-left">
           <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none">Authenticated</p>
              {isPro && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
           </div>
            <p suppressHydrationWarning className={cn(
              "text-xs leading-none flex items-center gap-2",
              isPro ? "font-black italic text-white" : "font-bold text-white"
            )}>
               {isPro ? <GradientText className="text-xs">{fullName.split(' ')[0]}</GradientText> : fullName.split(' ')[0]}
               {isPro && <Sparkles size={10} className="text-accent-purple animate-pulse" />}
            </p>
        </div>
      </button>

      {/* Floating Pro Badge next to menu trigger (Desktop only) */}
      {/* Floating Pro Badge removed as per user request */}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 mt-4 w-80 bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
          >
            <div suppressHydrationWarning className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent-purple/20 blur-[80px] rounded-full -z-10" />

            <div className="p-8 pb-6 text-center">
               <div className="relative inline-block mb-4">
                  <div className="absolute -inset-1.5 bg-linear-to-tr from-accent-purple to-accent-blue rounded-full blur opacity-40 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full border-2 border-white/10 p-1.5 bg-zinc-900 shadow-2xl">
                    <div className="w-full h-full rounded-full overflow-hidden">
                       {avatarUrl ? (
                         <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full bg-linear-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                           <span className="text-3xl font-black text-white">{fullName[0].toUpperCase()}</span>
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center text-emerald-500 shadow-xl">
                     <ShieldCheck size={18} />
                  </div>
               </div>
               
               <h3 suppressHydrationWarning className="text-xl font-black text-white tracking-tight leading-tight">
                 {isPro ? <GradientText className="text-xl font-black">{fullName}</GradientText> : fullName}
               </h3>
               <p className="text-[11px] font-medium text-zinc-500 mt-1">{user?.email}</p>
            </div>

            <div className="px-6 py-6 border-t border-b border-white/5 space-y-6">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Current Plan</span>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-xl",
                    plan === 'pro' ? "bg-white/5 border border-white/10" : "bg-zinc-800 shadow-xl"
                  )}>
                     {plan === 'pro' ? <GradientText className="font-black">ELITE PRO PLAN</GradientText> : "Free Plan"}
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-end">
                     <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-accent-purple" />
                        <span className="text-xs font-bold text-zinc-300">AI Generations</span>
                     </div>
                     <span className="text-xs font-black text-white">{usageCount}<span className="text-zinc-600 font-bold ml-1">/ {totalLimit}</span></span>
                  </div>
                  <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 p-[1px]">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full rounded-full bg-linear-to-r from-accent-purple to-accent-blue shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                     />
                  </div>
                  <p className="text-[9px] text-zinc-500 font-medium italic">Resets on {nextReset}</p>
               </div>
            </div>

            <div className="p-3 bg-white/[0.02] space-y-1">
               {!isPro ? (
                 <Link href="/pro" className="block mb-2">
                     <PremiumButton 
                        variant="upgrade"
                        size="sm"
                        className="w-full"
                     >
                        Upgrade to Pro
                     </PremiumButton>
                 </Link>
               ) : (
                   <Link 
                     href="/pro/benefits"
                     onClick={() => setIsOpen(false)}
                     className="w-full group flex items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest text-white bg-white/5 border border-white/10 rounded-2xl transition-all shadow-xl hover:bg-white/10"
                   >
                     <ShieldCheck size={16} className="text-accent-purple" />
                     <GradientText className="font-black">LUMORA PRO MEMBER</GradientText>
                     <Sparkles size={12} className="ml-auto text-accent-purple animate-pulse" />
                   </Link>
               )}

               <Link 
                 href="/pro"
                 onClick={() => setIsOpen(false)}
                 className="w-full group flex items-center gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
               >
                  <CreditCard size={16} className="text-zinc-600 group-hover:text-accent-purple" />
                  {plan === 'pro' ? "Manage Subscription" : "Plans & Billing"}
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
               </Link>
               
               <Link 
                  href="/account/settings"
                  onClick={() => setIsOpen(false)}
                  className="w-full group flex items-center gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
               >
                  <Settings size={16} className="text-zinc-600 group-hover:text-accent-blue" />
                  Settings & Security
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
               </Link>

               <div className="h-px bg-white/5 my-2 mx-3" />

               <button 
                 onClick={async () => {
                    await supabase.auth.signOut();
                    router.refresh();
                 }}
                 className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
               >
                 <LogOut size={16} />
                 Sign Out
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
