"use client";

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowUpRight,
  Scale, 
  CheckCircle,
  AlertCircle,
  Lightbulb,
  CreditCard,
  ShieldCheck,
  XCircle,
  RefreshCcw,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    icon: <CheckCircle size={24} />,
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    content: "By accessing or using the Lumora platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, you may not access the platform or use any services."
  },
  {
    id: "conduct",
    title: "2. User Conduct",
    icon: <AlertCircle size={24} />,
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.3)]",
    content: "You agree to use Lumora responsibly and legally. You shall not attempt to reverse engineer our AI models, use automated scraping tools, distribute malicious content, or use the service for any illegal activities."
  },
  {
    id: "ip",
    title: "3. Intellectual Property",
    icon: <Lightbulb size={24} />,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.3)]",
    content: "You retain all ownership rights to the original content you submit and the generations you create using Lumora. Lumora retains all intellectual property rights to the underlying platform, AI architectures, and user interface."
  },
  {
    id: "payments",
    title: "4. Pro Subscriptions & Payments",
    icon: <CreditCard size={24} />,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.3)]",
    content: "Lumora Pro subscriptions are billed in advance on a recurring basis. All fees are non-refundable unless legally required. You may cancel your subscription at any time, and you will retain access until the end of your current billing cycle."
  },
  {
    id: "privacy",
    title: "5. Data & Privacy",
    icon: <ShieldCheck size={24} />,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    glow: "shadow-[0_0_30px_rgba(96,165,250,0.3)]",
    content: "Your privacy is critical to us. Our data collection and usage practices are governed by our Privacy Policy. By using Lumora, you agree to the terms outlined in our Privacy Policy.",
    link: { text: "Read Privacy Policy", url: "/privacy-policy" }
  },
  {
    id: "termination",
    title: "6. Termination",
    icon: <XCircle size={24} />,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    glow: "shadow-[0_0_30px_rgba(251,113,133,0.3)]",
    content: "We reserve the right to suspend or terminate your account at our sole discretion, without notice or liability, for any reason, including but not limited to a breach of these Terms of Service."
  },
  {
    id: "liability",
    title: "7. Limitation of Liability",
    icon: <Scale size={24} />,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    glow: "shadow-[0_0_30px_rgba(129,140,248,0.3)]",
    content: "Lumora is provided 'as is' without warranties of any kind. In no event shall Lumora or its directors, employees, or partners be liable for any indirect, incidental, or consequential damages arising from your use of the platform."
  },
  {
    id: "changes",
    title: "8. Changes to Terms",
    icon: <RefreshCcw size={24} />,
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
    glow: "shadow-[0_0_30px_rgba(161,161,170,0.3)]",
    content: "We reserve the right to modify these terms at any time. We will notify you of significant changes via email or an in-app notice. Your continued use of Lumora after such changes constitutes acceptance of the new terms."
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 relative overflow-hidden font-sans">
      {/* 1. Cinematic Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Animated Glowing Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-48 right-1/4 w-[600px] h-[600px] bg-accent-purple/20 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-accent-cyan/20 blur-[150px] rounded-full" 
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
              className="relative inline-flex items-center gap-4 px-6 py-3 rounded-full bg-accent-purple/5 border border-accent-purple/20 text-accent-purple shadow-[0_0_40px_rgba(168,85,247,0.15)] group"
            >
              <div className="absolute inset-0 bg-accent-purple/20 blur-md rounded-full group-hover:bg-accent-purple/30 transition-colors" />
              <Scale size={20} className="relative z-10" />
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em] drop-shadow-md">Legal Agreement</span>
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] select-none">
                TERMS OF <br />
                <motion.span 
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-purple bg-[length:200%_auto] drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]"
                >
                  SERVICE.
                </motion.span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-zinc-400 font-medium text-lg">
                <p className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent-cyan animate-pulse" />
                  Fair and transparent.
                </p>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/20" />
                <p className="text-zinc-500 bg-white/5 px-4 py-1.5 rounded-full text-sm border border-white/5 shadow-inner">Last updated: May 19, 2026</p>
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
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight italic flex items-center gap-4">
                    <span className="text-white/20 text-xl font-bold">{section.title.split('.')[0]}.</span>
                    {section.title.split('.')[1]}
                  </h2>
                  <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl max-w-3xl group-hover:text-zinc-300 transition-colors duration-300">
                    {section.content}
                  </p>
                  {section.link && (
                    <div className="pt-2">
                       <Link href={section.link.url} className="inline-flex items-center gap-2 text-accent-cyan text-sm font-bold uppercase tracking-widest hover:text-white transition-colors group/link">
                          {section.link.text} <ArrowUpRight size={14} className="group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                       </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          ))}
        </motion.div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative p-12 rounded-[3rem] border border-accent-purple/20 text-center space-y-8 overflow-hidden group shadow-[0_0_50px_rgba(168,85,247,0.1)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
          
          <div className="relative z-10 space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent-purple/20 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform duration-500">
              <Scale size={40} className="text-accent-purple" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-wider">
              Need Clarification?
            </h3>
            <p className="text-zinc-400 font-medium max-w-xl mx-auto text-lg">
              If you have any questions about these terms or our practices, please don't hesitate to reach out to our legal team.
            </p>
            <div className="pt-6">
              <a href="mailto:legal@lumora.ai" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-zinc-200 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                Contact Legal Team <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
