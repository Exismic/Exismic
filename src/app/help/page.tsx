"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Mail, HelpCircle, Sparkles, Send, Zap, Shield, User, FileText, AlignLeft } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 overflow-hidden" suppressHydrationWarning>
      {/* Cinematic Background Architecture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.08)_0%,transparent_70%)]" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-accent-purple/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-accent-cyan/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>
      
      <main className="max-w-6xl mx-auto px-6 pt-32 space-y-24 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Support / Back
        </Link>

        <header className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 text-accent-purple"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-accent-purple/20 blur-xl animate-pulse" />
              <HelpCircle size={32} className="relative z-10 animate-pulse drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
            </div>
            <div className="h-px w-24 bg-linear-to-r from-accent-purple/50 to-transparent" />
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter uppercase italic leading-[0.8] select-none">
              Get <br />
              <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,#c084fc_0%,#ffffff_45%,#a855f7_55%,#ffffff_100%)] bg-[length:200%_100%] animate-[shine_4s_linear_infinite] drop-shadow-[0_2px_15px_rgba(168,85,247,0.4)]">Help.</span>
            </h1>
            <p className="text-zinc-500 font-medium text-xl max-w-xl leading-relaxed">
              Our team of specialists is standing by to ensure your creative flow remains uninterrupted.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 relative group p-8 sm:p-12 rounded-[3rem] bg-[#0b0c12]/80 backdrop-blur-2xl border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-700 hover:border-accent-purple/30"
          >
            {/* Animated Glow Behind Form */}
            <div className="absolute inset-0 bg-linear-to-br from-accent-purple/10 via-transparent to-accent-cyan/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -inset-[100%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,rgba(168,85,247,0.1)_25%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 space-y-10">
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-white/50 italic tracking-tighter uppercase">Send a Request</h2>
                <p className="text-zinc-400 font-medium text-sm">We'll get back to you as soon as possible.</p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as HTMLFormElement;
                  const btn = target.querySelector('button[type="submit"]') as HTMLButtonElement;
                  btn.innerHTML = '<span class="flex items-center gap-2"><svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending Transmission...</span>';
                  btn.disabled = true;
                  setTimeout(() => {
                    target.innerHTML = '<div class="flex flex-col items-center justify-center space-y-6 py-16"><div class="relative w-24 h-24"><div class="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div><div class="relative w-full h-full rounded-full border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-emerald-400"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div></div><div class="text-center space-y-2"><p class="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-emerald-500 uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">Transmission Sent</p><p class="text-zinc-400 font-medium">Our specialists will review your request shortly.</p></div></div>';
                  }, 1500);
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-2 relative group/input">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-colors group-focus-within/input:text-accent-purple">Name</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-zinc-600 transition-colors group-focus-within/input:text-accent-purple group-focus-within/input:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                        <User size={18} />
                      </div>
                      <input required type="text" placeholder="John Doe" className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-medium text-white placeholder-zinc-700 outline-none focus:border-accent-purple/50 focus:bg-accent-purple/[0.05] focus:ring-4 focus:ring-accent-purple/10 transition-all" />
                    </div>
                  </div>
                  
                  {/* Email Input */}
                  <div className="space-y-2 relative group/input">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-colors group-focus-within/input:text-accent-purple">Email Address</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-zinc-600 transition-colors group-focus-within/input:text-accent-purple group-focus-within/input:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                        <Mail size={18} />
                      </div>
                      <input required type="email" placeholder="john@example.com" className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-medium text-white placeholder-zinc-700 outline-none focus:border-accent-purple/50 focus:bg-accent-purple/[0.05] focus:ring-4 focus:ring-accent-purple/10 transition-all" />
                    </div>
                  </div>
                </div>
                
                {/* Subject Dropdown */}
                <div className="space-y-2 relative group/input">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-colors group-focus-within/input:text-accent-purple">Subject</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-zinc-600 transition-colors group-focus-within/input:text-accent-purple group-focus-within/input:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] pointer-events-none z-10">
                      <FileText size={18} />
                    </div>
                    <select className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-10 text-sm font-medium text-white outline-none focus:border-accent-purple/50 focus:bg-accent-purple/[0.05] focus:ring-4 focus:ring-accent-purple/10 transition-all appearance-none cursor-pointer relative z-0">
                      <option value="support" className="bg-[#0b0c12]">General Support</option>
                      <option value="billing" className="bg-[#0b0c12]">Billing Inquiry</option>
                      <option value="bug" className="bg-[#0b0c12]">Bug Report</option>
                      <option value="feature" className="bg-[#0b0c12]">Feature Request</option>
                    </select>
                    {/* Custom Dropdown Arrow */}
                    <div className="absolute right-4 pointer-events-none text-zinc-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="space-y-2 relative group/input">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-colors group-focus-within/input:text-accent-purple">Message</label>
                  <div className="relative">
                    <div className="absolute left-4 top-5 text-zinc-600 transition-colors group-focus-within/input:text-accent-purple group-focus-within/input:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                      <AlignLeft size={18} />
                    </div>
                    <textarea required placeholder="How can we help you today?" className="w-full h-40 bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 pt-5 pb-4 text-sm font-medium text-white placeholder-zinc-700 outline-none focus:border-accent-purple/50 focus:bg-accent-purple/[0.05] focus:ring-4 focus:ring-accent-purple/10 transition-all resize-none"></textarea>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="relative group/btn w-full h-16 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]">
                    {/* Animated button background sweep */}
                    <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(168,85,247,0)_0%,rgba(168,85,247,0.3)_50%,rgba(168,85,247,0)_100%)] bg-[length:200%_100%] animate-[shine_3s_linear_infinite] group-hover/btn:bg-[linear-gradient(110deg,rgba(168,85,247,0.4)_0%,rgba(168,85,247,0.8)_50%,rgba(168,85,247,0.4)_100%)] transition-colors duration-500" />
                    <div className="absolute inset-0 bg-accent-purple/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                    
                    <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
                      Submit Request <MessageSquare size={16} className="text-accent-purple group-hover/btn:text-white transition-colors" />
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Email Support Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 relative group p-8 sm:p-12 rounded-[3rem] glass-dark border border-white/5 overflow-hidden transition-all duration-700 hover:border-white/20 flex flex-col justify-center"
          >
            <div className="absolute inset-0 bg-linear-to-br from-accent-cyan/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10 space-y-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shadow-[0_0_40px_rgba(34,211,238,0.15)] group-hover:scale-110 transition-transform duration-500">
                <Mail size={36} />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Support Mail</h2>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed">
                  Detailed inquiries or bug reports. We guarantee a response within <span className="text-white">24 business hours</span>.
                </p>
              </div>
              <a 
                href="mailto:support@exismicai.online"
                className="w-full h-16 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all flex items-center justify-center gap-3 break-all px-2"
              >
                support@exismicai.online <Send size={14} className="shrink-0" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section with Premium Styling */}
        <section className="space-y-16">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-600">Common Questions</h2>
            <div className="h-px flex-1 mx-12 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { q: "How do I upgrade to Pro?", a: "Access the Pricing page or visit your Account Settings to upgrade instantly.", icon: Sparkles },
              { q: "What files are supported?", a: "We support all major image, audio, and document formats with high-fidelity output.", icon: Zap },
              { q: "Is my data secure?", a: "Yes. All processing is transient and encrypted. Your original files are never permanently stored.", icon: Shield }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-[2.5rem] glass-dark border border-white/5 space-y-6"
              >
                <faq.icon size={20} className="text-accent-purple" />
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{faq.q}</h3>
                  <p className="text-zinc-500 font-medium text-sm leading-relaxed">{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
