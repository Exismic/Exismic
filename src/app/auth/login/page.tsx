"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Wand2, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Globe
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

// --- Premium Custom Icons (Scalable and Sharp) ---
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

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const message = searchParams.get('message');

  useEffect(() => {
    if (message) {
      setError(message);
    }
  }, [message]);

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}` },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setSocialLoading(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (activeTab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}` }
        });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      }
      router.push(returnUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-purple-500/30">
      {/* Background Refinement */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.05)_0%,transparent_50%)]" />
        {/* Soft Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        {/* Subtle Noise */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] z-10 space-y-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-4">
            <Link href="/" className="group flex flex-col items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-purple-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-14 h-14 rounded-2xl bg-[#121214] border border-white/10 flex items-center justify-center shadow-2xl relative">
                  <Wand2 size={24} className="text-white group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Lumora
              </h1>
            </Link>
        </div>

        {/* Central Auth Container */}
        <div className="relative">
          {/* Elite card styling */}
          <div className="bg-[#121214]/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Glossy top edge */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            
            <div className="space-y-8">
              {/* Elegant Tabs */}
              <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/5 rounded-2xl relative">
                 <motion.div 
                   layoutId="luxTabGlow"
                   className="absolute inset-1 w-[calc(50%-4px)] bg-[#1D1D20] rounded-xl border border-white/10 shadow-sm"
                   animate={{ x: activeTab === 'signin' ? 0 : '100%' }}
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 />
                 <button 
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] relative z-10 transition-all ${
                    activeTab === 'signin' ? "text-white" : "text-zinc-500 hover:text-zinc-400"
                  }`}
                 >
                   Sign In
                 </button>
                 <button 
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] relative z-10 transition-all ${
                    activeTab === 'signup' ? "text-white" : "text-zinc-500 hover:text-zinc-400"
                  }`}
                 >
                   Sign Up
                 </button>
              </div>

              {/* Identity Providers */}
              <div className="grid grid-cols-2 gap-3">
                 <button 
                  onClick={() => handleSocialLogin('google')}
                  disabled={!!socialLoading}
                  className="flex items-center justify-center gap-3 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-[13px] font-medium text-white/90 hover:bg-white/[0.06] hover:border-white/10 transition-all disabled:opacity-50"
                 >
                    {socialLoading === 'google' ? <Loader2 size={16} className="animate-spin text-zinc-500" /> : <GoogleIcon />}
                    Google
                 </button>
                 <button 
                  onClick={() => handleSocialLogin('github')}
                  disabled={!!socialLoading}
                  className="flex items-center justify-center gap-3 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-[13px] font-medium text-white/90 hover:bg-white/[0.06] hover:border-white/10 transition-all disabled:opacity-50"
                 >
                    {socialLoading === 'github' ? <Loader2 size={16} className="animate-spin text-zinc-500" /> : <GitHubIcon />}
                    GitHub
                 </button>
              </div>

              {/* Separator */}
              <div className="relative flex items-center gap-4">
                 <div className="h-[1px] flex-1 bg-white/[0.05]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">or</span>
                 <div className="h-[1px] flex-1 bg-white/[0.05]" />
              </div>

              {/* Action Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-400 transition-colors" size={16} />
                    <input 
                      name="email"
                      type="email" 
                      required
                      placeholder="Email address"
                      className="w-full bg-black/20 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/30 focus:bg-white/[0.01] transition-all"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-400 transition-colors" size={16} />
                    <input 
                      name="password"
                      type="password" 
                      required
                      placeholder="Password"
                      className="w-full bg-black/20 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/30 focus:bg-white/[0.01] transition-all"
                    />
                  </div>
                  
                  {activeTab === 'signin' && (
                    <div className="flex justify-start px-1">
                      <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                        Forgot your password?
                      </button>
                    </div>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 text-[11px] font-medium flex items-center gap-2.5"
                    >
                      <AlertCircle size={14} />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-2 rounded-xl bg-white text-black font-bold text-[13px] hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
                    <>
                      {activeTab === 'signin' ? 'Sign in' : 'Create your account'}
                      <ChevronRight size={14} className="opacity-50" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Navigation */}
              <div className="text-center pt-2">
                <button 
                  onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
                  className="text-zinc-500 text-[11px] font-medium tracking-tight hover:text-zinc-300 transition-colors"
                >
                  {activeTab === 'signin' ? "Not a member yet? " : "Joined us before? "}
                  <span className="text-white hover:underline underline-offset-4 decoration-white/20">
                    {activeTab === 'signin' ? "Sign up now" : "Go to sign in"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.04] bg-white/[0.02]">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">Industry-standard encryption</span>
          </div>
          
          <p className="text-center text-zinc-600 text-[10px] font-medium uppercase tracking-[0.2em] leading-relaxed">
             Lumora v2.4 <span className="mx-2">/</span> Build with Intent
          </p>
        </div>
      </motion.div>
    </div>
  );
}
