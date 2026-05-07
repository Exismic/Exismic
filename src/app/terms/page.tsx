import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back Home
        </Link>
        
        <div className="space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
            <FileText size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">
            Terms of <span className="gradient-text">Service.</span>
          </h1>
          <p className="text-zinc-500 font-medium text-xl">Effective Date: April 23, 2026</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-400">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">1. Acceptance of Terms</h2>
            <p>By accessing or using Lumora, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">2. User Responsibilities</h2>
            <p>You are responsible for the content you upload and process through Lumora. You agree not to use the service for any illegal or unauthorized purposes.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">3. Limitation of Liability</h2>
            <p>Lumora is provided "as is" without any warranties. We shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our service.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
