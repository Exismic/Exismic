"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  ArrowRight, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Smartphone,
  Radio,
  Link2,
  X,
  Sparkles,
  Zap,
  Check,
  Globe,
  Star,
  Layers
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import {
  signUpAction,
  signInAction,
  verifyOtpAction,
  forgotPasswordAction,
  resendOtpAction,
  getOAuthLinkRequestAction,
  consumeOAuthLinkRequestAction,
  cancelOAuthLinkRequestAction,
  type OAuthLinkProvider,
} from "@/app/actions/auth";
import { useAuth } from "@/hooks/useAuth";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { getClientSiteUrl } from "@/lib/site-url";

// --- Premium Custom Brand Icons ---
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
  </svg>
);

type AuthState =
  | 'signin'
  | 'signup'
  | 'magic'
  | 'forgot'
  | 'verify'
  | 'link'
  | 'linkVerify'
  | 'success';

type AuthFieldErrors = {
  email?: string;
  password?: string;
};

function providerLabel(provider: OAuthLinkProvider | null) {
  if (provider === 'google') return 'Google';
  if (provider === 'github') return 'GitHub';
  if (provider === 'discord') return 'Discord';
  return 'social login';
}

function ProviderIcon({ provider }: { provider: OAuthLinkProvider | null }) {
  if (provider === 'google') return <GoogleIcon />;
  if (provider === 'github') return <GitHubIcon />;
  if (provider === 'discord') return <DiscordIcon />;
  return <Link2 size={20} />;
}

// Password strength calculator
function calculatePasswordStrength(pass: string) {
  let score = 0;
  if (!pass) return { score: 0, label: "Empty", color: "bg-zinc-700" };
  if (pass.length >= 8) score++;
  if (pass.length >= 10) score++;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

  if (score === 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-purple-500" };
  return { score: 4, label: "Strong", color: "bg-emerald-400" };
}

export default function AuthPage() {
  const [state, setState] = useState<AuthState>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | 'discord' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [pendingSignupPassword, setPendingSignupPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [linkEmail, setLinkEmail] = useState("");
  const [linkProvider, setLinkProvider] = useState<OAuthLinkProvider | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isRedirectingState, setIsRedirectingState] = useState(false);
  const [trustedChallengeId, setTrustedChallengeId] = useState("");
  const [trustedBrowserToken, setTrustedBrowserToken] = useState("");
  const [trustedDeviceName, setTrustedDeviceName] = useState("");
  const [trustedExpiresAt, setTrustedExpiresAt] = useState("");
  
  // Interactive UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");

  const searchParams = useSearchParams();
  const authErrorCode = searchParams.get('authError');
  const errorParam = searchParams.get('error');
  const linkToken = searchParams.get('link') || '';
  const requestedReturnUrl = searchParams.get('returnUrl');
  const returnUrl =
    requestedReturnUrl?.startsWith('/') && !requestedReturnUrl.startsWith('//')
      ? requestedReturnUrl
      : '/dashboard';
  
  const { isRedirecting: isHookRedirecting } = useAuth(returnUrl);
  const isRedirecting = isHookRedirecting || isRedirectingState;

  // Auto-dismiss success/error messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    if (errorParam === 'suspended') {
      setError("This account has been suspended due to violations of Exismic terms of service.");
      const supabase = createClient();
      supabase.auth.signOut().then(() => {
        // Clear local credentials cache
      });
    }
  }, [errorParam]);

  useEffect(() => {
    if (!authErrorCode) return;
    const messages: Record<string, string> = {
      provider_link_failed: "That login method couldn't be connected securely. Please try again.",
      session_exchange_failed: "The sign-in session expired before it could finish. Please try again.",
      missing_identity: "That provider didn't share a verified email address.",
    };
    setError(messages[authErrorCode] || "We couldn't finish that sign-in. Please try again.");
  }, [authErrorCode]);

  useEffect(() => {
    if (!linkToken) return;
    let cancelled = false;

    void getOAuthLinkRequestAction(linkToken).then((result) => {
      if (cancelled) return;
      if (result.error || !result.email || !result.provider) {
        setError(result.error || "This connection request is no longer available.");
        setState('signin');
        return;
      }

      setLinkEmail(result.email);
      setLinkProvider(result.provider);
      setState('link');
      setError(null);
    });

    return () => {
      cancelled = true;
    };
  }, [linkToken]);

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
          setError("Exismic could not reach the registered phone.");
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
    value = value.replace(/\D/g, '').slice(0, 1);
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
    setFieldErrors({});
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { 
          redirectTo: `${getClientSiteUrl()}/auth/callback?next=${encodeURIComponent(returnUrl)}` 
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
    const formEmail = String(formData.get('email') || '').trim();
    const formPassword = String(formData.get('password') || '');
    if (formEmail) setEmail(formEmail);

    const nextFieldErrors: AuthFieldErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      nextFieldErrors.email = "Enter a complete email address.";
    }
    if (state !== 'forgot' && !formPassword) {
      nextFieldErrors.password = "Enter your password.";
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("Check the highlighted fields and try again.");
      setIsLoading(false);
      return;
    }
    setFieldErrors({});

    try {
      if (state === 'signin') {
        const result = await signInAction(formData);
        if (result?.error) {
          setError(result.error);
          if (result.field === 'email') {
            setFieldErrors({ email: result.error });
          } else if (result.field === 'password') {
            setFieldErrors({ password: result.error });
          } else if (result.field === 'credentials') {
            setFieldErrors({
              email: "Check this email address.",
              password: "Check this password.",
            });
          }
        } else {
          setIsRedirectingState(true);
          window.location.href = returnUrl;
        }
      } else if (state === 'signup') {
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password.length < 10) {
          setError("Use at least 10 characters with a mix of uppercase, lowercase, numbers, or symbols.");
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
          setEmail(String(result.email || formEmail).trim().toLowerCase());
          setPendingSignupPassword(password);
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

  const handleCancelLink = async () => {
    if (linkToken) await cancelOAuthLinkRequestAction(linkToken);
    setLinkEmail("");
    setLinkProvider(null);
    setState('signin');
    setError(null);
    window.history.replaceState({}, '', '/auth/login');
  };

  const handleLinkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const password = String(new FormData(e.currentTarget).get('password') || '');
    if (!password) {
      setFieldErrors({ password: "Enter the password for this Exismic account." });
      setError("Enter your password to approve this connection.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: linkEmail,
        password,
      });
      if (signInError) {
        setFieldErrors({ password: "That password doesn't match this account." });
        setError("Password incorrect. Your account has not been changed.");
        return;
      }

      const approval = await consumeOAuthLinkRequestAction(linkToken);
      if (approval.error || !approval.provider) {
        setError(approval.error || "Could not approve this login method.");
        return;
      }

      setIsRedirectingState(true);
      const { error: linkError } = await supabase.auth.linkIdentity({
        provider: approval.provider,
        options: {
          redirectTo: `${getClientSiteUrl()}/auth/callback?next=${encodeURIComponent(returnUrl)}`,
        },
      });
      if (linkError) {
        setIsRedirectingState(false);
        setError("Could not connect that login method. Please try again.");
      }
    } catch {
      setError("Could not connect that login method. Please try again.");
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
      const result = await verifyOtpAction(email, otpString, pendingSignupPassword);
      if (result.error) {
        setError(result.error);
      } else {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: pendingSignupPassword,
        });

        if (signInError) {
          setPendingSignupPassword("");
          setState('signin');
          setSuccess("Email verified. Sign in with your new password.");
          return;
        }

        setState('success');
        setIsRedirectingState(true);
        setPendingSignupPassword("");
        window.location.replace(returnUrl);
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

  const passStrength = calculatePasswordStrength(signupPassword);

  return (
    <div className="min-h-screen bg-[#020204] text-white flex flex-col lg:flex-row overflow-hidden relative font-sans selection:bg-purple-500/30">
      
      {/* GLOBAL BACKGROUND EFFECTS & AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated glowing mesh gradient blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.16)_0%,rgba(99,102,241,0.08)_50%,transparent_70%)] blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] -right-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,rgba(168,85,247,0.06)_50%,transparent_70%)] blur-3xl" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/[0.04] blur-[140px] rounded-full" />
        
        {/* Luxury subtle dot grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [bg-size:32px_32px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_50%,transparent_100%)] opacity-80" />
      </div>

      {/* ======================================================================== */}
      {/* LEFT PANEL: SaaS Visual Showcase & Hero Experience (Desktop Only)       */}
      {/* ======================================================================== */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 xl:p-16 z-10 border-r border-white/[0.06] bg-[#040407]/70 backdrop-blur-2xl">
        
        {/* Top Header / Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3.5">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-violet-500 to-cyan-400 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <ExismicMark size={44} className="relative z-10 transform group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1 font-mono">
                EXISMIC<span className="text-purple-400 font-sans">.</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                AI Creation Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Middle Feature Showcase */}
        <div className="my-auto py-10 max-w-xl space-y-9">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Everything you need to <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                create with AI.
              </span>
            </h1>

            <p className="text-zinc-400 text-base leading-relaxed font-normal">
              Remove backgrounds, generate images, isolate audio stems, and convert code — all in one powerful, unified workspace.
            </p>
          </motion.div>

          {/* Clean Feature Highlights Grid */}
          <div className="space-y-3.5">
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-start gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.035] hover:border-purple-500/25 transition-all duration-300 group shadow-sm"
            >
              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 shrink-0 group-hover:scale-105 transition-all duration-300">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">Image & Asset Generation</h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed font-normal">
                  Instant background removal, AI image creation, and photo enhancement in high resolution.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-start gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.035] hover:border-cyan-500/25 transition-all duration-300 group shadow-sm"
            >
              <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shrink-0 group-hover:scale-105 transition-all duration-300">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">Audio & Vocal Separation</h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed font-normal">
                  Studio-grade vocal and instrumental stem separation for music producers and video creators.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-start gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.035] hover:border-emerald-500/25 transition-all duration-300 group shadow-sm"
            >
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shrink-0 group-hover:scale-105 transition-all duration-300">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-200 transition-colors">Developer & Productivity Tools</h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed font-normal">
                  Convert design screenshots to code, extract text with smart OCR, and automate export workflows.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Trust Social Proof Bar */}
          <div className="pt-5 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex -space-x-2.5">
                <img src="/avatars/marcus.png" alt="Creator" className="w-8 h-8 rounded-full border-2 border-[#040407] object-cover ring-1 ring-white/10" />
                <img src="/avatars/alena.png" alt="Creator" className="w-8 h-8 rounded-full border-2 border-[#040407] object-cover ring-1 ring-white/10" />
                <img src="/avatars/julian.png" alt="Creator" className="w-8 h-8 rounded-full border-2 border-[#040407] object-cover ring-1 ring-white/10" />
                <div className="w-8 h-8 rounded-full border-2 border-[#040407] bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white ring-1 ring-white/10">
                  +10k
                </div>
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={11} fill="currentColor" className="drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
                  <Star size={11} fill="currentColor" className="drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
                  <Star size={11} fill="currentColor" className="drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
                  <Star size={11} fill="currentColor" className="drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
                  <Star size={11} fill="currentColor" className="drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
                  <span className="text-white font-extrabold ml-1 text-[11px]">4.9/5</span>
                </div>
                <p className="text-zinc-400 text-[11px] font-medium">Loved by creators worldwide</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium bg-white/[0.02] border border-white/[0.04] px-3 py-1.5 rounded-full">
              <Globe size={13} className="text-purple-400" />
              <span>99.99% Uptime</span>
            </div>
          </div>

        </div>

        {/* Footer / Copyright */}
        <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
          <p>© {new Date().getFullYear()} Exismic. All rights reserved.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>

      </div>

      {/* ======================================================================== */}
      {/* RIGHT PANEL: Sleek Glassmorphic Form Container                           */}
      {/* ======================================================================== */}
      <div className="w-full lg:w-[48%] flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 z-10 relative">

        {/* Redirecting Overlay Screen */}
        {isRedirecting ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[420px] flex flex-col items-center justify-center space-y-6 py-16"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <CheckCircle2 size={42} className="text-emerald-400" />
              <motion.div 
                className="absolute inset-0 rounded-3xl border border-emerald-500/40"
                animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Authentication Approved</h2>
              <p className="text-zinc-400 text-sm flex items-center justify-center gap-2 font-medium">
                <Loader2 className="animate-spin text-purple-400" size={16} /> 
                Redirecting to your workspace...
              </p>
            </div>
          </motion.div>
        ) : (

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* Mobile Only Header Logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <Link href="/" className="flex flex-col items-center group">
              <ExismicMark size={56} className="mb-3 transform group-hover:scale-105 transition-transform" />
              <h1 className="text-2xl font-black tracking-tight text-white">
                EXISMIC<span className="text-purple-400">.</span>
              </h1>
            </Link>
          </div>

          {/* Account Suspended Notice */}
          {errorParam === "suspended" && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs space-y-2 backdrop-blur-md">
              <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
                <AlertCircle size={15} /> Account Suspended
              </div>
              <p className="leading-relaxed text-zinc-300">
                This account has been suspended due to violations of Exismic terms of service.
              </p>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                If you believe this is a mistake, you can <Link href="/appeal" className="text-purple-400 hover:underline font-bold">submit an appeal</Link>.
              </p>
            </div>
          )}

          {/* Main Auth Glass Card */}
          <div className="relative group">
            {/* Multi-layer ambient border glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-purple-500/30 via-white/10 to-cyan-500/20 rounded-[2.1rem] pointer-events-none blur-[1px]" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-[2.1rem] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="bg-[#090a10]/95 backdrop-blur-3xl border border-white/[0.09] rounded-[2rem] p-7 sm:p-10 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.9)] overflow-hidden relative">
              
              {/* Floating Toast Notification */}
              <AnimatePresence>
                {(success || error) && (
                  <motion.div 
                    initial={{ opacity: 0, y: -16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="mb-6"
                  >
                    <div className={`relative overflow-hidden rounded-2xl border p-[1px] shadow-2xl ${
                      success 
                        ? "border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-transparent"
                        : "border-rose-500/30 bg-gradient-to-r from-rose-500/20 via-amber-500/10 to-transparent"
                    }`}>
                      <div className="flex items-start gap-3 rounded-[15px] bg-[#0a0a12]/95 p-3.5 backdrop-blur-xl">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                          success
                            ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                            : "border-rose-400/30 bg-rose-500/15 text-rose-300"
                        }`}>
                          {success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className={`text-[10px] font-black uppercase tracking-wider ${
                            success ? "text-emerald-300" : "text-rose-300"
                          }`}>
                            {success ? "Success" : "Attention Required"}
                          </p>
                          <p className="mt-0.5 text-xs font-medium leading-relaxed text-zinc-200">
                            {success || error}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="Dismiss message"
                          onClick={() => { setSuccess(null); setError(null); }}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic State Machine Screens */}
              <AnimatePresence mode="wait">
                
                {/* ------------------------------------------------------------- */}
                {/* STATE: LINK OFFER                                             */}
                {/* ------------------------------------------------------------- */}
                {state === 'link' ? (
                  <motion.div
                    key="link-offer"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                          <ProviderIcon provider={linkProvider} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Identity Linking</p>
                          <h2 className="text-xl font-bold text-white">Connect {providerLabel(linkProvider)}?</h2>
                        </div>
                      </div>
                      <Link2 size={18} className="text-purple-400" />
                    </div>

                    <div className="border-y border-white/10 py-5 space-y-2">
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        An account already exists for <span className="font-semibold text-white">{linkEmail}</span>.
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                        Linking {providerLabel(linkProvider)} will enable quick one-click login in the future without affecting your saved data or credits.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setState('linkVerify')}
                        className="py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Approve & Connect
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleCancelLink()}
                        className="py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all cursor-pointer"
                      >
                        Not Now
                      </button>
                    </div>
                  </motion.div>

                ) : state === 'linkVerify' ? (
                  
                  /* ------------------------------------------------------------- */
                  /* STATE: LINK VERIFY (CONFIRM EXISTING PASSWORD)               */
                  /* ------------------------------------------------------------- */
                  <motion.div
                    key="link-verify"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <button
                      type="button"
                      onClick={() => { setState('link'); setError(null); setFieldErrors({}); }}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>

                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-white">Approve {providerLabel(linkProvider)}</h2>
                      <p className="mt-1.5 text-xs text-zinc-400 font-medium">Confirm your existing Exismic password to finish linking.</p>
                    </div>

                    <form onSubmit={handleLinkSubmit} className="space-y-4">
                      <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Account Email</p>
                        <p className="mt-1 truncate text-xs font-semibold text-white">{linkEmail}</p>
                      </div>

                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Current password"
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-black" size={16} />
                            <span>Connecting...</span>
                          </div>
                        ) : (
                          <><Link2 size={15} /> Confirm & Link Provider</>
                        )}
                      </button>
                    </form>
                  </motion.div>

                ) : state === 'success' ? (

                  /* ------------------------------------------------------------- */
                  /* STATE: SUCCESS SCREEN                                         */
                  /* ------------------------------------------------------------- */
                  <motion.div 
                    key="success-screen"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-8 space-y-5"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 size={36} />
                    </div>
                    <div className="text-center space-y-1">
                      <h2 className="text-2xl font-bold text-white">Identity Verified</h2>
                      <p className="text-zinc-400 text-xs font-medium">Preparing your workspace dashboard...</p>
                    </div>
                    <Loader2 className="animate-spin text-purple-400" size={20} />
                  </motion.div>

                ) : state === 'magic' ? (

                  /* ------------------------------------------------------------- */
                  /* STATE: PHONE MFA APPROVAL                                      */
                  /* ------------------------------------------------------------- */
                  <motion.div
                    key="magic-screen"
                    initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <button onClick={() => setState('signin')} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer">
                      <ArrowLeft size={14} /> Back to standard login
                    </button>

                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        <Radio size={12} className="animate-pulse" /> Mobile Approval Security
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-white">Mobile Device MFA</h2>
                      <p className="text-zinc-400 text-xs leading-relaxed font-normal">
                        Approve sign-in requests directly from your trusted phone app without typing passwords.
                      </p>
                    </div>

                    {trustedChallengeId ? (
                      <div className="space-y-4">
                        <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.05] p-6 text-center shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                          <div className="relative z-10 space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/40 bg-black/50 text-cyan-300 relative shadow-md">
                              <Smartphone size={28} />
                              <motion.span
                                className="absolute inset-[-6px] rounded-2xl border border-cyan-400/40"
                                animate={{ scale: [1, 1.2], opacity: [0.8, 0] }}
                                transition={{ repeat: Infinity, duration: 1.8 }}
                              />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">Approval Request Sent</h3>
                              <p className="mt-1 text-xs text-zinc-400 leading-relaxed font-normal">
                                Notification sent to <span className="font-semibold text-cyan-200">{trustedDeviceName}</span>. Tap &ldquo;Approve&rdquo; on your phone screen.
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setTrustedChallengeId("");
                            setTrustedBrowserToken("");
                            setSuccess(null);
                          }}
                          className="w-full py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 transition-all cursor-pointer"
                        >
                          Cancel Request
                        </button>
                      </div>
                    ) : (
                      <form action={handleMagicLinkSubmit} className="space-y-4">
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                          <input
                            name="email"
                            type="email"
                            required
                            defaultValue={email}
                            placeholder="Registered email address"
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-black text-xs uppercase tracking-wider hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="animate-spin text-white" size={16} />
                              <span>Sending Request...</span>
                            </div>
                          ) : (
                            <>Send Approval Request <ArrowRight size={15} /></>
                          )}
                        </button>
                      </form>
                    )}
                  </motion.div>

                ) : state === 'forgot' ? (

                  /* ------------------------------------------------------------- */
                  /* STATE: FORGOT PASSWORD                                         */
                  /* ------------------------------------------------------------- */
                  <motion.div 
                    key="forgot-screen"
                    initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <button onClick={() => setState('signin')} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer">
                      <ArrowLeft size={14} /> Back to Sign In
                    </button>

                    <div className="space-y-1">
                      <h2 className="text-2xl font-black tracking-tight text-white">Reset Password</h2>
                      <p className="text-zinc-400 text-xs font-normal">Enter your email address to receive a secure recovery link.</p>
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
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                        <input 
                          name="email"
                          type="email"
                          placeholder="Your account email"
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          required
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-black" size={16} />
                            <span>Sending Link...</span>
                          </div>
                        ) : (
                          <>Send Recovery Link <ChevronRight size={16} /></>
                        )}
                      </button>
                    </form>
                  </motion.div>

                ) : state === 'verify' ? (

                  /* ------------------------------------------------------------- */
                  /* STATE: VERIFY OTP                                              */
                  /* ------------------------------------------------------------- */
                  <motion.div 
                    key="verify-screen"
                    initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <button onClick={() => setState('signup')} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer">
                      <ArrowLeft size={14} /> Back
                    </button>

                    <div className="space-y-1">
                      <h2 className="text-2xl font-black tracking-tight text-white">Verify Email Address</h2>
                      <p className="text-zinc-400 text-xs leading-relaxed font-normal">
                        Enter the 6-digit code sent to <span className="text-white font-semibold">{email}</span>
                      </p>
                    </div>

                    <div className="flex justify-between gap-2 py-2">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-11 h-14 bg-black/60 border border-white/10 rounded-xl text-center text-xl font-bold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                        />
                      ))}
                    </div>

                    <button 
                      onClick={handleVerifyOtp}
                      disabled={isLoading}
                      className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-black" size={16} />
                          <span>Verifying Code...</span>
                        </div>
                      ) : (
                        <>Complete Verification <ChevronRight size={16} /></>
                      )}
                    </button>

                    <p className="text-center text-zinc-500 text-xs font-medium">
                      Didn&apos;t receive the code?{" "}
                      <button
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
                            setSuccess("New verification code sent!");
                            setError(null);
                          } catch {
                            setError("Failed to resend code.");
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        className="text-purple-400 font-bold hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        Resend Code
                      </button>
                    </p>
                  </motion.div>

                ) : (

                  /* ------------------------------------------------------------- */
                  /* MAIN AUTH FORM: SIGN IN / SIGN UP TABS                         */
                  /* ------------------------------------------------------------- */
                  <motion.div 
                    key="main-auth-form"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Segmented Tab Switcher */}
                    <div className="grid grid-cols-2 p-1.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl relative shadow-inner">
                      <button 
                        type="button"
                        onClick={() => { setState('signin'); setError(null); setFieldErrors({}); }}
                        className={`py-2.5 text-xs font-black uppercase tracking-wider relative z-10 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                          state === 'signin' ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {state === 'signin' && (
                          <motion.div 
                            layoutId="activeAuthTab"
                            className="absolute inset-0 bg-[#181824] rounded-xl border border-white/10 shadow-lg -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}
                        <KeyRound size={13} className={state === 'signin' ? "text-purple-400" : "text-zinc-500"} />
                        <span>Sign In</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => { setState('signup'); setError(null); setFieldErrors({}); }}
                        className={`py-2.5 text-xs font-black uppercase tracking-wider relative z-10 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                          state === 'signup' ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {state === 'signup' && (
                          <motion.div 
                            layoutId="activeAuthTab"
                            className="absolute inset-0 bg-[#181824] rounded-xl border border-white/10 shadow-lg -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}
                        <Sparkles size={13} className={state === 'signup' ? "text-purple-400" : "text-zinc-500"} />
                        <span>Sign Up</span>
                      </button>
                    </div>

                    {/* Social OAuth Buttons */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <button 
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        disabled={!!socialLoading}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.025] border border-white/10 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-sm group"
                      >
                        {socialLoading === 'google' ? <Loader2 size={16} className="animate-spin text-purple-400" /> : <GoogleIcon />}
                        <span className="hidden sm:inline">{socialLoading === 'google' ? 'Connecting...' : 'Google'}</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => handleSocialLogin('github')}
                        disabled={!!socialLoading}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.025] border border-white/10 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-sm group"
                      >
                        {socialLoading === 'github' ? <Loader2 size={16} className="animate-spin text-purple-400" /> : <GitHubIcon />}
                        <span className="hidden sm:inline">{socialLoading === 'github' ? 'Connecting...' : 'GitHub'}</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => handleSocialLogin('discord')}
                        disabled={!!socialLoading}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.025] border border-white/10 text-xs font-semibold text-zinc-300 hover:bg-[#5865F2]/15 hover:border-[#5865F2]/40 hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-sm group"
                      >
                        {socialLoading === 'discord' ? <Loader2 size={16} className="animate-spin text-purple-400" /> : <DiscordIcon />}
                        <span className="hidden sm:inline">{socialLoading === 'discord' ? 'Connecting...' : 'Discord'}</span>
                      </button>
                    </div>

                    {/* Mobile Security Approval Tile (Sign In Only with smooth slide) */}
                    <AnimatePresence mode="popLayout">
                      {state === 'signin' && (
                        <motion.div
                          key="mobile-security-tile"
                          initial={{ opacity: 0, height: 0, scale: 0.96 }}
                          animate={{ opacity: 1, height: "auto", scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.96 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => { setState('magic'); setError(null); setSuccess(null); }}
                            className="w-full group relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-500/[0.06] via-purple-500/[0.03] to-transparent p-[1px] transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-500/[0.1] cursor-pointer shadow-sm"
                          >
                            <div className="relative flex items-center gap-3.5 p-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-black/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                                <Smartphone size={18} />
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <span>One-Tap Mobile Security</span>
                                  <span className="text-[9px] bg-cyan-400/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">Fast</span>
                                </div>
                                <div className="text-[11px] text-zinc-400 truncate font-normal">Approve sign-in directly from your phone app</div>
                              </div>
                              <ChevronRight size={16} className="text-cyan-300 opacity-60 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Divider */}
                    <div className="relative flex items-center gap-3">
                      <div className="h-[1px] flex-1 bg-white/10" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">or continue with email</span>
                      <div className="h-[1px] flex-1 bg-white/10" />
                    </div>

                    {/* Main Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      
                      {/* Email Input */}
                      <div className="space-y-1">
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                          <input 
                            name="email"
                            type="email" 
                            required
                            autoComplete="email"
                            placeholder="Email address"
                            onChange={() => {
                              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                            }}
                            className={`w-full bg-black/50 border rounded-2xl py-3.5 pl-11 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                              fieldErrors.email 
                                ? "border-rose-500/60 bg-rose-500/[0.03] focus:border-rose-500" 
                                : "border-white/10 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 focus:bg-purple-950/10"
                            }`}
                          />
                        </div>
                        {fieldErrors.email && (
                          <p className="text-[11px] text-rose-400 pl-1 font-medium">{fieldErrors.email}</p>
                        )}
                      </div>

                      {/* Password Input */}
                      <div className="space-y-1">
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                          <input 
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete={state === 'signup' ? 'new-password' : 'current-password'}
                            placeholder="Password"
                            onChange={(e) => {
                              if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                              if (state === 'signup') setSignupPassword(e.target.value);
                            }}
                            className={`w-full bg-black/50 border rounded-2xl py-3.5 pl-11 pr-11 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                              fieldErrors.password 
                                ? "border-rose-500/60 bg-rose-500/[0.03] focus:border-rose-500" 
                                : "border-white/10 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 focus:bg-purple-950/10"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <p className="text-[11px] text-rose-400 pl-1 font-medium">{fieldErrors.password}</p>
                        )}
                      </div>

                      {/* Password Strength Indicator (Sign Up Only) */}
                      {state === 'signup' && signupPassword.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-1.5 pt-1 px-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-400">Security Rating</span>
                            <span className={`font-bold ${
                              passStrength.score >= 3 ? "text-emerald-400" : passStrength.score === 2 ? "text-amber-400" : "text-rose-400"
                            }`}>
                              {passStrength.label}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-1">
                            <div className={`h-full flex-1 transition-all duration-300 ${passStrength.score >= 1 ? passStrength.color : "bg-transparent"}`} />
                            <div className={`h-full flex-1 transition-all duration-300 ${passStrength.score >= 2 ? passStrength.color : "bg-transparent"}`} />
                            <div className={`h-full flex-1 transition-all duration-300 ${passStrength.score >= 3 ? passStrength.color : "bg-transparent"}`} />
                            <div className={`h-full flex-1 transition-all duration-300 ${passStrength.score >= 4 ? passStrength.color : "bg-transparent"}`} />
                          </div>
                        </motion.div>
                      )}

                      {/* Confirm Password Field (Sign Up Only) */}
                      <AnimatePresence mode="popLayout">
                        {state === 'signup' && (
                          <motion.div
                            key="confirm-password-field"
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-1 overflow-hidden"
                          >
                            <div className="relative group">
                              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                              <input 
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                placeholder="Confirm Password"
                                className="w-full bg-black/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-11 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 focus:bg-purple-950/10 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                              >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Forgot Password Link (Sign In Only) */}
                      <AnimatePresence mode="popLayout">
                        {state === 'signin' && (
                          <motion.div
                            key="forgot-password-link"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex justify-end pt-0.5 overflow-hidden"
                          >
                            <button 
                              type="button" 
                              onClick={() => setState('forgot')}
                              className="text-[11px] font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                              Forgot password?
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Premium CTA Button */}
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-widest shadow-[0_10px_35px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_15px_45px_-5px_rgba(168,85,247,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 relative overflow-hidden group/btn disabled:opacity-60 cursor-pointer mt-2 flex items-center justify-center"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={isLoading ? 'loading' : state}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="flex items-center justify-center gap-2 relative z-10"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="animate-spin text-white" size={17} />
                                <span>{state === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                              </>
                            ) : (
                              <>
                                <span>{state === 'signin' ? 'Sign In to Workspace' : 'Create Exismic Account'}</span>
                                <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                              </>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </button>
                    </form>

                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="mt-8 text-center flex items-center justify-center gap-2 text-zinc-500 text-xs font-medium">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>256-Bit SSL Encrypted Workspace Access</span>
          </div>

        </motion.div>
        )}

      </div>

    </div>
  );
}
