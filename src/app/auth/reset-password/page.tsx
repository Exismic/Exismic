"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Wand2,
  Sparkles,
  Check,
  ShieldCheck,
  RefreshCw,
  Copy,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { updatePasswordAction, validateResetPasswordTokenAction } from "@/app/actions/auth";
import { ExismicMark } from "@/components/ui/ExismicLogo";

function generateStrongPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:";

  const getRandom = (str: string) => str[Math.floor(Math.random() * str.length)];

  // Guarantee at least 2 of each character class
  const required = [
    getRandom(upper),
    getRandom(upper),
    getRandom(lower),
    getRandom(lower),
    getRandom(numbers),
    getRandom(numbers),
    getRandom(symbols),
    getRandom(symbols),
  ];

  const all = upper + lower + numbers + symbols;
  const remainingLength = 16 - required.length;

  for (let i = 0; i < remainingLength; i++) {
    required.push(getRandom(all));
  }

  // Shuffle array using Fisher-Yates algorithm
  for (let i = required.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [required[i], required[j]] = [required[j], required[i]];
  }

  return required.join("");
}

function calculatePasswordMetrics(pass: string, confirm: string) {
  const hasMinLength = pass.length >= 10;
  const hasUpperLower = /[A-Z]/.test(pass) && /[a-z]/.test(pass);
  const hasNumber = /\d/.test(pass);
  const hasSymbol = /[^A-Za-z0-9]/.test(pass);
  const isMatch = pass.length > 0 && pass === confirm;

  const score = [hasMinLength, hasUpperLower, hasNumber, hasSymbol].filter(Boolean).length;

  let label = "Empty";
  let color = "bg-zinc-700";
  let textColor = "text-zinc-500";

  if (score === 1) {
    label = "Weak";
    color = "bg-rose-500";
    textColor = "text-rose-400";
  } else if (score === 2) {
    label = "Fair";
    color = "bg-amber-500";
    textColor = "text-amber-400";
  } else if (score === 3) {
    label = "Good";
    color = "bg-purple-500";
    textColor = "text-purple-400";
  } else if (score === 4) {
    label = "Strong";
    color = "bg-emerald-400";
    textColor = "text-emerald-400";
  }

  return {
    score,
    label,
    color,
    textColor,
    hasMinLength,
    hasUpperLower,
    hasNumber,
    hasSymbol,
    isMatch,
    isValid: score >= 3 && hasMinLength && isMatch,
  };
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const isDemoMode = !token || !email || token === "demo" || searchParams.get("demo") === "true";
  const displayEmail = email || "user@exismic.com";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const metrics = calculatePasswordMetrics(password, confirmPassword);

  useEffect(() => {
    let cancelled = false;

    const validateLink = async () => {
      if (isDemoMode) {
        setIsCheckingLink(false);
        setLinkError(null);
        return;
      }

      if (!token || !email) {
        setIsCheckingLink(false);
        setLinkError("This password reset link is invalid or has expired.");
        return;
      }

      const result = await validateResetPasswordTokenAction(email, token);
      if (cancelled) return;

      if (!result.valid) {
        setLinkError(result.error || "This password reset link is invalid or has already been used.");
      }
      setIsCheckingLink(false);
    };

    void validateLink();

    return () => {
      cancelled = true;
    };
  }, [email, token, isDemoMode]);

  const handleSuggestPassword = () => {
    const generated = generateStrongPassword();
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setError(null);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 4000);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 10) {
      setError("Use at least 10 characters with a mix of uppercase, lowercase, numbers, or symbols.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isDemoMode) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSuccess(true);
      } else {
        const result = await updatePasswordAction(email!, token!, password);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess(true);
        }
      }
    } catch {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingLink) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="animate-spin text-purple-400" size={32} />
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.22em]">Verifying reset link...</p>
      </div>
    );
  }

  if (!token || !email || linkError) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
          <AlertCircle className="text-rose-400" size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white">Invalid or Expired Link</h2>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto font-medium">
            {linkError || "This password reset link is invalid, expired, or has already been used."}
          </p>
        </div>
        <Link 
          href="/auth/login" 
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
        >
          Return to Sign In <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 py-4"
      >
        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/25 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="text-emerald-400" size={42} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white">Password Updated!</h2>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto font-medium">
            Your password has been reset successfully. You can now sign in to your Exismic account with your new credentials.
          </p>
        </div>
        <Link 
          href="/auth/login" 
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 text-white font-black text-xs uppercase tracking-wider hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          Sign In Now <ChevronRight size={16} />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-400/30 bg-purple-400/10 text-purple-300 text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <ShieldCheck size={13} className="text-purple-400" /> Account Security
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">Set New Password</h2>
        <p className="text-zinc-400 text-xs font-normal">Choose a strong, unique password for <span className="text-white font-semibold">{displayEmail}</span></p>
      </div>

      {/* Suggest Password Generator Action Banner */}
      <div className="relative group">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/30 via-cyan-500/20 to-purple-500/30 rounded-2xl pointer-events-none blur-[1px]" />
        <button
          type="button"
          onClick={handleSuggestPassword}
          className="relative w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-cyan-950/30 border border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer group/btn"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover/btn:scale-110 transition-transform">
              <Sparkles size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-extrabold text-white flex items-center gap-1.5">
                Suggest Strong Password
                <span className="text-[9px] bg-purple-400/20 text-purple-300 px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">Recommended</span>
              </p>
              <p className="text-[11px] text-zinc-400 font-normal">Generate a 16-character secure random password</p>
            </div>
          </div>
          <Wand2 size={16} className="text-purple-400 group-hover/btn:rotate-45 transition-transform" />
        </button>
      </div>

      {/* Generated Password Toast Notice */}
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between font-medium"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              Strong password generated & filled!
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80">Make sure to save it safely</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleReset} className="space-y-5">
        
        <div className="space-y-3.5">
          {/* New Password Input */}
          <div className="space-y-1">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={16} />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-11 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 focus:bg-purple-950/10 transition-all font-mono"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2 pt-1 px-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Password Strength</span>
                <span className={`font-bold ${metrics.textColor}`}>{metrics.label}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full flex-1 transition-all duration-300 ${metrics.score >= 1 ? metrics.color : "bg-transparent"}`} />
                <div className={`h-full flex-1 transition-all duration-300 ${metrics.score >= 2 ? metrics.color : "bg-transparent"}`} />
                <div className={`h-full flex-1 transition-all duration-300 ${metrics.score >= 3 ? metrics.color : "bg-transparent"}`} />
                <div className={`h-full flex-1 transition-all duration-300 ${metrics.score >= 4 ? metrics.color : "bg-transparent"}`} />
              </div>
            </motion.div>
          )}

          {/* Confirm Password Input */}
          <div className="space-y-1">
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={16} />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 focus:bg-purple-950/10 transition-all font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Real-Time Security Requirements Checklist */}
        <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Password Requirements</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-normal text-zinc-300">
            <div className="flex items-center gap-2">
              {metrics.hasMinLength ? (
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1.5 mr-1" />
              )}
              <span className={metrics.hasMinLength ? "text-zinc-200" : "text-zinc-500"}>At least 10 characters</span>
            </div>

            <div className="flex items-center gap-2">
              {metrics.hasUpperLower ? (
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1.5 mr-1" />
              )}
              <span className={metrics.hasUpperLower ? "text-zinc-200" : "text-zinc-500"}>Uppercase & lowercase</span>
            </div>

            <div className="flex items-center gap-2">
              {metrics.hasNumber ? (
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1.5 mr-1" />
              )}
              <span className={metrics.hasNumber ? "text-zinc-200" : "text-zinc-500"}>At least one number</span>
            </div>

            <div className="flex items-center gap-2">
              {metrics.hasSymbol ? (
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1.5 mr-1" />
              )}
              <span className={metrics.hasSymbol ? "text-zinc-200" : "text-zinc-500"}>Special symbol (!@#$)</span>
            </div>

            <div className="flex items-center gap-2 col-span-1 sm:col-span-2 pt-1 border-t border-white/[0.05]">
              {metrics.isMatch ? (
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1.5 mr-1" />
              )}
              <span className={metrics.isMatch ? "text-zinc-200 font-semibold" : "text-zinc-500"}>Passwords match</span>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-start gap-3 backdrop-blur-md"
            >
              <AlertCircle size={17} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isLoading || !metrics.isValid}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-white" size={18} />
              <span>Updating Password...</span>
            </div>
          ) : (
            <>Update Password <ChevronRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-purple-500/30 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* GLOBAL BACKGROUND EFFECTS & AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
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
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [bg-size:32px_32px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_50%,transparent_100%)] opacity-80" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[460px] z-10 space-y-8"
      >
        <div className="flex flex-col items-center">
          <Link href="/" className="group flex flex-col items-center">
            <ExismicMark size={48} className="mb-2 transform group-hover:scale-105 transition-transform" />
            <h1 className="text-2xl font-black tracking-tight text-white">
              EXISMIC<span className="text-purple-400">.</span>
            </h1>
          </Link>
        </div>

        {/* Main Glass Card */}
        <div className="relative group">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-purple-500/30 via-white/10 to-cyan-500/20 rounded-[2.1rem] pointer-events-none blur-[1px]" />
          <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-[2.1rem] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="bg-[#090a10]/95 backdrop-blur-3xl border border-white/[0.09] rounded-[2rem] p-7 sm:p-9 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.9)] overflow-hidden relative">
            <Suspense fallback={<div className="py-20 flex justify-center"><Loader2 className="animate-spin text-purple-400" size={32} /></div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
          <p>© {new Date().getFullYear()} Exismic. All rights reserved.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
