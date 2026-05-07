"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Zap, Image, Video, Music, Code } from 'lucide-react';
import GradientText from '@/components/ui/GradientText';

const PRO_FEATURES = [
  { icon: Image, name: 'AI Image Studio', desc: 'No limits, highest resolution' },
  { icon: Video, name: 'Pro Video Tools', desc: '4K processing & long duration' },
  { icon: Music, name: 'AI Audio Engine', desc: 'Premium stem separation' },
  { icon: Code, name: 'AI Code Studio', desc: 'Unlimited workspace generations' }
];

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Fire confetti on load
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[800px] h-[800px] bg-cyan-600/[0.08] blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-3xl w-full text-center relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-[2rem] mx-auto flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(6,182,212,0.3)]"
        >
          <Zap className="w-12 h-12 text-white fill-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4">
            Welcome to <GradientText>Pro</GradientText>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto mb-16">
            Your payment was successful. All premium features are now unlocked for your account.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {PRO_FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-5 text-left group hover:bg-white/[0.08] transition-all cursor-default"
            >
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-1 italic">{feature.name}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => router.push('/')}
          className="px-12 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] italic flex items-center gap-3 mx-auto hover:scale-[1.05] transition-all active:scale-95 shadow-2xl"
        >
          Explore Pro Dashboard <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
