"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { LumoraMark } from "@/components/ui/LumoraLogo";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { name: "All tools", href: "/tools" },
      { name: "Lumora AI", href: "/chat" },
      { name: "Support Agent", href: "/tools/support-agent" },
      { name: "Lumora Pro", href: "/pro" },
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
      { name: "About Lumora", href: "/about" },
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
                Your Lumora workspace
              </span>
            </div>
            <h2 className="mt-5 bg-[linear-gradient(100deg,#fff_0%,#f5f3ff_46%,#d8b4fe_72%,#a5f3fc_100%)] bg-clip-text text-[clamp(2.25rem,5vw,4.5rem)] font-black leading-[0.92] tracking-[-0.045em] text-transparent">
              Make something worth shipping.
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-zinc-500 sm:text-base">
              Create, refine, and deliver from one focused workspace built for practical AI work.
            </p>
          </div>

          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
            className="w-full md:w-[292px] md:justify-self-end"
          >
            <Link
              href={session ? "/" : "/auth/login"}
              className="group/launch relative isolate flex h-[72px] w-full overflow-hidden rounded-[18px] p-px shadow-[0_20px_55px_rgba(0,0,0,0.42),0_0_30px_rgba(124,58,237,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
            >
              <motion.span
                aria-hidden="true"
                className="absolute -inset-[130%] bg-[conic-gradient(from_20deg,transparent_0deg,#7c3aed_74deg,#e879f9_122deg,#22d3ee_178deg,transparent_245deg)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative flex h-full w-full items-center gap-3 rounded-[17px] border border-white/[0.07] bg-[#08080d]/96 px-3.5 backdrop-blur-2xl">
                <LumoraMark size={36} />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-white">
                    {session ? "Open Lumora" : "Enter Lumora"}
                  </span>
                  <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-600 transition-colors group-hover/launch:text-zinc-400">
                    Creative workspace
                  </span>
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-400 transition-all duration-300 group-hover/launch:border-cyan-300/25 group-hover/launch:bg-cyan-300/[0.07] group-hover/launch:text-cyan-200 group-hover/launch:shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover/launch:translate-x-1" />
                </span>
                <span className="pointer-events-none absolute inset-y-0 -left-16 w-9 skew-x-[-18deg] bg-white/12 blur-sm transition-transform duration-1000 group-hover/launch:translate-x-[360px]" />
              </span>
            </Link>
          </motion.div>
        </motion.section>

        <div className="grid gap-12 py-14 md:grid-cols-[1.1fr_1.9fr] md:py-18 lg:gap-20">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <LumoraMark size={42} />
              <div>
                <p className="text-lg font-black tracking-[-0.02em] text-white">
                  Lumora<span className="text-cyan-300">.</span>
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
              Built and operated by Raxstdioz LLC
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

        <div className="relative flex flex-col gap-5 border-t border-white/[0.07] py-7 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-700">
            &copy; 2026 Raxstdioz LLC. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-end">
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
            <span className="bg-linear-to-r from-purple-300 to-cyan-300 bg-clip-text text-[8px] font-black uppercase tracking-[0.19em] text-transparent">
              Lumora AI Studio
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
