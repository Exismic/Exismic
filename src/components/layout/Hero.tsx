"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { Sparkles, ArrowRight, Users, Lock, FastForward } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function Hero() {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
    },
  };

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center py-24 px-6 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-accent-purple/15 blur-[120px] rounded-full" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-cyan/10 blur-[150px] rounded-full" 
        />
        
        {/* Soft Grid */}

        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
                <div 
                    key={i} 
                    className="absolute rounded-full bg-white opacity-[0.1] blur-[1px]"
                    style={{
                        width: `${1 + ((i * 7) % 3)}px`,
                        height: `${1 + ((i * 11) % 3)}px`,
                        top: `${(i * 37) % 100}%`,
                        left: `${(i * 61) % 100}%`,
                        animation: `float-particle ${20 + ((i * 13) % 20)}s linear infinite`,
                        animationDelay: `-${(i * 17) % 20}s`
                    }}
                />
            ))}
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ opacity }}
        className="relative z-20 max-w-5xl text-center flex flex-col items-center"
      >
        {/* Headline */}
        <motion.h1 
          variants={itemVariants}
          className="text-[14vw] md:text-[8rem] lg:text-[10rem] font-black mb-8 leading-[0.8] tracking-tighter italic uppercase text-white pr-10 px-4 -mx-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          {t('hero.title_top')} <br />
          <span className="gradient-text">{t('hero.title_bottom')}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-2xl text-zinc-400 mb-14 max-w-3xl mx-auto leading-relaxed font-medium"
        >
          {t('hero.subtitle_top')} <br className="hidden md:block" />
          <span className="text-white/80">{t('hero.subtitle_bottom')}</span>
        </motion.p>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full mb-20">
          <Link href="/pro" className="group relative w-full sm:w-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-purple to-accent-cyan rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition duration-500" />
            <button className="relative w-full h-18 px-12 text-sm font-black uppercase tracking-[0.2em] rounded-xl premium-gradient text-white hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
              <Sparkles size={18} className="text-white" />
              {t('common.upgrade')}
            </button>
          </Link>

          <Link href="/#explore" className="w-full sm:w-auto">
            <button className="h-18 w-full px-12 text-sm font-black uppercase tracking-[0.2em] rounded-xl glass-dark border border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-3 group">
              {t('common.browse_all')}
              <ArrowRight size={18} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>


      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
      >
        <div className="w-[2px] h-12 bg-gradient-to-b from-white/60 to-transparent" />
      </motion.div>

      <style jsx>{`
        @keyframes float-particle {
            0% { transform: translateY(0px) translateX(0px); opacity: 0; }
            10% { opacity: 0.2; }
            90% { opacity: 0.2; }
            100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
