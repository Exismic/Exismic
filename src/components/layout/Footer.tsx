"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { ExismicMark } from "@/components/ui/ExismicLogo";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { name: "All tools", href: "/tools" },
      { name: "Exismic Ai", href: "/chat" },
      { name: "Support Agent", href: "/tools/support-agent" },
      { name: "Exismic Pro", href: "/pro" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help center", href: "/help" },
      { name: "Product updates", href: "/changelog" },
      { name: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Exismic", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy", href: "/privacy-policy" },
      { name: "Terms", href: "/terms-of-service" },
      { name: "Cookies", href: "/cookies" },
    ],
  },
];

const GithubIcon = ({ size = 14, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const InstagramIcon = ({ size = 14, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const XIcon = ({ size = 14, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

export function Footer() {
  const [session, setSession] = useState<Session | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, [supabase]);

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#020204]" suppressHydrationWarning>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-purple-400/70 to-cyan-300/70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(115deg,rgba(124,58,237,0.08),transparent_38%,rgba(34,211,238,0.055)_74%,transparent)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid items-center gap-8 border-b border-white/[0.07] py-14 md:grid-cols-[1fr_auto] md:py-20"
        >
          <div className="max-w-3xl">
            <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-purple-300/15 bg-purple-300/[0.055] px-3">
              <Sparkles size={11} className="text-cyan-300" />
              <span className="text-[8px] font-black uppercase tracking-[0.24em] text-zinc-400">
                Your Exismic workspace
              </span>
            </div>
            <h2 className="mt-5 bg-[linear-gradient(100deg,#fff_0%,#f5f3ff_46%,#d8b4fe_72%,#a5f3fc_100%)] bg-clip-text text-[clamp(2.25rem,5vw,4.5rem)] font-black leading-[1.1] pb-2 tracking-[-0.045em] text-transparent">
              Make something worth shipping.
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-zinc-500 sm:text-base">
              Create, refine, and deliver from one focused workspace built for practical AI work.
            </p>
          </div>

          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full md:w-[292px] md:justify-self-end relative group/launch isolate"
          >
            {/* Ambient Aura Glow (Idle & Hover) */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 rounded-[24px] blur-xl opacity-30 group-hover/launch:opacity-60 transition duration-1000 group-hover/launch:duration-300 animate-pulse" />

            <Link
              href={session ? "/" : "/auth/login"}
              className="relative isolate flex h-[72px] w-full overflow-hidden rounded-[20px] p-[2px] shadow-[0_20px_55px_rgba(0,0,0,0.5),0_0_30px_rgba(124,58,237,0.15)] transition-shadow duration-500 hover:shadow-[0_20px_65px_rgba(0,0,0,0.6),0_0_40px_rgba(34,211,238,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
            >
              {/* Continuous Seamless Rotating Neon Border */}
              <motion.span
                aria-hidden="true"
                className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,rgba(124,58,237,1)_0%,rgba(34,211,238,1)_33%,rgba(232,121,249,1)_66%,rgba(124,58,237,1)_100%)] opacity-90 mix-blend-screen transition-opacity duration-500 group-hover/launch:opacity-100"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />

              <span className="relative flex h-full w-full items-center gap-3.5 rounded-[18px] border border-white/5 bg-gradient-to-br from-[#08080d]/98 to-[#040406]/98 px-4 backdrop-blur-2xl transition-colors duration-500 group-hover/launch:from-[#0d0d16]/98 group-hover/launch:to-[#06060a]/98">
                {/* Idle Shimmer Sweep */}
                <motion.div
                  animate={{ x: ["-250%", "250%"] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1.5 }}
                  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                />

                <ExismicMark size={38} className="drop-shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all duration-500 group-hover/launch:scale-110 group-hover/launch:rotate-3" />
                
                <span className="min-w-0 flex-1 text-left relative z-10">
                  <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/90 drop-shadow-sm transition-all duration-500 group-hover/launch:text-white group-hover/launch:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                    {session ? "Open Exismic" : "Enter Exismic"}
                  </span>
                  <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-500 transition-colors duration-500 group-hover/launch:text-cyan-200/90">
                    Creative workspace
                  </span>
                </span>

                <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.04] bg-white/[0.02] text-zinc-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-500 group-hover/launch:border-cyan-300/40 group-hover/launch:bg-cyan-300/[0.15] group-hover/launch:text-cyan-50 group-hover/launch:shadow-[0_0_30px_rgba(34,211,238,0.4),inset_0_1px_5px_rgba(255,255,255,0.2)]">
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="text-zinc-300 group-hover/launch:text-cyan-100 transition-colors"
                  >
                    <ArrowRight size={16} />
                  </motion.div>
                </span>
              </span>
            </Link>
          </motion.div>
        </motion.section>

        <div className="grid gap-12 py-14 md:grid-cols-[1.1fr_1.9fr] md:py-18 lg:gap-20">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <ExismicMark size={42} />
              <div>
                <p className="text-lg font-black tracking-[-0.02em] text-white">
                  Exismic<span className="text-cyan-300">.</span>
                </p>
                <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.25em] text-zinc-600">
                  AI Studio
                </p>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm font-medium leading-7 text-zinc-600">
              A practical creative platform for AI, media, documents, code, and everyday work.
            </p>
            <div className="mt-7 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
              Built and operated by Exismic
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4" aria-label="Footer navigation">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title}>
                <h3 className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-600">{section.title}</h3>
                <ul className="mt-5 space-y-3.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="group inline-flex min-h-6 items-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-white"
                      >
                        {link.name}
                        <ArrowUpRight
                          size={10}
                          className="translate-y-0.5 text-cyan-300 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="relative flex flex-col gap-6 border-t border-white/[0.07] py-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 sm:gap-6">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-700">
              &copy; 2026 Exismic. All rights reserved.
            </p>
            <span className="hidden h-3 w-px bg-white/[0.08] sm:block" />
            <div className="flex items-center gap-4 text-zinc-600">
              <a href="#" target="_blank" rel="noreferrer" aria-label="X (Twitter)" className="transition-all duration-300 hover:text-white hover:scale-110">
                <XIcon size={14} />
              </a>
              <a href="#" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition-all duration-300 hover:text-pink-400 hover:scale-110">
                <InstagramIcon size={14} />
              </a>
              <a href="#" target="_blank" rel="noreferrer" aria-label="GitHub" className="transition-all duration-300 hover:text-white hover:scale-110">
                <GithubIcon size={14} />
              </a>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:justify-end">
            <Link href="/privacy-policy" className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:text-zinc-400">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:text-zinc-400">
              Terms
            </Link>
            <Link href="/help" className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:text-zinc-400">
              Support
            </Link>
            <span className="hidden h-3 w-px bg-white/[0.08] sm:block" />
            <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-[8px] font-black uppercase tracking-[0.19em] text-transparent">
              Exismic Ai Studio
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
