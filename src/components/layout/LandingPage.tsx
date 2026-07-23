"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  Zap, 
  Infinity as InfinityIcon,
  Sparkles,
  ArrowRight,
  Eraser,
  Mic2,
  FileText,
  LayoutGrid,
  PenTool,
  Palette,
  Layout,
  Box,
  Quote,
  ShieldCheck,
  Zap as ZapIcon,
  Cloud,
  Globe,
  Star,
  Users,
  CheckCircle2,
  Cpu,
  MousePointer2,
  Lock,
  ChevronRight,
  Plus,
  Crown,
  Play,
  Layers,
  Search,
  Video,
  Music,
  Trash2,
  Wand2,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ToolCard } from "@/components/ui/ToolCard";
import GradientText from "@/components/ui/GradientText";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";
import { InteractivePlayground } from "@/components/tool/InteractivePlayground";

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIndia, setIsIndia] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/billing/market", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (active) {
          setIsIndia(data.countryCode === "UNKNOWN" ? getIsIndia() : data.market === "IN");
        }
      })
      .catch(() => {
        if (active) setIsIndia(getIsIndia());
      });
    return () => {
      active = false;
    };
  }, []);

  const proPriceVal = isIndia ? PRICING_CONFIG.PRO_PLAN.INR : PRICING_CONFIG.PRO_PLAN.USD;
  const proPrice = isIndia ? `Rs ${proPriceVal}` : `$${proPriceVal}`;
  const launchComparePrice = isIndia ? "Rs 999" : "$14.99";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="flex flex-col w-full overflow-hidden bg-[#020202] selection:bg-purple-500/30 font-sans text-zinc-100">

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-40 px-6 overflow-hidden">
        {/* Animated Background Ambience */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[120%] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.08)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
          
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] right-[-5%] w-[600px] h-[600px] bg-purple-600/[0.03] blur-[120px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              scale: [1.1, 1, 1.1],
              x: [0, -30, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[15%] left-[-5%] w-[500px] h-[500px] bg-cyan-600/[0.02] blur-[100px] rounded-full" 
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center space-y-12"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md mx-auto w-fit"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">The Next Generation AI Platform</span>
              </motion.div>

              <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.85] uppercase">
                ALL-IN-ONE <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.2)]">AI STUDIO.</span>
              </h1>
            </div>

            <p className="text-lg md:text-2xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Remove backgrounds, generate images, edit videos, restore photos, and create music — <span className="text-zinc-300">everything you need, in one simple place.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Link href="/tools" className="w-full sm:w-auto group">
                <button className="h-16 px-10 w-full sm:w-auto rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(124,58,237,0.3)]">
                  Try for Free
                </button>
              </Link>
              <Link href="/pro" className="w-full sm:w-auto group">
                <button className="h-16 px-10 w-full sm:w-auto rounded-2xl bg-white/[0.03] border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/[0.08] transition-all flex items-center justify-center gap-3">
                  Upgrade to Pro
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            <div className="pt-16 flex flex-col items-center gap-6">
              {/* Creator Avatars & Social Proof */}
              <div className="flex items-center gap-3 bg-white/[0.01] border border-white/[0.03] px-4 py-2 rounded-2xl backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex -space-x-2.5">
                  <img
                    src="/avatars/marcus.png"
                    alt="Creator avatar"
                    className="w-8 h-8 rounded-full border-2 border-[#020202] object-cover ring-1 ring-white/10 hover:scale-110 hover:z-10 transition-transform duration-200"
                  />
                  <img
                    src="/avatars/alena.png"
                    alt="Creator avatar"
                    className="w-8 h-8 rounded-full border-2 border-[#020202] object-cover ring-1 ring-white/10 hover:scale-110 hover:z-10 transition-transform duration-200"
                  />
                  <img
                    src="/avatars/julian.png"
                    alt="Creator avatar"
                    className="w-8 h-8 rounded-full border-2 border-[#020202] object-cover ring-1 ring-white/10 hover:scale-110 hover:z-10 transition-transform duration-200"
                  />
                  <div className="w-8 h-8 rounded-full border-2 border-[#020202] bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white ring-1 ring-white/10 hover:scale-110 hover:z-10 transition-transform duration-200">
                    +9k
                  </div>
                </div>
                
                <div className="h-4 w-[1px] bg-white/10" />

                <span className="text-[11px] font-semibold tracking-wider text-zinc-300">
                  Trusted by{" "}
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                    10,000+
                  </span>{" "}
                  creators
                </span>
              </div>

              {/* No Credit Card Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <ShieldCheck size={13} className="text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                  No credit card required to start
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 flex flex-col items-center gap-3 cursor-pointer group"
          onClick={() => {
            document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-purple-400 transition-colors">
            Scroll to explore
          </span>
          <div className="w-6 h-10 rounded-full border border-zinc-800 group-hover:border-purple-500/50 flex justify-center p-1.5 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.05)]">
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"
            />
          </div>
        </motion.div>
      </section>

      {/* Interactive Sandbox Section */}
      <InteractivePlayground />

      {/* 3. POPULAR TOOLS SHOWCASE */}
      <section id="explore" className="py-40 px-6 max-w-7xl mx-auto w-full relative">
        <div className="flex flex-col items-center mb-24 text-center space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Wand2 size={12} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Flagship Suite</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Curated <span className="text-zinc-600 italic font-medium">Power Tools.</span>
          </h2>
          <p className="text-zinc-500 font-medium text-sm md:text-base max-w-lg">
            Our most popular AI-driven utilities used by professionals worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ToolCard 
            id="image-eraser" 
            name="Background Remover" 
            description="Remove backgrounds from your photos instantly with professional-grade AI precision." 
            category="image" 
            icon="ImageIcon" 
            href="/tools/image/eraser" 
            proPowerPack
            popular 
          />
          <ToolCard 
            id="ai-img-gen" 
            name="AI Image Generator" 
            description="Transform your imagination into beautiful art and photos using advanced AI magic." 
            category="ai" 
            icon="Sparkles" 
            href="/tools/ai/img-gen" 
            pro 
            proPowerPack
            popular
          />
          <ToolCard 
            id="audio-vocal-remover" 
            name="Vocal Remover" 
            description="Extract high-quality vocals or instrumentals from any track with studio-grade separation." 
            category="audio" 
            icon="Mic2" 
            href="/tools/audio/vocal-remover" 
            popular 
          />
          <ToolCard 
            id="ai-writer" 
            name="AI Content Architect" 
            description="Generate professional scripts, articles, and creative copy optimized for engagement and SEO." 
            category="ai" 
            icon="PenTool" 
            href="/tools/ai/writer" 
            pro 
          />
          <ToolCard 
            id="video-bg-remover" 
            name="AI Video Studio" 
            description="Remove and replace video backgrounds instantly without any manual work or green screens." 
            category="video" 
            icon="Video" 
            href="/tools/video/bg-remover" 
            pro 
          />
          <ToolCard 
            id="pdf-ocr" 
            name="Smart OCR Extractor" 
            description="Convert complex documents, scans, and images into structured, editable digital text." 
            category="pdf" 
            icon="Search" 
            href="/tools/pdf/ocr" 
            popular
          />
        </div>

        <div className="mt-20 text-center">
          <Link href="/tools">
             <button className="group h-14 px-8 rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-white hover:border-white/10 transition-all flex items-center gap-3 mx-auto">
                Explore All 50+ Tools
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </Link>
        </div>
      </section>

      {/* 4. WHY EXISMIC (BENEFITS) */}
      <section className="py-40 px-6 relative bg-zinc-950/30 border-y border-white/[0.04] overflow-hidden">
         {/* Background Ambient Glows */}
         <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

         <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
               <div className="space-y-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.15),inset_0_0_12px_rgba(168,85,247,0.1)]">
                     <Cpu size={28} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                      ELITE <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">PERFORMANCE.</span>
                    </h2>
                    <p className="text-lg text-zinc-400 font-medium leading-relaxed max-w-lg">
                      We've bridged the gap between complex AI research and professional creative workflows. One platform, unlimited possibilities.
                    </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <BenefitItem icon={ZapIcon} title="Warp Speed" desc="Proprietary hardware acceleration for instant processing." />
                  <BenefitItem icon={InfinityIcon} title="Unlimited Pro" desc="Zero caps for subscribers. Total creative freedom." />
                  <BenefitItem icon={Lock} title="Privacy First" desc="Secure, encrypted processing. Your data stays yours." />
                  <BenefitItem icon={Layers} title="Unified Flow" desc="Every tool you need in a single, cohesive interface." />
               </div>
            </div>
         </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-48 px-6 max-w-7xl mx-auto w-full relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

        <div className="text-center mb-32 space-y-6 relative z-10">
          <div className="text-purple-400 flex items-center justify-center gap-1.5 bg-purple-500/5 border border-purple-500/10 px-4 py-1.5 rounded-full w-fit mx-auto shadow-[0_0_20px_rgba(168,85,247,0.05)]">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={11} fill="currentColor" className="text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
            ))}
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-purple-300 ml-1.5">5.0 Star Rated</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight uppercase leading-[0.9]">
            Loved by <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 font-serif italic font-medium lowercase">creators.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard 
            quote="Exismic has completely replaced four other subscriptions for me. The AI quality is unmatched."
            author="Sarah Jenkins"
            role="Digital Artist"
            avatar="SJ"
          />
          <TestimonialCard 
            quote="The speed is what blew me away. Vocal removal takes seconds, not minutes. Highly recommended."
            author="Marcus Chen"
            role="Music Producer"
            avatar="MC"
          />
          <TestimonialCard 
            quote="Finally, an AI suite that actually feels professional. The UI is a dream to work in every day."
            author="Elena Rodriguez"
            role="Content Director"
            avatar="ER"
          />
        </div>
      </section>

      {/* 5.5 FAQ ACCORDION SECTION */}
      <FaqAccordion />

      {/* 6. PRICING TEASER */}
      <section className="py-24 sm:py-36 px-4 sm:px-6 relative overflow-hidden">
         {/* Background ambient lighting */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06)_0%,rgba(99,102,241,0.03)_50%,transparent_75%)] rounded-full blur-[140px] pointer-events-none" />

         <div className="max-w-4xl mx-auto relative z-10">
           
           {/* Glassmorphic Pricing Card Frame */}
           <div className="p-[1.5px] sm:p-[2px] rounded-3xl sm:rounded-[3.5rem] bg-gradient-to-b from-purple-500/30 via-indigo-500/20 via-cyan-500/20 to-purple-500/30 shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_50px_rgba(168,85,247,0.1)]">
             <div className="bg-[#070811]/95 p-6 sm:p-14 md:p-20 rounded-[22px] sm:rounded-[3.3rem] backdrop-blur-2xl border border-white/[0.06] text-center space-y-10 sm:space-y-12 relative overflow-hidden group">
               
               {/* Internal ambient corner glows */}
               <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent group-hover:via-purple-500/70 transition-all duration-700" />
               <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-cyan-500/5 blur-[100px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
               
               <div className="relative z-10 space-y-8 sm:space-y-10">
                 
                 {/* Top Badge & Header */}
                 <div className="space-y-4 sm:space-y-5">
                   <div className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 border border-purple-500/30 text-purple-300 w-fit mx-auto shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                      <Crown size={13} className="text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-300">All-Access Pass</span>
                   </div>

                   <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase leading-[0.96]">
                      UNLIMITED <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 font-serif italic font-medium lowercase">pro power.</span>
                   </h2>

                   <p className="text-zinc-400 font-medium text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                     Unlock every AI tool, high-speed rendering, 4K export, and priority GPU processing with zero hidden caps.
                   </p>
                 </div>

                 {/* Feature Matrix Grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 max-w-2xl mx-auto text-left py-2">
                    {[
                      { text: 'Unlimited AI Studio Access', desc: 'No daily limits or hidden generation caps' },
                      { text: '4K Ultra-HD Output', desc: 'Export high-res images and audio stems' },
                      { text: 'Priority Server Queue', desc: 'Hardware accelerated GPU processing' },
                      { text: 'No Ads or Watermarks', desc: 'Clean professional outputs ready to use' },
                      { text: 'Full Commercial License', desc: '100% royalty-free for commercial work' },
                      { text: 'VIP Priority Support', desc: 'Dedicated 24/7 priority customer support' }
                    ].map(feat => (
                      <div key={feat.text} className="p-3.5 rounded-2xl bg-zinc-950/60 border border-white/[0.04] hover:border-purple-500/30 transition-all duration-300 flex items-start gap-3 group/item">
                        <div className="w-6 h-6 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center shrink-0 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)] group-hover/item:scale-110 transition-transform">
                           <CheckCircle2 size={13} />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-white font-bold text-xs block group-hover/item:text-purple-300 transition-colors">{feat.text}</span>
                          <span className="text-zinc-500 text-[10px] block leading-tight font-medium">{feat.desc}</span>
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 {/* Price Display & CTA Section */}
                 <div className="pt-4 space-y-6 sm:space-y-8 border-t border-white/[0.06]">
                    
                    <div className="flex flex-col items-center gap-2">
                       <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-purple-300 mb-1">
                          <Zap size={10} className="text-purple-400 animate-pulse" />
                          <span>50% Launch Discount</span>
                       </div>

                       <div className="flex items-baseline justify-center gap-3">
                          <span className="text-zinc-500 line-through text-lg sm:text-2xl font-bold tracking-tight">
                            {launchComparePrice}
                          </span>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-purple-200 text-5xl sm:text-7xl font-black tracking-tight drop-shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                            {proPrice}
                          </span>
                          <span className="text-zinc-400 text-xs sm:text-sm font-bold tracking-normal uppercase">
                            / month
                          </span>
                       </div>

                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                         Simple Monthly Subscription • Cancel Anytime
                       </p>
                    </div>

                    {/* CTA Button */}
                    <div className="space-y-4">
                      <Link href="/pro" className="inline-block w-full max-w-md">
                         <button className="w-full h-15 sm:h-16 px-8 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-black uppercase tracking-[0.2em] text-xs sm:text-sm hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group/btn cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <span>Unlock Pro Access Now</span>
                              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                         </button>
                      </Link>

                      {/* Trust Badges */}
                      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-70 text-zinc-400 text-[10px] font-mono">
                         <TrustBadge icon={<Lock size={12} className="text-purple-400" />} text="256-Bit Encrypted Checkout" />
                         <TrustBadge icon={<RefreshCcw size={12} className="text-purple-400" />} text="Cancel Anytime in 1-Click" />
                      </div>
                    </div>

                 </div>
               </div>
             </div>
           </div>
         </div>
      </section>

    </div>
  );
}

function BenefitItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-3xl bg-zinc-950/40 hover:bg-zinc-900/30 border border-white/[0.03] hover:border-purple-500/25 backdrop-blur-md transition-all duration-300 relative overflow-hidden group shadow-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
      {/* Internal ambient corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent blur-xl pointer-events-none rounded-full transition-opacity duration-300 group-hover:opacity-100 opacity-30" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/5 to-transparent blur-xl pointer-events-none rounded-full transition-opacity duration-300 group-hover:opacity-100 opacity-20" />
      
      <div className="relative z-10 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 group-hover:from-purple-500/15 group-hover:to-cyan-500/15 border border-white/[0.06] group-hover:border-purple-500/30 text-zinc-400 group-hover:text-purple-400 flex items-center justify-center transition-all duration-300 shadow-[inset_0_0_12px_rgba(255,255,255,0.01)]">
          <Icon size={22} className="transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-white font-black uppercase tracking-wider text-xs transition-colors duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text">
            {title}
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium transition-colors duration-300 group-hover:text-zinc-300">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, author, role, avatar }: { quote: string; author: string; role: string; avatar: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.03] hover:border-purple-500/20 backdrop-blur-md transition-all duration-500 relative group overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_-15px_rgba(168,85,247,0.06)]"
    >
      {/* Sleek light sweep/glow overlays */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

      <Quote className="absolute top-6 right-6 text-purple-500/10 group-hover:text-purple-500/20 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" size={44} />
      
      <div className="relative z-10 space-y-8">
        <p className="text-base text-zinc-300 group-hover:text-white transition-colors duration-500 font-medium italic leading-relaxed">
          "{quote}"
        </p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 p-[1.5px] shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.45)] transition-all duration-500">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-white font-black text-[10px] tracking-wider">
              {avatar}
            </div>
          </div>
          <div className="space-y-0.5">
            <h4 className="text-white font-bold text-sm tracking-tight group-hover:text-purple-300 transition-colors duration-500">{author}</h4>
            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 group-hover:text-zinc-400">{role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
      {icon}
      {text}
    </div>
  );
}

function RefreshCcw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is Exismic free to use?",
      a: "Yes, Exismic offers a generous free tier for all our tools, including our flagship background remover and AI image generator."
    },
    {
      q: "What AI tools does Exismic offer?",
      a: "Exismic provides over 50+ AI tools including AI Image Generation, Background Removal, Vocal Separation, PDF Processing, and AI Writing."
    },
    {
      q: "Do I need a credit card to sign up?",
      a: "No credit card is required to start using Exismic's free tools."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Absolutely. You can cancel your Pro plan anytime directly from your account billing settings with a single click. You will keep your Pro benefits until the end of your billing period."
    },
    {
      q: "Is my uploaded data safe and private?",
      a: "Yes, security and privacy are our top priorities. All uploaded files are securely encrypted and automatically processed. We never sell your files or use them for training external AI models."
    }
  ];

  return (
    <section className="py-32 px-6 max-w-4xl mx-auto w-full relative">
      <div className="flex flex-col items-center mb-16 text-center space-y-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <HelpCircle size={12} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Support</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight uppercase leading-[0.9]">
          Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">Questions</span>
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className="border border-white/[0.04] bg-zinc-950/40 rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/20"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left text-white font-bold text-sm md:text-base hover:bg-white/[0.01] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className={cn("text-zinc-500 transition-transform duration-300", isOpen ? "rotate-45 text-purple-400" : "")}>
                  <Plus size={20} />
                </span>
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-0 text-zinc-400 text-xs md:text-sm font-medium leading-relaxed border-t border-white/[0.02]">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
