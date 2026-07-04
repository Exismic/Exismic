"use client";

import { Bot } from "lucide-react";
import { SupportAgentAuthCard } from "./SupportAgentAuthCard";
import { SupportAgentForm } from "./SupportAgentForm";
import { SupportAgentWorkspaceSkeleton } from "./SupportAgentSkeletons";
import { useSupportAgentSession } from "./useSupportAgentSession";

export function SupportAgentFormPage() {
  const { loading, session, userId } = useSupportAgentSession();

  if (loading) return <SupportAgentWorkspaceSkeleton />;

  if (!session || !userId) return <SupportAgentAuthCard />;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030305] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-purple-100">
            <Bot className="h-3.5 w-3.5" />
            New Support Agent
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">Create a support agent</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-zinc-400">
              Shape the brand voice, first message, widget style, and lead capture flow your visitors will see.
            </p>
          </div>
        </header>
        <SupportAgentForm userId={userId} />
      </div>
    </main>
  );
}
