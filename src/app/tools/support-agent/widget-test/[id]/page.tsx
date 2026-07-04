import Script from "next/script";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";

export default async function SupportAgentWidgetTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="min-h-screen overflow-hidden bg-[#050509] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.22),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,#050509,#080812)]" />
      <div className="relative mx-auto max-w-6xl space-y-7">
        <Link href={`/dashboard/support-agent/${id}/widget`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 text-xs font-black uppercase tracking-[0.18em] text-zinc-300 transition hover:bg-white/10 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Widget setup
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-9">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              Live widget preview
            </p>
            <h1 className="mt-5 text-4xl font-black uppercase tracking-tight sm:text-6xl">Customer website test</h1>
            <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-zinc-300 sm:text-base sm:leading-8">
              This page behaves like a real website with your support widget installed. Open the floating chat button and test greetings, pricing questions, services, policies, and lead capture.
            </p>
          </div>
          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {["Open the chat", "Ask a saved FAQ", "Review conversations"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-white">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-200">Suggested prompts</p>
            <div className="mt-5 grid gap-3">
              {[
                "Hi",
                "How much does an AI chatbot setup cost?",
                "What services do you offer?",
                "How can I contact your team?",
              ].map((prompt) => (
                <div key={prompt} className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm font-bold leading-6 text-zinc-200">
                  {prompt}
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#09090f] p-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Example business page</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">Raxstdioz Services</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400">
                <MessageCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {["AI chatbot setup", "Website support", "Automation", "Customer onboarding"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <h3 className="text-sm font-black text-white">{item}</h3>
                  <p className="mt-3 text-xs font-semibold leading-6 text-zinc-500">
                    Visitors can ask the support agent about this topic and receive answers from your saved knowledge.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-black/25 p-5 text-sm font-semibold leading-7 text-zinc-400">
          <p>
            The widget floats in the bottom corner, exactly like it would on a live website. It uses the same script shown in your embed setup.
          </p>
        </section>
      </div>
      <Script src={`/api/support-agent/widget/${id}/embed`} strategy="afterInteractive" />
    </main>
  );
}
