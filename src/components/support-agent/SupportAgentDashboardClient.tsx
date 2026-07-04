"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bot, CalendarClock, MessageSquare, Plus, Settings, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SupportAgent } from "@/lib/support-agent/types";
import { getSupportAgentInsights, listSupportAgentsForUser } from "@/lib/support-agent/client-service";
import { useSupportAgentSession } from "./useSupportAgentSession";
import { SupportAgentAuthCard } from "./SupportAgentAuthCard";
import { SupportAgentDashboardSkeleton } from "./SupportAgentSkeletons";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function SupportAgentDashboardClient() {
  const { loading, session, userId } = useSupportAgentSession();
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [summary, setSummary] = useState({ messages: 0, conversations: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    void listSupportAgentsForUser(userId).then(async (items) => {
      setAgents(items);
      const insights = await Promise.all(items.map((agent) => getSupportAgentInsights(userId, agent.id)));
      setSummary({
        conversations: insights.reduce((total, item) => total + item.usage.conversations, 0),
        messages: insights.reduce((total, item) => total + item.usage.messages, 0),
      });
    }).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Could not load support agents.");
    });
  }, [userId]);

  if (loading) return <SupportAgentDashboardSkeleton />;

  if (!session || !userId) return <SupportAgentAuthCard />;

  const summaryCards: Array<{ label: string; value: string; icon: LucideIcon }> = [
    { label: "Agents", value: agents.length.toString(), icon: Sparkles },
    { label: "Conversations", value: summary.conversations.toString(), icon: MessageSquare },
    { label: "Monthly messages", value: `${summary.messages} / 50`, icon: CalendarClock },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030305] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-purple-600/10 blur-[110px]" />
        <div className="absolute bottom-[8%] right-[10%] h-80 w-80 rounded-full bg-cyan-400/10 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100">
              <Bot className="h-3.5 w-3.5" />
              Support Agent Studio
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">AI support agents</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-zinc-400">
                Build customer-facing chat agents for business FAQs, policies, product details, lead capture, and support follow-up.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/support-agent/new"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 px-5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_20px_70px_rgba(139,92,246,0.22)] transition hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            New Agent
          </Link>
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

        {agents.length === 0 ? (
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 text-center shadow-2xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-400/10">
              <Bot className="h-7 w-7 text-purple-100" />
            </div>
            <h2 className="mt-6 text-2xl font-black uppercase tracking-tight">Create your first support agent</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-zinc-400">
              Set your brand tone, welcome message, widget style, and lead capture preferences in a few minutes.
            </p>
            <Link
              href="/dashboard/support-agent/new"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 text-xs font-black uppercase tracking-[0.2em] text-black transition hover:bg-cyan-100"
            >
              Create support agent
            </Link>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/dashboard/support-agent/${agent.id}`}
                className="group rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.055]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${agent.primary_color}, #22D3EE)` }}
                    >
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-black text-white">{agent.name}</h2>
                      <p className="truncate text-xs font-bold text-zinc-500">{agent.business_name || "Business profile"}</p>
                    </div>
                  </div>
                  <Settings className="h-4 w-4 text-zinc-600 transition group-hover:text-cyan-200" />
                </div>
                <p className="mt-5 line-clamp-3 min-h-[4.5rem] text-sm font-medium leading-6 text-zinc-400">
                  {agent.description || "A polished support agent ready for FAQs, policies, product answers, and lead capture."}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{agent.tone}</span>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{agent.theme}</span>
                </div>
                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Updated {formatDate(agent.updated_at)}</p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
