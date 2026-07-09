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
            <p className="text-xl text-zinc-300 font-medium leading-relaxed mb-10">
              The modern creative process is broken. We bounce between tabs, juggle subscriptions, and constantly interrupt our flow state to deal with cluttered interfaces. Today, we're changing that. <strong>Welcome to Exismic.</strong>
            </p>
            
            <h2 className="text-3xl text-white mt-16 mb-6">Power Without the Clutter</h2>
            <p>
              Exismic is built on a single, uncompromising philosophy: every pixel on your screen must earn its place. We've stripped away the noise and combined the absolute best of AI tooling into a single, unified workspace. Whether you're generating images, removing backgrounds, or writing code, Exismic gets out of your way and lets you create.
            </p>
            
            <blockquote className="border-l-4 border-cyan-400 pl-6 my-10 italic text-zinc-400 bg-white/[0.02] py-4 pr-6 rounded-r-2xl">
              "We didn't just want to build another AI tool. We wanted to build the last AI workspace you'll ever need to subscribe to."
            </blockquote>

            <h2 className="text-3xl text-white mt-16 mb-6">Everything You Need, In One Place</h2>
            <p>
              With the launch of Exismic, we are rolling out a suite of elite tools designed specifically for high-end creative work.
            </p>
            
            <ul className="space-y-4 my-8 list-none pl-0">
              <li className="flex items-start gap-4 p-5 rounded-2xl bg-[#050508]/80 border border-white/5 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-cyan-300 font-black text-xl">1</span>
                </div>
                <div>
                  <strong className="block text-white mb-1">4K-Ready Exports</strong>
                  Keep detail intact. We ensure that when supported tools produce high-resolution output, you can actually use it for professional work.
                </div>
              </li>
              <li className="flex items-start gap-4 p-5 rounded-2xl bg-[#050508]/80 border border-white/5 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-purple-300 font-black text-xl">2</span>
                </div>
                <div>
                  <strong className="block text-white mb-1">Unlimited AI Conversations</strong>
                  Think, refine, and build without a daily message ceiling. Your creative flow shouldn't be interrupted by a rate limit.
                </div>
              </li>
              <li className="flex items-start gap-4 p-5 rounded-2xl bg-[#050508]/80 border border-white/5 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-emerald-300 font-black text-xl">3</span>
                </div>
                <div>
                  <strong className="block text-white mb-1">Code and Creative Power Together</strong>
                  Use the same membership across Exismic AI, Code Studio, and Pro tools. It's the ultimate toolkit for the modern builder.
                </div>
              </li>
            </ul>

            <h2 className="text-3xl text-white mt-16 mb-6">Commercial Usage Rights</h2>
            <p>
              When you upgrade to Exismic Pro, you aren't just getting better tools—you're getting a business partner. We include full commercial usage rights, allowing you to use eligible Pro outputs for brands, client work, and paid projects without hesitation. 
            </p>

            <h2 className="text-3xl text-white mt-16 mb-6">The Road Ahead</h2>
            <p>
              This is just day one. We are already hard at work on the next generation of Exismic tools, including exclusive themes, avatar frames, and animated identity styles for Pro members. 
            </p>
            <p>
              Thank you for joining us on this journey. We can't wait to see what you create.
            </p>
          </>
        )}
      </main>

      {/* Footer Newsletter */}
      <section className="max-w-4xl mx-auto px-6 mt-20">
        <div className="relative overflow-hidden rounded-[3rem] border border-white/[0.08] bg-[#050508]/80 shadow-2xl p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(124,58,237,0.15),transparent_60%)] pointer-events-none" />
          
          <div className="relative z-10 max-w-lg mx-auto">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white">Join the Journal</h3>
            <p className="text-zinc-400 text-sm font-medium mb-10">Get the latest updates, tutorials, and early access to new Exismic features delivered straight to your inbox.</p>
            
            {status === 'success' ? (
              <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="text-emerald-400 font-black uppercase tracking-widest text-[11px] mb-2">Subscribed successfully</h4>
                <p className="text-emerald-200/70 text-sm font-medium">Keep an eye on your inbox for the next edition!</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-emerald-600/20 blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                <div className="relative flex flex-col sm:flex-row gap-3 p-2 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-2xl">
                  <div className="flex-1 flex items-center px-4">
                    <Mail className="text-zinc-500 shrink-0" size={16} />
                    <input 
                      type="email" 
                      placeholder="Enter email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-600 text-sm font-medium ml-3 h-12"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 h-12 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    {status === 'loading' ? <Loader2 className="animate-spin w-4 h-4" /> : "Subscribe"}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-red-400 text-[10px] font-bold mt-4 uppercase tracking-widest">{errorMessage}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
