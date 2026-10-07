"use client";
import { safeAuthReturnPath } from "@/lib/auth/redirect";

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
  ArrowLeft, 
  Smartphone, 
  X, 
  Check, 
  RotateCcw,
  Clock
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import {
  signUpAction,
  signInAction,
  verifyOtpAction,
  verifyDeviceOtpAction,
  resendDeviceOtpAction,
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
import { SilkBackground } from "@/components/ui/SilkBackground";

// --- Minimalist Brand Icons ---
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

type AuthState =
  | 'signin'
  | 'signup'
  | 'magic'
  | 'forgot'
  | 'verify'
  | 'verifyDeviceOtp'
  | 'link'
  | 'linkVerify'
  | 'pendingDeletion'
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
  
  // Unrecognized Device OTP verification state
  const [deviceChallengeId, setDeviceChallengeId] = useState("");
  const [deviceUnrecognizedName, setDeviceUnrecognizedName] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [deviceOtp, setDeviceOtp] = useState(["", "", "", "", "", ""]);
  
  // Account Pending Deletion & Recovery State
  const [pendingDeletionInfo, setPendingDeletionInfo] = useState<{
    email: string;
    scheduledDeletionAt: string | null;
    deletionRecoveryRequested: boolean;
  } | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  // Interactive UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");
  const [ageConsent, setAgeConsent] = useState(false);

  const searchParams = useSearchParams();
  const authErrorCode = searchParams.get('authError');
  const errorParam = searchParams.get('error');
  const deletedParam = searchParams.get('deleted');
  const linkToken = searchParams.get('link') || '';
  const tabParam = searchParams.get('tab') || searchParams.get('mode');
  const requestedReturnUrl = searchParams.get('returnUrl');
  const returnUrl = safeAuthReturnPath(requestedReturnUrl);
  
  const { isRedirecting: isHookRedirecting } = useAuth(returnUrl);
  const isRedirecting = isHookRedirecting || isRedirectingState;

  useEffect(() => {
    if (tabParam === 'signup') {
      setState('signup');
    }
  }, [tabParam]);

  const getRemainingDays = (dateStr: string | null) => {
    if (!dateStr) return "the scheduled deletion date";
    const diffMs = new Date(dateStr).getTime() - Date.now();
    if (diffMs <= 0) return "the next cleanup run";
    const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  const handleRequestRecovery = async () => {
    if (!pendingDeletionInfo) return;
    setIsRecovering(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/user/account/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "cancel",
          email: pendingDeletionInfo.email,
          ...(storedPassword ? { password: storedPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send recovery request.");
      setPendingDeletionInfo(null);
      setStoredPassword("");
      setState('signin');
      setSuccess("Account deletion cancelled. Sign in again to continue.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit recovery request.");
    } finally {
      setIsRecovering(false);
    }
  };

  // Errors remain visible until the user retries or changes the form.
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (deletedParam === 'true') {
      setSuccess("Your account deletion has been scheduled. You have 7 days to change your mind.");
    }
    if (searchParams.get('deletionCancelled') === 'true') setSuccess('Account deletion cancelled. Sign in again to continue.');
  }, [deletedParam, searchParams]);

  useEffect(() => {
    const isPending = searchParams.get('pendingDeletion') === 'true';
    if (isPending) {
      const pendingEmail = searchParams.get('email') || '';
      const scheduledAt = searchParams.get('scheduledAt') || null;
      setPendingDeletionInfo({
        email: pendingEmail,
        scheduledDeletionAt: scheduledAt,
        deletionRecoveryRequested: false,
      });
      setState('pendingDeletion');
    }
  }, [searchParams]);

  useEffect(() => {
    if (errorParam === 'suspended') {
      setError("This account has been suspended due to violations of Exismic terms of service.");
      const supabase = createClient();
      supabase.auth.signOut();
    }
  }, [errorParam]);

  useEffect(() => {
    if (!authErrorCode) return;
    const messages: Record<string, string> = {
      provider_link_failed: "That login method couldn't be connected securely. Please try again.",
      session_exchange_failed: "The sign-in session expired before it could finish. Please try again.",
      missing_identity: "That provider didn't share a verified email address.",
      account_deletion_started: "Account deletion has already started. Please contact support if you need help.",
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
    value = value.replace(/\D/g, '').slice(0, 6 - index);
    const newOtp = [...otp];
    if (!value) newOtp[index] = "";
    for (let offset = 0; offset < value.length; offset++) newOtp[index + offset] = value[offset];
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${Math.min(index + value.length, 5)}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); if (!isLoading) void handleVerifyOtp(); return; }
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
    } catch {
      setError("Could not connect this login method. Please try again or sign in with your email.");
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
        if (result?.isPendingDeletion) {
          const supabase = createClient();
          await supabase.auth.signOut();
          setStoredPassword(formPassword);
          setPendingDeletionInfo({
            email: result.email || formEmail,
            scheduledDeletionAt: result.scheduledDeletionAt || null,
            deletionRecoveryRequested: Boolean(result.deletionRecoveryRequested),
          });
          setState('pendingDeletion');
          setIsLoading(false);
          return;
        } else if (result?.requireDeviceOtp) {
          setEmail(result.email || formEmail);
          setDeviceChallengeId(result.challengeId || "");
          setDeviceUnrecognizedName(result.deviceName || "Unrecognized Device");
          setStoredPassword(formPassword);
          setDeviceOtp(["", "", "", "", "", ""]);
          setState('verifyDeviceOtp');
          setSuccess(`Security Check: A 6-digit verification code was sent to ${result.email}.`);
        } else if (result?.error) {
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
          setOtp(["", "", "", "", "", ""]);
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
      const loginForm = new FormData();
      loginForm.set('email', linkEmail);
      loginForm.set('password', password);
      const login = await signInAction(loginForm);
      if (login.error) { setError(login.error); return; }
      if (login.requireDeviceOtp) {
        setEmail(linkEmail); setDeviceChallengeId(login.challengeId || '');
        setStoredPassword(password); setDeviceUnrecognizedName(login.deviceName || 'Unrecognized device');
        setDeviceOtp(['','','','','','']); setState('verifyDeviceOtp');
        setSuccess('Check your email to verify this device before connecting the login method.');
        return;
      }
      if (login.isPendingDeletion) { setError('Restore this account before connecting another login method.'); return; }

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
        if ('redirectToSignIn' in result && result.redirectToSignIn) {
          setState('signin');
          setError(result.error);
          return;
        }
        setError(result.error);
      } else {
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

  const handleVerifyDeviceOtp = async () => {
    setIsLoading(true);
    setError(null);
    const otpString = deviceOtp.join("");
    if (otpString.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await verifyDeviceOtpAction(
        email,
        deviceChallengeId,
        otpString,
        storedPassword,
      );

      if (result?.error) {
        setError(result.error);
      } else {
        if (linkToken) {
          const approval = await consumeOAuthLinkRequestAction(linkToken);
          if (approval.error || !approval.provider) { setError(approval.error || 'Could not connect this login method.'); return; }
          const linked = await createClient().auth.linkIdentity({ provider: approval.provider, options: { redirectTo: `${getClientSiteUrl()}/auth/callback?next=${encodeURIComponent(returnUrl)}` } });
          if (linked.error) setError('Could not connect this login method. Please try again.');
          return;
        }
        setState('success');
        setIsRedirectingState(true);
        setStoredPassword("");
        window.location.replace(returnUrl);
        return;
      }
    } catch {
      setError("Device verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendDeviceOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await resendDeviceOtpAction(email, deviceChallengeId);
      if (result.error) {
        setError(result.error);
      } else {
        if (result.challengeId) setDeviceChallengeId(result.challengeId);
        setDeviceOtp(["", "", "", "", "", ""]);
        setSuccess("A new verification code has been sent to your email!");
      }
    } catch {
      setError("Could not resend verification code.");
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
    <div className="min-h-screen bg-[#030305] text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND: React Bits Silk WebGL Shader with Resend Vignette */}
      {/* ------------------------------------------------------------- */}
      <SilkBackground
        color="#4c1d95"
        speed={0.9}
        scale={0.95}
        noiseIntensity={0.8}
        rotation={0.15}
        lightMode={true}
        showVignette={true}
      />

      {/* Discrete Top-Left Home Escape Link */}
      <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-30">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-zinc-400 hover:text-white border border-white/10 backdrop-blur-md transition-all group shadow-sm"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Home</span>
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CENTER STAGE: Resend-Style Minimalist Floating Auth Container */}
      {/* ------------------------------------------------------------- */}
      <main className="w-full max-w-[360px] sm:max-w-[380px] mx-auto px-4 pt-6 pb-14 sm:pt-8 sm:pb-18 relative z-10 flex flex-col justify-center flex-1 -translate-y-6 sm:-translate-y-7">
        
        {/* Redirecting Overlay Screen */}
        {isRedirecting ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center justify-center space-y-6 py-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <CheckCircle2 size={36} className="text-emerald-400" />
              <motion.div 
                className="absolute inset-0 rounded-2xl border border-emerald-500/40"
                animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-bold font-outfit text-white tracking-tight">Signed in successfully</h2>
              <p className="text-zinc-400 text-xs flex items-center justify-center gap-2 font-medium">
                <Loader2 className="animate-spin text-purple-400" size={14} /> 
                Redirecting to your account...
              </p>
            </div>
          </motion.div>
        ) : (

        <div className="w-full flex flex-col items-center">
          
          {/* Exismic Logo (~10% larger at ~48px visual size with balanced breathing room) */}
          <Link href="/" className="group mb-5 block focus:outline-none" aria-label="Exismic Home">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-12 h-12 rounded-2xl bg-[#090a12]/90 border border-white/10 group-hover:border-purple-500/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_24px_rgba(109,40,217,0.3)] group-hover:scale-105 transition-all">
                <ExismicMark size={29} />
              </div>
            </div>
          </Link>

          {/* Floating Toast Notification */}
          <AnimatePresence>
            {(success || error) && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full mb-4"
              >
                <div className={`flex items-start gap-2.5 p-3 rounded-xl border backdrop-blur-xl ${
                  success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                }`}>
                  <div className="mt-0.5 shrink-0">
                    {success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  </div>
                  <div className="flex-1 text-xs leading-relaxed font-normal">
                    {success || error}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSuccess(null); setError(null); }}
                    className="shrink-0 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Dismiss message"
                  >
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic State Machine Screens */}
          <AnimatePresence mode="wait">

            {/* ------------------------------------------------------------- */}
            {/* STATE: PENDING DELETION RECOVERY SCREEN                       */}
            {/* ------------------------------------------------------------- */}
            {state === 'pendingDeletion' ? (
              <motion.div
                key="pending-deletion-screen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="w-full space-y-4"
              >
                <button 
                  type="button" 
                  onClick={() => { setState('signin'); setError(null); setSuccess(null); }} 
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer mb-2"
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </button>

                <div className="text-center mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-outfit tracking-tight text-white">
                    Account Pending Deletion
                  </h1>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                    <Clock size={13} /> Account Deletion Scheduled
                  </div>
                  <p className="text-zinc-300 leading-relaxed font-normal">
                    This account is scheduled to be erased in{" "}
                    <strong className="text-amber-300">
                      {getRemainingDays(pendingDeletionInfo?.scheduledDeletionAt ?? null)}
                    </strong>. Cancel during the safety period to keep your account. You will need to sign in again afterward.
                  </p>
                </div>

                  <div className="space-y-3">

                    <button
                      type="button"
                      onClick={handleRequestRecovery}
                      disabled={isRecovering}
                      className="w-full h-10 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isRecovering ? (
                        <>
                          <Loader2 className="animate-spin text-zinc-950" size={14} />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw size={14} />
                          <span>Cancel Deletion &amp; Keep Account</span>
                        </>
                      )}
                    </button>
                  </div>
              </motion.div>

            ) : state === 'link' ? (
              <motion.div
                key="link-screen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="w-full space-y-4"
              >
                <div className="text-center mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-outfit tracking-tight text-white">
                    Connect Account
                  </h1>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-zinc-300 leading-relaxed">
                  An Exismic account already exists for <strong className="text-white">{linkEmail}</strong>. Enter your password to connect {providerLabel(linkProvider)}.
                </div>

                <form onSubmit={handleLinkSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="link-password" className="text-xs font-medium text-zinc-300">Password</label>
                    <div className="group relative flex items-center bg-[#07080e]/80 border border-white/10 hover:border-white/20 focus-within:border-purple-500/70 focus-within:ring-2 focus-within:ring-purple-500/20 rounded-xl transition-all">
                      <Lock size={15} className="text-zinc-500 group-focus-within:text-purple-400 transition-colors ml-3.5 shrink-0" aria-hidden="true" />
                      <input
                        id="link-password"
                        name="password"
                        type="password"
                        required
                        placeholder="Account password"
                        className="w-full bg-transparent text-white px-3 py-2.5 text-xs transition-all outline-none placeholder:text-zinc-500 hover:placeholder:text-zinc-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Approve connection →"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelLink}
                    className="w-full text-center text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer pt-1"
                  >
                    Cancel
                  </button>
                </form>
              </motion.div>

            ) : state === 'magic' ? (
              <motion.div
                key="magic-screen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="w-full space-y-4"
              >
                <button 
                  onClick={() => setState('signin')} 
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer mb-1"
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </button>

                <div className="text-center mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-outfit tracking-tight text-white">
                    Phone Approval
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Send an instant sign-in prompt to your device.
                  </p>
                </div>

                {trustedChallengeId ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center gap-3">
                      <Smartphone size={20} className="text-cyan-400 shrink-0" />
                      <div className="text-xs">
                        <h3 className="font-bold text-white">Approval Request Sent</h3>
                        <p className="text-zinc-400 text-[11px] mt-0.5">
                          Notification sent to <strong className="text-cyan-200">{trustedDeviceName}</strong>. Tap &ldquo;Approve&rdquo; on your phone screen.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTrustedChallengeId("");
                        setTrustedBrowserToken("");
                        setSuccess(null);
                      }}
                      className="w-full h-10 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-zinc-300 hover:bg-white/[0.07] transition-all cursor-pointer"
                    >
                      Cancel Request
                    </button>
                  </div>
                ) : (
                  <form action={handleMagicLinkSubmit} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="magic-email" className="text-xs font-medium text-zinc-300">Registered Email</label>
                      <div className="group relative flex items-center bg-[#07080e]/80 border border-white/10 hover:border-white/20 focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-400/20 rounded-xl transition-all">
                        <Mail size={15} className="text-zinc-500 group-focus-within:text-cyan-400 transition-colors ml-3.5 shrink-0" aria-hidden="true" />
                        <input
                          id="magic-email"
                          name="email"
                          type="email"
                          required
                          defaultValue={email}
                          placeholder="you@example.com"
                          className="w-full bg-transparent text-white px-3 py-2.5 text-xs sm:text-sm transition-all outline-none placeholder:text-zinc-500 hover:placeholder:text-zinc-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 text-zinc-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin text-zinc-950" size={14} />
                          <span>Sending Request...</span>
                        </>
                      ) : (
                        <>Send Phone Approval <ArrowRight size={14} /></>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>

            ) : state === 'forgot' ? (
              <motion.div 
                key="forgot-screen"
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -8 }}
                className="w-full space-y-4"
              >
                <button 
                  onClick={() => setState('signin')} 
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer mb-1"
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </button>

                <div className="text-center mb-2">
                  <h1 className="text-2xl font-bold font-outfit tracking-tight text-white">
                    Reset your password.
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Enter your email address to receive a secure reset link.
                  </p>
                </div>

                <form action={async (formData) => {
                  setIsLoading(true);
                  setError(null);
                  setSuccess(null);
                  try {
                    const emailInput = formData.get("email") as string;
                    const res = await forgotPasswordAction(emailInput);
                    if (res?.error) setError(res.error);
                    else setSuccess("If an account exists, a reset link has been sent.");
                  } catch {
                    setError("Could not send the reset request. Please try again.");
                  } finally { setIsLoading(false); }
                }} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="forgot-email" className="text-xs font-medium text-zinc-300">Email Address</label>
                    <div className="group relative flex items-center bg-[#07080e]/80 border border-white/10 hover:border-white/20 focus-within:border-purple-500/70 focus-within:ring-2 focus-within:ring-purple-500/20 rounded-xl transition-all">
                      <Mail size={15} className="text-zinc-500 group-focus-within:text-purple-400 transition-colors ml-3.5 shrink-0" aria-hidden="true" />
                      <input 
                        id="forgot-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className="w-full bg-transparent text-white px-3 py-2.5 text-xs sm:text-sm transition-all outline-none placeholder:text-zinc-500 hover:placeholder:text-zinc-400"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin text-zinc-950" size={14} />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>Send reset link <ChevronRight size={14} /></>
                    )}
                  </button>
                </form>
              </motion.div>

            ) : state === 'verify' ? (
              <motion.div 
                key="verify-screen"
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -8 }}
                className="w-full space-y-4"
              >
                <button 
                  onClick={() => setState('signup')} 
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer mb-1"
                >
                  <ArrowLeft size={13} /> Back
                </button>

                <div className="text-center mb-2">
                  <h1 className="text-2xl font-bold font-outfit tracking-tight text-white">
                    Verify your email.
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Enter the 6-digit code sent to <strong className="text-white">{email}</strong>
                  </p>
                </div>

                <div className="flex justify-between gap-2 py-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      aria-label={`Verification code digit ${i + 1}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onPaste={(e) => { e.preventDefault(); handleOtpChange(i, e.clipboardData.getData("text")); }}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-13 bg-[#07080e]/80 border border-white/10 hover:border-white/20 rounded-xl text-center text-lg font-bold focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all font-mono"
                    />
                  ))}
                </div>

                <button 
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin text-zinc-950" size={14} />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>Complete verification <ChevronRight size={14} /></>
                  )}
                </button>

                <p className="text-center text-zinc-500 text-xs font-medium pt-1">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const result = await resendOtpAction(email, pendingSignupPassword);
                        if (result?.error) {
                          setError(result.error);
                          setSuccess(null);
                          return;
                        }
                        setSuccess("New verification code sent!");
                        setOtp(["", "", "", "", "", ""]);
                        setError(null);
                      } catch {
                        setError("Failed to resend code.");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="text-purple-400 font-bold hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    Resend
                  </button>
                </p>
              </motion.div>

            ) : state === 'verifyDeviceOtp' ? (
              <motion.div 
                key="verify-device-screen"
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -8 }}
                className="w-full space-y-4"
              >
                <div className="text-center mb-2">
                  <h1 className="text-2xl font-bold font-outfit tracking-tight text-white">
                    Device Authorization
                  </h1>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs text-zinc-300 leading-relaxed">
                  Signing in from a new device: <strong className="text-cyan-300">{deviceUnrecognizedName}</strong>. Enter the 6-digit security code sent to <strong className="text-white">{email}</strong>.
                </div>

                <div className="flex justify-between gap-2 py-2">
                  {deviceOtp.map((digit, i) => (
                    <input
                      key={i}
                      id={`device-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6 - i);
                        const next = [...deviceOtp];
                        if (!val) next[i] = "";
                        for (let offset = 0; offset < val.length; offset++) next[i + offset] = val[offset];
                        setDeviceOtp(next);
                        if (val && i < 5) {
                          document.getElementById(`device-otp-${Math.min(i + val.length, 5)}`)?.focus();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                        if (!pasted) return;
                        const next = [...deviceOtp];
                        for (let k = 0; k < pasted.length; k++) {
                          next[k] = pasted[k];
                        }
                        setDeviceOtp(next);
                        const targetIdx = Math.min(pasted.length, 5);
                        document.getElementById(`device-otp-${targetIdx}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !deviceOtp[i] && i > 0) {
                          document.getElementById(`device-otp-${i - 1}`)?.focus();
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          void handleVerifyDeviceOtp();
                        }
                      }}
                      className="w-11 h-13 bg-[#07080e]/80 border border-white/10 hover:border-white/20 rounded-xl text-center text-lg font-bold focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono"
                    />
                  ))}
                </div>

                <button 
                  onClick={handleVerifyDeviceOtp}
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin text-zinc-950" size={14} />
                      <span>Authorizing Device...</span>
                    </>
                  ) : (
                    <>Authorize &amp; continue <ArrowRight size={14} /></>
                  )}
                </button>

                <p className="text-center text-zinc-500 text-xs font-medium pt-1">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleResendDeviceOtp}
                    className="text-cyan-400 font-bold hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    Resend
                  </button>
                </p>
              </motion.div>

            ) : (
              <motion.div 
                key="main-auth-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-4"
              >
                {/* Heading & Supporting Line */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={state}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="text-center pb-1"
                  >
                    <h1 className="text-2xl sm:text-[26px] font-bold font-outfit tracking-tight text-white">
                      {state === 'signup' ? "Create your account." : "Welcome back."}
                    </h1>
                    <p className="text-xs sm:text-[13px] text-zinc-400 mt-1 font-normal">
                      {state === 'signup' ? "Get started with Exismic." : "Sign in to continue."}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Social Login Options (Side-by-side, equal width, elevated hover) */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button 
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={!!socialLoading}
                    className="flex items-center justify-center gap-2.5 h-10 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/25 hover:shadow-[0_0_16px_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.4)] text-xs font-medium text-zinc-300 hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.985] group"
                    aria-label="Continue with Google"
                  >
                    <div className="shrink-0 transition-transform group-hover:scale-105 duration-200">
                      {socialLoading === 'google' ? <Loader2 size={14} className="animate-spin text-purple-400" /> : <GoogleIcon />}
                    </div>
                    <span className="truncate">{socialLoading === 'google' ? 'Connecting...' : 'Google'}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    disabled={!!socialLoading}
                    className="flex items-center justify-center gap-2.5 h-10 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/25 hover:shadow-[0_0_16px_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.4)] text-xs font-medium text-zinc-300 hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.985] group"
                    aria-label="Continue with GitHub"
                  >
                    <div className="shrink-0 transition-transform group-hover:scale-105 duration-200">
                      {socialLoading === 'github' ? <Loader2 size={14} className="animate-spin text-purple-400" /> : <GitHubIcon />}
                    </div>
                    <span className="truncate">{socialLoading === 'github' ? 'Connecting...' : 'GitHub'}</span>
                  </button>
                </div>

                {/* Balanced OR Divider */}
                <div className="flex items-center gap-3 w-full py-1">
                  <div className="h-[1px] flex-1 bg-white/[0.08]" />
                  <span className="text-[11px] text-zinc-500 font-semibold tracking-wider uppercase">or</span>
                  <div className="h-[1px] flex-1 bg-white/[0.08]" />
                </div>

                {/* Email / Password Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5 w-full">
                  
                  {/* Email Field with Rich Hover & Focus */}
                  <div className="space-y-1.5 w-full">
                    <label htmlFor="auth-email" className="block text-xs font-medium text-zinc-300">
                      Email
                    </label>
                    <div className={`group relative flex items-center bg-[#07080e]/80 border rounded-xl transition-all duration-200 ${
                      fieldErrors.email 
                        ? "border-rose-500/70 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20" 
                        : "border-white/[0.08] hover:border-white/25 hover:bg-[#07080e]/95 focus-within:border-purple-400/80 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:shadow-[0_0_20px_rgba(147,51,234,0.15)]"
                    }`}>
                      <Mail size={15} className="text-zinc-500 group-hover:text-zinc-400 group-focus-within:text-purple-400 transition-colors ml-3.5 shrink-0" aria-hidden="true" />
                      <input 
                        id="auth-email"
                        name="email"
                        type="email" 
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        defaultValue={email}
                        onChange={() => {
                          if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        className="w-full bg-transparent text-white px-3 py-2.5 text-xs sm:text-sm placeholder:text-zinc-500/70 hover:placeholder:text-zinc-400/90 transition-colors outline-none"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-[11px] text-rose-400 font-normal pl-0.5 flex items-center gap-1">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Field with Rich Hover & Focus */}
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between">
                      <label htmlFor="auth-password" className="text-xs font-medium text-zinc-300">
                        Password
                      </label>
                      {state === 'signin' && (
                        <button 
                          type="button" 
                          onClick={() => { setState('forgot'); setError(null); setSuccess(null); }}
                          className="text-xs text-zinc-400 hover:text-purple-300 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    
                    <div className={`group relative flex items-center bg-[#07080e]/80 border rounded-xl transition-all duration-200 ${
                      fieldErrors.password 
                        ? "border-rose-500/70 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20" 
                        : "border-white/[0.08] hover:border-white/25 hover:bg-[#07080e]/95 focus-within:border-purple-400/80 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:shadow-[0_0_20px_rgba(147,51,234,0.15)]"
                    }`}>
                      <Lock size={15} className="text-zinc-500 group-hover:text-zinc-400 group-focus-within:text-purple-400 transition-colors ml-3.5 shrink-0" aria-hidden="true" />
                      <input 
                        id="auth-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete={state === 'signup' ? 'new-password' : 'current-password'}
                        placeholder="••••••••••••"
                        onChange={(e) => {
                          if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                          if (state === 'signup') setSignupPassword(e.target.value);
                        }}
                        className="w-full bg-transparent text-white px-3 py-2.5 pr-2 text-xs sm:text-sm placeholder:text-zinc-500/70 hover:placeholder:text-zinc-400/90 transition-colors outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2.5 mr-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {fieldErrors.password && (
                      <p className="text-[11px] text-rose-400 font-normal pl-0.5 flex items-center gap-1">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{fieldErrors.password}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Strength Meter (Sign Up Only) */}
                  <AnimatePresence initial={false}>
                    {state === 'signup' && signupPassword.length > 0 && (
                      <motion.div
                        key="password-strength-box"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden space-y-1 pt-0.5"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">Password strength</span>
                          <span className={`font-semibold ${
                            passStrength.score >= 3 ? "text-emerald-400" : passStrength.score === 2 ? "text-amber-400" : "text-rose-400"
                          }`}>
                            {passStrength.label}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 transition-all duration-300 ${passStrength.score >= 1 ? passStrength.color : "bg-transparent"}`} />
                          <div className={`h-full flex-1 transition-all duration-300 ${passStrength.score >= 2 ? passStrength.color : "bg-transparent"}`} />
                          <div className={`h-full flex-1 transition-all duration-300 ${passStrength.score >= 3 ? passStrength.color : "bg-transparent"}`} />
                          <div className={`h-full flex-1 transition-all duration-300 ${passStrength.score >= 4 ? passStrength.color : "bg-transparent"}`} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Confirm Password (Sign Up Only) */}
                  <AnimatePresence initial={false}>
                    {state === 'signup' && (
                      <motion.div
                        key="confirm-password-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5 pt-1">
                          <label htmlFor="auth-confirm-password" className="block text-xs font-medium text-zinc-300">
                            Confirm password
                          </label>
                          <div className="group relative flex items-center bg-[#07080e]/80 border border-white/[0.08] hover:border-white/25 hover:bg-[#07080e]/95 focus-within:border-purple-400/80 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:shadow-[0_0_20px_rgba(147,51,234,0.15)] rounded-xl transition-all duration-200">
                            <Lock size={15} className="text-zinc-500 group-hover:text-zinc-400 group-focus-within:text-purple-400 transition-colors ml-3.5 shrink-0" aria-hidden="true" />
                            <input 
                              id="auth-confirm-password"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              autoComplete="new-password"
                              placeholder="••••••••••••"
                              className="w-full bg-transparent text-white px-3 py-2.5 pr-2 text-xs sm:text-sm placeholder:text-zinc-500/70 hover:placeholder:text-zinc-400/90 transition-colors outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="p-2.5 mr-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 13+ Age Confirmation Checkbox (Sign Up Only) */}
                  <AnimatePresence initial={false}>
                    {state === 'signup' && (
                      <motion.div
                        key="age-consent-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <label 
                          htmlFor="ageConsent"
                          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/[0.08] hover:border-white/15 bg-white/[0.02] cursor-pointer select-none mt-1 transition-colors"
                        >
                          <input
                            type="checkbox"
                            id="ageConsent"
                            name="ageConsent"
                            required
                            checked={ageConsent}
                            onChange={(e) => setAgeConsent(e.target.checked)}
                            className="sr-only"
                          />
                          
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                            ageConsent
                              ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]"
                              : "bg-white/[0.04] border-white/20 text-transparent"
                          }`}>
                            <Check size={11} strokeWidth={3} className={ageConsent ? "opacity-100" : "opacity-0"} />
                          </div>

                          <span className="text-[11px] text-zinc-300 font-normal">
                            I confirm that I am at least 13 years of age.
                          </span>
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Primary Action CTA (Full width, strong contrast, clean) */}
                  <div className="pt-2 w-full">
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold font-outfit text-zinc-950 bg-white hover:bg-zinc-200 active:bg-zinc-300 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin text-zinc-950" size={15} />
                          <span>{state === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{state === 'signin' ? 'Sign in' : 'Create account'}</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Secondary Phone Approval Link (Sign In Only) */}
                  {state === 'signin' && (
                    <div className="pt-1 text-center w-full">
                      <button
                        type="button"
                        onClick={() => { setState('magic'); setError(null); setSuccess(null); }}
                        className="inline-flex items-center justify-center gap-1.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        <Smartphone size={13} className="text-zinc-500" />
                        <span>Use phone approval instead</span>
                      </button>
                    </div>
                  )}

                  {/* Footer Terms & Privacy Notice (Sign Up Only) */}
                  {state === 'signup' && (
                    <p className="text-[11px] text-center text-zinc-500 font-normal leading-relaxed pt-1">
                      By creating an account, you agree to our{" "}
                      <Link href="/terms-of-service" className="text-zinc-300 underline hover:text-white transition-colors">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy-policy" className="text-zinc-300 underline hover:text-white transition-colors">
                        Privacy Policy
                      </Link>.
                    </p>
                  )}
                </form>

                {/* Bottom Sign In / Sign Up Switcher */}
                <div className="pt-2 text-center w-full">
                  <p className="text-xs text-zinc-400 font-normal">
                    {state === 'signup' ? (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => { setState('signin'); setError(null); setFieldErrors({}); }}
                          className="text-white font-semibold hover:text-purple-300 hover:underline cursor-pointer transition-colors"
                        >
                          Sign in
                        </button>
                      </>
                    ) : (
                      <>
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          onClick={() => { setState('signup'); setError(null); setFieldErrors({}); }}
                          className="text-white font-semibold hover:text-purple-300 hover:underline cursor-pointer transition-colors"
                        >
                          Sign up for free
                        </button>
                      </>
                    )}
                  </p>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>
        )}

      </main>

      {/* Discrete Bottom Footer Links (Pure, minimal links without security badge) */}
      <footer className="w-full max-w-lg mx-auto py-5 px-4 text-center relative z-20 flex items-center justify-center gap-3 text-zinc-500 text-[11px] font-normal">
        <Link href="/terms-of-service" className="hover:text-zinc-300 transition-colors">Terms</Link>
        <span>•</span>
        <Link href="/privacy-policy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
        <span>•</span>
        <Link href="/cookies" className="hover:text-zinc-300 transition-colors">Cookies</Link>
      </footer>

    </div>
  );
}
