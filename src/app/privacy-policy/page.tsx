"use client";

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowUpRight,
  ShieldCheck, 
  Lock, 
  Database,
  Search,
  Activity,
  UserCheck,
  Cookie,
  Globe,
  RefreshCcw,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "your-data",
    title: "1. Your Data",
    icon: <Database size={24} />,
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    content: "We only collect information that is strictly necessary to run your account and provide you with our services. This primarily includes your email address, basic profile details, and the files you process through our tools."
  },
  {
    id: "collection",
    title: "2. How We Collect Data",
    icon: <Search size={24} />,
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.3)]",
    content: "Data is collected directly from you when you register for an account, interact with our services, or contact our support team. We also collect basic telemetry data automatically to ensure our platform runs smoothly and securely."
  },
  {
    id: "usage",
    title: "3. How We Use Your Data",
    icon: <Activity size={24} />,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.3)]",
    content: "Your information is used exclusively to power your Exismic experience. We process your files in real-time to deliver the requested AI generation, maintain your account security, and communicate important service updates. We do not use your data to train public AI models."
  },
  {
    id: "security",
    title: "4. Security",
    icon: <Lock size={24} />,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    glow: "shadow-[0_0_30px_rgba(251,113,133,0.3)]",
    content: "We employ industry-leading encryption protocols for data both at rest and in transit. Your files are processed securely and are automatically purged from our temporary processing servers shortly after your session ends."
  },
  {
    id: "rights",
    title: "5. Your Rights",
    icon: <UserCheck size={24} />,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    glow: "shadow-[0_0_30px_rgba(96,165,250,0.3)]",
    content: "You retain full control over your personal data. You have the right to access, modify, export, or permanently delete your information at any time. Our account settings provide intuitive tools to exercise these rights instantly."
  },
  {
    id: "cookies",
    title: "6. Cookies",
    icon: <Cookie size={24} />,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.3)]",
    content: "We use essential cookies to keep you logged in and secure your sessions. We also use minimal analytics cookies to understand how our platform is used and improve our features. You can manage your cookie preferences through your browser settings."
  },
  {
    id: "third-parties",
    title: "7. Third Parties",
    icon: <Globe size={24} />,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    glow: "shadow-[0_0_30px_rgba(129,140,248,0.3)]",
    content: "We never sell your personal information. We only share data with trusted infrastructure partners (such as secure hosting providers and payment processors) who are bound by strict confidentiality agreements to facilitate our services."
  },
  {
    id: "changes",
    title: "8. Changes to Policy",
    icon: <RefreshCcw size={24} />,
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
    glow: "shadow-[0_0_30px_rgba(161,161,170,0.3)]",
    content: "We may update this policy periodically to reflect changes in our services or legal requirements. We will notify you of any significant changes via email or an in-app announcement before they take effect."
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 relative overflow-hidden font-sans">
      {/* 1. Cinematic Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Animated Glowing Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-48 left-1/4 w-[600px] h-[600px] bg-accent-purple/20 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -right-48 w-[500px] h-[500px] bg-accent-cyan/20 blur-[150px] rounded-full" 
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
              <ShieldCheck size={20} className="relative z-10" />
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em] drop-shadow-md">Trust &amp; Transparency</span>
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] select-none">
                PRIVACY <br />
                <motion.span 
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-purple bg-[length:200%_auto] drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]"
                >
                  POLICY.
                </motion.span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-zinc-400 font-medium text-lg">
                <p className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent-cyan animate-pulse" />
                  Your security is our priority.
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
              <ShieldCheck size={40} className="text-accent-purple" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-wider">
              Have questions about your privacy?
            </h3>
            <p className="text-zinc-400 font-medium max-w-xl mx-auto text-lg">
              Our dedicated privacy team is always here to help you understand how your data is handled.
            </p>
            <div className="pt-6">
              <a href="mailto:privacy@exismic.ai" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-zinc-200 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                Contact Privacy Team <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
