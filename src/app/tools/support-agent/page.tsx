import type { Metadata } from "next";
import Link from "next/link";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Check,
  Code2,
  Handshake,
  MessageSquare,
  MessagesSquare,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import {
  SUPPORT_AGENT_FEATURES,
  SUPPORT_AGENT_PRICING,
  SUPPORT_AGENT_USE_CASES,
} from "@/lib/support-agent/types";

export const metadata: Metadata = constructMetadata({
  title: "Exismic Support Agent - AI support agents for your website",
  description:
    "Create an AI customer support chatbot for your website. Train Exismic with FAQs, policies, documents, and product details, then embed it in minutes.",
  canonicalUrl: `${SITE_URL}/tools/support-agent`,
});

const featureIcons = [BookOpen, MessageSquare, Users, Handshake, MessagesSquare, BarChart3];
const useCaseIcons = [Store, Bot, Sparkles, Users, Code2, MessageSquare];

export default function SupportAgentLandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030305] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[5%] top-[5%] h-[460px] w-[460px] rounded-full bg-purple-600/12 blur-[150px]" />
        <div className="absolute right-[8%] top-[18%] h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-[150px]" />
        <div className="absolute bottom-[5%] left-[25%] h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100">
            <Bot className="h-4 w-4" />
            Exismic Support Agent
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              AI support agents for your website
            </h1>
            <p className="max-w-2xl text-base font-semibold leading-8 text-zinc-400 sm:text-lg">
              Train Exismic with your FAQs, policies, documents, and product details. Then embed a support chatbot on your website in minutes.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/support-agent/new"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_24px_90px_rgba(34,211,238,0.22)] transition hover:scale-[1.02]"
            >
              Create support agent
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-200 transition hover:bg-white/[0.06]"
            >
              View pricing
            </Link>
          </div>
        </div>

        <ProductPreview />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORT_AGENT_FEATURES.map((feature, index) => {
            const Icon = featureIcons[index] ?? Sparkles;
            return (
              <div key={feature} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.055]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
                  <Icon className="h-5 w-5 text-cyan-100" />
                </div>
                <h2 className="mt-6 text-lg font-black text-white">{feature}</h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-zinc-500">
                  Give customers fast, consistent answers while keeping your team in control of the experience.
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-purple-200">How it works</p>
          <h2 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">From business details to live support</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Create", "Set the agent name, business profile, tone, and first message."],
            ["Train", "Add the FAQs, policies, documents, and product details customers ask about."],
            ["Embed", "Place the chat widget on your website and review every conversation from Exismic."],
          ].map(([title, description], index) => (
            <div key={title} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-black">{index + 1}</div>
              <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-zinc-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">Use cases</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-5xl">Built for real businesses</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORT_AGENT_USE_CASES.map((useCase, index) => {
            const Icon = useCaseIcons[index] ?? Store;
            return (
              <div key={useCase} className="flex min-h-24 items-center gap-4 rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-400/10">
                  <Icon className="h-5 w-5 text-purple-100" />
                </div>
                <p className="text-base font-black text-white">{useCase}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-purple-200">Pricing preview</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-5xl">Start lean, scale when support grows</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {SUPPORT_AGENT_PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[2rem] border p-6 ${
                plan.highlighted
                  ? "border-cyan-300/40 bg-cyan-300/[0.07] shadow-[0_24px_100px_rgba(34,211,238,0.14)]"
                  : "border-white/10 bg-white/[0.035]"
              }`}
            >
              <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">{plan.name}</p>
              <p className="mt-4 text-4xl font-black tracking-tight text-white">{plan.price}</p>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                    <Check className="h-4 w-4 text-cyan-200" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 pb-24 sm:px-6 lg:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">FAQ</p>
          <div className="mt-6 divide-y divide-white/10">
            {[
              ["Can I train it with my own business information?", "Yes. Exismic Support Agent is designed around your FAQs, policies, documents, services, and product details."],
              ["Can I add it to my website?", "Yes. The website widget area is built for embed setup and brand customization."],
              ["Can it capture leads?", "Yes. Lead capture can be enabled per agent so interested visitors can leave contact details for follow-up."],
            ].map(([question, answer]) => (
              <div key={question} className="py-5">
                <h3 className="text-base font-black text-white">{question}</h3>
                <p className="mt-2 text-sm font-semibold leading-7 text-zinc-500">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-cyan-400/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] p-4 shadow-2xl backdrop-blur-2xl sm:p-5">
        <div className="rounded-[1.5rem] border border-white/10 bg-[#08080d] p-4">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 text-sm font-black text-white">LS</div>
              <div>
                <p className="text-sm font-black text-white">Exismic Support</p>
                <p className="text-xs font-bold text-zinc-500">Website assistant</p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">Active</span>
          </div>

          <div className="grid gap-3 py-4 sm:grid-cols-3">
            {["Knowledge", "Leads", "Widget"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">{item}</p>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-purple-400 to-cyan-300" />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
            <div className="max-w-[84%] rounded-2xl bg-white/[0.06] px-4 py-3 text-sm font-semibold leading-6 text-zinc-300">
              Hi, welcome in. How can I help today?
            </div>
            <div className="ml-auto max-w-[80%] rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-3 text-sm font-black text-white">
              Do you offer same-day delivery?
            </div>
            <div className="max-w-[88%] rounded-2xl bg-white/[0.06] px-4 py-3 text-sm font-semibold leading-6 text-zinc-300">
              Yes. Orders placed before the cutoff can be delivered today in supported areas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
