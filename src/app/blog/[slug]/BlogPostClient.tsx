"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2, Mail, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BlogPostMetadata } from '@/lib/blog-data';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

export function BlogPostClient({ post }: { post: BlogPostMetadata }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const supabase = createClient();

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email, source: 'blog_footer', created_at: new Date().toISOString() }]);

      if (error) {
        if (error.code === '23505') {
          setStatus('success');
        } else {
          throw error;
        }
      } else {
        setStatus('success');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
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
                    <span className="flex items-center gap-1"><Calendar size={12}/> {post.publishedAt}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {post.readTime}</span>
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
        {post.slug === 'introducing-exismic' && (
          <>
            <p className="text-xl sm:text-2xl text-zinc-300 font-medium leading-relaxed mb-14">
              The modern creative process is broken. We bounce between tabs, juggle subscriptions, and constantly interrupt our flow state to deal with cluttered interfaces. Today, we're changing that. <strong className="text-white">Welcome to Exismic.</strong>
            </p>
            
            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mt-20 mb-8">Power Without the Clutter</h2>
            <p className="text-lg text-zinc-300 leading-relaxed">
              Exismic is built on a single, uncompromising philosophy: every pixel on your screen must earn its place. We've stripped away the noise and combined the absolute best of AI tooling into a single, unified workspace. Whether you're generating images, removing backgrounds, or writing code, Exismic gets out of your way and lets you create.
            </p>
            
            <blockquote className="relative my-16 overflow-hidden rounded-[2.5rem] border border-cyan-400/20 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.12),transparent_60%),rgba(255,255,255,0.02)] p-8 sm:p-12 shadow-2xl">
              <div className="absolute -left-2 top-1/2 h-20 w-1.5 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.8)]" />
              <p className="text-xl sm:text-3xl font-black italic leading-tight tracking-tight text-cyan-50">
                "We didn't just want to build another AI tool. We wanted to build the last AI workspace you'll ever need to subscribe to."
              </p>
            </blockquote>

            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mt-20 mb-8">Everything You Need, In One Place</h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-10">
              With the launch of Exismic, we are rolling out a suite of elite tools designed specifically for high-end creative work.
            </p>
            
            <ul className="space-y-6 my-10 list-none pl-0">
              <li className="group relative flex flex-col sm:flex-row items-start gap-6 p-8 rounded-[2.5rem] bg-[#030305]/80 border border-white/5 shadow-2xl transition-all duration-500 hover:bg-white/[0.02] hover:border-white/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[2px] shadow-[0_0_30px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#050508]">
                    <span className="bg-gradient-to-br from-cyan-300 to-blue-400 bg-clip-text text-xl font-black text-transparent">1</span>
                  </div>
                </div>
                <div className="relative z-10">
                  <strong className="block text-xl font-black tracking-tight text-white mb-2">4K-Ready Exports</strong>
                  <p className="text-zinc-400 leading-relaxed m-0 text-base">Keep detail intact. We ensure that when supported tools produce high-resolution output, you can actually use it for professional work.</p>
                </div>
              </li>
              <li className="group relative flex flex-col sm:flex-row items-start gap-6 p-8 rounded-[2.5rem] bg-[#030305]/80 border border-white/5 shadow-2xl transition-all duration-500 hover:bg-white/[0.02] hover:border-white/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 p-[2px] shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#050508]">
                    <span className="bg-gradient-to-br from-purple-300 to-pink-400 bg-clip-text text-xl font-black text-transparent">2</span>
                  </div>
                </div>
                <div className="relative z-10">
                  <strong className="block text-xl font-black tracking-tight text-white mb-2">Unlimited AI Conversations</strong>
                  <p className="text-zinc-400 leading-relaxed m-0 text-base">Think, refine, and build without a daily message ceiling. Your creative flow shouldn't be interrupted by a rate limit.</p>
                </div>
              </li>
              <li className="group relative flex flex-col sm:flex-row items-start gap-6 p-8 rounded-[2.5rem] bg-[#030305]/80 border border-white/5 shadow-2xl transition-all duration-500 hover:bg-white/[0.02] hover:border-white/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-[2px] shadow-[0_0_30px_rgba(52,211,153,0.2)] group-hover:shadow-[0_0_40px_rgba(52,211,153,0.4)] transition-all">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#050508]">
                    <span className="bg-gradient-to-br from-emerald-300 to-cyan-400 bg-clip-text text-xl font-black text-transparent">3</span>
                  </div>
                </div>
                <div className="relative z-10">
                  <strong className="block text-xl font-black tracking-tight text-white mb-2">Code and Creative Power Together</strong>
                  <p className="text-zinc-400 leading-relaxed m-0 text-base">Use the same membership across Exismic AI, Code Studio, and Pro tools. It's the ultimate toolkit for the modern builder.</p>
                </div>
              </li>
            </ul>

            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mt-20 mb-8">Commercial Usage Rights</h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-8">
              When you upgrade to Exismic Pro, you aren't just getting better tools—you're getting a business partner. We include full commercial usage rights, allowing you to use eligible Pro outputs for brands, client work, and paid projects without hesitation. 
            </p>

            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mt-20 mb-8">The Road Ahead</h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              This is just day one. We are already hard at work on the next generation of Exismic tools, including exclusive themes, avatar frames, and animated identity styles for Pro members. 
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed">
              Thank you for joining us on this journey. We can't wait to see what you create.
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
