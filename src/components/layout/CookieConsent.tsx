"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Settings2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
};

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    functional: true
  });

  useEffect(() => {
    setMounted(true);
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem("lumora_cookie_consent");
    if (!savedConsent) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    } else {
      try {
        setPreferences(JSON.parse(savedConsent));
      } catch (e) {}
    }
  }, []);

  const savePreferences = async (newPrefs: CookiePreferences) => {
    localStorage.setItem("lumora_cookie_consent", JSON.stringify(newPrefs));
    setPreferences(newPrefs);
    setShowBanner(false);
    setShowModal(false);

    // Save to supabase if logged in
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      try {
        await supabase.from('users').update({
          cookie_preferences: newPrefs
        }).eq('id', session.user.id);
      } catch (e) {
        // Ignore error if schema doesn't have cookie_preferences yet
        console.log("Could not save preferences to DB");
      }
    }
  };

  const acceptAll = () => {
    savePreferences({ essential: true, analytics: true, functional: true });
  };

  const rejectAll = () => {
    savePreferences({ essential: true, analytics: false, functional: false });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mini Banner */}
      <AnimatePresence>
        {showBanner && !showModal && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-3rem)] max-w-4xl"
          >
            <div className="relative p-6 md:px-8 md:py-6 rounded-3xl glass-dark border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] overflow-hidden group">
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/5 via-transparent to-accent-cyan/5 opacity-50" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                {/* Content */}
                <div className="flex items-start md:items-center gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
                    <Cookie size={18} className="text-accent-purple" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      We value your privacy
                    </p>
                    <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                      We use essential cookies to make Lumora work. We'd also like to use analytics to improve your experience. You can manage your preferences anytime.{" "}
                      <Link href="/cookies" className="text-accent-cyan hover:underline underline-offset-2 transition-all">
                        Cookie Policy
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
                  <button 
                    onClick={rejectAll}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Reject All
                  </button>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Settings2 size={14} /> Customize
                  </button>
                  <button 
                    onClick={acceptAll}
                    className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-black text-xs font-black uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  >
                    Accept All
                  </button>
                </div>

                {/* Close Button (defaults to reject/dismiss) */}
                <button 
                  onClick={rejectAll}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors md:hidden"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customize Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md p-8 rounded-[2.5rem] glass-dark border border-white/10 shadow-2xl z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-purple to-accent-cyan" />
              
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-white italic">Cookie Preferences</h3>
                  <p className="text-sm text-zinc-400 mt-2">Manage how we use data to personalize your experience.</p>
                </div>

                <div className="space-y-4">
                  {/* Essential */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                    <ShieldCheck size={20} className="text-accent-purple shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">Essential</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded-full border border-accent-purple/20">Always On</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Strictly necessary for the platform to function and keep your session secure.</p>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4 transition-colors">
                    <div className="shrink-0 mt-0.5 relative">
                      <input 
                        type="checkbox" 
                        id="analytics"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <label htmlFor="analytics" className="w-10 h-6 bg-white/10 rounded-full flex items-center peer-checked:bg-accent-cyan cursor-pointer transition-colors p-1">
                        <div className={cn("w-4 h-4 bg-white rounded-full shadow-md transition-transform", preferences.analytics ? "translate-x-4" : "translate-x-0")} />
                      </label>
                    </div>
                    <div className="flex-1">
                      <label htmlFor="analytics" className="font-bold text-white text-sm cursor-pointer select-none block">Analytics</label>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Helps us understand user behavior so we can improve Lumora.</p>
                    </div>
                  </div>

                  {/* Functional */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4 transition-colors">
                    <div className="shrink-0 mt-0.5 relative">
                      <input 
                        type="checkbox" 
                        id="functional"
                        checked={preferences.functional}
                        onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <label htmlFor="functional" className="w-10 h-6 bg-white/10 rounded-full flex items-center peer-checked:bg-emerald-400 cursor-pointer transition-colors p-1">
                        <div className={cn("w-4 h-4 bg-white rounded-full shadow-md transition-transform", preferences.functional ? "translate-x-4" : "translate-x-0")} />
                      </label>
                    </div>
                    <div className="flex-1">
                      <label htmlFor="functional" className="font-bold text-white text-sm cursor-pointer select-none block">Functional</label>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Remembers your display preferences and custom settings.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button 
                    onClick={rejectAll}
                    className="py-3 rounded-xl border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Reject All
                  </button>
                  <button 
                    onClick={saveCustom}
                    className="py-3 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    Save Options
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
