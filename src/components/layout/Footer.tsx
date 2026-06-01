"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ArrowUpRight,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Globe,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

// --- Custom Social Icons for Premium Aesthetics ---
const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.682 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.006 14.006 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 01.077.01c.12.099.246.197.372.291a.077.077 0 01-.006.128 12.983 12.983 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/>
  </svg>
);

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { name: "Dashboard", href: "/" },
      { name: "All Tools", href: "/tools" },
      { name: "Pricing", href: "/pro" },
      { name: "Updates", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/help" },
      { name: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export function Footer() {
  const [session, setSession] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, [supabase]);

  return (
    <footer className="relative bg-[#020204] pt-32 pb-14 overflow-hidden border-t border-white/[0.03]" suppressHydrationWarning>
      
      {/* 1. Luxurious Atmospheric Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft, colorful horizontal gradient splits */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 via-cyan-400/50 to-transparent blur-[1px]" />
        
        {/* Large Cinematic Decorative Typography */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center select-none opacity-[0.025] z-0">
          <h2 className="text-[15vw] font-sans font-black tracking-[0.08em] uppercase italic leading-none text-white whitespace-nowrap">
            LUMORA
          </h2>
        </div>

        {/* Ambient atmosphere gradients */}
        <div className="absolute -bottom-64 left-1/3 w-[800px] h-[500px] bg-purple-600/10 blur-[160px] rounded-full" />
        <div className="absolute -top-32 right-1/4 w-[600px] h-[400px] bg-cyan-500/8 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* 2. Pre-Footer Action Capsule */}
        <div className="mb-32 p-12 md:p-20 rounded-[3.5rem] bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.05] relative overflow-hidden group shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.02)]">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] via-transparent to-cyan-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1fr_auto] items-center gap-12 xl:gap-24">
                <div className="space-y-8 text-center xl:text-left">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-[9px] font-black uppercase tracking-[0.3em] shadow-lg">
                        <Sparkles size={11} className="animate-pulse" /> The Future is Simple
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic leading-none select-none">
                            Ready to <span className="bg-gradient-to-r from-purple-400 via-pink-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]">transcend?</span>
                        </h2>
                        <p className="text-zinc-500 font-semibold max-w-md text-base leading-relaxed mx-auto xl:mx-0">
                            Join 50,000+ creators who have already simplified their creative process with Lumora.
                        </p>
                    </div>
                </div>
                
                <div className="relative group/btn w-fit mx-auto xl:mx-0">
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full blur-xl opacity-20 group-hover/btn:opacity-50 transition duration-700" />
                    <Link 
                        href={mounted && session ? "/" : "/auth/login"} 
                        className="relative flex items-center gap-5 h-20 px-10 rounded-full bg-zinc-950 border border-white/10 text-white font-black text-lg tracking-tight uppercase italic hover:bg-black transition-all shadow-3xl overflow-hidden group/link"
                    >
                        <div className="absolute inset-0 shimmer opacity-10 group-hover/link:opacity-20 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        
                        <span className="relative z-10 whitespace-nowrap">
                          {mounted && session ? "Open Dashboard" : "Get Started"}
                        </span>
                        
                        <div className="relative z-10 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover/link:bg-white group-hover/link:text-black transition-all duration-500">
                          <ArrowRight size={16} className="group-hover/link:translate-x-0.5 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Decorative Background Icon */}
            <div className="absolute -bottom-20 -right-20 opacity-[0.02] pointer-events-none rotate-12">
               <Zap size={350} strokeWidth={1} />
            </div>
        </div>

        {/* 3. Main Footer Links & Branding */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <div className="space-y-5">
              <Link href="/" className="flex items-center gap-3.5 group w-fit mx-auto lg:mx-0">
                <div className="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px] group-hover:rotate-6 transition-transform duration-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <div className="w-full h-full bg-black rounded-[13px] flex items-center justify-center">
                    <Shield className="text-white fill-white/10" size={20} />
                  </div>
                </div>
                <div className="flex flex-col items-start leading-none">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Lumora</h2>
                  <p className="text-[8px] font-black uppercase tracking-[0.35em] text-purple-400 mt-1">Creative Hub</p>
                </div>
              </Link>
              <p className="text-zinc-500 font-medium leading-relaxed max-w-sm text-sm mx-auto lg:mx-0">
                Making professional creative tools simple for everyone. Elevate your daily tasks with state-of-the-art AI.
              </p>
            </div>

            {/* Premium Social Icons */}
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <SocialLink href="#" icon={<TwitterIcon size={18} />} label="Twitter" hoverStyles="hover:text-cyan-400 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:bg-cyan-500/[0.02]" />
              <SocialLink href="#" icon={<GithubIcon size={18} />} label="GitHub" hoverStyles="hover:text-white hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/[0.02]" />
              <SocialLink href="#" icon={<DiscordIcon size={18} />} label="Discord" hoverStyles="hover:text-indigo-400 hover:border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:bg-indigo-500/[0.02]" />
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-12 lg:pl-12 text-center lg:text-left">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title} className="space-y-6 flex flex-col items-center lg:items-start">
                <h3 className="text-[9.5px] font-black uppercase tracking-[0.4em] text-zinc-500/80">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name} className="flex justify-center lg:justify-start">
                      <Link 
                        href={link.href}
                        className="text-zinc-400 hover:text-white transition-all font-semibold text-xs flex items-center gap-2 group w-fit hover:translate-x-1"
                      >
                        <span className="w-1.5 h-px bg-purple-500/0 group-hover:bg-purple-500/100 transition-all group-hover:w-3" />
                        {link.name}
                        <ArrowUpRight size={10} className="opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all text-purple-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Luxury Tech Status Bar (Bottom) */}
        <div className="pt-10 border-t border-white/[0.04]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            
            {/* Copyright & Info */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-[9.5px] font-black uppercase tracking-[0.25em] text-zinc-600">
              <span className="hover:text-zinc-400 transition-colors">© 2026 Raxstdioz LLC. All Rights Reserved.</span>
              <div className="hidden md:block w-px h-3 bg-white/10" />
              <span className="text-zinc-500/60 leading-none">Global • Fast • Reliable</span>
            </div>

            {/* Live Stats Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4">
                <StatusItem icon={<Globe size={13} />} label="Global Reach" value="24+ Countries" color="cyan" />
                <StatusItem icon={<Activity size={13} />} label="Processing" value="Instant" color="purple" />
                
                {/* Glowing Pulse Status Badge */}
                <div className="flex items-center gap-2.5 px-4.5 py-2 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                    <div className="relative flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Online</span>
                </div>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
}

function SocialLink({ icon, href, label, hoverStyles }: { icon: React.ReactNode; href: string; label: string; hoverStyles: string }) {
  return (
    <motion.a 
      href={href}
      whileHover={{ y: -4, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "w-12 h-12 rounded-[14px] bg-zinc-950/40 backdrop-blur-2xl border border-white/[0.05] flex items-center justify-center text-zinc-500 hover:text-white transition-all duration-300 group relative shadow-md",
        hoverStyles
      )}
      title={label}
    >
      <div className="absolute inset-0 bg-purple-500/[0.04] opacity-0 group-hover:opacity-100 rounded-[14px] blur-sm transition-opacity pointer-events-none" />
      <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
        {icon}
      </span>
    </motion.a>
  );
}

function StatusItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: "cyan" | "purple" }) {
    return (
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-950/40 border border-white/[0.04] group hover:border-white/[0.08] transition-colors shadow-sm">
            <div className={cn(
                "text-zinc-500 transition-colors duration-300",
                color === "cyan" ? "group-hover:text-cyan-400" : "group-hover:text-purple-400"
            )}>
                {icon}
            </div>
            <div className="flex flex-col leading-none text-left">
                <span className="text-[7.5px] font-bold uppercase tracking-wider text-zinc-600">{label}</span>
                <span className="text-[10px] font-black text-white tracking-tighter tabular-nums mt-0.5">{value}</span>
            </div>
        </div>
    );
}
