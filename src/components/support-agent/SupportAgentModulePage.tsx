"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Bot, CheckCircle2, Code2, Copy, MessageSquareText, MessagesSquare, Send, ShieldCheck, Sparkles, Trash2, UploadCloud, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SupportAgent, SupportDocument, SupportLead, SupportMessage } from "@/lib/support-agent/types";
import {
  addDocumentForAgent,
  chatWithSupportAgent,
  getSupportAgentForUser,
  getSupportAgentInsights,
  listDocumentsForAgent,
  removeDocumentForAgent,
} from "@/lib/support-agent/client-service";
import { SupportAgentAuthCard } from "./SupportAgentAuthCard";
import { useSupportAgentSession } from "./useSupportAgentSession";
import { SupportAgentWorkspaceSkeleton } from "./SupportAgentSkeletons";

type SupportAgentModule = "knowledge" | "playground" | "widget" | "conversations";

interface SupportAgentModulePageProps {
  agentId: string;
  module: SupportAgentModule;
}

interface Insights {
  conversations: unknown[];
  messages: SupportMessage[];
  leads: SupportLead[];
  usage: { messages: number; documents: number; leads: number; conversations: number };
}

const moduleCopy: Record<SupportAgentModule, { title: string; eyebrow: string; description: string; icon: LucideIcon }> = {
  knowledge: {
    title: "Knowledge base",
    eyebrow: "Business knowledge",
    description: "Organize FAQs, policies, services, product details, and support notes your agent can use for customer answers.",
    icon: BookOpen,
  },
  playground: {
    title: "Chat playground",
    eyebrow: "Reply testing",
    description: "Test the support experience before you place the widget on your website.",
    icon: MessageSquareText,
  },
  widget: {
    title: "Website widget",
    eyebrow: "Embed setup",
    description: "Install your support chat on a website, test the launcher, and share the embed snippet with your developer.",
    icon: Code2,
  },
  conversations: {
    title: "Conversations",
    eyebrow: "Customer inbox",
    description: "Review visitor questions, captured leads, and follow-up opportunities from your support agent.",
    icon: MessagesSquare,
  },
};

export function SupportAgentModulePage({ agentId, module }: SupportAgentModulePageProps) {
  const { loading, session, userId } = useSupportAgentSession();
  const [agent, setAgent] = useState<SupportAgent | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pageError, setPageError] = useState("");
  const [insights, setInsights] = useState<Insights>({ conversations: [], messages: [], leads: [], usage: { messages: 0, documents: 0, leads: 0, conversations: 0 } });
  const copy = moduleCopy[module];
  const Icon = copy.icon;

  useEffect(() => {
    if (!userId) return;
    void getSupportAgentForUser(userId, agentId).then((item) => {
      setAgent(item);
      setLoaded(true);
    }).catch((loadError) => {
      setPageError(loadError instanceof Error ? loadError.message : "Could not load support agent.");
      setLoaded(true);
    });
    void getSupportAgentInsights(userId, agentId).then(setInsights).catch(() => {});
  }, [agentId, userId]);

  const accent = useMemo(() => agent?.primary_color ?? "#8B5CF6", [agent?.primary_color]);

  if (loading || (userId && !loaded)) return <SupportAgentWorkspaceSkeleton />;

  if (!session || !userId) return <SupportAgentAuthCard />;

  if (!agent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030305] px-4 text-white">
        <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight">Agent not found</h1>
          <Link href="/dashboard/support-agent" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-xs font-black uppercase tracking-[0.18em] text-black">
            Back to agents
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030305] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-7">
        <Link href={`/dashboard/support-agent/${agent.id}`} className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          {agent.name}
        </Link>

        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl sm:p-8">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: `${accent}33` }} />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-zinc-300">
                <Icon className="h-3.5 w-3.5 text-cyan-200" />
                {copy.eyebrow}
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">{copy.title}</h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-zinc-400">{copy.description}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Agent</p>
              <p className="mt-2 text-lg font-black text-white">{agent.name}</p>
            </div>
          </div>
        </header>

        {pageError && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
            {pageError}
          </div>
        )}

        {module === "knowledge" && <KnowledgePanel agent={agent} userId={userId} accent={accent} />}
        {module === "playground" && <PlaygroundPanel agent={agent} userId={userId} accent={accent} />}
        {module === "widget" && <WidgetPanel agent={agent} accent={accent} />}
        {module === "conversations" && <ConversationsPanel insights={insights} />}
      </div>
    </main>
  );
}

function KnowledgePanel({ agent, userId, accent }: { agent: SupportAgent; userId: string; accent: string }) {
  const [documents, setDocuments] = useState<SupportDocument[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function refresh() {
    void listDocumentsForAgent(userId, agent.id).then(setDocuments);
  }

  useEffect(refresh, [agent.id, userId]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setError("");
    void addDocumentForAgent(userId, agent.id, {
      title: title.trim() || "Business knowledge",
      content: content.trim(),
      source_type: sourceUrl ? "url" : "note",
      source_url: sourceUrl.trim() || null,
    })
      .then(() => {
        setTitle("");
        setContent("");
        setSourceUrl("");
        refresh();
      })
      .catch((saveError) => setError(saveError instanceof Error ? saveError.message : "Could not save knowledge."))
      .finally(() => setSaving(false));
  }

  async function handleFile(file?: File) {
    if (!file) return;
    const text = file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".csv") ? await file.text() : `Uploaded file: ${file.name}. Add the key policy or FAQ text here so the support agent can answer from it.`;
    setTitle(file.name.replace(/\.[^.]+$/, ""));
    setContent(text.slice(0, 30000));
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <form onSubmit={submit} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
          <UploadCloud className="h-6 w-6 text-cyan-200" />
        </div>
        <h2 className="mt-6 text-2xl font-black uppercase tracking-tight">Add business knowledge</h2>
        <p className="mt-3 text-sm font-semibold leading-7 text-zinc-400">
          Add menus, policies, FAQs, service brochures, pricing sheets, and product guides so customers receive consistent answers.
        </p>
        <div className="mt-6 grid gap-3">
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-bold text-white outline-none" placeholder="Title" />
          <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} className="min-h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-bold text-white outline-none" placeholder="Source URL" />
          <textarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-44 resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-semibold leading-7 text-white outline-none" placeholder="Paste FAQs, policy details, product notes, or support answers here." />
          <input type="file" accept=".txt,.md,.csv,.json,.html,.pdf" onChange={(event) => void handleFile(event.target.files?.[0])} className="min-h-12 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-zinc-300 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-black file:text-black" />
        </div>
        {error && <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">{error}</p>}
        <button disabled={saving} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl px-5 text-xs font-black uppercase tracking-[0.18em] text-white disabled:opacity-60" style={{ background: `linear-gradient(135deg, ${accent}, #22D3EE)` }}>
          {saving ? "Saving" : "Save knowledge"}
        </button>
      </form>
      <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Knowledge items</h3>
        <div className="mt-5 space-y-3">
          {documents.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm font-semibold leading-7 text-zinc-500">No knowledge has been added yet.</p>
          ) : (
            documents.map((document) => (
              <div key={document.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{document.title}</p>
                    <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-zinc-500">{document.content}</p>
                  </div>
                  <button onClick={() => void removeDocumentForAgent(userId, agent.id, document.id).then(refresh)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-100" aria-label="Delete knowledge item">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function PlaygroundPanel({ agent, userId, accent }: { agent: SupportAgent; userId: string; accent: string }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "visitor" | "assistant"; content: string }>>([
    { role: "assistant", content: agent.welcome_message },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message) return;
    setMessages((current) => [...current, { role: "visitor", content: message }]);
    setInput("");
    setLoading(true);
    setError("");
    void chatWithSupportAgent(userId, agent, message)
      .then((response) => setMessages((current) => [...current, { role: "assistant", content: response.reply }]))
      .catch((chatError) => setError(chatError instanceof Error ? chatError.message : "Support agent could not reply."))
      .finally(() => setLoading(false));
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 sm:p-7">
      <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-white/10 bg-[#08080d] p-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black text-white" style={{ background: `linear-gradient(135deg, ${accent}, #22D3EE)` }}>
            {agent.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-black text-white">{agent.name}</p>
            <p className="text-xs font-bold capitalize text-zinc-500">{agent.tone} tone</p>
          </div>
        </div>
        <div className="grid max-h-[460px] gap-3 overflow-auto py-5">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm font-semibold leading-6 ${message.role === "visitor" ? "ml-auto text-white" : "bg-white/[0.06] text-zinc-300"}`} style={message.role === "visitor" ? { background: `linear-gradient(135deg, ${accent}, #22D3EE)` } : undefined}>
              {message.content}
            </div>
          ))}
          {loading && <div className="max-w-[70%] rounded-2xl bg-white/[0.06] px-4 py-3 text-sm font-semibold text-zinc-400">Typing...</div>}
        </div>
        {error && <p className="mb-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">{error}</p>}
        <form onSubmit={send} className="flex gap-3">
          <input value={input} onChange={(event) => setInput(event.target.value)} className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-bold text-white outline-none" placeholder="Ask a customer question" />
          <button className="flex min-h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: accent }} aria-label="Send test message">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}

function WidgetPanel({ agent, accent }: { agent: SupportAgent; accent: string }) {
  const embedCode = `<script async src="${typeof window !== "undefined" ? window.location.origin : ""}/api/support-agent/widget/${agent.id}/embed"></script>`;
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const featureCards = [
    {
      title: "Fast AI replies",
      description: "Answers common customer questions from your saved business knowledge.",
      icon: Zap,
    },
    {
      title: "Lead safety net",
      description: "When the answer needs a human, the widget can capture visitor details for follow-up.",
      icon: ShieldCheck,
    },
    {
      title: "Brand-matched widget",
      description: "Color, placement, greeting, tone, and launcher style follow the agent settings.",
      icon: Sparkles,
    },
    {
      title: "Conversation memory",
      description: "Visitor chats are saved to the agent inbox so teams can review real demand.",
      icon: MessagesSquare,
    },
  ];

  async function copyEmbedCode() {
    setCopyStatus("idle");

    try {
      await navigator.clipboard.writeText(embedCode);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1800);
      return;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = embedCode;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        const copied = document.execCommand("copy");
        setCopyStatus(copied ? "copied" : "failed");
      } catch {
        setCopyStatus("failed");
      } finally {
        document.body.removeChild(textarea);
        window.setTimeout(() => setCopyStatus("idle"), 2200);
      }
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,1.02fr)]">
      <div className="space-y-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-cyan-300/[0.03] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">Install snippet</p>
            <h2 className="mt-3 text-2xl font-black uppercase tracking-tight sm:text-3xl">Launch your website agent</h2>
            <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-zinc-400">
              Add one script to your website and give visitors a branded support assistant that answers from your business knowledge.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ready to embed
          </span>
        </div>

        <div className="rounded-[1.5rem] border border-cyan-300/15 bg-[#050509] p-4 shadow-inner">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Embed code</span>
            <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-black text-zinc-400">HTML</span>
          </div>
          <code className="block whitespace-pre-wrap break-all font-mono text-[11px] font-bold leading-6 text-cyan-100 sm:text-xs">
            {embedCode}
          </code>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void copyEmbedCode()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 px-5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_60px_rgba(34,211,238,0.18)] transition hover:scale-[1.02]"
          >
            <Copy className="h-4 w-4" />
            {copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Select Code" : "Copy Code"}
          </button>
          <Link
            href={`/tools/support-agent/widget-test/${agent.id}`}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
          >
            Test Widget
          </Link>
        </div>

        {copyStatus === "failed" && (
          <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs font-bold leading-6 text-amber-100">
            Browser copy permission is blocked. Select the code above and copy it manually.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Placement", agent.widget_position === "bottom-left" ? "Bottom left" : "Bottom right"],
            ["Brand color", agent.primary_color],
            ["Lead capture", agent.lead_capture_enabled ? "Enabled" : "Disabled"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">{label}</p>
              <p className="mt-2 text-sm font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {featureCards.map((feature) => {
            const FeatureIcon = feature.icon;
            return (
              <div key={feature.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-100">
                  <FeatureIcon className="h-4 w-4" />
                </div>
                <p className="mt-4 text-sm font-black text-white">{feature.title}</p>
                <p className="mt-2 text-xs font-semibold leading-6 text-zinc-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#07070c] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.32)] sm:p-6">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: `${accent}2e` }} />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400/80" />
              <div className="h-3 w-3 rounded-full bg-amber-300/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-300/80" />
            </div>
            <div className="h-7 w-32 rounded-full border border-white/10 bg-black/30" />
          </div>
          <div className="mt-6 grid gap-4">
            <div className="h-12 rounded-2xl border border-white/10 bg-white/[0.05]" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-28 rounded-2xl border border-white/10 bg-white/[0.035]" />
              <div className="h-28 rounded-2xl border border-white/10 bg-white/[0.035]" />
            </div>
            <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.035]" />
          </div>
        </div>
        <div className={`absolute ${agent.widget_position === "bottom-left" ? "left-6" : "right-6"} bottom-6 w-[21rem] max-w-[calc(100%-3rem)] overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#07070c]/95 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl`}>
          <div className="flex items-start gap-3 border-b border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black text-white" style={{ background: `linear-gradient(135deg, ${accent}, #22D3EE)` }}>
              {agent.widget_icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agent.widget_icon_url} alt="" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">{agent.name}</p>
              <p className="mt-1 text-xs font-bold text-emerald-200">Online now</p>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.08] px-3 py-2.5 text-xs font-semibold leading-5 text-zinc-200">
              {agent.welcome_message}
            </div>
            <div className="ml-auto max-w-[82%] rounded-2xl rounded-br-md px-3 py-2.5 text-xs font-black leading-5 text-white" style={{ background: `linear-gradient(135deg, ${accent}, #22D3EE)` }}>
              What are your prices?
            </div>
            <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.08] px-3 py-2.5 text-xs font-semibold leading-5 text-zinc-200">
              I can help with pricing, services, policies, and next steps from the knowledge you added.
            </div>
            <div className="flex gap-2">
              {["Pricing", "Services", "Contact"].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConversationsPanel({ insights }: { insights: Insights }) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
        <h2 className="text-2xl font-black uppercase tracking-tight">Customer conversations</h2>
        <div className="mt-5 space-y-3">
          {insights.messages.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-semibold leading-7 text-zinc-500">Customer chats will appear here once visitors start using your support widget or playground.</p>
          ) : (
            insights.messages.slice(-16).map((message) => (
              <div key={message.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{message.role}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-zinc-300">{message.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="space-y-5">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Analytics</h3>
          <div className="mt-5 grid gap-3">
            {[
              ["Messages", insights.usage.messages],
              ["Conversations", insights.usage.conversations],
              ["Leads", insights.usage.leads],
              ["Knowledge", insights.usage.documents],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</span>
                <span className="text-lg font-black text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Captured leads</h3>
          <div className="mt-5 space-y-3">
            {insights.leads.length === 0 ? <p className="text-sm font-semibold leading-7 text-zinc-500">No leads captured yet.</p> : insights.leads.map((lead) => (
              <div key={lead.id} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-semibold text-zinc-300">
                {lead.name || "Visitor"} {lead.email ? `- ${lead.email}` : ""}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
