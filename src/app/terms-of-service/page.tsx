"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  UserCheck,
  ShieldCheck,
  FileCheck,
  CreditCard,
  Coins,
  RefreshCcw,
  Lock,
  HelpCircle,
  Check,
  Copy,
  Mail,
  ArrowUpRight,
  Sparkles as _ForbiddenSparkles
} from "lucide-react";
import Link from "next/link";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";

interface TermSection {
  id: string;
  number: string;
  title: string;
  summary: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  clauses: {
    heading: string;
    text: string;
  }[];
  link?: {
    text: string;
    url: string;
  };
}

const GUARANTEES = [
  {
    icon: FileCheck,
    title: "100% Commercial Rights",
    description: "You own everything you create. Sell, monetize, or publish anywhere.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20"
  },
  {
    icon: CreditCard,
    title: "Cancel Pro Anytime",
    description: "One-tap cancellation in settings with zero hidden fees.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20"
  },
  {
    icon: Lock,
    title: "7-Day Account Safety",
    description: "Automatic safety period to restore your account if deleted by mistake.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20"
  }
];

const SECTIONS: TermSection[] = [
  {
    id: "eligibility",
    number: "01",
    title: "Who Can Use Exismic",
    summary: "You must be at least 13 years old to use Exismic. By creating an account, you agree to these fair terms.",
    icon: UserCheck,
    clauses: [
      {
        heading: "Age Requirement",
        text: "You must be at least 13 years old to register an account or use our creative tools. Users in regions requiring adult consent for purchases must be 18 or have guardian permission."
      },
      {
        heading: "Simple Agreement",
        text: "Using our website or creating an account means you agree to these terms. If you disagree, you should not access the platform."
      },
      {
        heading: "Accurate Information",
        text: "Please provide a valid email address so we can securely restore your account, send receipts, and notify you of important updates."
      }
    ]
  },
  {
    id: "conduct",
    number: "02",
    title: "Fair Use & Community Rules",
    summary: "Use Exismic creatively and respectfully. Do not attempt to harm the platform, break laws, or exploit systems.",
    icon: ShieldCheck,
    clauses: [
      {
        heading: "Safe & Legal Creation",
        text: "You may not use our tools to create illegal material, generate hateful or abusive content, or harass other individuals."
      },
      {
        heading: "Platform Protection",
        text: "You agree not to deploy automated scraping bots, attack platform infrastructure, reverse-engineer tools, or attempt to bypass security protections."
      },
      {
        heading: "Fair Resource Use",
        text: "Tools and daily free credits are intended for genuine creators. Scripted farming or manipulating free credit refills is prohibited."
      }
    ]
  },
  {
    id: "ownership",
    number: "03",
    title: "Your Content & Commercial Rights",
    summary: "You own 100% of what you create. You have full commercial rights to sell or publish your outputs.",
    icon: FileCheck,
    clauses: [
      {
        heading: "Full Commercial Ownership",
        text: "Everything you generate, edit, or produce through your Exismic account belongs completely to you. You are free to sell, monetize, and distribute your work anywhere."
      },
      {
        heading: "Your Uploaded Assets",
        text: "We claim zero ownership over the photos, audio, documents, and videos you upload. Your files remain strictly yours."
      },
      {
        heading: "Exismic Platform Code",
        text: "Exismic owns the website software, platform interface, logos, tool designs, and original code that powers the studio."
      }
    ]
  },
  {
    id: "subscriptions",
    number: "04",
    title: "Pro Subscriptions & Billing",
    summary: "Transparent recurring subscriptions with 1-click cancellation anytime in your account settings.",
    icon: CreditCard,
    clauses: [
      {
        heading: "Upfront & Clear Pricing",
        text: "Exismic Pro is billed in advance on a monthly or yearly cycle. There are never any surprise charges or hidden maintenance fees."
      },
      {
        heading: "Cancel Anytime with 1 Click",
        text: "You can cancel your subscription at any moment directly from your profile settings. You keep full Pro benefits until your paid billing period ends."
      },
      {
        heading: "Bank-Level Payment Security",
        text: "All payments are processed securely by certified providers (PayPal and Razorpay). Exismic never sees or stores your credit card number or bank credentials."
      }
    ]
  },
  {
    id: "economy",
    number: "05",
    title: "Credits & Sparks Economy",
    summary: "How Generation Credits and promotional Exismic Sparks work across the studio.",
    icon: Coins,
    clauses: [
      {
        heading: "Generation Credits",
        text: "Credits are digital units used to process tools and generate media. Free accounts receive a daily allowance that refills every 24 hours. Purchased credit packs stay in your reserve and never expire."
      },
      {
        heading: "Exismic Sparks Rewards",
        text: "Sparks are reward points earned by completing daily quests and streak milestones. You can spend them in the shop to unlock avatar frames, name styles, streak shields, and discount vouchers."
      },
      {
        heading: "Non-Transferable & No Cash Value",
        text: "Sparks and credits are promotional platform perks. They have no real cash value, cannot be redeemed for fiat currency, and cannot be transferred between accounts."
      }
    ]
  },
  {
    id: "refunds",
    number: "06",
    title: "Refunds & Final Purchase Terms",
    summary: "Fair refund protections for unused memberships and final sales on consumed digital credits.",
    icon: RefreshCcw,
    clauses: [
      {
        heading: "14-Day Statutory Right",
        text: "In accordance with consumer protection standards (such as EU/UK regulations), you have a 14-day right of withdrawal from new subscription activations if no benefits have been consumed."
      },
      {
        heading: "Spent Credits Are Final",
        text: "Once credits or sparks are spent to process a tool or unlock a cosmetic perk, the action is irreversible and cannot be refunded or replaced."
      }
    ],
    link: {
      text: "Read Full Refund Policy",
      url: "/refund-policy"
    }
  },
  {
    id: "safety",
    number: "07",
    title: "Account Safety & 7-Day Recovery",
    summary: "We protect against accidental account loss and enforce fair community safety rules.",
    icon: Lock,
    clauses: [
      {
        heading: "7-Day Safety Grace Period",
        text: "If you request account deletion, we hold your account in a 7-day safety period. You can restore your account anytime simply by logging back in within 7 days."
      },
      {
        heading: "Rules Enforcement",
        text: "Accounts that violate community rules, deploy malicious bots, or exploit payment systems may be suspended to protect all other creators."
      }
    ]
  },
  {
    id: "service",
    number: "08",
    title: "Service Reliability & Updates",
    summary: "We continuously improve Exismic and keep you informed before major terms changes.",
    icon: HelpCircle,
    clauses: [
      {
        heading: "Continuous Improvements",
        text: "We work constantly to keep Exismic fast, secure, and reliable. We regularly release new tools, speed boosts, and design polish."
      },
      {
        heading: "Notice of Changes",
        text: "If we make meaningful updates to these terms, we will notify you through email or a clear announcement on the platform before the changes take effect."
      }
    ]
  }
];

export default function TermsPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("legal@exismic.xyz");
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
            scale: [1, 1.14, 0.95, 1],
            opacity: [0.1, 0.2, 0.12, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 right-1/4 w-[520px] h-[520px] bg-purple-600/18 blur-[130px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -35, 25, 0],
            y: [0, 30, -25, 0],
            scale: [1, 1.15, 1, 1],
            opacity: [0.08, 0.16, 0.1, 0.08]
          }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 -left-20 w-[460px] h-[460px] bg-cyan-500/15 blur-[120px] rounded-full"
        />
        <div className="absolute top-0 left-0 w-full h-[320px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.1)_0%,rgba(6,182,212,0.04)_40%,transparent_70%)]" />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-7 relative z-10">
        {/* Breadcrumb */}
        <PageBreadcrumb items={[{ label: "Terms of Service" }]} />

        {/* Hero Header: Compact & Direct */}
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
            <span>Official User Agreement</span>
            <span className="text-zinc-600">•</span>
            <span className="text-cyan-400 font-bold">Updated September 2026</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit tracking-tight text-white leading-tight"
          >
            Terms of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              Service
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-zinc-400 text-sm sm:text-base max-w-2xl font-normal leading-relaxed"
          >
            Simple, fair rules for creating with Exismic — written in plain everyday English with zero legal jargon.
          </motion.p>
        </header>

        {/* 3 Core Guarantees: Full Width Balanced Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GUARANTEES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + idx * 0.05 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="p-4 rounded-xl bg-gradient-to-b from-[#0b0e1b]/95 to-[#070912]/95 border border-white/[0.08] hover:border-purple-500/35 transition-all duration-300 backdrop-blur-md flex flex-col justify-between space-y-2 group shadow-lg"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-110 ${item.bg} ${item.color}`}>
                    <Icon size={16} />
                  </div>
                  <h3 className="text-xs font-bold font-outfit text-white group-hover:text-purple-200 transition-colors">
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
                onClick={() => scrollTo(sec.id)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold font-outfit bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border border-white/5 hover:border-white/15 transition-all cursor-pointer"
              >
                {sec.number} {sec.title}
              </button>
            ))}
          </div>
        </section>

        {/* Balanced 2-Column Grid of Policy Articles (Zero Dead Voids) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {SECTIONS.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.article
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: Math.min(idx * 0.04, 0.25) }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="scroll-mt-24 rounded-2xl bg-gradient-to-b from-[#0b0f1e]/95 to-[#060812]/95 border border-white/[0.08] hover:border-purple-500/35 transition-all duration-300 p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between relative group overflow-hidden"
              >
                {/* Subtle top ambient flare on hover */}
                <div className="absolute -top-12 -right-12 w-44 h-44 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/0 to-transparent group-hover:via-purple-400/40 transition-all duration-500" />

                <div className="space-y-3.5 relative z-10">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/15 via-cyan-500/10 to-transparent border border-purple-500/25 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)] group-hover:scale-110 group-hover:border-purple-400/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all duration-300 shrink-0">
                        <Icon size={17} />
                      </div>
                      <h2 className="text-sm sm:text-base font-bold font-outfit text-white tracking-tight group-hover:text-purple-100 transition-colors">
                        {section.title}
                      </h2>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-[10px] font-black font-outfit text-cyan-300 uppercase tracking-widest shrink-0">
                      {section.number}
                    </span>
                  </div>

                  {/* In Plain English Banner */}
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed font-medium flex items-start gap-2.5">
                    <Scale size={14} className="text-purple-300 shrink-0 mt-0.5" />
                    <p className="flex-1 text-[11px] sm:text-xs">
                      <strong className="text-white">In Plain English:</strong> {section.summary}
                    </p>
                  </div>

                  {/* Clauses Breakdown */}
                  <div className="space-y-2 pt-1">
                    {section.clauses.map((clause, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 sm:p-3 rounded-xl bg-white/[0.015] hover:bg-white/[0.035] border border-white/[0.03] hover:border-purple-500/20 transition-all duration-150 space-y-0.5"
                      >
                        <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span>{clause.heading}</span>
                        </h3>
                        <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed font-normal pl-3">
                          {clause.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Policy Link */}
                {section.link && (
                  <div className="pt-3 border-t border-white/[0.04] mt-3 relative z-10">
                    <Link
                      href={section.link.url}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors group/link"
                    >
                      <span>{section.link.text}</span>
                      <ArrowUpRight size={13} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                )}
              </motion.article>
            );
          })}
        </section>

        {/* Category-Reactive Cyber Laser Horizon Divider */}
        <div className="relative w-full max-w-3xl mx-auto my-12 pointer-events-none">
          <div className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent blur-sm animate-pulse" />
          <div className="relative h-[1px] bg-gradient-to-r from-transparent via-purple-400/80 to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-300 shadow-[0_0_15px_#a855f7]" />
        </div>

        {/* Legal Contact Card (Full Width, Balanced) */}
        <section className="rounded-2xl bg-gradient-to-b from-[#0a0d1b]/95 to-[#060812]/95 border border-white/[0.08] hover:border-purple-500/30 p-5 sm:p-7 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl transition-all duration-300">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400">
              <Scale size={14} />
              <span>Legal Support</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Questions about these terms?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md font-normal">
              Our team is available to assist you with any questions regarding our terms, commercial ownership, or licensing.
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
              href="mailto:legal@exismic.xyz"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
            >
              <Mail size={13} />
              <span>Contact Legal Team</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
