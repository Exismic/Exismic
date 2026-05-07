"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Scale, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32">
      <main className="max-w-4xl mx-auto px-6 pt-32 space-y-20 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Legal / Back
        </Link>

        <header className="space-y-6">
          <div className="flex items-center gap-4 text-accent-purple">
            <Scale size={32} />
            <div className="h-px w-20 bg-accent-purple/20" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]">
            Terms of <span className="gradient-text">Service.</span>
          </h1>
          <p className="text-zinc-500 font-medium text-xl max-w-xl">
            The agreement between you and Lumora regarding the use of our intelligence platform.
          </p>
        </header>

        <div className="p-10 md:p-16 rounded-[3rem] glass-dark border border-white/5 space-y-12 text-zinc-400 font-medium leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">1. Acceptance of Terms</h2>
            <p>By accessing or using Lumora, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">2. User Conduct</h2>
            <div className="space-y-4">
              <p>You agree not to use the platform for any illegal or unauthorized purpose. Prohibited activities include:</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                   <AlertCircle size={14} className="text-accent-purple" />
                   <span>Attempting to reverse engineer AI models</span>
                </li>
                <li className="flex items-center gap-3">
                   <AlertCircle size={14} className="text-accent-purple" />
                   <span>Automated scraping of our node network</span>
                </li>
                <li className="flex items-center gap-3">
                   <AlertCircle size={14} className="text-accent-purple" />
                   <span>Uploading malicious content</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">3. Intellectual Property</h2>
            <p>You retain all rights to the content you create using Lumora. Lumora retains all rights to the underlying technology, AI models, and interface designs.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">4. Limitation of Liability</h2>
            <p>Lumora is provided "as is" without warranty of any kind. We shall not be liable for any damages arising from your use of the platform.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
