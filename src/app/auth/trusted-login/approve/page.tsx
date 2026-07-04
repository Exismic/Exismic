"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Loader2,
  MapPin,
  MonitorSmartphone,
  ShieldCheck,
  X,
} from "lucide-react";

type ApprovalDetails = {
  challengeId: string;
  approvalToken: string;
  email: string;
  device: string;
  ip: string;
  time: string;
};

type ResultState = "idle" | "submitting" | "approved" | "denied" | "error";

export default function TrustedLoginApprovalPage() {
  const [details, setDetails] = useState<ApprovalDetails | null>(null);
  const [result, setResult] = useState<ResultState>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    setDetails({
      challengeId: params.get("challenge") || "",
      approvalToken: params.get("token") || "",
      email: params.get("email") || "your Lumora account",
      device: params.get("device") || "Unknown device",
      ip: params.get("ip") || "Unknown network",
      time: params.get("time") || "",
    });
  }, []);

  const requestedAt = useMemo(() => {
    if (!details?.time) return "Just now";
    const value = new Date(details.time);
    return Number.isNaN(value.getTime())
      ? "Just now"
      : new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit",
          month: "short",
          day: "numeric",
        }).format(value);
  }, [details?.time]);

  async function respond(decision: "approved" | "denied") {
    if (!details?.challengeId || !details.approvalToken) {
      setResult("error");
      setError("This approval request is incomplete or has expired.");
      return;
    }

    setResult("submitting");
    setError("");

    try {
      const response = await fetch("/api/auth/trusted-login/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: details.challengeId,
          approvalToken: details.approvalToken,
          decision,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update the request.");
      setResult(decision);
    } catch (responseError) {
      setResult("error");
      setError(
        responseError instanceof Error
          ? responseError.message
          : "Could not update the login request.",
      );
    }
  }

  if (!details) {
    return (
      <main className="flex min-h-[80dvh] items-center justify-center bg-[#030303]">
        <Loader2 className="animate-spin text-cyan-300" size={28} />
      </main>
    );
  }

  const finished = result === "approved" || result === "denied";

  return (
    <main className="relative flex min-h-[80dvh] items-center justify-center overflow-hidden bg-[#030303] px-4 py-16 text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-600/15 blur-[130px]" />
      <motion.section
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#090a0f]/95 shadow-[0_40px_120px_rgba(0,0,0,0.75)]"
      >
        <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.3),transparent_45%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_42%)] p-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-black/30 text-cyan-100 shadow-[0_0_35px_rgba(34,211,238,0.15)]">
            {finished ? (
              result === "approved" ? <Check size={27} /> : <X size={27} />
            ) : (
              <ShieldCheck size={27} />
            )}
          </div>
          <h1 className="mt-6 text-2xl font-black tracking-tight">
            {finished
              ? result === "approved"
                ? "Login approved"
                : "Login blocked"
              : "Is this you?"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {finished
              ? result === "approved"
                ? "The requesting browser is completing sign-in now."
                : "That browser will not receive access to your account."
              : "A browser is asking to access your Lumora account."}
          </p>
        </div>

        <div className="space-y-4 p-6 sm:p-7">
          {!finished ? (
            <>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                <p className="break-all text-sm font-bold text-white">{details.email}</p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <MonitorSmartphone className="shrink-0 text-purple-300" size={17} />
                    <span>{details.device}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <MapPin className="shrink-0 text-cyan-300" size={17} />
                    <span>{details.ip}</span>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                    Requested {requestedAt}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] p-4 text-[11px] leading-relaxed text-zinc-400">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-200" size={17} />
                Approve only if you started this login. Lumora will never ask you to approve a
                request over chat or a phone call.
              </div>

              {result === "error" ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-xs text-red-200">
                  {error}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={result === "submitting"}
                  onClick={() => void respond("denied")}
                  className="min-h-14 rounded-2xl border border-red-400/20 bg-red-400/[0.055] text-[10px] font-black uppercase tracking-widest text-red-200 transition hover:bg-red-400/10 disabled:opacity-50"
                >
                  No, block it
                </button>
                <button
                  type="button"
                  disabled={result === "submitting"}
                  onClick={() => void respond("approved")}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-400 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_35px_rgba(124,58,237,0.24)] transition hover:brightness-110 disabled:opacity-50"
                >
                  {result === "submitting" ? (
                    <Loader2 className="animate-spin" size={17} />
                  ) : (
                    <Check size={17} />
                  )}
                  Yes, it&apos;s me
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => window.close()}
              className="min-h-13 w-full rounded-2xl border border-white/10 bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-zinc-300 transition hover:bg-white/[0.07]"
            >
              Close
            </button>
          )}
        </div>
      </motion.section>
    </main>
  );
}
