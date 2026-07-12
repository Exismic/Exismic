"use client";

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowUpRight,
  Cookie, 
  HelpCircle,
  Settings,
  SlidersHorizontal,
  List,
  RefreshCcw,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { openCookiePreferences } from "@/lib/cookie-consent";

const SECTIONS = [
  {
    id: "what-are-cookies",
    title: "1. What Are Cookies?",
    icon: <HelpCircle size={24} />,
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    content: "Cookies are small text files that are placed on your device when you browse the web. They are widely used to make websites work more efficiently, provide a secure experience, and help us understand how you interact with Exismic."
  },
  {
    id: "how-we-use",
    title: "2. How We Use Them",
    icon: <Settings size={24} />,
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.3)]",
    content: (
      <div className="space-y-4">
        <p>We classify our cookies into three main categories to maintain transparency:</p>
        <ul className="space-y-4 pt-2">
          <li className="flex items-start gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-purple mt-2.5 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
            <div className="leading-relaxed">
              <strong className="text-white block mb-1 uppercase tracking-wider text-[11px]">Essential</strong> 
              Strictly necessary for Exismic to function, such as keeping you logged in securely and remembering session states.
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-2.5 shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <div className="leading-relaxed">
              <strong className="text-white block mb-1 uppercase tracking-wider text-[11px]">Analytics</strong> 
              Helps us understand user behavior and platform performance anonymously so we can improve our services.
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <div className="leading-relaxed">
              <strong className="text-white block mb-1 uppercase tracking-wider text-[11px]">Functional</strong> 
              Remembers your preferences and custom settings to provide a personalized experience across sessions.
            </div>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: "managing",
    title: "3. Managing Preferences",
    icon: <SlidersHorizontal size={24} />,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.3)]",
    content: (
      <div className="space-y-6">
        <p>
          Essential services remain active because they are required for secure
          sign-in, payments, and core platform features. Analytics and functional
          storage are optional and remain off until you enable them.
        </p>
        <div className="flex items-start gap-4 rounded-2xl border border-accent-purple/20 bg-accent-purple/5 p-6 text-sm shadow-inner">
          <Sparkles size={18} className="text-accent-purple shrink-0 mt-0.5" />
          <div className="space-y-4">
            <p className="leading-relaxed text-zinc-300">
              Your choice is saved on this browser for 180 days. You can reopen
              the consent manager at any time and changes take effect immediately.
            </p>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-accent-purple/30 bg-accent-purple/10 px-5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-all hover:border-accent-cyan/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
            >
              <SlidersHorizontal size={15} /> Manage preferences
            </button>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "list",
    title: "4. Our Cookie List",
    icon: <List size={24} />,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.3)]",
    content: (
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.05] border-b border-white/10 text-white">
              <tr>
                <th className="p-5 font-black uppercase tracking-widest text-[10px]">Name</th>
                <th className="p-5 font-black uppercase tracking-widest text-[10px]">Provider</th>
                <th className="p-5 font-black uppercase tracking-widest text-[10px]">Purpose</th>
                <th className="p-5 font-black uppercase tracking-widest text-[10px]">Type</th>
                <th className="p-5 font-black uppercase tracking-widest text-[10px]">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-5 font-medium text-white">exismic_cookie_consent</td>
                <td className="p-5 text-zinc-400">Exismic</td>
                <td className="p-5 text-zinc-400">Remembers your privacy choices on this browser</td>
                <td className="p-5"><span className="px-3 py-1 rounded-full bg-accent-purple/10 text-accent-purple text-[10px] font-bold uppercase tracking-wider border border-accent-purple/20">Essential</span></td>
                <td className="p-5 text-zinc-400">180 days</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-5 font-medium text-white">sb-*-auth-token*</td>
                <td className="p-5 text-zinc-400">Supabase</td>
                <td className="p-5 text-zinc-400">Maintains and refreshes your secure sign-in session</td>
                <td className="p-5"><span className="px-3 py-1 rounded-full bg-accent-purple/10 text-accent-purple text-[10px] font-bold uppercase tracking-wider border border-accent-purple/20">Essential</span></td>
                <td className="p-5 text-zinc-400">Session dependent</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-5 font-medium text-white">_clck</td>
                <td className="p-5 text-zinc-400">Microsoft Clarity</td>
                <td className="p-5 text-zinc-400">Distinguishes a browser for product analytics</td>
                <td className="p-5"><span className="px-3 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan text-[10px] font-bold uppercase tracking-wider border border-accent-cyan/20">Analytics</span></td>
                <td className="p-5 text-zinc-400">1 year</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-5 font-medium text-white">_clsk</td>
                <td className="p-5 text-zinc-400">Microsoft Clarity</td>
                <td className="p-5 text-zinc-400">Connects page views within an analytics session</td>
                <td className="p-5"><span className="px-3 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan text-[10px] font-bold uppercase tracking-wider border border-accent-cyan/20">Analytics</span></td>
                <td className="p-5 text-zinc-400">1 day</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: "updates",
    title: "5. Updates to Policy",
    icon: <RefreshCcw size={24} />,
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
    glow: "shadow-[0_0_30px_rgba(161,161,170,0.3)]",
    content: "We may update this Cookie Policy from time to time to reflect changes in technology, our services, or regulatory requirements. Any significant changes will be communicated via email or an in-app notice."
  }
];

export default function CookiesPage() {
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
          className="absolute -top-48 right-1/4 w-[600px] h-[600px] bg-accent-cyan/20 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-accent-purple/20 blur-[150px] rounded-full" 
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
              className="relative inline-flex items-center gap-4 px-6 py-3 rounded-full bg-accent-cyan/5 border border-accent-cyan/20 text-accent-cyan shadow-[0_0_40px_rgba(34,211,238,0.15)] group"
            >
              <div className="absolute inset-0 bg-accent-cyan/20 blur-md rounded-full group-hover:bg-accent-cyan/30 transition-colors" />
              <Cookie size={20} className="relative z-10" />
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em] drop-shadow-md">Data Usage</span>
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] select-none">
                COOKIE <br />
                <motion.span 
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan bg-[length:200%_auto] drop-shadow-[0_0_60px_rgba(34,211,238,0.4)]"
                >
                  POLICY.
                </motion.span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-zinc-400 font-medium text-lg">
                <p className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent-purple animate-pulse" />
                  Small data, big transparency.
                </p>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/20" />
                <p className="text-zinc-500 bg-white/5 px-4 py-1.5 rounded-full text-sm border border-white/5 shadow-inner">Last updated: July 10, 2026</p>
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
                
                <div className="space-y-4 pt-1 w-full overflow-hidden">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight italic flex items-center gap-4">
                    <span className="text-white/20 text-xl font-bold">{section.title.split('.')[0]}.</span>
                    {section.title.split('.')[1]}
                  </h2>
                  <div className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl max-w-4xl group-hover:text-zinc-300 transition-colors duration-300 w-full">
                    {section.content}
                  </div>
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
          className="relative p-12 rounded-[3rem] border border-accent-cyan/20 text-center space-y-8 overflow-hidden group shadow-[0_0_50px_rgba(34,211,238,0.1)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-accent-cyan/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
          
          <div className="relative z-10 space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent-cyan/20 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)] group-hover:scale-110 transition-transform duration-500">
              <Cookie size={40} className="text-accent-cyan" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-wider">
              Have questions about your data?
            </h3>
            <p className="text-zinc-400 font-medium max-w-xl mx-auto text-lg">
              If you have any concerns regarding how we use cookies, please don&apos;t hesitate to reach out to our privacy team.
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
