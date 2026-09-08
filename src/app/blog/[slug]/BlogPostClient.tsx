"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2, Mail, Loader2, ShieldCheck, Zap, Compass, Flame, Gift, ArrowRight, ExternalLink, CheckCircle2, Sliders, Layers, CircleUser, Type, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BlogPostMetadata } from '@/lib/blog-data';
import { SparkIcon } from '@/components/ui/SparkIcon';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

export function BlogPostClient({ post }: { post: BlogPostMetadata }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already_subscribed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const supabase = createClient();

  const isSavedLocally = (mail: string) => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = JSON.parse(localStorage.getItem('exismic_journal_subscribers') || '[]');
      return Array.isArray(saved) && saved.includes(mail.trim().toLowerCase());
    } catch {
      return false;
    }
  };

  const markSavedLocally = (mail: string) => {
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(localStorage.getItem('exismic_journal_subscribers') || '[]');
      const normalized = mail.trim().toLowerCase();
      if (!saved.includes(normalized)) {
        saved.push(normalized);
        localStorage.setItem('exismic_journal_subscribers', JSON.stringify(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;

    if (isSavedLocally(normalized)) {
      setStatus('already_subscribed');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized, source: 'blog_footer' }),
      });

      const data = await res.json();
      markSavedLocally(normalized);

      if (data.alreadySubscribed) {
        setStatus('already_subscribed');
      } else {
        setStatus('success');
      }
    } catch (err: any) {
      console.error(err);
      markSavedLocally(normalized);
      setStatus('success');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 selection:bg-purple-500/30 overflow-x-hidden font-sans pb-32">
      {/* Article Header */}
      <header className="relative pt-32 pb-24 overflow-hidden border-b border-white/[0.05]">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className={cn("absolute inset-0 opacity-40", post.coverImage)} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020202] to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/blog')}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all mb-12 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Journal
          </motion.button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-[10px] font-black uppercase tracking-widest mb-6">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] mb-8">
              {post.title}
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mb-10">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-white/10">
              <Link
                href={(post.author as any).username ? `/u/${(post.author as any).username}` : '#'}
                className="flex items-center gap-4 group/author cursor-pointer"
              >
                <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full border border-white/20 group-hover/author:border-cyan-400/50 transition-colors" />
                <div>
                  <h4 className="text-sm font-black text-white group-hover/author:text-cyan-300 transition-colors">{post.author.name}</h4>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.publishedAt}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                  </div>
                </div>
              </Link>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-[10px] font-black uppercase tracking-widest text-zinc-300"
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-3xl mx-auto px-6 py-20 prose prose-invert prose-lg prose-headings:font-black prose-headings:tracking-tight prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-p:text-zinc-300 prose-p:leading-relaxed prose-li:text-zinc-300">
        {post.slug === 'exismic-1-6-release' && (
          <>
            <p className="text-xl sm:text-2xl text-zinc-200 font-medium leading-relaxed mb-14">
              Today, we are delighted to introduce <strong className="text-white">Exismic 1.6</strong>—a transformative update built around creator progression, effortless workspace navigation, daily consistency protection, and comprehensive platform refinements.
            </p>

            {/* Section 1: Sparks Meta-Currency */}
            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-500 mt-20 mb-8 flex items-center gap-3">
              <SparkIcon size={32} variant="amber" />
              A New Creator Economy: Introducing Exismic Sparks
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              When we first introduced the Quests system in version 1.5, daily and weekly tasks directly rewarded standard generation credits. While helpful, combining compute allowances with gamified engagement points created friction and limited how we could reward long-term community dedication.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              With Exismic 1.6, we have established a clear, balanced distinction between compute fuel and creator prestige by introducing <strong className="text-white">Exismic Sparks (⚡)</strong>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 not-prose">
              <div className="p-6 rounded-3xl bg-[#080910] border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Generation Credits</h3>
                    <p className="text-[11px] text-cyan-400 font-semibold uppercase tracking-widest">Compute Fuel</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Your dedicated fuel for generating imagery, running creative transformations, converting files, and operating our specialized AI tools. Refreshes daily or expands with permanent packs.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#080910] border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                    <SparkIcon size={20} variant="amber" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Exismic Sparks</h3>
                    <p className="text-[11px] text-amber-400 font-semibold uppercase tracking-widest">Creator Meta-Currency</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Earned through consistency and creativity. Complete daily directives, conquer weekly masteries, and redeem your Sparks for profile cosmetics, streak shields, and real-money vouchers.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight mt-12 mb-4">
              How You Earn Sparks
            </h3>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              You can earn Sparks every single day simply by engaging with the studio:
            </p>
            <ul className="space-y-4 my-6">
              <li className="flex items-start gap-3 text-zinc-300">
                <CheckCircle2 size={20} className="text-amber-400 shrink-0 mt-1" />
                <span><strong className="text-white">Daily Directives:</strong> Four quick creative tasks that rotate every 24 hours, rewarding 10 to 25 Sparks each.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <CheckCircle2 size={20} className="text-amber-400 shrink-0 mt-1" />
                <span><strong className="text-white">Weekly Masteries:</strong> Deeper creative goals that reset every Monday, offering generous 50 to 100 Sparks rewards.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <CheckCircle2 size={20} className="text-amber-400 shrink-0 mt-1" />
                <span><strong className="text-white">Community Bonus Drops:</strong> Special celebrations, platform milestones, and seasonal rewards.</span>
              </li>
            </ul>

            <h3 className="text-2xl font-black text-white tracking-tight mt-12 mb-4">
              Unlocking Rewards in the Sparks Shop
            </h3>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              Head over to the new <Link href="/rewards" className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4">Sparks Rewards Shop</Link> to spend your earnings across a curated selection of rewards:
            </p>
            <ul className="space-y-4 my-6">
              <li className="flex items-start gap-3 text-zinc-300">
                <CircleUser size={20} className="text-purple-400 shrink-0 mt-1" />
                <span><strong className="text-white">Animated Avatar Frames:</strong> Over 20 handcrafted holographic borders, neon rings, and cyberpunk frames to customize your profile avatar.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <Type size={20} className="text-cyan-400 shrink-0 mt-1" />
                <span><strong className="text-white">Illuminated Glowing Names:</strong> Dynamic color gradients that illuminate your username across studio headers, comments, and leaderboards.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <Crown size={20} className="text-pink-400 shrink-0 mt-1" />
                <span><strong className="text-white">Creator Insignias & Themes:</strong> Prestige title crests placed beside your name, paired with ambient studio background themes.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-1" />
                <span><strong className="text-white">Streak Freeze Shields:</strong> Safeguard your hard-earned daily streaks against missed days.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <Gift size={20} className="text-amber-400 shrink-0 mt-1" />
                <span><strong className="text-white">Real-Money Shop Vouchers:</strong> Redeem single-use discount vouchers (such as ₹100 / $1.50 OFF or 20% off Pro passes) to use directly at checkout.</span>
              </li>
            </ul>

            <div className="my-10 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 not-prose">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                  <SparkIcon size={22} variant="amber" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white mb-1">Currencies Policy & Earning Guide</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                    Want to learn the exact mechanics of daily refresh cycles, lifetime reserves, and our strict fair-play rules? Review our official documentation.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider">
                    <Link href="/rewards/guide" className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors">
                      Read Sparks & Rewards Guide <ArrowRight size={12} />
                    </Link>
                    <Link href="/terms-of-service" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
                      Terms of Service (Section 6 & 7) <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Executive Studio Cockpit */}
            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-500 mt-20 mb-8 flex items-center gap-3">
              <Compass size={32} className="text-cyan-400" />
              Executive Studio Cockpit: A Redesigned Dashboard
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              Creators spend the majority of their time moving between creative ideas and tools. Your main interface should be an intuitive mission control, not a cluttered directory.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-8">
              In version 1.6, we completely restructured the home dashboard into the <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4">Executive Studio Cockpit</Link>:
            </p>

            <ul className="space-y-6 my-12 list-none pl-0 not-prose">
              <li className="p-8 rounded-[2.5rem] bg-[#05060b] border border-white/5 hover:border-cyan-500/20 transition-all duration-300 shadow-xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Sliders size={20} />
                  </div>
                  <strong className="text-xl font-black text-white">Live Creator Vitals HUD</strong>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Positioned right below your personalized time-of-day greeting, four vital stats cards display your remaining Generation Credits, active Daily Quest Streak, total tools explored, and active membership tier.
                </p>
              </li>

              <li className="p-8 rounded-[2.5rem] bg-[#05060b] border border-white/5 hover:border-cyan-500/20 transition-all duration-300 shadow-xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Zap size={20} />
                  </div>
                  <strong className="text-xl font-black text-white">'Continue Using' Launchpad</strong>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  A high-visibility showcase card at the top of your workspace allows you to resume your most recent session with a single click. No searching or navigating menus required.
                </p>
              </li>

              <li className="p-8 rounded-[2.5rem] bg-[#05060b] border border-white/5 hover:border-cyan-500/20 transition-all duration-300 shadow-xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Compass size={20} />
                  </div>
                  <strong className="text-xl font-black text-white">Curated Workstations & Smart Discovery</strong>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Your pinned Favorites and Recently Used studios are organized into clean four-column responsive grids with glowing borders. Below them, our recommendation engine pairs complementary tools based on your recent activity.
                </p>
              </li>
            </ul>

            <blockquote className="relative my-16 overflow-hidden rounded-[2.5rem] border border-cyan-400/20 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.12),transparent_60%),rgba(255,255,255,0.02)] p-8 sm:p-12 shadow-2xl">
              <div className="absolute -left-2 top-1/2 h-20 w-1.5 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.8)]" />
              <p className="text-xl sm:text-2xl font-black italic leading-tight tracking-tight text-cyan-50">
                "Our philosophy for Exismic 1.6 was straightforward: give creators clear goals with Sparks, protect their consistency, and make launching any studio instantaneous."
              </p>
            </blockquote>

            {/* Section 3: Streak Freeze Shields */}
            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-orange-500 mt-20 mb-8 flex items-center gap-3">
              <Flame size={32} className="text-orange-400" />
              Streak Freeze Shields & The 30-Day Milestone Journey
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              Building a daily creative habit should feel empowering, not punitive. We know that real life, travel, and busy days happen.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              With Exismic 1.6, you can now equip <strong className="text-white">Streak Freeze Shields</strong> to protect your hard-earned streaks:
            </p>

            <div className="p-8 rounded-[2.5rem] bg-[#07080f] border border-orange-500/20 shadow-xl my-8 not-prose">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={24} className="text-orange-400" />
                <h4 className="text-lg font-black text-white uppercase tracking-wider">How Streak Shields Work</h4>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                You can hold up to 3 armed shields in your inventory. If you miss a calendar day, an armed shield automatically triggers when you next log in, preserving your streak without losing momentum.
              </p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Shields can be equipped in the Sparks Rewards Shop or earned automatically as rewards along the streak quest roadmap.
              </p>
            </div>

            <p className="text-lg text-zinc-300 leading-relaxed mb-4">
              Maintaining your streak unlocks progressive milestone perks:
            </p>
            <ul className="space-y-4 my-6">
              <li className="flex items-start gap-3 text-zinc-300">
                <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs shrink-0 mt-0.5">3d</span>
                <span><strong className="text-white">Day 3 (Bronze):</strong> +25 bonus credits and an elevated floor on all subsequent daily rolls.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <span className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-xs shrink-0 mt-0.5">7d</span>
                <span><strong className="text-white">Day 7 (Silver):</strong> +75 bonus credits and +1 free Streak Freeze Shield added straight to your inventory.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <span className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-xs shrink-0 mt-0.5">14d</span>
                <span><strong className="text-white">Day 14 (Gold):</strong> +150 bonus credits and doubled odds for rare, epic, and legendary drops in the Daily Vault.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs shrink-0 mt-0.5">30d</span>
                <span><strong className="text-white">Day 30 (Mythic):</strong> +500 permanent Lifetime Credits that never expire or reset at midnight.</span>
              </li>
            </ul>

            {/* Section 4: Streamlined Tool Headers */}
            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-500 mt-20 mb-8 flex items-center gap-3">
              <Layers size={32} className="text-purple-400" />
              Streamlined Tool Headers & Visual Polish
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              We redesigned the top header and action bars across all 117+ creative tools. The new layouts feature an obsidian glass aesthetic with high-contrast typography and subtle hairline borders that keep your canvas in primary focus.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              We also added custom bespoke iconography—such as a dedicated Creeper insignia for Minecraft skin creators—replacing generic icons with imagery tailored to each specific craft.
            </p>

            {/* Section 5: Exismic Cloud Drive & Tool Pipelines */}
            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-emerald-500 mt-20 mb-8 flex items-center gap-3">
              <Gift size={32} className="text-emerald-400" />
              Exismic Cloud Drive & Instant Tool Pipelines
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              Your past outputs are now organized and ready in the <Link href="/library" className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4">Exismic Cloud Drive</Link>. Free members enjoy 50 MB of cloud storage with automatic image compression, while Pro members receive an expansive 5 GB vault.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              Even better, our new <strong className="text-white">Quick Action Pipelines</strong> eliminate the tedious cycle of downloading an image just to re-upload it to another tool. With a single click, you can pass an AI-generated artwork directly into the Background Remover, send a cutout to the Meme Studio, or compress a final graphic for web publishing.
            </p>

            {/* Section 6: Sound Design & Bug Fixes */}
            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mt-20 mb-8">
              Audio Synthesis & Platform Bug Fixes
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              In addition to our headline features, Exismic 1.6 resolves numerous community-reported bugs and polish details:
            </p>
            <ul className="space-y-4 my-6">
              <li className="flex items-start gap-3 text-zinc-300">
                <CheckCircle2 size={20} className="text-cyan-400 shrink-0 mt-1" />
                <span><strong className="text-white">Melodic Audio Synthesizer:</strong> Replaced the harsh buzzer tone during Daily Vault unboxings with warm, harmonious risers and celebratory sound cues.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <CheckCircle2 size={20} className="text-cyan-400 shrink-0 mt-1" />
                <span><strong className="text-white">Instant Balance & Streak Sync:</strong> Fixed synchronization delays so your credit allowance, streak count, and quest completions update immediately across all open tabs.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <CheckCircle2 size={20} className="text-cyan-400 shrink-0 mt-1" />
                <span><strong className="text-white">100% Watermark-Free Downloads:</strong> All creative tool exports are completely clean and unbranded for both free and Pro accounts.</span>
              </li>
              <li className="flex items-start gap-3 text-zinc-300">
                <CheckCircle2 size={20} className="text-cyan-400 shrink-0 mt-1" />
                <span><strong className="text-white">Responsive Interface Polish:</strong> Optimized modal scrolling, eliminated text clipping on headings, and polished mobile drawers across all screen sizes.</span>
              </li>
            </ul>

            {/* Closing */}
            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mt-20 mb-8">
              Experience Exismic 1.6 Today
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              Every feature in Exismic 1.6 is live right now across the platform. Log in to your <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4">Dashboard</Link>, check your active Daily Directives, explore the <Link href="/rewards" className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4">Sparks Shop</Link>, and claim your rewards.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed">
              Thank you for creating with Exismic. We look forward to seeing what you produce with version 1.6!
            </p>
          </>
        )}

        {post.slug === 'exismic-1-5-release' && (
          <>
            <p className="text-xl sm:text-2xl text-zinc-300 font-medium leading-relaxed mb-14">
              Today marks an exciting milestone for our community. We are officially releasing <strong className="text-white">Exismic 1.5</strong>—an update focused on empowering your creative journey, opening our ecosystem to developers, giving you new ways to earn and share credits, and delivering a thoroughly refined user experience.
            </p>

            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mt-20 mb-8">
              Daily & Weekly Quests: Earn Credits While You Create
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              We believe that using creative tools should be rewarding. With Exismic 1.5, we are introducing an all-new <strong className="text-white">Quests system</strong> designed to reward your everyday exploration across the studio.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-8">
              Whether you are generating new imagery, perfecting visual assets, or testing different tools, you can now complete rotating daily and weekly milestones to earn bonus credits. It provides an engaging and natural way to keep your creative momentum going without having to worry about running low on allowances.
            </p>

            <blockquote className="relative my-16 overflow-hidden rounded-[2.5rem] border border-purple-400/20 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.12),transparent_60%),rgba(255,255,255,0.02)] p-8 sm:p-12 shadow-2xl">
              <div className="absolute -left-2 top-1/2 h-20 w-1.5 -translate-y-1/2 rounded-full bg-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.8)]" />
              <p className="text-xl sm:text-3xl font-black italic leading-tight tracking-tight text-purple-50">
                "Our goal with 1.5 was simple: reward creators for their everyday work, open our capabilities to builders everywhere, and elevate the feel of every single screen."
              </p>
            </blockquote>

            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mt-20 mb-8">
              Developer API: Integrate Exismic Anywhere
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              For builders and software teams, we are opening our doors. Developers can now generate official API keys directly from their Exismic account and bring our generation and processing capabilities into their own applications, websites, and automated workflows.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-8">
              With straightforward integration options and thorough documentation, bringing the speed and quality of Exismic to your custom projects is now simpler than ever.
            </p>

            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mt-20 mb-8">
              Yearly Pro Subscriptions & Creative Gifting
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              To give creators greater flexibility and value, Exismic Pro is now available with an <strong className="text-white">annual subscription plan</strong>. Members who prefer a single, uninterrupted yearly plan can now enjoy uninterrupted premium features, higher allowances, and exclusive perks with substantial annual savings.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-8">
              Alongside yearly memberships, we are introducing our new <strong className="text-white">Gifting system</strong>. You can now gift credits as well as full Exismic Pro memberships directly to friends, collaborators, or team members—making it easy to support other creators and collaborate with full access.
            </p>

            <ul className="space-y-6 my-12 list-none pl-0">
              <li className="group relative flex flex-col sm:flex-row items-start gap-6 p-8 rounded-[2.5rem] bg-[#030305]/80 border border-white/5 shadow-2xl transition-all duration-500 hover:bg-white/[0.02] hover:border-white/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 p-[2px] shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#050508]">
                    <span className="bg-gradient-to-br from-purple-300 to-indigo-400 bg-clip-text text-xl font-black text-transparent">✦</span>
                  </div>
                </div>
                <div className="relative z-10">
                  <strong className="block text-xl font-black tracking-tight text-white mb-2">Annual Savings</strong>
                  <p className="text-zinc-400 leading-relaxed m-0 text-base">Enjoy all the benefits of Exismic Pro all year long with our most cost-effective membership tier to date.</p>
                </div>
              </li>
              <li className="group relative flex flex-col sm:flex-row items-start gap-6 p-8 rounded-[2.5rem] bg-[#030305]/80 border border-white/5 shadow-2xl transition-all duration-500 hover:bg-white/[0.02] hover:border-white/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-600 p-[2px] shadow-[0_0_30px_rgba(244,63,94,0.2)] group-hover:shadow-[0_0_40px_rgba(244,63,94,0.4)] transition-all">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#050508]">
                    <span className="bg-gradient-to-br from-pink-300 to-rose-400 bg-clip-text text-xl font-black text-transparent">♥</span>
                  </div>
                </div>
                <div className="relative z-10">
                  <strong className="block text-xl font-black tracking-tight text-white mb-2">Gift Credits & Memberships</strong>
                  <p className="text-zinc-400 leading-relaxed m-0 text-base">Surprise collaborators, reward community friends, or send a creative boost with instant credit gifts and giftable Pro plans.</p>
                </div>
              </li>
            </ul>

            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mt-20 mb-8">
              Visual Refinements & Enhanced Reliability
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              Alongside our major feature additions, Exismic 1.5 brings tons of UI changes across the entire interface. Workspaces now feature cleaner dark aesthetics, refined input controls, smoother transitions, and uncluttered layouts designed to keep your attention on what you create rather than on the tools around it.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-8">
              We have also resolved various bugs and errors across the platform, improving overall responsiveness and ensuring a reliable, fluid experience from the moment you sign in.
            </p>

            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mt-20 mb-8">
              Experience Exismic 1.5 Today
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              All of these updates are live right now. Log in to your dashboard to check your new daily quests, explore the developer section, or upgrade your plan.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed">
              Thank you for being part of the Exismic community. We cannot wait to see everything you build with these new tools.
            </p>
          </>
        )}
      </main>

      {/* Footer Newsletter */}
      <section className="max-w-4xl mx-auto px-6 mt-32 mb-20 relative">
        <div className="absolute -inset-10 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-emerald-500/10 blur-3xl opacity-30 pointer-events-none" />
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-[#060608]/90 shadow-[0_0_80px_rgba(0,0,0,0.8)] p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none blur-xl" />
          <div className="absolute left-1/2 -top-24 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-500">Join the Journal</h3>
            <p className="text-zinc-400 text-base font-medium mb-12 leading-relaxed">Get the latest updates, tutorials, and early access to new Exismic features delivered straight to your inbox. No spam, ever.</p>

            {status === 'success' ? (
              <div className="p-8 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)] transform transition-all">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="text-emerald-400 font-black uppercase tracking-widest text-[12px] mb-2">Subscribed successfully</h4>
                <p className="text-emerald-200/70 text-sm font-medium">Keep an eye on your inbox for the next edition!</p>
              </div>
            ) : status === 'already_subscribed' ? (
              <div className="p-8 rounded-[2rem] bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)] transform transition-all">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="text-cyan-400 font-black uppercase tracking-widest text-[12px] mb-2">Already Subscribed!</h4>
                <p className="text-cyan-200/70 text-sm font-medium">
                  {email ? <span className="font-bold text-white">{email}</span> : 'This email'} is already on our newsletter list. We&apos;ll keep you posted!
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="relative group/form max-w-md mx-auto">
                <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 rounded-full blur-lg opacity-30 group-hover/form:opacity-60 transition duration-700" />
                <div className="relative flex flex-col sm:flex-row gap-2 p-1.5 rounded-full bg-black/80 border border-white/15 backdrop-blur-3xl shadow-2xl transition-colors focus-within:border-white/30 focus-within:bg-black/90">
                  <div className="flex-1 flex items-center px-5">
                    <Mail className="text-zinc-500 shrink-0 group-focus-within/form:text-cyan-400 transition-colors" size={18} />
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder:text-zinc-600 text-sm font-bold ml-3 h-14"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="group/btn relative overflow-hidden h-14 px-8 rounded-full bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:text-white transition-colors duration-500">
                      {status === 'loading' ? <Loader2 className="animate-spin w-4 h-4" /> : "Subscribe"}
                    </span>
                  </button>
                </div>
                {status === 'error' && (
                  <p className="absolute -bottom-8 left-0 right-0 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errorMessage}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
