"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, CheckCircle2, ShieldAlert, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { submitContactRequest } from "@/app/actions/contact";
import { cn } from "@/lib/utils";

export default function AppealPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim().toLowerCase());
    formData.append("subject", "Ban Appeal");
    formData.append("message", message.trim());

    try {
      const result = await submitContactRequest(formData);
      if (result.error) {
        setErrorMsg(result.error);
        setIsSubmitting(false);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden selection:bg-red-500/30">
      {/* Cinematic Red Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.12)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_100%_100%,rgba(239,68,68,0.06)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px] z-10 space-y-6"
      >
        <Link 
          href="/auth/login" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} /> Back to Login
        </Link>

        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-red-500/20 to-transparent rounded-[2rem] pointer-events-none" />
          <div className="bg-[#0A0A0B]/90 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] relative space-y-6">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-red-500/10 blur-md animate-pulse" />
                <ShieldAlert size={22} className="relative z-10 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase italic tracking-tight text-white">Ban Appeal Center</h1>
                <p className="text-zinc-500 text-xs font-semibold">Submit a request to review your account status.</p>
              </div>
            </div>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl" />
                  <div className="relative w-full h-full rounded-full border border-red-500/30 bg-red-500/5 flex items-center justify-center text-red-400">
                    <CheckCircle2 size={36} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 uppercase italic tracking-tighter">Appeal Dispatched</p>
                  <p className="text-zinc-400 text-xs font-semibold max-w-xs leading-relaxed">
                    Your appeal has been received. Our administration board will review the case details and notify you via email shortly.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-3">
                    <AlertTriangle size={14} className="shrink-0" /> {errorMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-red-500/40 text-xs font-semibold rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Suspended Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E.G. user@example.com"
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-red-500/40 text-xs font-semibold rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Appeal Explanation</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Explain why your suspension should be lifted. Provide any relevant context..."
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-red-500/40 text-xs font-semibold rounded-xl p-4 text-white placeholder-zinc-600 outline-none resize-none leading-relaxed transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Dispatching...
                    </>
                  ) : (
                    <>
                      <Send size={13} /> Submit Ban Appeal
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
