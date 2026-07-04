"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Laptop,
  Loader2,
  MailCheck,
  ShieldCheck,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  type TrustedLoginDeviceDetails,
  detectTrustedLoginDevice,
  getOrCreateTrustedDeviceToken,
  isIosStandaloneApp,
  registerTrustedLoginPush,
  supportsBackgroundPush,
} from "@/lib/trusted-login-client";
import { cn } from "@/lib/utils";

type RegisteredDevice = {
  id: string;
  loginEmail: string;
  deviceName: string;
  platform: string | null;
  browserName: string | null;
  osVersion: string | null;
  deviceModel: string | null;
  notificationPermission: string | null;
  setupCompletedAt: string;
  lastSeenAt: string;
  expiresAt: string;
  pushReady: boolean;
};

type EnrollmentResponse = {
  emails: string[];
  device: RegisteredDevice | null;
};

type Notice = {
  type: "success" | "error" | "info";
  message: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function TrustedLoginSetup() {
  const [enrollment, setEnrollment] = useState<EnrollmentResponse>({
    emails: [],
    device: null,
  });
  const [selectedEmail, setSelectedEmail] = useState("");
  const [detectedDevice, setDetectedDevice] = useState<TrustedLoginDeviceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [handoffUrl, setHandoffUrl] = useState("");
  const [isLocalPreview, setIsLocalPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadEnrollment = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/trusted-login", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load trusted login settings.");

      setEnrollment({
        emails: Array.isArray(data.emails) ? data.emails : [],
        device: data.device || null,
      });
      setSelectedEmail((current) => current || data.device?.loginEmail || data.emails?.[0] || "");
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Could not load trusted login settings.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setDetectedDevice(detectTrustedLoginDevice());
    const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);
    setIsLocalPreview(localHostnames.has(window.location.hostname));
    setHandoffUrl(`${window.location.origin}/account/settings?tab=security`);
    void loadEnrollment();
  }, [loadEnrollment]);

  async function copyHandoffLink() {
    if (!handoffUrl) return;
    await navigator.clipboard.writeText(handoffUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const selectedEmailIsRegistered = useMemo(
    () =>
      Boolean(
        enrollment.device &&
          enrollment.device.pushReady &&
          enrollment.device.loginEmail.toLowerCase() === selectedEmail.toLowerCase(),
      ),
    [enrollment.device, selectedEmail],
  );

  async function beginSetup() {
    setNotice(null);
    if (!detectedDevice?.isPhone) {
      setNotice({
        type: "info",
        message:
          "Open Lumora Settings on the phone you want to register, then return to this Security tab.",
      });
      return;
    }
    if (!selectedEmail) {
      setNotice({
        type: "error",
        message: "Verify an email on your Lumora account before setting up Lumora Confirm.",
      });
      return;
    }

    if (!supportsBackgroundPush()) {
      setNotice({
        type: "error",
        message: "This phone browser does not support background push notifications.",
      });
      return;
    }

    if (!isIosStandaloneApp()) {
      setNotice({
        type: "info",
        message:
          "On iPhone, add Lumora to your Home Screen first, open the installed app, and run setup there.",
      });
      return;
    }

    setConfirming(true);
  }

  async function confirmSetup() {
    if (!detectedDevice || !selectedEmail) return;

    setIsSaving(true);
    setNotice(null);

    try {
      const pushSubscription = await registerTrustedLoginPush();
      const notificationPermission = Notification.permission;

      const response = await fetch("/api/auth/trusted-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedEmail,
          deviceToken: getOrCreateTrustedDeviceToken(),
          deviceName: detectedDevice.deviceName,
          platform: detectedDevice.platform,
          browserName: detectedDevice.browserName,
          osVersion: detectedDevice.osVersion,
          deviceModel: detectedDevice.deviceModel,
          notificationPermission,
          pushSubscription,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not register this phone.");

      setConfirming(false);
      await loadEnrollment();
      setNotice({
        type: "success",
        message:
          "Registration successful. This phone can now approve logins even when Lumora is closed.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Could not register this phone.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function removeDevice() {
    setIsRemoving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/auth/trusted-login", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not remove the trusted phone.");

      await loadEnrollment();
      setNotice({
        type: "success",
        message: "Lumora Confirm has been removed from this account.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Could not remove the trusted phone.",
      });
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-[#07080c] p-5 sm:p-8 lg:rounded-[3rem] lg:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/8 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-purple-600/10 blur-[110px]" />

        <div className="relative space-y-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-purple-500/25 to-cyan-400/15 text-cyan-100 shadow-[0_0_35px_rgba(34,211,238,0.12)]">
                <ShieldCheck size={25} />
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.055] px-3 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-cyan-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
                  Optional security setup
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white sm:text-3xl">
                  Set up Lumora Confirm
                </h3>
                <p className="mt-2 max-w-2xl text-[11px] font-medium leading-relaxed text-zinc-500">
                  Choose your final login email and confirm one phone. Lumora stores the phone
                  details and push subscription only after you approve setup.
                </p>
              </div>
            </div>
            <div
              className={cn(
                "inline-flex min-h-10 items-center gap-2 self-start rounded-full border px-4 py-2 text-[9px] font-black uppercase tracking-widest",
                enrollment.device?.pushReady
                  ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                  : "border-white/10 bg-white/[0.035] text-zinc-500",
              )}
            >
              {enrollment.device?.pushReady ? <CheckCircle2 size={14} /> : <Smartphone size={14} />}
              {enrollment.device?.pushReady ? "Background ready" : "Not configured"}
            </div>
          </div>

          {notice ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-xs font-semibold",
                notice.type === "success" &&
                  "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200",
                notice.type === "error" && "border-red-400/20 bg-red-400/[0.07] text-red-200",
                notice.type === "info" && "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-100",
              )}
            >
              {notice.type === "success" ? (
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
              ) : (
                <AlertCircle className="mt-0.5 shrink-0" size={17} />
              )}
              <span className="leading-relaxed">{notice.message}</span>
            </motion.div>
          ) : null}

          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-widest text-zinc-600">
              <Loader2 className="mr-3 animate-spin" size={18} />
              Loading secure setup
            </div>
          ) : (
            <div className="space-y-6">
              <div className={cn("grid gap-5", detectedDevice?.isPhone && "lg:grid-cols-[1fr_auto] lg:items-end")}>
                <label className="space-y-3">
                  <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Final login email
                  </span>
                  <select
                    value={selectedEmail}
                    onChange={(event) => setSelectedEmail(event.target.value)}
                    className="min-h-14 w-full rounded-2xl border border-white/10 bg-black/35 px-5 text-sm font-semibold text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10"
                  >
                    {enrollment.emails.length ? (
                      enrollment.emails.map((email) => (
                        <option key={email} value={email} className="bg-[#08090d]">
                          {email}
                        </option>
                      ))
                    ) : (
                      <option value="">No verified email available</option>
                    )}
                  </select>
                  <span className="block text-[10px] leading-relaxed text-zinc-600">
                    Only verified emails connected to your Lumora account can be selected.
                  </span>
                </label>

                {detectedDevice?.isPhone ? (
                  <button
                    type="button"
                    onClick={() => void beginSetup()}
                    disabled={!selectedEmail || selectedEmailIsRegistered}
                    className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-400 px-7 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_0_35px_rgba(124,58,237,0.22)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {selectedEmailIsRegistered ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <Smartphone size={17} />
                    )}
                    {selectedEmailIsRegistered ? "Setup complete" : "Enable on this phone"}
                  </button>
                ) : null}
              </div>

              {!detectedDevice?.isPhone ? (
                <div className="overflow-hidden rounded-3xl border border-cyan-300/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_45%),rgba(255,255,255,0.018)]">
                  <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-100">
                        <Laptop size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-white">
                          One-time setup must happen on your phone
                        </p>
                        <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-zinc-500">
                          The phone must grant notification permission once. After that, Lumora can
                          send login approvals while the browser or installed app is closed.
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          {[
                            ["01", "Open Lumora on phone"],
                            ["02", "Sign in normally once"],
                            ["03", "Security > Enable"],
                          ].map(([step, label]) => (
                            <div key={step} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                              <span className="text-[8px] font-black tracking-widest text-cyan-300">{step}</span>
                              <p className="mt-1 text-[10px] font-bold text-zinc-300">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {!isLocalPreview && handoffUrl ? (
                      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white p-3 text-black">
                        <QRCodeSVG value={handoffUrl} size={112} level="M" />
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          Scan with phone
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {!isLocalPreview ? (
                    <div className="border-t border-white/8 px-5 py-4 sm:px-6">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void copyHandoffLink()}
                          className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-[9px] font-black uppercase tracking-widest text-zinc-300 transition hover:bg-white/[0.07]"
                        >
                          <Copy size={14} />
                          {copied ? "Link copied" : "Copy phone link"}
                        </button>
                        <a
                          href={handoffUrl}
                          className="flex min-h-11 items-center gap-2 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] px-4 text-[9px] font-black uppercase tracking-widest text-cyan-100 transition hover:bg-cyan-300/[0.09]"
                        >
                          <ExternalLink size={14} />
                          Open setup link
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {enrollment.device ? (
                <div className="grid gap-5 rounded-3xl border border-white/8 bg-white/[0.025] p-5 sm:p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-100">
                    <Smartphone size={21} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">
                      {enrollment.device.deviceName}
                    </p>
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {enrollment.device.loginEmail}
                    </p>
                    <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-zinc-600">
                      {enrollment.device.osVersion || enrollment.device.platform} ·{" "}
                      {enrollment.device.browserName || "Browser"} · Registered{" "}
                      {formatDate(enrollment.device.setupCompletedAt)}
                    </p>
                    <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                      {enrollment.device.pushReady
                        ? "Background approval active"
                        : "Refresh setup to enable background approval"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeDevice()}
                    disabled={isRemoving}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.055] px-5 text-[9px] font-black uppercase tracking-widest text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                  >
                    {isRemoving ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}
                    Remove
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.018] px-5 py-10 text-center">
                  <Smartphone className="mx-auto text-zinc-700" size={29} />
                  <p className="mt-4 text-xs font-black uppercase tracking-widest text-white">
                    No trusted phone registered
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-[11px] leading-relaxed text-zinc-600">
                    Nothing has been saved. Open this page on your signed-in phone to begin.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {confirming && detectedDevice ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-4 backdrop-blur-xl sm:items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="w-full max-w-md overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#08090d] shadow-[0_35px_100px_rgba(0,0,0,0.75)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="trusted-login-confirmation-title"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.25),transparent_45%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_40%)] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 text-white">
                    <MailCheck size={22} />
                  </div>
                  <div>
                    <h4
                      id="trusted-login-confirmation-title"
                      className="text-base font-black uppercase tracking-tight text-white"
                    >
                      Confirm this phone
                    </h4>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      Review before Lumora saves anything.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-white"
                  aria-label="Close phone confirmation"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-3 p-6">
                {[
                  ["Login email", selectedEmail],
                  ["Phone", detectedDevice.deviceModel],
                  ["System", detectedDevice.osVersion],
                  ["Browser", detectedDevice.browserName],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                      {label}
                    </span>
                    <span className="text-right text-xs font-bold text-white">{value}</span>
                  </div>
                ))}

                <p className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4 text-[10px] leading-relaxed text-zinc-500">
                  Selecting Confirm setup authorizes Lumora to store these device details and a
                  secure push subscription. Login prompts can arrive while Lumora is closed. You
                  can revoke this phone anytime.
                </p>

                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={isSaving}
                    className="min-h-12 rounded-xl border border-white/10 bg-white/[0.035] text-[9px] font-black uppercase tracking-widest text-zinc-300 transition hover:bg-white/[0.06]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void confirmSetup()}
                    disabled={isSaving}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-400 text-[9px] font-black uppercase tracking-widest text-white transition hover:brightness-110 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <ShieldCheck size={16} />
                    )}
                    {isSaving ? "Registering..." : "Confirm setup"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
