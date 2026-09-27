"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Zap, 
  Download, 
  ShieldCheck, 
  Crown, 
  Laptop, 
  HelpCircle, 
  ArrowRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
  accentColor: string;
  borderActive: string;
  badgeStyle: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  tags: string[];
}

const FAQS: FaqItem[] = [
  {
    question: "Is Exismic really free to use?",
    answer: "Yes. Exismic offers free daily credits across all tools, including background removal, vocal separation, and AI image generation. No credit card or payment information is ever required to get started.",
    category: "Free Access",
    accentColor: "#10b981",
    borderActive: "border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)]",
    badgeStyle: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    icon: Zap,
    tags: ["Daily Free Credits", "Zero Credit Card", "No Trial Traps"],
  },
  {
    question: "What kind of files can I download?",
    answer: "You can download real, ready-to-use files directly to your device, including transparent PNGs, editable vector SVGs, brand kits (.ZIP), Next.js 15 starter projects (.ZIP), separated audio stems (.WAV / .MP3), and high-resolution QR codes (.PNG / .SVG).",
    category: "Deliverables",
    accentColor: "#06b6d4",
    borderActive: "border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)]",
    badgeStyle: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    icon: Download,
    tags: [".PNG Cutouts", ".SVG Vectors", ".ZIP Kits", ".WAV Stems", "Next.js 15"],
  },
  {
    question: "Are my files private and secure?",
    answer: "Yes. Tools like image compression, video trimming, and QR code generation run locally in your browser. For cloud-processed tools, your files belong only to you, are never shared or sold, and are never used to train public AI models.",
    category: "Security",
    accentColor: "#38bdf8",
    borderActive: "border-2 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.25)]",
    badgeStyle: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    icon: ShieldCheck,
    tags: ["100% Local In-Browser", "Zero Public AI Training", "Private & Secure"],
  },
  {
    question: "How does the Pro subscription work?",
    answer: "Exismic Pro gives you 500 daily credits (10x the free tier), 1-click Brand Kit (.ZIP) downloads, bulk CSV spreadsheet processing, full Next.js 15 starter code exports, and commercial licensing for client work. You can cancel anytime in 1 click from your account.",
    category: "Exismic Pro",
    accentColor: "#a855f7",
    borderActive: "border-2 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.25)]",
    badgeStyle: "border-purple-400/30 bg-purple-400/10 text-purple-300",
    icon: Crown,
    tags: ["500 Daily Credits", "Brand Kit ZIPs", "Full Commercial License"],
  },
  {
    question: "Do I need to install any software or extensions?",
    answer: "No. Exismic works 100% in your web browser across desktop, laptop, and tablet devices. There is nothing to install.",
    category: "Compatibility",
    accentColor: "#f59e0b",
    borderActive: "border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]",
    badgeStyle: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    icon: Laptop,
    tags: ["Zero Installations", "Chrome / Safari / Edge", "Desktop & Tablet"],
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="pt-2 pb-3 sm:pt-3 sm:pb-4 px-4 sm:px-6 max-w-4xl mx-auto w-full scroll-mt-20 relative">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-5 sm:mb-6 text-center space-y-2.5">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
          FAQ
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Frequently asked{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-400">
            questions.
          </span>
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-md">
          Everything you need to know about files, free credits, privacy, and Pro tools.
        </p>
      </div>

      {/* Accordion List with Luxury Category Styling */}
      <div className="space-y-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const Icon = faq.icon;

          return (
            <div
              key={idx}
              className={cn(
                "rounded-2xl overflow-hidden transition-all duration-300 relative group/faq",
                isOpen
                  ? cn("bg-[#0a0c16]/95", faq.borderActive)
                  : "bg-white/[0.02] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]"
              )}
            >
              {/* Continuous Hover Shine */}
              <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 -translate-x-[150%] group-hover/faq:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              </div>

              {/* Accordion Toggle Header */}
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer relative z-10 select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  {/* Squircle Jewel Icon Frame with Conic Glow Accent */}
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover/faq:scale-105 shadow-sm"
                    style={{
                      backgroundColor: `${faq.accentColor}15`,
                      borderColor: `${faq.accentColor}40`,
                      color: faq.accentColor,
                    }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>

                  <div>
                    <span className="text-sm sm:text-base font-bold text-white tracking-tight group-hover/faq:text-zinc-100 transition-colors block">
                      {faq.question}
                    </span>
                    <span className={cn("inline-block mt-0.5 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider", faq.badgeStyle)}>
                      {faq.category}
                    </span>
                  </div>
                </div>

                {/* Rotating Squircle Indicator */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0",
                    isOpen
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 rotate-45 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                      : "border-white/10 bg-white/[0.04] text-zinc-400 group-hover/faq:text-white group-hover/faq:border-white/20"
                  )}
                >
                  <Plus className="w-4 h-4 stroke-[2.2]" />
                </div>
              </button>

              {/* Animated Expandable Answer Panel */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-zinc-300 text-xs sm:text-sm leading-relaxed border-t border-white/[0.06] relative z-10">
                      <p className="mt-2 font-normal leading-relaxed text-zinc-300">
                        {faq.answer}
                      </p>

                      {/* Informative Deliverable / Feature Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3.5 pt-2">
                        {faq.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono text-zinc-300 bg-white/[0.04] border border-white/[0.08]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Support Reassurance Card */}
      <div className="mt-5 sm:mt-6 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-300 shrink-0">
            <HelpCircle className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white">
              Still have a question?
            </div>
            <div className="text-[11px] text-zinc-400 font-normal">
              Check our support center or browse our complete documentation.
            </div>
          </div>
        </div>

        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold transition-all shrink-0 hover:scale-[1.03]"
        >
          <span>Help Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </section>
  );
}
