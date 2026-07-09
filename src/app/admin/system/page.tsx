import { Activity, AlertTriangle, CheckCircle2, Database, KeyRound, Mail, SlidersHorizontal, Users, WalletCards, type LucideIcon } from "lucide-react";
import { getSystemDiagnostics } from "@/lib/system-diagnostics";

export const dynamic = "force-dynamic";

function statusClasses(status: string) {
  if (status === "ok") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (status === "warning") return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  return "border-red-400/20 bg-red-400/10 text-red-300";
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${statusClasses(status)}`}>
      {status}
    </span>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-cyan-200">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default async function SystemAdminPage() {
  const diagnostics = await getSystemDiagnostics();

  return (
    <main className="min-h-screen bg-[#020202] px-4 py-20 text-white sm:px-6">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.16),transparent_32%),radial-gradient(circle_at_90%_10%,rgba(6,182,212,0.10),transparent_30%)]" />
      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-200">
                <Activity size={12} />
                System Command Center
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Exismic Diagnostics</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-500">
                Email, payment, auth, database, and heavy-tool configuration in one place.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <StatusPill status={diagnostics.status} />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                {new Date(diagnostics.generatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Users" value={diagnostics.database.totalUsers} icon={Users} />
          <MetricCard label="Pro Users" value={diagnostics.database.proUsers} icon={CheckCircle2} />
          <MetricCard label="Cancelled" value={diagnostics.database.cancelledSubscriptions} icon={AlertTriangle} />
          <MetricCard label="Email Status" value={diagnostics.email.status.toUpperCase()} icon={Mail} />
        </section>

        <section id="tools" className="scroll-mt-28 rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white">
              <SlidersHorizontal size={16} /> Tool Health
            </h2>
            <StatusPill status={diagnostics.tools.status} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Ready" value={diagnostics.tools.summary.ready} icon={CheckCircle2} />
            <MetricCard label="Limited" value={diagnostics.tools.summary.limited} icon={Activity} />
            <MetricCard label="Needs Setup" value={diagnostics.tools.summary.setupNeeded} icon={KeyRound} />
            <MetricCard label="Offline" value={diagnostics.tools.summary.offline} icon={AlertTriangle} />
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {diagnostics.tools.tools
              .filter((tool) => tool.status !== "ready")
              .slice(0, 12)
              .map((tool) => (
                <div key={tool.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{tool.name}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{tool.category} / {tool.reliabilityLevel}</p>
                    </div>
                    <StatusPill status={tool.status === "setup-needed" || tool.status === "offline" ? "error" : "warning"} />
                  </div>

                  {tool.missingRequired.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">Missing required</p>
                      {tool.missingRequired.map((dependency) => (
                        <p key={dependency.label} className="text-[11px] font-semibold leading-relaxed text-zinc-500">
                          {dependency.label}: {dependency.env.join(" or ")}
                        </p>
                      ))}
                    </div>
                  )}

                  {tool.missingOptional.length > 0 && tool.missingRequired.length === 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Missing optional fallback</p>
                      {tool.missingOptional.slice(0, 2).map((dependency) => (
                        <p key={dependency.label} className="text-[11px] font-semibold leading-relaxed text-zinc-500">
                          {dependency.label}: {dependency.env.join(" or ")}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {diagnostics.tools.tools.every((tool) => tool.status === "ready") && (
            <p className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4 text-xs font-semibold text-emerald-200">
              Every registered tool is reporting ready.
            </p>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div id="email" className="scroll-mt-28 rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white"><Mail size={16} /> Email</h2>
              <StatusPill status={diagnostics.email.status} />
            </div>
            <div className="space-y-3">
              {diagnostics.email.checks.map((check) => (
                <div key={check.key} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white">{check.label}</p>
                    <StatusPill status={check.status} />
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-zinc-500">{check.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Senders</p>
              <div className="mt-3 space-y-1 text-xs font-semibold text-zinc-400">
                <p>{diagnostics.email.senders.payment}</p>
                <p>{diagnostics.email.senders.noreply}</p>
                <p>{diagnostics.email.senders.welcome}</p>
              </div>
            </div>
          </div>

          <div id="payments" className="scroll-mt-28 rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white"><WalletCards size={16} /> Payments</h2>
              <StatusPill status={diagnostics.payments.status} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Server Keys</p>
                <p className="mt-3 text-lg font-black">{diagnostics.payments.razorpayServerConfigured ? "Configured" : "Missing"}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Public Key</p>
                <p className="mt-3 text-lg font-black">{diagnostics.payments.razorpayPublicConfigured ? "Configured" : "Missing"}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-400"><Database size={14} /> Recent Users</h3>
              <div className="space-y-2">
                {diagnostics.database.recentUsers.map((item) => (
                  <div key={`${item.email}-${item.createdAt}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">{item.email || "No email"}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{item.plan} / {item.subscriptionStatus}</p>
                    </div>
                    <p className="shrink-0 text-[10px] font-bold text-zinc-600">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
                {diagnostics.database.recentUsers.length === 0 && (
                  <p className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-xs font-semibold text-zinc-500">No users found or database unavailable.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-5 flex items-center gap-2">
            <KeyRound size={16} className="text-cyan-200" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Environment Checks</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {diagnostics.env.map((check) => (
              <div key={check.key} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-white">{check.label}</p>
                  <StatusPill status={check.status} />
                </div>
                <p className="mt-2 text-[11px] font-semibold text-zinc-500">{check.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white"><Mail size={16} /> Recent Email Attempts</h2>
          <div className="space-y-2">
            {diagnostics.email.recentEvents.map((event) => (
              <div key={`${event.channel}-${event.timestamp}`} className="flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{event.channel} to {event.recipient}</p>
                  {event.error && <p className="mt-1 text-[11px] font-semibold text-red-300">{event.error}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={event.success ? "ok" : "error"} />
                  <p className="text-[10px] font-bold text-zinc-600">{new Date(event.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {diagnostics.email.recentEvents.length === 0 && (
              <p className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-xs font-semibold text-zinc-500">No email attempts recorded since this server started.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
