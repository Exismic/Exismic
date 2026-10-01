"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Crown, 
  Zap, 
  CheckCircle2,
  Flame
} from "lucide-react";
import { LuxuryButton } from "@/components/ui/LuxuryButton";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { PRICING_CONFIG, getIsIndia, isExismic17PromoActive } from "@/config/pricing";

const FREE_FEATURES = [
  { title: "50 Daily Free Credits", desc: "Refreshed every 24 hours so you can make what you need." },
  { title: "50+ Creative & Code Tools", desc: "Full access to photo, video, audio, and dev tools." },
  { title: "Direct File Downloads", desc: "Save finished files straight to your computer without watermarks." },
  { title: "No Credit Card Required", desc: "Use the tools right away without entering payment info." },
  { title: "Private Processing", desc: "Your files are processed securely and stay under your control." },
  { title: "Commercial Use Allowed", desc: "Use your downloaded files for personal or client work." },
];

const PRO_FEATURES = [
  { title: "500 Daily Credits", desc: "10x more credits every day for heavier projects." },
  { title: "Startup Brand Kit (.ZIP)", desc: "Download vector SVG logos, favicons, PNGs, and brand guides." },
  { title: "Bulk Spreadsheets & Files", desc: "Make dozens of QR codes from spreadsheets and compress files in batches." },
  { title: "Next.js 15 Source Code (.ZIP)", desc: "Download full Next.js and Tailwind projects ready to run." },
  { title: "Saved Project Folders", desc: "Keep your files organized into folders you can revisit anytime." },
  { title: "Full Commercial License", desc: "Complete usage rights for commercial client projects." },
];

export function ProSection() {
  const [isIndia, setIsIndia] = useState(false);

  useEffect(() => {
    // Check client browser signals immediately on mount (timezone, offset, locales)
    if (getIsIndia()) {
      setIsIndia(true);
    }

    let active = true;
    fetch("/api/billing/market", { cache: "no-store" })
      .then((res) => res.json())
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

  const promoActive = isExismic17PromoActive();
  const regularProPriceVal = isIndia ? PRICING_CONFIG.PRO_PLAN.INR : PRICING_CONFIG.PRO_PLAN.USD;
  const regularProPrice = isIndia ? `₹${regularProPriceVal}` : `$${regularProPriceVal}`;
  
  const proPriceVal = promoActive
    ? (isIndia ? PRICING_CONFIG.V17_LAUNCH_PROMO.PRO_MONTHLY.INR : PRICING_CONFIG.V17_LAUNCH_PROMO.PRO_MONTHLY.USD)
    : regularProPriceVal;
  const proPrice = isIndia ? `₹${proPriceVal}` : `$${proPriceVal}`;
  const freePrice = isIndia ? "₹0" : "$0";

  return (
    <section id="pro" className="pt-6 pb-6 sm:pt-8 sm:pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full scroll-mt-20">
      
      {/* Outer Grand Container with 2.5px Multi-Category Living Border Beam & Glow */}
      <div className="group relative p-[2px] sm:p-[2.5px] rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_45px_rgba(16,185,129,0.18),0_0_45px_rgba(168,85,247,0.22)] hover:shadow-[0_0_75px_rgba(16,185,129,0.28),0_0_75px_rgba(168,85,247,0.32)] transition-all duration-700">
        
        {/* 1. Base Multi-Category Perimeter Border (100% continuous 360° coverage, zero dead spots) */}
        <div 
          className="absolute -inset-[150%] pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: "conic-gradient(from 0deg, #10b981 0deg, #06b6d4 90deg, #a855f7 180deg, #f59e0b 270deg, #10b981 360deg)"
          }}
        />

        {/* 2. Active Rotating Laser Border Beam Animation on Hover */}
        <motion.div
          aria-hidden="true"
          className="absolute -inset-[160%] pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          style={{
            background: "conic-gradient(from 0deg, #10b981, #06b6d4 25%, #a855f7 50%, #f59e0b 75%, #10b981 100%)"
          }}
        />

        {/* 3. Halo Diffusion Glow Layer */}
        <motion.div
          aria-hidden="true"
          className="absolute -inset-[120%] pointer-events-none blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500 mix-blend-screen"
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          style={{
            background: "conic-gradient(from 0deg, #10b981, #06b6d4 25%, #a855f7 50%, #f59e0b 75%, #10b981 100%)"
          }}
        />

        {/* Inner Dark Shell */}
        <div className="relative z-10 h-full w-full p-6 sm:p-10 md:p-12 rounded-[calc(1.5rem-2px)] sm:rounded-[calc(2.5rem-2.5px)] bg-gradient-to-b from-[#0e0f17]/98 via-[#0a0a10]/98 to-[#06060a]/98 backdrop-blur-3xl overflow-hidden">
          
          {/* Continuous Hover Shine Sweep — elevated z-30 pointer-events-none */}
          <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-30">
            <div className="absolute inset-0 -translate-x-[160%] group-hover:translate-x-[160%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
          </div>

          {/* 4 Corner Ambient Mesh Glow Auras (Emerald & Cyan on left, Purple & Amber on right) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
            {/* Top-Left: Emerald (Free) */}
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-[90px] bg-emerald-500/20 opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            {/* Bottom-Left: Cyan */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-[90px] bg-cyan-500/20 opacity-35 group-hover:opacity-55 transition-opacity duration-700" />
            {/* Top-Right: Purple (Pro) */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[90px] bg-purple-500/25 opacity-40 group-hover:opacity-65 transition-opacity duration-700" />
            {/* Bottom-Right: Amber */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[90px] bg-amber-500/20 opacity-35 group-hover:opacity-55 transition-opacity duration-700" />
          </div>

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2.5 relative z-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
              PLANS
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.18] sm:leading-[1.15] py-0.5 pb-2">
              Start free.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 inline-block pb-1">
                Upgrade when you need it.
              </span>
            </h2>

            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Free is enough to try and use Exismic. When you need more daily credits, higher limits, and full project downloads, Pro is ready.
            </p>
          </div>

          {/* Side-by-Side Dual-Card Comparison Grid - Symmetrical, tight, zero-void */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 relative z-10 items-stretch">
            
            {/* 1. FREE TIER CARD (Emerald / Cyan Theme) */}
            <div className="group/card relative p-6 sm:p-7.5 rounded-[2rem] flex flex-col transition-all duration-500 transform-gpu hover:scale-[1.015] bg-gradient-to-b from-[#06180f]/95 via-[#030e09]/95 to-[#010704]/95 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:border-emerald-300 hover:shadow-[0_0_45px_rgba(16,185,129,0.45)] overflow-hidden">
              
              {/* Card Hover Shine Sweep */}
              <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10">
                <div className="absolute inset-0 translate-x-[-150%] group-hover/card:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Watermark Icon */}
              <Zap 
                className="absolute -top-6 -right-6 w-36 h-36 opacity-[0.05] group-hover/card:opacity-[0.12] transition-opacity duration-500 stroke-[1.2] text-emerald-400 pointer-events-none select-none" 
              />

              {/* Colored Micro Dot Matrix */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-[45px] opacity-30 bg-emerald-500/30" />
                <div 
                  className="absolute inset-0 opacity-20 group-hover/card:opacity-45 transition-opacity duration-500"
                  style={{
                    backgroundImage: "radial-gradient(#10b981 1.5px, transparent 1.5px)",
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>

              <div className="relative z-10">
                {/* Top Row: Squircle Icon + Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-13 h-13 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 shadow-xl bg-[#0b0c12] border border-white/10 group-hover/card:rotate-6 group-hover/card:scale-105 shrink-0">
                    <div 
                      className="absolute inset-[-100%] animate-spin-smooth opacity-80"
                      style={{
                        background: "conic-gradient(from 0deg, transparent 0%, #10b981 30%, transparent 60%)",
                      }}
                    />
                    <div className="absolute inset-[1.5px] rounded-[14.5px] bg-[#0b0c12] z-0" />
                    <Zap className="w-6 h-6 text-emerald-400 relative z-10" strokeWidth={2} />
                  </div>

                  <div className="px-3 py-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider shrink-0">
                    Free Forever
                  </div>
                </div>

                {/* Plan Header & Price */}
                <div className="mb-5">
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Start Free
                  </h3>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span 
                      className="text-3xl sm:text-4xl font-black text-white tracking-tight"
                      suppressHydrationWarning
                    >
                      {freePrice}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 uppercase">
                      / forever
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">
                    No credit card required • Instant access
                  </p>
                </div>

                {/* Exactly 6 Checklist Items (Matches Pro card height down to the pixel) */}
                <div className="space-y-3 mb-6 pt-4 border-t border-white/[0.08]">
                  {FREE_FEATURES.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white leading-tight">
                          {feat.title}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                          {feat.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Luxury Pill Action Button (Matching Screenshot 2 Style) */}
              <div className="relative z-10 mt-auto pt-3 border-t border-white/[0.08]">
                <LuxuryButton
                  href="/tools"
                  title="Start creating free"
                  subtitle="Free access • No card required"
                  theme="emerald"
                  icon={<Zap size={17} className="text-emerald-300" />}
                  size="sm"
                />
              </div>

            </div>

            {/* 2. PRO TIER CARD (Purple / Amber Theme) */}
            <div className="group/card relative p-6 sm:p-7.5 rounded-[2rem] flex flex-col transition-all duration-500 transform-gpu hover:scale-[1.015] bg-gradient-to-b from-[#140a1f]/95 via-[#0b0512]/95 to-[#050208]/95 border-2 border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.3)] hover:border-purple-300 hover:shadow-[0_0_55px_rgba(168,85,247,0.55)] overflow-hidden">
              
              {/* Card Hover Shine Sweep */}
              <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10">
                <div className="absolute inset-0 translate-x-[-150%] group-hover/card:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Watermark Icon */}
              <Crown 
                className="absolute -top-6 -right-6 w-36 h-36 opacity-[0.06] group-hover/card:opacity-[0.14] transition-opacity duration-500 stroke-[1.2] text-amber-400 pointer-events-none select-none" 
              />

              {/* Colored Micro Dot Matrix */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-[45px] opacity-30 bg-purple-500/30" />
                <div 
                  className="absolute inset-0 opacity-20 group-hover/card:opacity-45 transition-opacity duration-500"
                  style={{
                    backgroundImage: "radial-gradient(#a855f7 1.5px, transparent 1.5px)",
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>

              <div className="relative z-10">
                {/* Top Row: Squircle Icon + Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-13 h-13 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 shadow-xl bg-[#0b0c12] border border-white/10 group-hover/card:rotate-6 group-hover/card:scale-105 shrink-0">
                    <div 
                      className="absolute inset-[-100%] animate-spin-smooth opacity-80"
                      style={{
                        background: "conic-gradient(from 0deg, transparent 0%, #f59e0b 30%, transparent 60%)",
                      }}
                    />
                    <div className="absolute inset-[1.5px] rounded-[14.5px] bg-[#0b0c12] z-0" />
                    <Crown className="w-6 h-6 text-amber-400 relative z-10" strokeWidth={2} />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {promoActive && (
                      <div className="px-2.5 py-1 rounded-full border border-amber-400/50 bg-amber-400/15 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        20% OFF
                      </div>
                    )}
                    <div className="px-3 py-1 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-400/15 via-purple-400/15 to-pink-400/15 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                      <Flame className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      <span>Power Users</span>
                    </div>
                  </div>
                </div>

                {/* Plan Header & Price */}
                <div className="mb-5">
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Exismic Pro
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    {promoActive && (
                      <span className="text-xl sm:text-2xl font-bold text-zinc-500 line-through">
                        {regularProPrice}
                      </span>
                    )}
                    <span 
                      className="text-3xl sm:text-4xl font-black text-white tracking-tight"
                      suppressHydrationWarning
                    >
                      {proPrice}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 uppercase">
                      / month
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">
                    {promoActive
                      ? "Exismic 1.7 Special • Limited 1-week launch pricing"
                      : "Simple monthly subscription • Cancel anytime in 1 click"}
                  </p>
                </div>

                {/* Exactly 6 Checklist Items (Matches Free card height down to the pixel) */}
                <div className="space-y-3 mb-6 pt-4 border-t border-white/[0.08]">
                  {PRO_FEATURES.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-purple-400/15 border border-purple-400/30 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white leading-tight">
                          {feat.title}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                          {feat.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Luxury Pill Action Button with Authentic Pro Icon "P" (Matching Screenshot 2 Style) */}
              <div className="relative z-10 mt-auto pt-3 border-t border-white/[0.08]">
                <LuxuryButton
                  href={isIndia ? "/pro?market=IN" : "/pro?market=GLOBAL"}
                  title="Get Exismic Pro"
                  subtitle={promoActive ? "20% OFF launch deal • 500 daily credits" : "500 daily credits • All bundles"}
                  theme="purple"
                  icon={<ExismicMark size={22} letter="P" theme="purple" animated={true} />}
                  size="sm"
                />
              </div>

            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
