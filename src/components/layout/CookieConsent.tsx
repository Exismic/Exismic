"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Settings2, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DEFAULT_COOKIE_PREFERENCES,
  OPEN_COOKIE_PREFERENCES_EVENT,
  readCookieConsent,
  saveCookieConsent,
  type CookiePreferences,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [hasDecision, setHasDecision] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(
    DEFAULT_COOKIE_PREFERENCES,
  );

  useEffect(() => {
    let bannerTimer: number | undefined;
    const initializeTimer = window.setTimeout(() => {
      const savedConsent = readCookieConsent();
      setMounted(true);
      setHasDecision(Boolean(savedConsent));

      if (savedConsent) {
        setPreferences(savedConsent.preferences);
      } else {
        bannerTimer = window.setTimeout(() => setShowBanner(true), 900);
      }
    }, 0);

    const handleOpenPreferences = () => {
      const latestConsent = readCookieConsent();
      setPreferences(
        latestConsent?.preferences ?? DEFAULT_COOKIE_PREFERENCES,
      );
      setShowBanner(false);
      setShowModal(true);
    };

    window.addEventListener(
      OPEN_COOKIE_PREFERENCES_EVENT,
      handleOpenPreferences,
    );

    return () => {
      window.clearTimeout(initializeTimer);
      if (bannerTimer) window.clearTimeout(bannerTimer);
      window.removeEventListener(
        OPEN_COOKIE_PREFERENCES_EVENT,
        handleOpenPreferences,
      );
    };
  }, []);

  const persistPreferences = (newPreferences: CookiePreferences) => {
    saveCookieConsent(newPreferences);
    setPreferences(newPreferences);
    setHasDecision(true);
    setShowBanner(false);
    setShowModal(false);
  };

  const acceptAll = () => {
    persistPreferences({
      essential: true,
      analytics: true,
      functional: true,
    });
  };

  const rejectAll = () => {
    persistPreferences(DEFAULT_COOKIE_PREFERENCES);
  };

  const closePreferences = () => {
    setShowModal(false);
    if (!hasDecision) setShowBanner(true);
  };

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-x-3 bottom-3 z-[100] mx-auto w-auto max-w-4xl sm:inset-x-6 sm:bottom-6"
            role="region"
            aria-label="Cookie consent"
          >
            <div className="glass-dark group relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-[0_24px_80px_-20px_rgba(0,0,0,1)] sm:rounded-3xl sm:px-8 sm:py-6">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/10 via-transparent to-accent-cyan/10 opacity-60" />

              <div className="relative z-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center md:gap-6">
                <div className="flex items-start gap-4 md:items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                    <Cookie size={19} className="text-accent-cyan" />
                  </div>
                  <div className="space-y-1.5 pr-6 sm:pr-0">
                    <p className="text-sm font-bold text-white">
                      Your privacy, your choice
                    </p>
                    <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
                      Essential cookies keep Exismic secure. Analytics and
                      functional storage are optional and stay off until you
                      choose otherwise. You can change this anytime. {" "}
                      <Link
                        href="/cookies"
                        className="text-accent-cyan underline-offset-2 transition-colors hover:text-white hover:underline"
                      >
                        Cookie Policy
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
                  <button
                    type="button"
                    onClick={rejectAll}
                    className="min-h-11 rounded-xl border border-white/10 px-4 text-xs font-bold text-zinc-300 transition-all hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
                  >
                    Reject optional
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-white transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
                  >
                    <Settings2 size={14} /> Customize
                  </button>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="col-span-2 min-h-11 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan px-6 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_24px_rgba(34,211,238,0.2)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:col-auto"
                  >
                    Accept all
                  </button>
                </div>

                <button
                  type="button"
                  onClick={rejectAll}
                  aria-label="Reject optional cookies and close"
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-zinc-500 transition-colors hover:text-white md:hidden"
                >
                  <X size={17} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.button
              type="button"
              aria-label="Close cookie preferences"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePreferences}
              className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cookie-preferences-title"
              initial={{ opacity: 0, scale: 0.97, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 24 }}
              className="glass-dark relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] border border-white/10 p-6 shadow-2xl sm:rounded-[2.5rem] sm:p-8"
            >
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-accent-purple via-fuchsia-400 to-accent-cyan" />

              <button
                type="button"
                onClick={closePreferences}
                aria-label="Close cookie preferences"
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-white/5 hover:text-white sm:right-6 sm:top-6"
              >
                <X size={20} />
              </button>

              <div className="space-y-7">
                <div className="pr-12">
                  <h2
                    id="cookie-preferences-title"
                    className="text-2xl font-black italic text-white"
                  >
                    Cookie Preferences
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Choose which optional technologies Exismic may use on this
                    browser. Essential services always remain active.
                  </p>
                </div>

                <div className="space-y-3">
                  <PreferenceCard
                    icon={<ShieldCheck size={20} />}
                    title="Essential"
                    description="Required for authentication, security, payments, and remembering your privacy choice."
                    required
                  />
                  <PreferenceCard
                    id="analytics"
                    title="Analytics"
                    description="Allows Microsoft Clarity to help us understand performance and improve Exismic."
                    checked={preferences.analytics}
                    onChange={(checked) =>
                      setPreferences((current) => ({
                        ...current,
                        analytics: checked,
                      }))
                    }
                  />
                  <PreferenceCard
                    id="functional"
                    title="Functional"
                    description="Remembers optional preferences, drafts, and tool history on this device."
                    checked={preferences.functional}
                    onChange={(checked) =>
                      setPreferences((current) => ({
                        ...current,
                        functional: checked,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={rejectAll}
                    className="min-h-12 rounded-xl border border-white/10 text-xs font-bold text-zinc-300 transition-all hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
                  >
                    Reject optional
                  </button>
                  <button
                    type="button"
                    onClick={() => persistPreferences(preferences)}
                    className="min-h-12 rounded-xl bg-white text-xs font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
                  >
                    Save choices
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

type PreferenceCardProps = {
  id?: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  required?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

function PreferenceCard({
  id,
  icon,
  title,
  description,
  required = false,
  checked = false,
  onChange,
}: PreferenceCardProps) {
  return (
    <div className="flex min-h-24 items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.025] p-4">
      {required ? (
        <div className="mt-0.5 shrink-0 text-accent-purple">{icon}</div>
      ) : (
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(event) => onChange?.(event.target.checked)}
            className="peer sr-only"
          />
          <label
            htmlFor={id}
            className="flex h-7 w-12 cursor-pointer items-center rounded-full bg-white/10 p-1 transition-colors peer-checked:bg-accent-cyan peer-focus-visible:ring-2 peer-focus-visible:ring-white"
          >
            <span
              className={cn(
                "h-5 w-5 rounded-full bg-white shadow-md transition-transform",
                checked ? "translate-x-5" : "translate-x-0",
              )}
            />
            <span className="sr-only">Toggle {title}</span>
          </label>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={id} className="text-sm font-bold text-white">
            {title}
          </label>
          {required && (
            <span className="shrink-0 rounded-full border border-accent-purple/20 bg-accent-purple/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-accent-purple">
              Always on
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}
