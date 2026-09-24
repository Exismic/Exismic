"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Send, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Check, 
  ArrowRight, 
  MailCheck, 
  ExternalLink,
  MessageSquare,
  Sparkles as SparklesIcon,
  RotateCcw,
  UserCheck,
  Inbox,
  PenTool
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { setPipedContent, usePipedContent } from "@/lib/tool-piping";
import { PipedBadge } from "@/components/tool/PipedBadge";
import { 
  EMAIL_REPLY_BLUEPRINTS, 
  type EmailReplyBlueprint 
} from "./email-reply-blueprints";

type ResponseIntent = "accept" | "decline" | "followup" | "negotiate" | "info";
type ReplyTone = "professional" | "friendly" | "formal" | "assertive" | "direct";

const INTENTS: Array<{ id: ResponseIntent; label: string; icon: string; desc: string }> = [
  { id: "accept", label: "Accept & Proceed", icon: "🤝", desc: "Confirm & set next steps" },
  { id: "decline", label: "Decline Politely", icon: "🛑", desc: "Respectful refusal" },
  { id: "followup", label: "Gentle Follow-Up", icon: "⏳", desc: "Friendly check-in nudge" },
  { id: "negotiate", label: "Negotiate Offer", icon: "💼", desc: "Counter-offer & terms" },
  { id: "info", label: "Provide Details", icon: "ℹ️", desc: "Answer questions & files" },
];

const TONES: Array<{ id: ReplyTone; label: string; desc: string }> = [
  { id: "professional", label: "Professional", desc: "Executive business polish" },
  { id: "friendly", label: "Friendly & Warm", desc: "Approachable & conversational" },
  { id: "direct", label: "Direct & Crisp", desc: "To the point, zero fluff" },
  { id: "assertive", label: "Firm & Confident", desc: "Clear boundaries & terms" },
  { id: "formal", label: "Formal & Courteous", desc: "Traditional corporate etiquette" },
];

export default function EmailReplyGenerator() {
  const router = useRouter();

  // Active inputs
  const [emailText, setEmailText] = useState(EMAIL_REPLY_BLUEPRINTS[0].receivedEmail);
  const [intent, setIntent] = useState<ResponseIntent>(EMAIL_REPLY_BLUEPRINTS[0].intent);
  const [tone, setTone] = useState<ReplyTone>(EMAIL_REPLY_BLUEPRINTS[0].tone);
  const [extraNotes, setExtraNotes] = useState(EMAIL_REPLY_BLUEPRINTS[0].extraNotes || "");
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(EMAIL_REPLY_BLUEPRINTS[0].id);

  // Output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [subject, setSubject] = useState(EMAIL_REPLY_BLUEPRINTS[0].subject);
  const [replyBody, setReplyBody] = useState(EMAIL_REPLY_BLUEPRINTS[0].replyBody);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // View mode switcher: interactive email card vs raw text
  const [viewMode, setViewMode] = useState<"card" | "raw">("card");

  const { pipedPayload, isPiped, clearPiped } = usePipedContent((payload) => {
    if (payload.content) {
      setEmailText(payload.content);
      setSelectedBlueprintId("custom");
    }
  });

  const handleSelectBlueprint = (bp: EmailReplyBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setEmailText(bp.receivedEmail);
    setIntent(bp.intent);
    setTone(bp.tone);
    setExtraNotes(bp.extraNotes || "");
    setSubject(bp.subject);
    setReplyBody(bp.replyBody);
  };

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText.trim()) {
        setEmailText(clipText);
        setSelectedBlueprintId("custom");
      }
    } catch {
      // Fallback
    }
  };

  const handleGenerate = async () => {
    if (!emailText.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Draft a professional email reply to the following received email:\n\n"${emailText}"\n\nIntent: ${intent}\nTone Style: ${tone}\nKey Points to include: ${extraNotes || "None"}`,
          toolId: "email-reply-generator",
          systemInstruction: "You are an executive communications expert. Write a tailored, polished email reply. Format your output strictly starting with 'Subject: [Subject Line]' on the first line, followed by two newlines, then the full email body with greeting and sign-off."
        })
      });

      const data = await response.json();
      const rawOutput = data.output || data.text || "";

      if (rawOutput && rawOutput.trim()) {
        const text = rawOutput.trim();
        const subjectMatch = text.match(/^Subject:\s*(.*)$/im);
        if (subjectMatch) {
          setSubject(subjectMatch[1].trim());
          const bodyOnly = text.replace(/^Subject:\s*.*(\r?\n)+/i, "").trim();
          setReplyBody(bodyOnly);
        } else {
          setSubject(`Re: ${intent.toUpperCase()} - Follow-up`);
          setReplyBody(text);
        }
      } else {
        // Fallback standard response
        setSubject("Re: Following up on your email");
        setReplyBody(`Hi there,\n\nThank you for reaching out and sharing these details.\n\nI have reviewed your message and would like to proceed with our next steps. Please let me know what works best for your schedule.\n\nBest regards,\n[Your Name]`);
      }
    } catch {
      setSubject("Re: Following up on your email");
      setReplyBody(`Hi there,\n\nThank you for reaching out. I've received your note and will review the details shortly.\n\nBest regards,\n[Your Name]`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copySubjectOnly = () => {
    navigator.clipboard.writeText(subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const copyBodyOnly = () => {
    navigator.clipboard.writeText(replyBody);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const copyAll = () => {
    const fullEmail = `Subject: ${subject}\n\n${replyBody}`;
    navigator.clipboard.writeText(fullEmail);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleOpenMailto = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(replyBody)}`;
    window.open(mailtoUrl, "_blank");
  };

  const handleSendToHumanizer = () => {
    if (!replyBody) return;
    setPipedContent({
      sourceToolId: "email-reply-generator",
      sourceToolName: "Email Reply Generator",
      content: replyBody,
      fieldHint: "text",
    });
    router.push("/tools/ai-humanizer");
  };

  const wordCount = emailText.trim() ? emailText.trim().split(/\s+/).length : 0;
  const replyWordCount = replyBody.trim() ? replyBody.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-12">
      {/* Symmetrical Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Pane: Email Controls Studio (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0e14]/90 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Studio Header Badge */}
            <div className="flex items-center justify-between border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner">
                  <MailCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Email Studio
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Draft clear, high-impact responses tailored to any scenario
                  </p>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready to Draft</span>
              </div>
            </div>

            {/* Received Email Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Received Email Text
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePasteClipboard}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Paste Email
                  </button>
                  {emailText && (
                    <button
                      onClick={() => {
                        setEmailText("");
                        setSelectedBlueprintId("custom");
                        setSubject("");
                        setReplyBody("");
                      }}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 font-medium transition cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {isPiped && pipedPayload && (
                <PipedBadge
                  sourceName={pipedPayload.sourceToolName}
                  onClear={() => {
                    setEmailText("");
                    clearPiped();
                  }}
                  className="mb-1"
                />
              )}

              <div className="relative">
                <textarea
                  value={emailText}
                  onChange={(e) => {
                    setEmailText(e.target.value);
                    setSelectedBlueprintId("custom");
                  }}
                  rows={4}
                  placeholder="Paste the message or email you received here..."
                  className="w-full bg-black/60 border border-white/10 focus:border-emerald-500/50 rounded-2xl p-4 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none font-medium leading-relaxed custom-scrollbar shadow-inner"
                />
                <div className="flex items-center justify-between pt-1.5 px-1 text-[10px] font-bold text-zinc-500">
                  <span>{wordCount.toLocaleString()} words</span>
                  <span>{emailText.length.toLocaleString()} characters</span>
                </div>
              </div>
            </div>

            {/* Response Intent Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Response Goal & Intent
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INTENTS.map((item) => {
                  const isSelected = intent === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIntent(item.id);
                        setSelectedBlueprintId("custom");
                      }}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm"
                          : "bg-white/[0.03] border-white/5 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
                        <span>{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="text-[9px] text-zinc-400 truncate">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone Style Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Writing Tone
              </label>

              <div className="grid grid-cols-3 gap-2">
                {TONES.map((item) => {
                  const isSelected = tone === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTone(item.id);
                        setSelectedBlueprintId("custom");
                      }}
                      className={cn(
                        "p-2 rounded-xl border text-center transition-all cursor-pointer",
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm"
                          : "bg-white/[0.03] border-white/5 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                      )}
                    >
                      <div className="text-[11px] font-bold text-white truncate">{item.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Specific Notes */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Specific Details or Key Points (Optional)
              </label>
              <input
                type="text"
                value={extraNotes}
                onChange={(e) => {
                  setExtraNotes(e.target.value);
                  setSelectedBlueprintId("custom");
                }}
                placeholder="e.g. 'Available Thursday at 3 PM', 'Counter at $135k', 'Review deck first'"
                className="w-full bg-black/60 border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium shadow-inner"
              />
            </div>

            {/* 4 Instant Demonstration Blueprints ($0 Previews) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Instant Demonstration Blueprints ($0 Free Previews)
                </span>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                  Click to test
                </span>
              </div>

              <div className="space-y-2">
                {EMAIL_REPLY_BLUEPRINTS.map((bp) => {
                  const isSelected = selectedBlueprintId === bp.id;
                  return (
                    <button
                      key={bp.id}
                      onClick={() => handleSelectBlueprint(bp)}
                      className={cn(
                        "w-full p-3 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative group flex items-center justify-between gap-3",
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-white"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs sm:text-sm font-bold text-white truncate">
                            {bp.name}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-emerald-300 border border-emerald-500/20 shrink-0">
                            {bp.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate leading-relaxed">
                          {bp.tagline}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" /> Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 group-hover:text-emerald-300 group-hover:border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider transition">
                            Preview $0
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleGenerate}
                disabled={!emailText.trim() || isGenerating}
                className={cn(
                  "w-full flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-2xl",
                  "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:brightness-110 text-zinc-950 shadow-emerald-500/25 active:scale-[0.98]",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Drafting tailored reply...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-zinc-950 fill-zinc-950/20" />
                    <span>Draft Email Reply</span>
                    <span className="px-2 py-0.5 rounded-full bg-black/20 text-zinc-950 text-[9px] font-black border border-black/10">
                      100% Free
                    </span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-zinc-500 font-medium">
                Generates a complete response with subject line, greeting, body, and sign-off
              </p>
            </div>

          </div>
        </div>

        {/* Right Pane: Live Email Composer Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#0c0e14]/90 border border-white/10 rounded-[2.5rem] p-5 sm:p-7 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Email Compose Simulator
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  {replyWordCount} Words
                </span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/10 rounded-xl">
                <button
                  onClick={() => setViewMode("card")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                    viewMode === "card"
                      ? "bg-emerald-400 text-zinc-950 font-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  Interactive Composer
                </button>
                <button
                  onClick={() => setViewMode("raw")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                    viewMode === "raw"
                      ? "bg-emerald-400 text-zinc-950 font-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  Plain Text
                </button>
              </div>
            </div>

            {/* Interactive Email Compose Box */}
            <div className="p-4 sm:p-6 rounded-3xl bg-black/70 border border-white/10 shadow-inner min-h-[360px] space-y-4">
              
              {viewMode === "card" ? (
                <div className="space-y-4 text-left">
                  {/* Compose Header Bar */}
                  <div className="space-y-2 border-b border-white/10 pb-3.5">
                    {/* To Field */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] w-14">
                        To:
                      </span>
                      <span className="text-zinc-300 font-mono text-xs flex-1 truncate">
                        recipient@company.com
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold">New Message</span>
                    </div>

                    {/* Subject Field */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] w-14">
                        Subject:
                      </span>
                      <span className="text-white font-bold text-xs flex-1 truncate">
                        {subject || "Re: Following up"}
                      </span>
                      <button
                        onClick={copySubjectOnly}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider transition cursor-pointer shrink-0 ml-2"
                      >
                        {copiedSubject ? "Copied!" : "Copy Subject"}
                      </button>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="text-xs sm:text-sm text-zinc-100 leading-relaxed font-normal whitespace-pre-wrap py-2">
                    {replyBody || "Paste your received email and click 'Draft Email Reply' to preview the response here."}
                  </div>

                  {/* Sign-off Signature Box */}
                  <div className="pt-3 border-t border-white/5 text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>Standard Business Signature Template</span>
                    <span className="text-emerald-400 font-bold">Ready to Send</span>
                  </div>
                </div>
              ) : (
                /* Raw Plain Text Mode */
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-white/5 pb-2 font-bold">
                    <span>PLAIN TEXT FORMAT</span>
                    <span>Ready to copy</span>
                  </div>
                  <pre className="text-xs sm:text-sm text-zinc-100 font-mono leading-relaxed whitespace-pre-wrap">
                    {`Subject: ${subject}\n\n${replyBody}`}
                  </pre>
                </div>
              )}

            </div>

            {/* Bottom Actions Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={copyAll}
                  disabled={!replyBody}
                  className={cn(
                    "px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm",
                    copiedAll
                      ? "bg-emerald-500 text-zinc-950 border-emerald-500 font-black"
                      : "bg-white text-zinc-950 hover:bg-zinc-200 border-white"
                  )}
                >
                  {copiedAll ? <CheckCircle2 className="w-4 h-4 text-zinc-950" /> : <Copy className="w-4 h-4 text-zinc-950" />}
                  <span>{copiedAll ? "Copied Full Email!" : "Copy Full Email"}</span>
                </button>

                <button
                  onClick={copyBodyOnly}
                  disabled={!replyBody}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2"
                >
                  {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBody ? "Body Copied!" : "Copy Body Only"}</span>
                </button>

                <button
                  onClick={handleOpenMailto}
                  disabled={!replyBody}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Mail App</span>
                </button>
              </div>

              <button
                onClick={handleSendToHumanizer}
                disabled={!replyBody}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Polish in AI Humanizer</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Chained Workflows */}
      {replyBody && (
        <ToolWorkflowChaining
          currentToolId="email-reply-generator"
          categoryId="productivity"
          outputContent={replyBody}
        />
      )}

      {/* Smart Workflow Tool Recommendations */}
      <ToolSuggestions
        currentToolId="email-reply-generator"
        categoryId="productivity"
        outputContent={replyBody || emailText}
      />
    </div>
  );
}
