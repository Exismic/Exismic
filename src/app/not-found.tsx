"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { useEffect, useState } from "react";

export default function NotFound() {
  const prefersReducedMotion = useReducedMotion();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030303] text-zinc-100 selection:bg-purple-500/35">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
        
        {/* Animated Orbs reacting to mouse */}
        <motion.div
          animate={prefersReducedMotion ? undefined : {
            x: mousePosition.x * -40,
            y: mousePosition.y * -40,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
          className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen"
        />
        <motion.div
          animate={prefersReducedMotion ? undefined : {
            x: mousePosition.x * 40,
            y: mousePosition.y * 40,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
          className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen"
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl px-6 py-20 mx-auto text-center flex flex-col items-center">
        {/* Floating Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
          <ExismicMark size={64} className="relative z-10" />
        </motion.div>

        {/* Glitchy 404 Text */}
        <div className="relative inline-block perspective-[1000px]">
          <motion.h1 
            initial={{ opacity: 0, z: -100 }}
            animate={{ opacity: 1, z: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(6rem,15vw,14rem)] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-[linear-gradient(110deg,#fff,#a5f3fc,#fff)] drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] select-none"
          >
            404
          </motion.h1>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4">
             <motion.div
               animate={prefersReducedMotion ? undefined : { rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             >
                <Compass className="w-12 h-12 text-zinc-800" strokeWidth={1} />
             </motion.div>
          </div>

          <motion.div 
            animate={{ 
              clipPath: [
                "inset(0 0 100% 0)", 
                "inset(10% 0 80% 0)", 
                "inset(80% 0 10% 0)", 
                "inset(0 0 100% 0)"
              ],
              x: [-5, 5, -5, 0]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
            className="absolute inset-0 text-[clamp(6rem,15vw,14rem)] font-black leading-none tracking-tighter text-cyan-400 opacity-70 select-none pointer-events-none"
          >
            404
          </motion.div>
          <motion.div 
            animate={{ 
              clipPath: [
                "inset(100% 0 0 0)", 
                "inset(80% 0 10% 0)", 
                "inset(10% 0 80% 0)", 
                "inset(100% 0 0 0)"
              ],
              x: [5, -5, 5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            className="absolute inset-0 text-[clamp(6rem,15vw,14rem)] font-black leading-none tracking-tighter text-purple-500 opacity-70 select-none pointer-events-none"
          >
            404
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2 mb-12 space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-[0.1em]">
            Reality Not Found
          </h2>
          <p className="text-zinc-400 font-medium max-w-[500px] mx-auto leading-relaxed">
            The coordinates you requested lead to an empty sector of the Exismic universe. The page might have been moved, deleted, or never existed.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/"
            className="group relative flex h-14 w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white px-8 text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(0,0,0,0.05),transparent)] bg-[length:200%_100%] animate-shine skew-x-[-20deg]" />
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Return to Base
          </Link>
          
          <Link
            href="/tools"
            className="group relative flex h-14 w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0a0a0f] px-8 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all hover:bg-cyan-500/10 hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] active:scale-[0.98]"
          >
            Explore Tools
            <Sparkles size={16} className="text-cyan-400 transition-transform group-hover:scale-110 group-hover:rotate-12" />
          </Link>
        </motion.div>
      </div>

      {/* Futuristic Scanner Line */}
      <motion.div
        className="absolute top-0 left-0 w-full h-px bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.8),rgba(6,182,212,0.8),transparent)] shadow-[0_0_20px_rgba(6,182,212,0.6)] z-20 pointer-events-none"
        animate={prefersReducedMotion ? undefined : {
          y: ["0vh", "100vh"],
          opacity: [0, 1, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
