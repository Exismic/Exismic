import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back Home
        </Link>
        
        <div className="space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
            <Shield size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">
            Privacy <span className="gradient-text">Policy.</span>
          </h1>
          <p className="text-zinc-500 font-medium text-xl">Last updated: April 23, 2026</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-400">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">1. Information We Collect</h2>
            <p>At Lumora, we take your privacy seriously. We only collect information that is necessary to provide you with our services. This includes your email address when you create an account and any metadata required to process your files.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">2. How We Use Data</h2>
            <p>Your files are processed in real-time. We do not store your original or processed files on our servers longer than necessary to deliver the result to you. Usually, files are deleted immediately after your session ends.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">3. Data Security</h2>
            <p>We use industry-standard encryption to protect your data during transmission and at rest. Our systems are regularly audited to ensure the highest level of security for our users.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
