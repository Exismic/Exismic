"use client";

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowUpRight,
  RefreshCcw, 
  CheckCircle,
  AlertCircle,
  CreditCard,
  Coins,
  ShieldAlert,
  Clock,
  HelpCircle,
  Sparkles,
  Zap,
  Mail
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "overview",
    title: "1. Policy Overview & Digital Nature of Services",
    icon: <HelpCircle size={24} />,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    content: "Exismic delivers online software-as-a-service (SaaS) and on-demand artificial intelligence cloud computing tools. Because our computational resources, GPU workers, and server capacity are provisioned immediately upon request, service delivery is deemed instant and complete once an AI generation or media processing job finishes."
  },
  {
    id: "pro-subscriptions",
    title: "2. Exismic Pro Subscriptions & Cancellations",
    icon: <CreditCard size={24} />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.3)]",
    content: "You may cancel your Exismic Pro recurring subscription at any time with zero penalty directly from your Account Settings (/account/settings) or via your payment provider (Razorpay or PayPal). When you cancel, your account remains fully upgraded with all Pro benefits until the conclusion of your current prepaid billing cycle. We do not issue prorated refunds for partial months or unused subscription periods once billing has occurred."
  },
  {
    id: "statutory-withdrawal",
    title: "3. 14-Day Statutory Right of Withdrawal (EU / UK)",
    icon: <Clock size={24} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.3)]",
    content: "If you reside within the European Union, United Kingdom, or another jurisdiction with statutory cooling-off consumer protection laws, you possess the right to cancel an initial subscription purchase within 14 calendar days of your transaction. However, this statutory right lapses once you explicitly consent to immediate digital performance and commence consuming computational credits or generating media during that window."
  },
  {
    id: "credits-and-sparks",
    title: "4. Generation Credits & Exismic Sparks",
    icon: <Coins size={24} />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.3)]",
    content: "Purchased generation credit packs (Starter, Creator, Studio) and promotional Exismic Sparks are digital compute tokens. All credit deductions for running AI tools (e.g. background removal, image generation, vocal separation, OCR) and Sparks redemptions for creator cosmetics or vouchers are strictly final and non-refundable once executed. Free daily credits carry no monetary value and cannot be exchanged for cash or credit balance."
  },
  {
    id: "technical-failures",
    title: "5. Technical Failures & Server Error Remedies",
    icon: <CheckCircle size={24} />,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    glow: "shadow-[0_0_30px_rgba(45,212,191,0.3)]",
    content: "If an unexpected server failure, model timeout, or platform bug causes a tool to consume credits without delivering output or returning a corrupted result, our automated fallback mechanism automatically restores the deducted credits to your balance. If your credits were not restored automatically, please contact our support desk with your session or transaction ID within 48 hours for immediate credit restoration."
  },
  {
    id: "chargebacks-fraud",
    title: "6. Chargebacks, Disputes & Unauthorized Billing",
    icon: <ShieldAlert size={24} />,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    glow: "shadow-[0_0_30px_rgba(251,113,133,0.3)]",
    content: "We encourage customers to contact us directly at billing@exismic.xyz before initiating a chargeback or payment dispute with your bank or card issuer. We resolve billing anomalies and accidental duplicate charges promptly. Accounts involved in fraudulent chargebacks or payment fraud will be immediately suspended pending investigation, and any active balances will be forfeited."
  }
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 pb-32 relative overflow-hidden font-sans">
      {/* Cinematic Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Animated Glowing Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-48 right-1/4 w-[600px] h-[600px] bg-purple-600/20 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-cyan-500/20 blur-[150px] rounded-full" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <main className="max-w-5xl mx-auto px-6 pt-32 space-y-24 relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12 text-center flex flex-col items-center"
        >
          <Link href="/" className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 group shadow-lg backdrop-blur-md">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Platform
          </Link>

          <header className="space-y-8 flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative inline-flex items-center gap-4 px-6 py-3 rounded-full bg-purple-500/5 border border-purple-500/20 text-purple-300 shadow-[0_0_40px_rgba(168,85,247,0.15)] group"
            >
              <div className="absolute inset-0 bg-purple-500/20 blur-md rounded-full group-hover:bg-purple-500/30 transition-colors" />
              <RefreshCcw size={18} className="relative z-10" />
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em] drop-shadow-md">Billing & Returns</span>
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] select-none">
                REFUND <br />
                <motion.span 
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-400 bg-[length:200%_auto] drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]"
                >
                  POLICY.
                </motion.span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-zinc-400 font-medium text-lg">
                <p className="flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-300 animate-pulse" />
                  Transparent cancellation and digital refund guidelines.
                </p>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/20" />
                <p className="text-zinc-500 bg-white/5 px-4 py-1.5 rounded-full text-sm border border-white/5 shadow-inner">Last updated: September 2026</p>
              </div>
            </div>
          </header>
        </motion.div>

        {/* Content Sections */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="grid gap-8"
        >
          {SECTIONS.map((section, index) => (
            <motion.section 
              key={section.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group p-8 md:p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden backdrop-blur-xl shadow-2xl"
            >
              {/* Subtle hover gradient sweep */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0 relative">
                  <div className={cn(
                    "absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500",
                    section.bg
                  )} />
                  <div className={cn(
                    "relative w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner",
                    section.bg,
                    section.color,
                    section.glow
                  )}>
                    {section.icon}
                  </div>
                </div>
                
                <div className="space-y-4 pt-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic flex items-center gap-4">
                    <span className="text-white/20 text-xl font-bold">{section.title.split('.')[0]}.</span>
                    {section.title.split('.')[1]}
                  </h2>
                  <p className="text-zinc-300 font-normal leading-relaxed text-base md:text-lg max-w-3xl group-hover:text-white transition-colors duration-300">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.section>
          ))}
        </motion.div>

        {/* Support & Billing Escalation Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative p-12 rounded-[3rem] border border-purple-500/20 text-center space-y-8 overflow-hidden group shadow-[0_0_50px_rgba(168,85,247,0.1)] bg-gradient-to-b from-[#0c0d18] to-[#040407]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
          
          <div className="relative z-10 space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform duration-500">
              <Mail size={36} className="text-purple-300" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-wider">
              Have a Billing or Refund Question?
            </h3>
            <p className="text-zinc-300 font-normal max-w-xl mx-auto text-base md:text-lg">
              Our dedicated billing support desk handles charge inquiries, duplicate transactions, and payment questions with priority 24-hour turnaround.
            </p>
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <a 
                href="mailto:billing@exismic.xyz" 
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-zinc-200 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Contact Billing Team (billing@exismic.xyz) <ArrowUpRight size={18} />
              </a>
              <Link 
                href="/help"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 font-bold uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                Help Center
              </Link>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
