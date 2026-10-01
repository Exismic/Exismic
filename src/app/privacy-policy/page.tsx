"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  UserCheck,
  Cookie,
  Server,
  Users,
  RefreshCcw,
  Mail,
  Copy,
  Check,
  ArrowUpRight,
  Trash2,
  Calendar,
  Sparkles as _ForbiddenSparkles
} from "lucide-react";
import Link from "next/link";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";

interface PolicySection {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
  badgeColor: string;
  dotColor: string;
  content: string[];
}

const GUARANTEES = [
  {
    icon: EyeOff,
    title: "Zero AI Training",
    description: "Your uploads and creations are never used to train public AI models.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/25",
    glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]"
  },
  {
    icon: Lock,
    title: "Never Sold",
    description: "We never sell, rent, or trade your personal data to advertisers.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/25",
    glow: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
  },
  {
    icon: Trash2,
    title: "Auto-Deleted in 1 Hour",
    description: "Temporary files uploaded to tools are automatically purged from servers.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/25",
    glow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]"
  },
  {
    icon: ShieldCheck,
    title: "7-Day Safety Period",
    description: "Easily restore your account within 7 days if deleted by mistake.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/25",
    glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
  }
];

const SECTIONS: PolicySection[] = [
  {
    id: "collection",
    title: "What Information We Collect",
    icon: Database,
    badge: "Minimal Data",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    dotColor: "bg-purple-400",
    content: [
      "We collect only what is strictly necessary to run your account and power your tools.",
      "This includes your email address, basic profile details, and the text or files you choose to upload for editing.",
      "Basic technical details (like browser type and screen dimensions) are logged automatically to prevent fraud and ensure tools load quickly."
    ]
  },
  {
    id: "ai-privacy",
    title: "Zero AI Training Guarantee",
    icon: EyeOff,
    badge: "100% Private",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dotColor: "bg-emerald-400",
    content: [
      "Your uploads, personal documents, and generated creations are NEVER sold, rented, or shared.",
      "We strictly guarantee that your files and creative prompts are never used to train, retrain, or improve public AI models.",
      "Everything you create on Exismic belongs entirely to you."
    ]
  },
  {
    id: "file-storage",
    title: "File Cleanup & Encryption",
    icon: Lock,
    badge: "Auto-Deleted",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    dotColor: "bg-cyan-400",
    content: [
      "All file transfers and stored records are protected with bank-grade encryption.",
      "Temporary files uploaded for processing (like images for background removal or audio for voice isolation) are automatically erased within 1 hour after your session ends.",
      "Creations saved to your Cloud Vault remain safely stored until you choose to delete them."
    ]
  },
  {
    id: "your-rights",
    title: "Your Rights & 7-Day Safety Period",
    icon: UserCheck,
    badge: "Full Ownership",
    badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    dotColor: "bg-blue-400",
    content: [
      "You have full ownership of your data. You can download a copy of your files or delete your account at any time.",
      "When you delete your account, we place it in a 7-day safety period to protect against accidental loss. You can restore it simply by signing back in within 7 days.",
      "After 7 days, your account, saved creations, and personal details are permanently erased."
    ]
  },
  {
    id: "payments-partners",
    title: "Secure Payments & Cloud Partners",
    icon: Server,
    badge: "Safe Providers",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    dotColor: "bg-amber-400",
    content: [
      "Exismic NEVER sees, collects, or stores your credit card number or bank passwords.",
      "All membership payments and credit purchases are handled directly by certified payment processors (PayPal and Razorpay) using bank-level security.",
      "Our website and databases are hosted on trusted cloud infrastructure (AWS, Supabase, and Vercel) under strict confidentiality terms."
    ]
  },
  {
    id: "cookies",
    title: "Cookies & Login Sessions",
    icon: Cookie,
    badge: "No Ad Trackers",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    dotColor: "bg-indigo-400",
    content: [
      "We use essential cookies strictly needed to keep you safely signed in and remember your workspace settings.",
      "We never use invasive cross-site ad trackers or sell your browsing history to third-party advertisers.",
      "You can manage or clear cookies anytime in your web browser settings."
    ]
  },
  {
    id: "age-requirement",
    title: "Age Requirement (13+ Only)",
    icon: Users,
    badge: "Child Safety",
    badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    dotColor: "bg-teal-400",
    content: [
      "Exismic is built for creators, students, and professionals who are at least 13 years old.",
      "In compliance with global child safety standards, all users must confirm they are at least 13 when creating an account.",
      "We do not knowingly collect personal details from children under 13."
    ]
  },
  {
    id: "policy-updates",
    title: "Policy Updates & Legal Contact",
    icon: RefreshCcw,
    badge: "Clear Notice",
    badgeColor: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
    dotColor: "bg-zinc-400",
    content: [
      "If we make meaningful updates to this policy, we will notify you through an email or a clear alert on the platform before changes take effect.",
      "For copyright questions, formal takedown requests, or legal matters, email our team directly at legal@exismic.xyz."
    ]
  }
];

export default function PrivacyPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("privacy@exismic.xyz");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 pb-28 relative overflow-hidden">
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.15, 0.95, 1],
            opacity: [0.12, 0.22, 0.15, 0.12]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 left-1/4 w-[520px] h-[520px] bg-purple-600/20 blur-[140px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 35, -25, 0],
            scale: [1, 1.2, 1, 1],
            opacity: [0.08, 0.18, 0.12, 0.08]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 -right-24 w-[480px] h-[480px] bg-cyan-500/20 blur-[130px] rounded-full"
        />
        <div className="absolute top-0 left-0 w-full h-[340px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.1)_0%,rgba(6,182,212,0.04)_45%,transparent_70%)]" />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-7 relative z-10">
        {/* Breadcrumb */}
        <PageBreadcrumb items={[{ label: "Privacy Policy" }]} />

        {/* Hero Header: Compact, Sleek & Animated */}
        <header className="space-y-3 pt-1">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-[11px] font-semibold text-zinc-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Privacy &amp; Data Safety</span>
            <span className="text-zinc-600">•</span>
            <span className="text-cyan-400 font-bold">Updated August 2026</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit tracking-tight text-white leading-tight"
          >
            Privacy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
              Policy
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-zinc-400 text-sm sm:text-base max-w-2xl font-normal leading-relaxed"
          >
            How we protect your data, respect your privacy, and keep your creations safe — written in simple everyday English.
          </motion.p>
        </header>

        {/* 4 Core Guarantees: Animated Bento Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GUARANTEES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + idx * 0.05 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`p-4 rounded-xl bg-gradient-to-b from-[#0b0e1b]/95 to-[#070912]/95 border border-white/[0.08] hover:border-cyan-500/35 transition-all duration-300 backdrop-blur-md flex flex-col justify-between space-y-2.5 group cursor-default shadow-lg ${item.glow}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-110 ${item.bg} ${item.color}`}>
                    <Icon size={16} />
                  </div>
                  <h3 className="text-xs font-bold font-outfit text-white group-hover:text-cyan-200 transition-colors">
                    {item.title}
                  </h3>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </section>

        {/* Quick Jump Navigation with smooth wrap */}
        <section className="space-y-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-white/[0.06]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 shrink-0 mr-1 hidden sm:inline">
              Jump to:
            </span>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border border-white/5 hover:border-white/15 transition-all cursor-pointer"
              >
                {sec.title}
              </button>
            ))}
          </div>
        </section>

        {/* Policy Sections: Animated Obsidian Cards with Micro-Check Strips */}
        <section className="space-y-4 pt-1">
          {SECTIONS.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.article
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: Math.min(idx * 0.04, 0.25) }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="scroll-mt-24 rounded-2xl bg-gradient-to-b from-[#0b0f1d]/95 to-[#060812]/95 border border-white/[0.08] hover:border-cyan-500/35 transition-all duration-300 p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative group overflow-hidden"
              >
                {/* Subtle top ambient flare on hover */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/0 to-transparent group-hover:via-cyan-400/40 transition-all duration-500" />

                {/* Card Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06] relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/15 via-purple-500/10 to-transparent border border-cyan-500/25 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:scale-110 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_22px_rgba(6,182,212,0.35)] transition-all duration-300 shrink-0">
                      <Icon size={17} />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold font-outfit text-white tracking-tight group-hover:text-cyan-100 transition-colors">
                      {section.title}
                    </h2>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-sm shrink-0 ${section.badgeColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${section.dotColor} animate-pulse`} />
                    <span>{section.badge}</span>
                  </span>
                </div>

                {/* Structured Interactive Strips (Replacing Plain Bullets) */}
                <div className="grid gap-2 pt-3.5 relative z-10">
                  {section.content.map((point, pIdx) => (
                    <motion.div
                      key={pIdx}
                      whileHover={{ x: 4, transition: { duration: 0.15 } }}
                      className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-white/[0.015] hover:bg-white/[0.04] border border-white/[0.03] hover:border-cyan-500/25 transition-all duration-200 group/point"
                    >
                      <div className="mt-0.5 w-5 h-5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover/point:bg-cyan-500/20 group-hover/point:border-cyan-500/40 transition-all shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                        <Check size={11} className="text-cyan-400 group-hover/point:text-cyan-300" />
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-300 group-hover/point:text-white leading-relaxed font-normal flex-1">
                        {point}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </section>

        {/* Category-Reactive Cyber Laser Horizon Divider */}
        <div className="relative w-full max-w-3xl mx-auto my-12 pointer-events-none">
          <div className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-sm animate-pulse" />
          <div className="relative h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_15px_#00ffff]" />
        </div>

        {/* Privacy Contact Card */}
        <section className="rounded-2xl bg-gradient-to-b from-[#0a0d1b]/95 to-[#060812]/95 border border-white/[0.08] hover:border-cyan-500/30 p-5 sm:p-7 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl transition-all duration-300">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <ShieldCheck size={14} />
              <span>Privacy Team</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Have questions about your privacy?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md font-normal">
              Our team is available to assist you with any data protection, account deletion, or privacy inquiries.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <motion.button
              whileTap={{ scale: 0.96 }}
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
            </motion.button>

            <motion.a
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              href="mailto:privacy@exismic.xyz"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <Mail size={13} />
              <span>Email Privacy Team</span>
              <ArrowUpRight size={13} />
            </motion.a>
          </div>
        </section>
      </main>
    </div>
  );
}
