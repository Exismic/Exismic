"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, BookOpen, Bot, Code2, MessageSquareText, MessagesSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SupportAgent } from "@/lib/support-agent/types";
import { getSupportAgentForUser, getSupportAgentInsights } from "@/lib/support-agent/client-service";
import { SupportAgentAuthCard } from "./SupportAgentAuthCard";
import { SupportAgentForm } from "./SupportAgentForm";
import { SupportAgentWorkspaceSkeleton } from "./SupportAgentSkeletons";
import { useSupportAgentSession } from "./useSupportAgentSession";

interface SupportAgentManageClientProps {
  agentId: string;
}

const workspaceLinks = [
  { label: "Knowledge", href: "knowledge", icon: BookOpen },
  { label: "Playground", href: "playground", icon: MessageSquareText },
  { label: "Widget", href: "widget", icon: Code2 },
  { label: "Conversations", href: "conversations", icon: MessagesSquare },
];

export function SupportAgentManageClient({ agentId }: SupportAgentManageClientProps) {
  const { loading, session, userId } = useSupportAgentSession();
  const [agent, setAgent] = useState<SupportAgent | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [usage, setUsage] = useState({ documents: 0, conversations: 0, leads: 0, messages: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    void getSupportAgentForUser(userId, agentId).then((item) => {
      setAgent(item);
      setLoaded(true);
    }).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Could not load support agent.");
      setLoaded(true);
    });
    void getSupportAgentInsights(userId, agentId).then((insights) => setUsage(insights.usage)).catch(() => {});
  }, [agentId, userId]);

  if (loading || (userId && !loaded)) return <SupportAgentWorkspaceSkeleton />;

  if (!session || !userId) return <SupportAgentAuthCard />;

  if (!agent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030305] px-4 text-white">
        <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
          <Bot className="mx-auto h-10 w-10 text-zinc-500" />
          <h1 className="mt-5 text-2xl font-black uppercase tracking-tight">Agent not found</h1>
          <p className="mt-3 text-sm font-semibold leading-7 text-zinc-400">Choose another support agent from your workspace.</p>
          <Link href="/dashboard/support-agent" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-xs font-black uppercase tracking-[0.18em] text-black">
            Back to agents
          </Link>
        </div>
      </main>
    );
  }

  const summaryCards: Array<{ label: string; value: string; icon: LucideIcon }> = [
    { label: "Knowledge items", value: usage.documents.toString(), icon: BookOpen },
    { label: "Open conversations", value: usage.conversations.toString(), icon: MessagesSquare },
    { label: "Capture status", value: agent.lead_capture_enabled ? "On" : "Off", icon: BarChart3 },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030305] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100">
                <Bot className="h-3.5 w-3.5" />
                Manage Agent
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">{agent.name}</h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-zinc-400">
                  Tune the agent profile, add knowledge, test replies, prepare your widget, and review customer conversations.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              {workspaceLinks.map((item) => (
                <Link
                  key={item.href}
                  href={`/dashboard/support-agent/${agent.id}/${item.href}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:border-cyan-300/30 hover:text-white"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {summaryCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">{label}</p>
                <Icon className="h-4 w-4 text-cyan-200" />
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-white">{value}</p>
            </div>
          ))}
        </section>

        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
            {error}
          </div>
        )}

        <SupportAgentForm userId={userId} initialAgent={agent} />
      </div>
    </main>
  );
}
