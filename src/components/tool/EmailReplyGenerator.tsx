"use client";

import React, { useState } from "react";
import { 
  Mail, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  Sliders
} from "lucide-react";
import { cn } from "@/lib/utils";

type ResponseIntent = "accept" | "decline" | "followup" | "negotiate" | "info";
type ReplyTone = "professional" | "friendly" | "formal" | "assertive" | "direct";

export default function EmailReplyGenerator() {
  const [emailText, setEmailText] = useState("");
  const [intent, setIntent] = useState<ResponseIntent>("accept");
  const [tone, setTone] = useState<ReplyTone>("professional");
  const [extraNotes, setExtraNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReply, setGeneratedReply] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!emailText.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a clear email reply to the following received email:\n\n"${emailText}"\n\nIntent: ${intent}\nTone: ${tone}\nAdditional details to include: ${extraNotes}`,
          toolId: "email-reply-generator",
          systemInstruction: "You are an expert executive assistant drafting clear, professional email replies with appropriate subject lines and sign-offs."
        })
      });

      const data = await response.json();
      if (data.output || data.text) {
        setGeneratedReply(data.output || data.text);
      } else {
        setGeneratedReply(fallbackReply(intent, tone));
      }
    } catch {
      setGeneratedReply(fallbackReply(intent, tone));
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackReply = (i: ResponseIntent, t: ReplyTone) => {
    if (i === "decline") {
      return `Subject: Re: Follow-up\n\nHi,\n\nThank you for reaching out and sharing the details. Unfortunately, I won't be able to move forward with this at the moment due to prior commitments.\n\nI appreciate your time and wish you the best.\n\nBest regards,\n[Your Name]`;
    }
    return `Subject: Re: Great connecting\n\nHi,\n\nThank you for your email. I've reviewed the details and I'm happy to proceed. Let me know what the next steps are.\n\nBest regards,\n[Your Name]`;
  };

  const handleCopy = () => {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-wider">
              <Mail size={14} className="text-blue-400" />
              <span>Smart Communication</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Email Reply Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Craft perfectly tailored, professional email replies in seconds based on intent and tone.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Received Email Text
            </label>
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste the email you received here..."
              className="w-full min-h-[160px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Response Intent</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(["accept", "decline", "followup", "negotiate", "info"] as ResponseIntent[]).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIntent(i)}
                  className={cn(
                    "px-2.5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all border capitalize cursor-pointer",
                    intent === i 
                      ? "bg-blue-500/20 border-blue-400 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.25)]" 
                      : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Tone Style</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(["professional", "friendly", "formal", "assertive", "direct"] as ReplyTone[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={cn(
                    "px-2.5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all border capitalize cursor-pointer",
                    tone === t 
                      ? "bg-blue-500/20 border-blue-400 text-blue-200" 
                      : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Key Points / Specific Notes (Optional)</label>
            <input
              type="text"
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              placeholder="e.g. Available Thursday 3pm EST, offer $5,000"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!emailText.trim() || isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin text-white" />
                <span>Drafting Reply...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Email Reply</span>
              </>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Send size={15} className="text-blue-400" />
            Generated Response
          </label>

          <div className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 font-sans leading-relaxed relative overflow-y-auto">
            {generatedReply ? (
              <p className="whitespace-pre-wrap">{generatedReply}</p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3 py-16">
                <Mail size={36} className="opacity-40" />
                <p className="text-xs font-medium max-w-xs">Paste received email, pick intent, and click "Generate Email Reply".</p>
              </div>
            )}
          </div>

          {generatedReply && (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Email Response"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
