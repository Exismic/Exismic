"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cookie,
  Lock,
  Zap,
  SlidersHorizontal,
  ShieldCheck,
  Check,
  Copy,
  Mail,
  ArrowUpRight,
  EyeOff,
  HelpCircle,
  Database,
  Calendar,
  Sparkles as _ForbiddenSparkles
} from "lucide-react";
import Link from "next/link";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { openCookiePreferences } from "@/lib/cookie-consent";

interface CookieType {
  title: string;
  badge: string;
  badgeColor: string;
  dotColor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  iconBg: string;
  description: string;
  examples: string;
}

interface CookieItem {
  name: string;
  provider: string;
  type: string;
  typeColor: string;
  duration: string;
  purpose: string;
}

const COOKIE_TYPES: CookieType[] = [
  {
    title: "Essential Cookies",
    badge: "Always Active",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dotColor: "bg-emerald-400",
    icon: Lock,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/25",
    description: "Strictly necessary for Exismic to work. They keep you signed in securely, verify payments, and prevent account fraud.",
    examples: "Login sessions, security tokens, and payment flow verification."
  },
  {
    title: "Speed & Performance",
    badge: "Optional",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    dotColor: "bg-cyan-400",
    icon: Zap,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10 border-cyan-500/25",
    description: "Helps us detect slow-loading tools, error crashes, and page hiccups anonymously so we can keep tools running fast.",
    examples: "Page load speed diagnostics and anonymous error reporting."
  },
  {
    title: "Workspace Settings",
    badge: "Optional",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    dotColor: "bg-amber-400",
    icon: SlidersHorizontal,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/25",
    description: "Remembers your studio preferences so you do not have to reset them every time you return to Exismic.",
    examples: "Theme choice, volume settings, and student study mode."
  }
];

const COOKIE_INVENTORY: CookieItem[] = [
  {
    name: "exismic_cookie_consent",
    provider: "Exismic Studio",
    type: "Essential",
    typeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    duration: "180 Days",
    purpose: "Remembers your privacy and cookie preferences on this browser so you are not asked on every page."
  },
  {
    name: "sb-*-auth-token",
    provider: "Supabase Cloud",
    type: "Essential",
    typeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    duration: "While Logged In",
    purpose: "Maintains your secure login session while you switch tools and edit files."
  },
  {
    name: "_clck",
    provider: "Microsoft Clarity",
    type: "Performance",
    typeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    duration: "1 Year",
    purpose: "Anonymously checks how quickly tool interfaces load and pinpoints page bottlenecks without collecting personal identity."
  },
  {
    name: "_clsk",
    provider: "Microsoft Clarity",
    type: "Performance",
    typeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    duration: "1 Day",
    purpose: "Connects views within a single visit to detect if a specific tool crashes or lags."
  }
];

const FAQS = [
  {
    question: "Do you track me across other websites or sell my data?",
    answer: "No, never. We do not use third-party advertising cookies, pixel beacons, or tracking networks. We never sell or rent your browsing activity."
  },
  {
    question: "How long do cookies stay on my browser?",
    answer: "Essential login cookies refresh while you use the site. Your cookie consent choice is remembered for 180 days so you don't get interrupted."
  },
  {
    question: "Can I use Exismic if I turn off optional cookies?",
    answer: "Yes, completely! All creative tools, AI generation, file conversions, and account features will continue working normally."
  },
  {
    question: "How can I change my cookie choices later?",
    answer: "You can click 'Manage Preferences' on this page anytime, or clear cookies directly in your web browser settings."
  }
];

export default function CookiesPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("privacy@exismic.xyz");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 pb-28 relative overflow-hidden">
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 35, -25, 0],
            y: [0, -30, 25, 0],
            scale: [1, 1.15, 0.95, 1],
            opacity: [0.1, 0.2, 0.12, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 left-1/4 w-[520px] h-[520px] bg-amber-500/15 blur-[140px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -35, 25, 0],
            y: [0, 30, -25, 0],
            scale: [1, 1.15, 1, 1],
            opacity: [0.08, 0.16, 0.1, 0.08]
          }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 -right-20 w-[460px] h-[460px] bg-cyan-500/15 blur-[120px] rounded-full"
        />
        <div className="absolute top-0 left-0 w-full h-[320px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.1)_0%,rgba(6,182,212,0.04)_40%,transparent_70%)]" />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-7 relative z-10">
        {/* Breadcrumb */}
        <PageBreadcrumb items={[{ label: "Cookie Policy" }]} />

        {/* Hero Header: Compact, Sleek & Modern */}
        <header className="space-y-3 pt-1">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-[11px] font-semibold text-zinc-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>Cookie &amp; Storage Transparency</span>
            <span className="text-zinc-600">•</span>
            <span className="text-amber-400 font-bold">Updated September 2026</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit tracking-tight text-white leading-tight"
          >
            Cookie{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-cyan-400">
              Policy
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-zinc-400 text-sm sm:text-base max-w-2xl font-normal leading-relaxed"
          >
            How Exismic uses cookies to keep you signed in, remember your preferences, and keep tools fast — with zero ad trackers.
          </motion.p>
        </header>

        {/* Preference Control Banner (Interactive Launchpad) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#101422]/95 to-[#080a14]/95 border border-amber-500/25 hover:border-amber-500/40 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 relative overflow-hidden group"
        >
          {/* Subtle top ambient glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0">
              <Cookie size={20} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-outfit text-white tracking-tight">
                Your Privacy Choices
              </h2>
              <p className="text-xs text-zinc-400 max-w-md font-normal leading-relaxed">
                Essential cookies stay active for account safety. You can enable or disable optional analytics anytime.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCookiePreferences}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-zinc-950 hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer shrink-0 relative z-10"
          >
            <SlidersHorizontal size={14} />
            <span>Manage Preferences</span>
          </button>
        </motion.section>

        {/* 3 Cookie Categories: 3-Column Bento */}
        <section className="space-y-3 pt-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
            How We Categorize Storage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COOKIE_TYPES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-5 rounded-2xl bg-gradient-to-b from-[#0b0e1b]/95 to-[#060812]/95 border border-white/[0.08] hover:border-amber-500/35 transition-all duration-300 backdrop-blur-xl shadow-lg flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-110 ${cat.iconBg} ${cat.iconColor}`}>
                        <Icon size={16} />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.badgeColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.dotColor} animate-pulse`} />
                        <span>{cat.badge}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold font-outfit text-white group-hover:text-amber-100 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">
                      Typical Use:
                    </span>
                    <p className="text-[11px] text-zinc-300 font-normal">
                      {cat.examples}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Transparent Cookie Inventory (Structured 2-Column Cards) */}
        <section className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
            Exact Cookies Used On Exismic
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COOKIE_INVENTORY.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#0b0f1e]/95 to-[#060812]/95 border border-white/[0.08] hover:border-amber-500/30 transition-all duration-300 backdrop-blur-xl shadow-lg space-y-2.5 group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
                  <span className="font-mono text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                    {item.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.typeColor}`}>
                    {item.type}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {item.purpose}
                </p>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/[0.04]">
                  <span>Provider: <strong className="text-zinc-400 font-semibold">{item.provider}</strong></span>
                  <span>Duration: <strong className="text-zinc-400 font-semibold">{item.duration}</strong></span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Plain English Cookie Q&A */}
        <section className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.015] hover:bg-white/[0.035] border border-white/[0.04] hover:border-amber-500/20 transition-all duration-200 space-y-1.5"
              >
                <h3 className="text-xs sm:text-sm font-semibold text-white flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal pl-3.5">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Category-Reactive Cyber Laser Horizon Divider (Amber Accent) */}
        <div className="relative w-full max-w-3xl mx-auto my-12 pointer-events-none">
          <div className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent blur-sm animate-pulse" />
          <div className="relative h-[1px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_15px_#f59e0b]" />
        </div>

        {/* Privacy & Cookie Support Card */}
        <section className="rounded-2xl bg-gradient-to-b from-[#0a0d1b]/95 to-[#060812]/95 border border-white/[0.08] hover:border-amber-500/30 p-5 sm:p-7 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl transition-all duration-300">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <ShieldCheck size={14} />
              <span>Privacy Desk</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-outfit text-white">
              Questions about our cookies?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md font-normal">
              Our privacy team is available to assist you with any questions regarding stored cookies, analytics, or session data.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/[0.05] hover:bg-white/[0.09] text-zinc-300 hover:text-white border border-white/[0.08] transition-all cursor-pointer"
            >
              {copiedEmail ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied Email!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Email</span>
                </>
              )}
            </button>

            <a
              href="mailto:privacy@exismic.xyz"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-zinc-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
            >
              <Mail size={13} />
              <span>Contact Privacy Team</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
