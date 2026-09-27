"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Terminal,
  Key,
  Layers,
  ArrowRight,
  BookOpen,
  Zap,
  Globe,
  Lock,
  Cpu,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { ExismicMark } from "@/components/ui/ExismicLogo";

const API_SAMPLE = `curl -X POST "https://api.exismic.xyz/v1/tools/image-eraser" \\
  -H "Authorization: Bearer YOUR_EXISMIC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageUrl": "https://example.com/photo.jpg",
    "maskMode": "auto-cutout"
  }'`;

const API_PERKS = [
  {
    icon: Zap,
    title: "Instant Edge Execution",
    desc: "Run background removals, format conversions, and text rewrites in under 1.5 seconds.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Key,
    title: "Simple Bearer Token Auth",
    desc: "Generate and rotate API keys instantly with granular tool permissions and custom spend limits.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Globe,
    title: "Global High Concurrency",
    desc: "Scale from 10 requests to 100,000 daily calls backed by enterprise cloud workers.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Predictable Token Billing",
    desc: "Consume your standard generation credits or pay-as-you-go volume rates with zero monthly lock-in.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

export default function DeveloperHubClient() {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(API_SAMPLE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[25%] w-[650px] h-[650px] bg-cyan-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[700px] h-[700px] bg-purple-500/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      <main className="max-w-6xl mx-auto px-5 sm:px-6 pt-24 sm:pt-28 space-y-16 relative z-10">
        <PageBreadcrumb items={[{ label: "Developer Platform" }]} />

        {/* Hero Section */}
        <header className="relative w-full rounded-[2.5rem] bg-[#090a10]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 md:p-16 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-center sm:text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4 mx-auto sm:mx-0">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-wide uppercase shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Code2 size={14} className="text-cyan-300" />
              <span>Exismic Cloud REST API & SDKs</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              One unified API for{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 bg-clip-text text-transparent">
                creative & AI tools.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-medium leading-relaxed max-w-2xl">
              Integrate Exismic&apos;s background remover, image resizer, PDF processing, text humanizer, and AI generation engines directly into your applications with just a few lines of code.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <Link
                href="/developer/docs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:scale-105"
              >
                <BookOpen size={16} />
                <span>Open Interactive API Docs</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/account/api-keys"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-sm transition-colors"
              >
                <Key size={15} className="text-amber-400" />
                <span>Manage API Keys</span>
              </Link>
            </div>
          </div>
        </header>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {API_PERKS.map((perk) => {
            const Icon = perk.icon;

            return (
              <div
                key={perk.title}
                className="rounded-2xl bg-[#090a10]/70 border border-white/10 p-5 space-y-2.5 transition-all duration-300 hover:border-white/20 hover:bg-[#0c0d16]"
              >
                <div className={`p-2.5 rounded-xl ${perk.bg} ${perk.border} border ${perk.color} w-fit`}>
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{perk.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{perk.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Quickstart Code Preview Card */}
        <div className="rounded-[2.5rem] bg-[#090a10]/90 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                <Terminal size={18} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Quickstart: 10-Second API Call
                </h2>
                <p className="text-xs text-zinc-400">
                  Standard JSON payloads with clear error messages and fast responses.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-300 transition-colors self-start sm:self-auto"
            >
              {copiedCode ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy cURL</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-2xl bg-[#030306] border border-white/5 p-4 sm:p-6 overflow-x-auto font-mono text-xs text-cyan-200 leading-relaxed select-all">
            <pre>{API_SAMPLE}</pre>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-zinc-400">
            <span>Base URL: <strong className="text-white font-mono">https://api.exismic.xyz/v1</strong></span>
            <Link
              href="/developer/docs"
              className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 font-bold transition-colors"
            >
              <span>Explore all 20+ API endpoints in interactive sandbox</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Category Laser Horizon Bridge */}
        <div className="relative w-full py-8">
          <div
            className="absolute inset-0 pointer-events-none blur-xl opacity-40"
            style={{ background: "radial-gradient(ellipse at center, #06b6d4, transparent 70%)" }}
          />
          <div
            className="w-full h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.2) 15%, #06b6d4 50%, rgba(6,182,212,0.2) 85%, transparent 100%)",
            }}
          />
          <div
            className="w-1/3 mx-auto h-0.5 -mt-px blur-[1px]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)",
            }}
          />
        </div>

        {/* Bottom Helpful Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 pb-8">
          <Link href="/developer/docs" className="hover:text-cyan-300 transition-colors">
            Interactive Documentation
          </Link>
          <span>•</span>
          <Link href="/account/api-keys" className="hover:text-cyan-300 transition-colors">
            API Keys
          </Link>
          <span>•</span>
          <Link href="/terms-of-service" className="hover:text-cyan-300 transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/help" className="hover:text-cyan-300 transition-colors">
            Developer Support
          </Link>
        </div>
      </main>
    </div>
  );
}
