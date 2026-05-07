"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  X, 
  ArrowRight,
  Zap,
  Crown,
  Lock
} from "lucide-react";
import Link from "next/link";
import GradientText from "@/components/ui/GradientText";

export function OutOfCreditsModal({ 
  isOpen, 
  onClose, 
  onBuyCredits 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  onBuyCredits: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-lg glass-dark border border-white/5 rounded-[3rem] p-10 overflow-hidden shadow-4xl text-center"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] pointer-events-none" />
            
            <div className="space-y-10 relative z-10">
               <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                     <AlertTriangle size={48} />
                  </div>
               </div>

               <div className="space-y-4">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                     Energy <GradientText>Depleted.</GradientText>
                  </h2>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                     You have exhausted your daily credit reserve. Refuel now to continue using high-performance AI tools.
                  </p>
               </div>

               <div className="space-y-4">
                  <button 
                    onClick={() => {
                       onClose();
                       onBuyCredits();
                    }}
                    className="w-full h-16 rounded-2xl premium-gradient text-white font-black uppercase tracking-[0.3em] text-[10px] italic shadow-4xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-4"
                  >
                     Buy More Credits <Zap size={18} />
                  </button>
                  
                  <Link href="/pro" className="block">
                     <button className="w-full h-16 rounded-2xl bg-white/[0.05] border border-white/10 text-white font-black uppercase tracking-[0.3em] text-[10px] italic hover:bg-white/10 transition-all flex items-center justify-center gap-4">
                        Upgrade to Pro <Crown size={18} />
                     </button>
                  </Link>
               </div>

               <button 
                 onClick={onClose}
                 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 hover:text-zinc-500 transition-colors"
               >
                  Close Terminal
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
