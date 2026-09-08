"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Coins, 
  Flame, 
  ShieldCheck, 
  AlertTriangle, 
  Crown, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Eye,
  Palette,
  Zap, 
  Ticket, 
  Gift, 
  FileText,
  Lock,
  ArrowUpRight,
  RotateCcw,
  HelpCircle,
  ChevronDown,
  Info
} from "lucide-react";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { SparkIcon } from "@/components/ui/SparkIcon";
import { cn } from "@/lib/utils";

// Side-by-side comparison dataset with 100% human, plain English
const COMPARISON_ROWS = [
  {
    feature: "Main Purpose",
    credits: "Used to run creative tools, generate AI art, edit video, and convert files.",
    sparks: "Used to unlock profile cosmetics, streak freeze shields, and store coupons.",
    creditsHighlight: "Creation Fuel",
    sparksHighlight: "Creator Rewards",
  },
  {
    feature: "How to Get Them",
    credits: "Given free every 24 hours (50 on Free, 500 on Pro), or purchased in credit packs.",
    sparks: "Earned 100% free by completing daily quests, weekly goals, and special occasion bonus drops.",
    creditsHighlight: "Daily Refills & Shop",
    sparksHighlight: "100% Free Activity",
  },
  {
    feature: "Can You Buy with Real Money?",
    credits: "Yes. You can top up extra credits anytime from the Shop.",
    sparks: "No, never. Sparks can only be earned by being active. They are never sold for cash.",
    creditsHighlight: "Yes (Optional)",
    sparksHighlight: "Never Sold",
  },
  {
    feature: "Do They Expire?",
    credits: "Daily free credits refill every 24 hours (do not roll over). Purchased credits stay forever.",
    sparks: "Never expire. Your Sparks remain in your account forever until you spend them.",
    creditsHighlight: "24h Refill / Vault Forever",
    sparksHighlight: "Never Expire",
  },
  {
    feature: "Can You Get a Refund After Spending?",
    credits: "No. Once spent on running a tool, credits cannot be refunded.",
    sparks: "No. Every Sparks redemption is strictly final and non-refundable under any circumstance.",
    creditsHighlight: "Non-Refundable",
    sparksHighlight: "Strictly Final",
  },
  {
    feature: "What if a Tool Errors or Crashes?",
    credits: "Protected! If a tool runs into an error or fails to create your file, credits are refunded instantly.",
    sparks: "Not applicable. Sparks are spent instantly to unlock cosmetics and vouchers in the shop.",
    creditsHighlight: "Auto-Refunded on Error",
    sparksHighlight: "Instant Delivery",
  },
  {
    feature: "Can They Be Turned into Cash?",
    credits: "No. Credits are internal digital points with no bank or cash withdrawal value.",
    sparks: "No. Sparks have no cash value, but you can trade them for store discount coupons.",
    creditsHighlight: "No Cash Value",
    sparksHighlight: "Discounts Only",
  },
];

const FAQ_ITEMS = [
  {
    q: "What is the difference between daily free credits and purchased credits?",
    a: "Every 24 hours, you receive a fresh daily allowance (50 free credits, or 500 for Pro members). When you use tools, your daily free credits are always consumed first. If you purchase additional credit packs from our Shop, those credits go into your permanent vault and never expire. They are only touched after your daily free credits reach zero."
  },
  {
    q: "Why can't I buy Sparks with real money?",
    a: "Exismic Sparks are designed strictly as an achievement and loyalty reward for genuine creators. We want profile cosmetics, badges, and discount vouchers to represent your real time, creativity, and daily activity on the platform—not who has the biggest wallet."
  },
  {
    q: "Can I get a refund if I accidentally bought the wrong item with Sparks?",
    a: "No. All Sparks transactions are 100% permanent and non-refundable under any circumstance. We show a clear confirmation screen before you spend your Sparks so you can review your choice. Once confirmed, items cannot be returned, exchanged, or reversed."
  },
  {
    q: "Can I get a refund if I spend credits on an AI tool and dislike the output?",
    a: "No. Credits pay for the server resources required to process your request. As long as the tool completes successfully, spent credits cannot be refunded. However, if a tool experiences a technical failure or error and does not produce your result, our system automatically refunds your credits back to your balance immediately."
  },
  {
    q: "How do Streak Freeze Shields work?",
    a: "Streak Freeze Shields are items you can purchase in the Sparks Shop. If you miss a day of logging in, an equipped Streak Freeze automatically protects your daily streak counter from resetting to zero. Once used to save your streak, that shield is consumed."
  },
  {
    q: "Can I transfer Credits or Sparks to another person or account?",
    a: "No. Both Credits and Sparks are permanently linked to your individual Exismic account. They cannot be transferred, gifted, traded, or sold between accounts."
  }
];

export default function CurrencyGuidePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#030308] text-white selection:bg-amber-500/30 selection:text-amber-200 pb-36 relative overflow-hidden font-sans">
      {/* Background Atmosphere VFX */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.28, 0.15]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 right-1/4 w-[650px] h-[650px] bg-amber-500/20 blur-[170px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.25, 1],
            opacity: [0.12, 0.25, 0.12]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-cyan-600/18 blur-[170px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-600/15 blur-[170px] rounded-full" 
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-14 sm:space-y-18 relative z-10">
        {/* Breadcrumb Navigation */}
        <PageBreadcrumb
          items={[
            { label: "Rewards Shop", href: "/rewards" },
            { label: "Points Guide & Policies" }
          ]}
        />

        {/* Hero Section */}
        <header className="space-y-6 text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 text-amber-200 text-xs font-bold tracking-wide shadow-[0_0_30px_rgba(245,158,11,0.25)] backdrop-blur-xl"
          >
            <SparkIcon size={16} variant="amber" animated />
            <span>Official Currency & Policies Guide</span>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-[1.18] sm:leading-[1.15] pt-1 pb-2 px-4 overflow-visible">
            How Credits & Sparks Work, <br />
            <span className="inline-block py-1 px-2 bg-clip-text text-transparent bg-[linear-gradient(110deg,#ffffff,#fde047,#fbbf24,#f59e0b,#ffffff)] bg-[length:240%_100%] drop-shadow-[0_0_40px_rgba(245,158,11,0.4)] overflow-visible">
              And Our Strict No-Refund Policy
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-normal leading-relaxed max-w-2xl mx-auto">
            A simple, clear explanation of our two point systems, how to get them, how to spend them, and our strict all-sales-final rules — written in plain everyday English.
          </p>
        </header>

        {/* Luxury Navigation Capsule Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-2 rounded-3xl border border-white/[0.1] bg-[#070914]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] max-w-3xl mx-auto">
          {[
            { label: "Side-by-Side Comparison", href: "#compare", icon: Coins, color: "text-amber-300" },
            { label: "Creation Credits", href: "#credits", icon: Zap, color: "text-cyan-300" },
            { label: "Reward Sparks", href: "#sparks", icon: Flame, color: "text-purple-300" },
            { label: "No-Refund Rules", href: "#no-refunds", icon: AlertTriangle, color: "text-rose-400" },
            { label: "Questions & Answers", href: "#faq", icon: HelpCircle, color: "text-emerald-300" },
            { label: "Terms of Service", href: "#legal", icon: FileText, color: "text-zinc-300" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-white/[0.08] hover:border-amber-400/40 bg-white/[0.04] hover:bg-amber-400/10 text-xs font-bold text-zinc-200 hover:text-white transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95 group cursor-pointer"
            >
              <item.icon size={14} className={cn(item.color, "transition-transform group-hover:scale-110")} />
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        {/* SECTION 1: SIDE-BY-SIDE COMPARISON TABLE */}
        <section id="compare" className="space-y-8 scroll-mt-24">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Eye size={13} className="text-amber-400" />
              <span>At A Glance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-normal pt-0.5 pb-1">
              Credits vs. Sparks Comparison
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              We keep them completely separate: Credits are for creating, and Sparks are for rewarding your activity.
            </p>
          </div>

          {/* Luxury Obsidian Table */}
          <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-[#090b17]/95 via-[#060810]/95 to-[#020306]/98 backdrop-blur-3xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Header Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 border-b border-white/10 bg-white/[0.02]">
              <div className="md:col-span-4 p-5 sm:p-6 flex items-center font-bold text-xs uppercase tracking-wider text-zinc-400">
                <span>Features & Rules</span>
              </div>
              <div className="md:col-span-4 p-5 sm:p-6 border-t md:border-t-0 md:border-l border-white/10 bg-cyan-500/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <Coins size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Creation Credits</h3>
                    <span className="text-[11px] font-semibold text-cyan-300">Fuel for Tools & AI</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-[11px] font-bold">
                  cr
                </span>
              </div>
              <div className="md:col-span-4 p-5 sm:p-6 border-t md:border-t-0 md:border-l border-white/10 bg-amber-500/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-amber-400/40 bg-amber-500/20 text-amber-300 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <SparkIcon size={20} variant="amber" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Reward Sparks</h3>
                    <span className="text-[11px] font-semibold text-amber-300">Earned From Playing</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 text-[11px] font-bold">
                  ⚡
                </span>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/[0.06]">
              {COMPARISON_ROWS.map((row, idx) => (
                <div 
                  key={row.feature}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-12 transition-colors duration-200 hover:bg-white/[0.02]",
                    idx % 2 === 1 ? "bg-white/[0.01]" : ""
                  )}
                >
                  <div className="md:col-span-4 p-5 sm:p-6 flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0 shadow-[0_0_6px_rgba(245,158,11,1)]" />
                    <div>
                      <span className="font-bold text-sm text-white block">{row.feature}</span>
                    </div>
                  </div>

                  <div className="md:col-span-4 p-5 sm:p-6 md:border-l border-white/10 flex flex-col justify-between space-y-2">
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{row.credits}</p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 text-xs font-bold">
                        <CheckCircle2 size={12} className="text-cyan-400" />
                        <span>{row.creditsHighlight}</span>
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-4 p-5 sm:p-6 md:border-l border-white/10 flex flex-col justify-between space-y-2">
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{row.sparks}</p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-200 text-xs font-bold">
                        <CheckCircle2 size={12} className="text-amber-400" />
                        <span>{row.sparksHighlight}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Footer in Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 p-5 sm:p-6 border-t border-white/10 bg-white/[0.02] gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 font-bold text-xs uppercase tracking-wider transition-all duration-200"
              >
                <Coins size={15} />
                <span>Visit Credit Shop</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/rewards"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 font-bold text-xs uppercase tracking-wider transition-all duration-200"
              >
                <SparkIcon size={15} variant="amber" />
                <span>Visit Sparks Rewards Shop</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW CREATION CREDITS WORK */}
        <section id="credits" className="space-y-8 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Coins size={14} />
              <span>Deep Dive</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-normal pt-0.5 pb-1">
              How Your Credit Balance Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              We use a simple two-pocket system: your daily free credits are always spent first to protect any permanent credits you have saved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Daily Free Credits */}
            <div className="p-7 rounded-3xl border-2 border-cyan-400/40 bg-gradient-to-b from-[#080d1e]/95 to-[#03050d]/98 backdrop-blur-2xl space-y-4 shadow-xl relative overflow-hidden group hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">1. Daily Free Credits</h3>
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Refreshed Every 24 Hours</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Every account receives free creation credits automatically every 24 hours:
                </p>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                    <span className="text-zinc-300 font-medium">Standard Free Account</span>
                    <strong className="text-cyan-300 font-bold">50 Free / 24h</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-between">
                    <span className="text-white font-medium">Pro Pass Member</span>
                    <strong className="text-cyan-200 font-bold">500 Free / 24h</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-zinc-400 mt-4">
                <span className="text-white font-semibold block mb-0.5">Rollover rule:</span>
                Daily free credits do not stack. A fresh batch of 50 or 500 is given every 24 hours.
              </div>
            </div>

            {/* Box 2: Permanent Vault Credits */}
            <div className="p-7 rounded-3xl border-2 border-purple-400/40 bg-gradient-to-b from-[#130b22]/95 to-[#06030c]/98 backdrop-blur-2xl space-y-4 shadow-xl relative overflow-hidden group hover:border-purple-300 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl border border-purple-400/40 bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">2. Permanent Vault Credits</h3>
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Never Expire</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Whenever you purchase a credit pack from the Shop or receive milestone bonuses, those credits go directly into your Permanent Vault.
                </p>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                    <span className="text-zinc-300">Stay in your account forever until you use them</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                    <span className="text-zinc-300">Only consumed after daily free credits hit zero</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-zinc-400 mt-4">
                <span className="text-white font-semibold block mb-0.5">Top-up available:</span>
                Credit packs of all sizes can be purchased at any time in the Shop.
              </div>
            </div>

            {/* Box 3: Automatic Error Protection */}
            <div className="p-7 rounded-3xl border-2 border-emerald-400/40 bg-gradient-to-b from-[#081812]/95 to-[#020906]/98 backdrop-blur-2xl space-y-4 shadow-xl relative overflow-hidden group hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">3. Automatic Error Refund</h3>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">100% Protected</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  You never have to pay for a broken or failed generation. If an AI model or creative tool experiences an error, crash, or timeout:
                </p>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span className="text-zinc-300">Credits are returned to your balance immediately</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span className="text-zinc-300">No support tickets or manual waiting needed</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-zinc-400 mt-4">
                <span className="text-white font-semibold block mb-0.5">Please note:</span>
                If a generation succeeds and creates your file, spent credits are final and cannot be refunded.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW REWARD SPARKS WORK */}
        <section id="sparks" className="space-y-8 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Flame size={14} />
              <span>Creator Rewards</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-normal pt-0.5 pb-1">
              How to Earn and Spend Sparks
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Sparks reward genuine creativity. You earn them completely free by being active, and you can spend them on exclusive rewards in the Sparks Shop.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Earning Box */}
            <div className="p-7 sm:p-8 rounded-[2.5rem] border-2 border-amber-400/50 bg-gradient-to-b from-[#150d06]/95 via-[#0e0904]/95 to-[#040201]/95 backdrop-blur-2xl space-y-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl border-2 border-amber-400/60 bg-amber-500/20 text-amber-300 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Flame size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">3 Ways to Earn Free Sparks</h3>
                  <p className="text-xs text-zinc-400">Earned purely through activity</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-start gap-3.5">
                  <span className="px-3 py-1 rounded-xl border border-amber-400/40 bg-amber-500/20 text-amber-200 font-black text-xs shrink-0">
                    +10 to 25 ⚡
                  </span>
                  <div>
                    <strong className="text-white block font-bold text-sm mb-0.5">Daily Quests</strong>
                    <span className="text-zinc-300">Quick daily actions like creating an image, removing a background, or converting a file.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-start gap-3.5">
                  <span className="px-3 py-1 rounded-xl border border-purple-400/40 bg-purple-500/20 text-purple-200 font-black text-xs shrink-0">
                    +50 to 100 ⚡
                  </span>
                  <div>
                    <strong className="text-white block font-bold text-sm mb-0.5">Weekly Challenges</strong>
                    <span className="text-zinc-300">Bigger goals completed across the week, like using multiple creative tools or processing batch files.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-start gap-3.5">
                  <span className="px-3 py-1 rounded-xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-200 font-black text-xs shrink-0">
                    Bonus Drops
                  </span>
                  <div>
                    <strong className="text-white block font-bold text-sm mb-0.5">Special Occasions & Giveaways</strong>
                    <span className="text-zinc-300">Limited-time drops during special occasions, milestone celebrations, community events, and seasonal giveaways.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spending Box */}
            <div className="p-7 sm:p-8 rounded-[2.5rem] border-2 border-purple-400/50 bg-gradient-to-b from-[#150a24]/95 via-[#0c0516]/95 to-[#040108]/95 backdrop-blur-2xl space-y-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl border-2 border-purple-400/60 bg-purple-500/20 text-purple-300 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <Gift size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">What You Can Get with Sparks</h3>
                  <p className="text-xs text-zinc-400">Available in the Sparks Shop</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl border border-purple-400/40 bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                    <Palette size={18} className="text-purple-300" />
                  </div>
                  <div>
                    <strong className="text-white block font-bold text-sm mb-0.5">Avatar Frames & Glowing Names</strong>
                    <span className="text-zinc-300">Equip animated avatar frames, glowing gradient usernames, and creator insignias visible across all tools.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <strong className="text-white block font-bold text-sm mb-0.5">Streak Freeze Shields</strong>
                    <span className="text-zinc-300">Protect your streak from resetting to zero if you get busy or miss logging in for a day.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <Ticket size={18} />
                  </div>
                  <div>
                    <strong className="text-white block font-bold text-sm mb-0.5">Real Money Store Discount Coupons</strong>
                    <span className="text-zinc-300">Get genuine cash discounts (like $1.50 OFF or 20% OFF Pro Pass) when checking out in the store.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: STRICT NO-REFUND POLICY */}
        <section id="no-refunds" className="space-y-8 scroll-mt-24">
          <div className="relative p-8 sm:p-12 rounded-[3rem] border-2 border-rose-500/80 bg-gradient-to-b from-[#1c080e]/98 via-[#110408]/98 to-[#050103]/98 backdrop-blur-3xl shadow-[0_0_60px_rgba(244,63,94,0.25),0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden space-y-8">
            <div className="pointer-events-none absolute -top-28 -right-28 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl" />

            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-rose-400/50 bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <AlertTriangle size={15} />
                <span>Strict All-Sales-Final Policy</span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-normal pt-0.5 pb-1">
                No Refunds Under Any Circumstance
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-zinc-300 max-w-2xl leading-relaxed">
                Please review this carefully before spending your points. We believe in complete transparency and honest rules with zero hidden fine print.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-white/[0.04] border border-rose-500/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
                    <XCircle size={20} />
                    <span>Spent Sparks are Final</span>
                  </div>
                  <p>
                    Once you confirm the purchase of any avatar frame, name style, insignia, streak shield, voucher, or boost using your Sparks, that purchase is permanent. You cannot return the item, exchange it, or ask for your Sparks back under any circumstance.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block pt-2 border-t border-rose-500/20">
                  100% Non-Reversible
                </span>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-white/[0.04] border border-rose-500/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
                    <XCircle size={20} />
                    <span>Used Credits are Final</span>
                  </div>
                  <p>
                    Credits spent on generating art, editing video, removing backgrounds, or running tools cannot be refunded once the tool has finished running. Real-money credit top-up packs are digital items and cannot be refunded once added to your account balance.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block pt-2 border-t border-rose-500/20">
                  Server Fuel Consumed
                </span>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-white/[0.04] border border-amber-500/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-300 font-bold text-base">
                    <Lock size={20} />
                    <span>No Cash Value</span>
                  </div>
                  <p>
                    Neither Generation Credits nor Exismic Sparks can ever be cashed out for real money, withdrawn to a bank account, or transferred to another person&apos;s account. They are digital points for use exclusively on the Exismic platform.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block pt-2 border-t border-amber-500/20">
                  Digital Platform Only
                </span>
              </div>
            </div>

            {/* Fair Play Warning */}
            <div className="p-6 rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10 shadow-lg">
              <div className="w-12 h-12 rounded-2xl border-2 border-amber-400/50 bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <ShieldCheck size={24} />
              </div>
              <div className="space-y-1 flex-1 text-xs sm:text-sm">
                <strong className="text-white block font-bold text-base">Fair Play & Anti-Abuse Pledge</strong>
                <p className="text-zinc-300 leading-relaxed">
                  Using automated scripts, bots, macro recorders, or multiple fake accounts to farm Sparks or credits is strictly forbidden. Any account caught attempting to abuse our rewards system will be permanently banned immediately, and all earned items will be revoked forever.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="space-y-8 scroll-mt-24">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <HelpCircle size={14} />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-normal pt-0.5 pb-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Clear, straightforward answers about spending points, refunds, and daily allowances.
            </p>
          </div>

          <div className="space-y-3.5 max-w-3xl mx-auto">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={item.q}
                  className="rounded-2xl border border-white/10 bg-[#080a18]/80 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/20"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown 
                      size={18} 
                      className={cn(
                        "shrink-0 text-zinc-400 transition-transform duration-300",
                        isOpen ? "rotate-180 text-amber-400" : ""
                      )} 
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/[0.06]">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 6: LEGAL AGREEMENT LINKS */}
        <section id="legal" className="p-8 sm:p-10 rounded-3xl border-2 border-white/[0.1] bg-gradient-to-r from-[#0a0c1e]/95 via-[#070914]/95 to-[#04050d]/95 backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl scroll-mt-24">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <FileText size={16} />
              <span>Official Policy Protection</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-normal pt-0.5 pb-1">
              Read Our Official Terms of Service
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              These policies are formally protected under Section 6 (Platform Currencies) and Section 7 (Strict All-Sales-Final Policy) of the official Exismic Terms of Service.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <Link
              href="/terms-of-service"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all duration-200 shadow-lg w-full sm:w-auto"
            >
              Read Full Terms <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 w-full sm:w-auto"
            >
              Help & Support
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
