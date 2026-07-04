"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Smartphone,
  Radio
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import { signUpAction, signInAction, verifyOtpAction, forgotPasswordAction, resendOtpAction } from "@/app/actions/auth";
import { useAuth } from "@/hooks/useAuth";
import { LumoraMark } from "@/components/ui/LumoraLogo";

// --- Premium Custom Icons ---
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
  </svg>
);

type AuthState = 'signin' | 'signup' | 'magic' | 'forgot' | 'verify' | 'success';

export default function AuthPage() {
  const [state, setState] = useState<AuthState>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | 'discord' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isRedirectingState, setIsRedirectingState] = useState(false);
  const [trustedChallengeId, setTrustedChallengeId] = useState("");
  const [trustedBrowserToken, setTrustedBrowserToken] = useState("");
  const [trustedDeviceName, setTrustedDeviceName] = useState("");
  const [trustedExpiresAt, setTrustedExpiresAt] = useState("");
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  
  const { isRedirecting: isHookRedirecting } = useAuth(returnUrl);
  const isRedirecting = isHookRedirecting || isRedirectingState;

  // Auto-dismiss success/error messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    if (!trustedChallengeId || !trustedBrowserToken) return;

    let cancelled = false;
    let polling = false;

    const checkApproval = async () => {
      if (polling || cancelled) return;
      polling = true;

      try {
        const response = await fetch("/api/auth/trusted-login/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challengeId: trustedChallengeId,
            browserToken: trustedBrowserToken,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not check phone approval.");
        if (cancelled) return;

        if (data.status === "approved" && data.actionLink) {
          setIsRedirectingState(true);
          window.location.assign(data.actionLink);
          return;
        }

        if (data.status === "denied") {
          setTrustedChallengeId("");
          setTrustedBrowserToken("");
          setError("The registered phone blocked this login request.");
        } else if (data.status === "expired") {
          setTrustedChallengeId("");
          setTrustedBrowserToken("");
          setError("The phone approval request expired. Send a new request.");
        } else if (data.status === "delivery_failed") {
          setTrustedChallengeId("");
          setTrustedBrowserToken("");
          setError("Lumora could not reach the registered phone.");
        }
      } catch (pollError) {
        if (!cancelled) {
          setError(
            pollError instanceof Error
              ? pollError.message
              : "Could not check phone approval.",
          );
        }
      } finally {
        polling = false;
      }
    };

    void checkApproval();
    const interval = window.setInterval(checkApproval, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [trustedBrowserToken, trustedChallengeId]);

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'discord') => {
    setSocialLoading(provider);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { 
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnUrl)}` 
        },
      });
      if (error) throw error;
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Social login failed.");
      setSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const formEmail = formData.get('email') as string;
    if (formEmail) setEmail(formEmail);

    try {
      if (state === 'signin') {
        const result = await signInAction(formData);
        if (result?.error) {
          setError(result.error);
        } else {
          setIsRedirectingState(true);
          window.location.href = returnUrl;
        }
      } else if (state === 'signup') {
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setIsLoading(false);
          return;
        }

        const result = await signUpAction(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.step === 'verify') {
          setState('verify');
          setSuccess("Check your email for the verification code!");
        }
      } else if (state === 'forgot') {
        const result = await forgotPasswordAction(formEmail);
        if (result?.error) {
          setError(result.error);
        } else {
          setSuccess("If an account exists, a reset link has been sent.");
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError(null);
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setError("Please enter the full 6-digit code.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await verifyOtpAction(email, otpString);
      if (result.error) {
        setError(result.error);
      } else {
        setState('success');
        setIsRedirectingState(true);
        setTimeout(() => {
          // Use window.location for a more reliable redirect during auth flows
          window.location.href = returnUrl;
        }, 1500);
      }
    } catch {
      setError("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const formEmail = String(formData.get('email') || '').trim();
    if (formEmail) setEmail(formEmail);

    try {
      const bytes = new Uint8Array(32);
      window.crypto.getRandomValues(bytes);
      const browserToken = btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");

      const response = await fetch("/api/auth/trusted-login/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formEmail,
          browserToken,
          returnUrl,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not contact your phone.");

      setTrustedBrowserToken(browserToken);
      setTrustedChallengeId(result.challengeId);
      setTrustedDeviceName(result.deviceName || "your registered phone");
      setTrustedExpiresAt(result.expiresAt || "");
      setSuccess(result.message || "Approval sent to your registered phone.");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not start phone approval. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden selection:bg-purple-500/30 font-sans">
      {/* Background Refinement */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.12)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.08)_0%,transparent_50%)]" />
        {/* Soft Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {isRedirecting ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[440px] z-10 flex flex-col items-center justify-center space-y-6 min-h-[400px]"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative">
            <CheckCircle2 size={40} className="text-emerald-500" />
            <motion.div 
              className="absolute inset-0 rounded-full border border-emerald-500/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
            <p className="text-zinc-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-purple-500" size={16} /> 
              Redirecting to your dashboard...
            </p>
          </div>
        </motion.div>
      ) : (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <Link href="/" className="group flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-6 bg-purple-600/30 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <LumoraMark size={80} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 italic uppercase">
              Lumora<span className="text-purple-500">.</span>
            </h1>
          </Link>
        </div>

        {/* Central Auth Container */}
        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-[2rem] pointer-events-none" />
          <div className="bg-[#0A0A0B]/80 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden relative">
            
            {/* Floating Toast Notification */}
            <AnimatePresence>
              {(success || error) && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="absolute top-4 left-4 right-4 z-50"
                >
                  <div className={`p-4 rounded-2xl backdrop-blur-xl border flex items-center gap-3 shadow-2xl ${
                    success 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                      : "bg-red-500/10 border-red-500/20 text-red-500"
                  }`}>
                    {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-[11px] font-bold uppercase tracking-widest flex-1">
                      {success || error}
                    </span>
                    <button onClick={() => { setSuccess(null); setError(null); }} className="opacity-50 hover:opacity-100 transition-opacity">
                      <Lock className="rotate-45" size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {state === 'success' ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-10 space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">Verified!</h2>
                    <p className="text-zinc-500 text-sm mt-2">Welcome to the elite tier creators.</p>
                  </div>
                  <Loader2 className="animate-spin text-zinc-700" size={24} />
                </motion.div>
              ) : state === 'magic' ? (
                <motion.div
                  key="magic"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <button onClick={() => setState('signin')} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 text-[10px] font-black uppercase tracking-widest">
                      <Radio size={13} /> Background phone approval
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Continue with Lumora Confirm</h2>
                    <p className="text-zinc-500 text-sm">Enter your registered email. Lumora will send a secure approval prompt to your phone, even when the mobile app is closed.</p>
                  </div>

                  {trustedChallengeId ? (
                    <div className="space-y-5">
                      <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.045] p-6 text-center">
                        <motion.div
                          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.13),transparent_55%)]"
                          animate={{ opacity: [0.35, 0.8, 0.35] }}
                          transition={{ repeat: Infinity, duration: 2.4 }}
                        />
                        <div className="relative">
                          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-cyan-300/20 bg-black/35 text-cyan-100">
                            <Smartphone size={30} />
                            <motion.span
                              className="absolute inset-[-8px] rounded-[2rem] border border-cyan-300/20"
                              animate={{ scale: [0.9, 1.18], opacity: [0.8, 0] }}
                              transition={{ repeat: Infinity, duration: 1.8 }}
                            />
                          </div>
                          <h3 className="mt-5 text-base font-black text-white">Check your phone</h3>
                          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                            Approval sent to <span className="font-bold text-cyan-100">{trustedDeviceName}</span>.
                            Tap “Yes, it&apos;s me” to continue automatically.
                          </p>
                          {trustedExpiresAt ? (
                            <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                              Request expires in five minutes
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTrustedChallengeId("");
                          setTrustedBrowserToken("");
                          setSuccess(null);
                        }}
                        className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.035] text-[10px] font-black uppercase tracking-widest text-zinc-300 transition hover:bg-white/[0.06]"
                      >
                        Cancel request
                      </button>
                    </div>
                  ) : (
                    <form action={handleMagicLinkSubmit} className="space-y-4">
                      <div className="relative group">
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm pointer-events-none" />
                        <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-300 transition-colors" size={18} />
                          <input
                            name="email"
                            type="email"
                            required
                            defaultValue={email}
                            placeholder="Registered email address"
                            className="w-full bg-black/40 border border-white/[0.05] rounded-2xl py-4.5 pl-14 pr-6 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400/40 focus:bg-cyan-400/[0.02] transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(124,58,237,0.22)]"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                          <>Send Phone Approval <ArrowRight size={18} className="opacity-70" /></>
                        )}
                      </button>
                    </form>
                  )}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-[11px] leading-relaxed text-zinc-500">
                      Android can receive this as a background browser notification. On iPhone,
                      install Lumora to the Home Screen before registering the phone.
                    </p>
                  </div>
                </motion.div>
              ) : state === 'forgot' ? (
                <motion.div 
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <button onClick={() => setState('signin')} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <h2 className="text-2xl font-bold tracking-tight">Recover Account</h2>
                    <p className="text-zinc-500 text-sm">Enter your email and we&apos;ll send you a recovery link.</p>
                  </div>

                  <form action={async (formData) => {
                    setIsLoading(true);
                    setError(null);
                    const email = formData.get("email") as string;
                    const res = await forgotPasswordAction(email);
                    if (res?.error) {
                      setError(res.error);
                    } else {
                      setSuccess("Recovery link sent to your email!");
                    }
                    setIsLoading(false);
                  }} className="space-y-4">
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input 
                        name="email"
                        type="email"
                        placeholder="EMAIL ADDRESS"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold tracking-widest placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                        <>Send Recovery Link <ChevronRight size={16} className="opacity-50" /></>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : state === 'verify' ? (
                <motion.div 
                  key="verify"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <button onClick={() => setState('signup')} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <h2 className="text-2xl font-bold tracking-tight">Verify Email</h2>
                    <p className="text-zinc-500 text-sm">Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span></p>
                  </div>

                  <div className="flex justify-between gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-16 bg-white/[0.03] border border-white/10 rounded-2xl text-center text-2xl font-bold focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                      />
                    ))}
                  </div>

                  {/* Removed in-line alerts in favor of floating toast */}

                  <button 
                    onClick={handleVerifyOtp}
                    disabled={isLoading}
                    className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>Complete Verification <ChevronRight size={16} className="opacity-50" /></>
                    )}
                  </button>

                  <p className="text-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    Didn&apos;t get the code? <button
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const result = await resendOtpAction(email);
                          if (result?.error) {
                            setError(result.error);
                            setSuccess(null);
                            return;
                          }
                          setSuccess("New code sent to your email!");
                          setError(null);
                        } catch {
                          setError("Failed to resend code.");
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-white hover:underline disabled:opacity-50"
                    >
                      {isLoading ? "Sending..." : "Resend"}
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="auth-form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  {/* Tabs */}
                  {(state === 'signin' || state === 'signup') && (
                    <div className="grid grid-cols-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl relative mb-2">
                      <motion.div 
                        layoutId="activeTabGlow"
                        className="absolute inset-1.5 w-[calc(50%-6px)] bg-[#1A1A1C] rounded-xl border border-white/10 shadow-xl"
                        animate={{ x: state === 'signin' ? 0 : '100%' }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                      <button 
                        onClick={() => { setState('signin'); setError(null); }}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] relative z-10 transition-all ${
                          state === 'signin' ? "text-white" : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={() => { setState('signup'); setError(null); }}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] relative z-10 transition-all ${
                          state === 'signup' ? "text-white" : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>
                  )}

                  {state === 'forgot' && (
                    <div className="space-y-2">
                      <button onClick={() => setState('signin')} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4">
                        <ArrowLeft size={14} /> Back
                      </button>
                      <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
                      <p className="text-zinc-500 text-sm">Enter your email to receive a password reset link.</p>
                    </div>
                  )}

                  {/* Identity Providers */}
                  {(state === 'signin' || state === 'signup') && (
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => handleSocialLogin('google')}
                        disabled={!!socialLoading}
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:bg-white/[0.05] hover:border-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-350 disabled:opacity-50 group shadow-md"
                      >
                        {socialLoading === 'google' ? <Loader2 size={16} className="animate-spin text-zinc-600" /> : <GoogleIcon />}
                        Google
                      </button>
                      <button 
                        onClick={() => handleSocialLogin('github')}
                        disabled={!!socialLoading}
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:bg-white/[0.05] hover:border-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-350 disabled:opacity-50 group shadow-md"
                      >
                        {socialLoading === 'github' ? <Loader2 size={16} className="animate-spin text-zinc-600" /> : <GitHubIcon />}
                        GitHub
                      </button>
                      <button 
                        onClick={() => handleSocialLogin('discord')}
                        disabled={!!socialLoading}
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:bg-[#5865F2]/10 hover:border-[#5865F2]/40 hover:text-white hover:shadow-[0_0_20px_rgba(88,101,242,0.2)] transition-all duration-350 disabled:opacity-50 group shadow-md"
                      >
                        {socialLoading === 'discord' ? (
                          <Loader2 size={16} className="animate-spin text-zinc-650" />
                        ) : (
                          <span className="text-white/85 group-hover:text-[#5865F2] transition-colors duration-350">
                            <DiscordIcon />
                          </span>
                        )}
                        Discord
                      </button>
                    </div>
                  )}

                  {state === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setState('magic'); setError(null); setSuccess(null); }}
                      className="w-full group relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.055] p-[1px] text-left transition-all hover:border-cyan-300/35 hover:bg-cyan-400/[0.085]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center gap-4 rounded-2xl px-4 py-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-black/30 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                          <KeyRound size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black uppercase tracking-[0.18em] text-white">Continue with Lumora Confirm</div>
                          <div className="mt-1 text-[11px] font-medium text-zinc-500">Approve sign-in from your registered phone.</div>
                        </div>
                        <ArrowRight size={17} className="text-cyan-200 opacity-70 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  )}

                  {/* Separator */}
                  {(state === 'signin' || state === 'signup') && (
                    <div className="relative flex items-center gap-4">
                      <div className="h-[1px] flex-1 bg-white/[0.03]" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">or continue with email</span>
                      <div className="h-[1px] flex-1 bg-white/[0.03]" />
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                      <div className="relative group">
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm pointer-events-none" />
                        <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-400 transition-colors" size={18} />
                          <input 
                            name="email"
                            type="email" 
                            required
                            placeholder="Email address"
                            className="w-full bg-black/40 border border-white/[0.05] rounded-2xl py-4.5 pl-14 pr-6 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/40 focus:bg-purple-500/[0.02] transition-all"
                          />
                        </div>
                      </div>

                      {state !== 'forgot' && (
                        <div className="relative group">
                          <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm pointer-events-none" />
                          <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-400 transition-colors" size={18} />
                            <input 
                              name="password"
                              type="password" 
                              required
                              placeholder="Security Password"
                              className="w-full bg-black/40 border border-white/[0.05] rounded-2xl py-4.5 pl-14 pr-6 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/40 focus:bg-purple-500/[0.02] transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {state === 'signup' && (
                        <div className="relative group">
                          <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm pointer-events-none" />
                          <div className="relative">
                            <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-400 transition-colors" size={18} />
                            <input 
                              name="confirmPassword"
                              type="password" 
                              required
                              placeholder="Confirm Password"
                              className="w-full bg-black/40 border border-white/[0.05] rounded-2xl py-4.5 pl-14 pr-6 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/40 focus:bg-purple-500/[0.02] transition-all"
                            />
                          </div>
                        </div>
                      )}
                      
                      {state === 'signin' && (
                        <div className="flex justify-end px-1">
                          <button 
                            type="button" 
                            onClick={() => setState('forgot')}
                            className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Removed in-line alerts in favor of floating toast */}

                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.15)] relative overflow-hidden group"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                        <>
                          {state === 'signin' ? 'Sign In' : state === 'signup' ? 'Create Account' : 'Send Reset Link'}
                          <ChevronRight size={18} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footnote */}
        <div className="flex flex-col items-center gap-8 mt-12">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.05] bg-white/[0.02] shadow-sm backdrop-blur-md">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Secure SSL Encrypted</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">
              Lumora
            </p>
          </div>
        </div>
      </motion.div>
      )}
    </div>
  );
}
