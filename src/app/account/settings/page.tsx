"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  LogOut, 
  Camera, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Crop as CropIcon,
  CreditCard,
  Settings,
  UserCircle,
  ExternalLink,
  ChevronRight,
  Activity,
  History,
  Lock,
  Bell,
  Wallet,
  Calendar,
  Clock,
  Crown,
  LayoutGrid,
  ChevronLeft,
  Loader2,
  RefreshCcw,
  ArrowRight,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cropper from "react-easy-crop";
import { cn } from "@/lib/utils";
import GradientText from "@/components/ui/GradientText";
import { useCredits } from "@/hooks/useCredits";
import { BuyCreditsModal } from "@/components/credits/BuyCreditsModal";
import { ManageSubscriptionModal } from "@/components/tool/ManageSubscriptionModal";
import { InvoiceModal } from "@/components/ui/InvoiceModal";
import { PRICING_CONFIG } from "@/config/pricing";
import { AvatarWithFrame, PRO_FRAMES } from "@/components/ui/AvatarWithFrame";
import { PremiumName, NAME_GRADIENTS } from "@/components/ui/PremiumName";
import { ThemeSelectorModal, CUSTOM_THEMES } from "@/components/modals/ThemeSelectorModal";
import { forgotPasswordAction } from "@/app/actions/auth";

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(error));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error("Canvas is empty")); return; }
      resolve(blob);
    }, "image/jpeg");
  });
}

type TabType = 'profile' | 'security' | 'billing' | 'credits' | 'preferences';

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [user, setUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { dailyCredits, lifetimeCredits, messagesUsed, plan, isPro, refreshCredits } = useCredits();
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [isUpdatingFrame, setIsUpdatingFrame] = useState(false);
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);

  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [isUpdatingGradient, setIsUpdatingGradient] = useState(false);
  const [isGradientModalOpen, setIsGradientModalOpen] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const displayAvatarUrl = dbUser?.custom_avatar_url || user?.user_metadata?.custom_avatar_url || user?.user_metadata?.avatar_url;

  useEffect(() => {
    const frame = user?.user_metadata?.avatar_frame ?? dbUser?.avatar_frame ?? null;
    const gradient = user?.user_metadata?.name_gradient ?? dbUser?.name_gradient ?? null;
    const theme =
      user?.user_metadata?.theme_preference ??
      user?.user_metadata?.profile_theme ??
      dbUser?.theme_preference ??
      dbUser?.profile_theme ??
      null;
    setSelectedFrame(frame);
    setSelectedGradient(gradient);
    setSelectedTheme(theme);
  }, [dbUser, user]);

  const handleApplyTheme = async (themeId: string | null) => {
    const previousTheme = selectedTheme;
    setSelectedTheme(themeId);
    
    try {
      setIsUpdatingTheme(true);
      setStatus(null);
      
      const response = await fetch('/api/user/profile-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update theme');
      
      const { error: syncError } = await supabase.auth.updateUser({
        data: { theme_preference: themeId }
      });
      if (syncError) throw syncError;
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profile-theme-updated', { detail: themeId }));
      }

      if (dbUser) {
        setDbUser({ ...dbUser, theme_preference: themeId });
      }
      
      if (user) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            theme_preference: themeId
          }
        });
      }
      
      setStatus({ type: 'success', message: themeId ? 'Profile theme applied!' : 'Theme reset to default!' });
      setIsThemeModalOpen(false);
      router.refresh();
    } catch (error: any) {
      setSelectedTheme(previousTheme);
      setStatus({ type: 'error', message: error.message || 'Failed to update theme' });
    } finally {
      setIsUpdatingTheme(false);
    }
  };

  const handleApplyGradient = async (gradientId: string | null) => {
    const previousGradient = selectedGradient;
    setSelectedGradient(gradientId);
    
    try {
      setIsUpdatingGradient(true);
      setStatus(null);
      
      const response = await fetch('/api/user/name-gradient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradientId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update name style');
      
      const { error: syncError } = await supabase.auth.updateUser({
        data: { name_gradient: gradientId }
      });
      if (syncError) throw syncError;
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('name-gradient-updated', { detail: gradientId }));
      }

      if (dbUser) {
        setDbUser({ ...dbUser, name_gradient: gradientId });
      }
      
      if (user) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            name_gradient: gradientId
          }
        });
      }
      
      setStatus({ type: 'success', message: gradientId ? 'Premium name style applied!' : 'Name style removed!' });
      router.refresh();
    } catch (error: any) {
      setSelectedGradient(previousGradient);
      setStatus({ type: 'error', message: error.message || 'Failed to update name style' });
    } finally {
      setIsUpdatingGradient(false);
    }
  };

  const handleApplyFrame = async (frameId: string | null) => {
    // Supersonic Optimistic Update
    const previousFrame = selectedFrame;
    setSelectedFrame(frameId);
    
    try {
      setIsUpdatingFrame(true);
      setStatus(null);
      
      // 1. Trigger API route to update PostgreSQL DB
      const response = await fetch('/api/user/avatar-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update avatar frame');
      
      // 2. Perform direct client-side Supabase metadata sync to broadcast updates to layout listeners instantly
      const { error: syncError } = await supabase.auth.updateUser({
        data: { avatar_frame: frameId }
      });
      if (syncError) throw syncError;

      // Dispatch luxury layout syncer event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('avatar-frame-updated', { detail: frameId }));
      }
      
      if (dbUser) {
        setDbUser({ ...dbUser, avatar_frame: frameId });
      }
      
      // Update local user reference for settings preview binding
      if (user) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            avatar_frame: frameId
          }
        });
      }
      
      setStatus({ type: 'success', message: frameId ? 'Premium avatar frame applied!' : 'Avatar frame removed!' });
      router.refresh();
    } catch (error: any) {
      // Graceful Rollback
      setSelectedFrame(previousFrame);
      setStatus({ type: 'error', message: error.message || 'Failed to update avatar frame' });
    } finally {
      setIsUpdatingFrame(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }
      setUser(session.user);
      setName(session.user.user_metadata?.full_name || "");
      const { data: dbData } = await supabase.from('User').select('*').eq('email', session.user.email).single();
      if (dbData) { setDbUser(dbData); setUsername(dbData.username || ""); }
    }
    loadData();
  }, [supabase, router]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => { setImageToCrop(reader.result?.toString() || null); });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCroppedImage = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      setIsUploading(true);
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, croppedBlob, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { error: profileError } = await supabase.from('User').upsert({
        id: user.id,
        email: user.email,
        image: publicUrl,
        custom_avatar_url: publicUrl
      }, { onConflict: 'id' });
      if (profileError) throw profileError;
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          picture: publicUrl,
          custom_avatar_url: publicUrl
        }
      });
      if (updateError) throw updateError;
      setUser({ ...user, user_metadata: { ...user.user_metadata, avatar_url: publicUrl, picture: publicUrl, custom_avatar_url: publicUrl } });
      setDbUser(dbUser ? { ...dbUser, image: publicUrl, custom_avatar_url: publicUrl } : dbUser);
      setImageToCrop(null);
      setStatus({ type: 'success', message: 'Profile picture updated!' });
      router.refresh();
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to process image' });
    } finally { setIsUploading(false); }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      setStatus(null);
      setSuggestions([]);
      const response = await fetch('/api/user/update-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, username }) });
      const data = await response.json();
      if (!response.ok) { if (data.suggestions) { setSuggestions(data.suggestions); } throw new Error(data.error || 'Failed to update profile'); }
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      router.refresh();
    } catch (error: any) { setStatus({ type: 'error', message: error.message || 'Failed to update profile' }); } finally { setIsUpdating(false); }
  };

  const [isResetting, setIsResetting] = useState(false);
  const handleResetPassword = async () => {
    try {
      setIsResetting(true);
      const result = await forgotPasswordAction(user.email);
      if (result?.error) throw new Error(result.error);
      setStatus({ type: 'success', message: 'Password reset email sent!' });
    } catch (error: any) { setStatus({ type: 'error', message: error.message || 'Failed to send reset email' }); } finally { setIsResetting(false); }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      const response = await fetch('/api/razorpay/cancel', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to cancel');
      setStatus({ type: 'success', message: 'Subscription cancelled successfully' });
      router.refresh();
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to cancel' });
    } finally {
      setIsCancelling(false);
    }
  };

  const getHoursUntilReset = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    return Math.floor(diff / (1000 * 60 * 60));
  };

  if (!isMounted || !user) return <div className="min-h-screen bg-[#030303]" />;

  const navigation = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'credits', label: 'Credits & Usage', icon: Zap },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ];

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10 lg:mb-16">
           <Link href="/" className="group flex min-h-11 items-center gap-3 text-zinc-500 hover:text-white transition-all">
              <div className="w-10 h-10 rounded-2xl glass-dark border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-all">
                 <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Exit Terminal</span>
           </Link>
           <div className="flex items-center gap-4">
              <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="min-h-11 px-6 py-2.5 rounded-full glass-dark border border-white/5 text-zinc-500 font-black uppercase tracking-widest text-[9px] hover:text-red-500 hover:border-red-500/20 transition-all">Sign Out</button>
           </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          <div className="lg:col-span-3 space-y-8">
             <div className="space-y-2">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Settings</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Account Infrastructure</p>
             </div>
             <nav className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
                {navigation.map((item) => (
                   <button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={cn("flex min-h-12 shrink-0 items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 group lg:w-full lg:gap-4 lg:px-6 lg:py-4", activeTab === item.id ? "bg-white/[0.05] border border-white/10 text-white shadow-2xl" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] border border-transparent")}>
                     <item.icon size={18} className={cn("transition-all", activeTab === item.id ? "text-accent-purple" : "group-hover:scale-110")} />
                     <span className="font-black uppercase tracking-widest text-[10px]">{item.label}</span>
                     {activeTab === item.id && <motion.div layoutId="nav-glow" className="ml-auto w-1 h-1 rounded-full bg-accent-purple shadow-[0_0_10px_#7c3aed]" />}
                   </button>
                ))}
             </nav>
          </div>
          <div className="lg:col-span-9 space-y-8">
             <AnimatePresence>
                {status && (
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("p-5 rounded-2xl border flex items-center justify-between backdrop-blur-2xl mb-8", status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400")}>
                     <div className="flex items-center gap-4">
                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{status.message}</span>
                     </div>
                     <button onClick={() => setStatus(null)}><X size={16} /></button>
                   </motion.div>
                )}
             </AnimatePresence>
             <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
                {activeTab === 'profile' && (
                   <div className="space-y-8">
                      <section className="glass-dark border border-white/5 rounded-[2rem] md:rounded-[3rem] p-5 sm:p-8 md:p-12 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/5 blur-[80px] pointer-events-none" />
                         <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                             <div className="relative group/avatar flex flex-col items-center">
                                <div className="absolute -inset-2 bg-linear-to-tr from-accent-purple to-accent-cyan rounded-full opacity-20 blur-md group-hover/avatar:opacity-40 transition-opacity duration-700" />
                                <div onClick={() => !isUploading && fileInputRef.current?.click()} className="relative cursor-pointer group/inner shadow-4xl rounded-[26px] overflow-hidden">
                                   <AvatarWithFrame 
                                     avatarUrl={displayAvatarUrl}
                                     displayName={name || 'User'}
                                     isPro={isPro}
                                     frameId={selectedFrame}
                                     size="xl"
                                   />
                                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/inner:opacity-100 flex flex-col items-center justify-center transition-all duration-300 z-30"><Camera size={20} className="text-white mb-1" /><span className="text-[7px] font-black uppercase tracking-widest text-white">Change</span></div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
                             </div>
                             <div className="flex-1 w-full space-y-8">
                               <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-3">
                                     <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white min-w-0 break-words">
                                        <PremiumName name={name || 'Anonymous User'} isPro={isPro} gradientId={selectedGradient} />
                                     </h2>
                                     <div suppressHydrationWarning className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest", isPro ? "bg-accent-purple/10 text-accent-purple border border-accent-purple/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-zinc-800 text-zinc-500")}>{isPro ? "Pro Member" : "Free Tier"}</div>
                                  </div>
                                  <p className="text-sm font-medium text-zinc-500">{user.email}</p>
                               </div>
                               <div className="space-y-3">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Full Name</label>
                                  <div className="relative group">
                                     <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
                                     <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:bg-white/[0.05] focus:border-white/10 outline-none transition-all" />
                                  </div>
                                </div>
                               <div className="space-y-3">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Email Address</label>
                                  <div className="relative">
                                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                                     <input type="text" value={user.email} readOnly className="w-full bg-white/[0.01] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-zinc-600 cursor-not-allowed" />
                                  </div>
                                </div>
                               <button onClick={handleUpdateProfile} disabled={isUpdating || name === (user.user_metadata?.full_name || "")} className="flex min-h-12 w-full sm:w-auto items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                  Sync Profile
                                </button>
                             </div>
                          </div>
                      </section>

                      {/* Pro Customization Section */}
                      {isPro && (
                      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.025] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:p-6">
                         <div className="absolute inset-px rounded-[2.45rem] bg-linear-to-br from-white/[0.08] via-transparent to-white/[0.03] pointer-events-none" />
                         <div className="absolute -top-24 left-10 h-56 w-56 rounded-full bg-purple-500/10 blur-[90px] pointer-events-none" />
                         <div className="absolute -bottom-28 right-10 h-60 w-60 rounded-full bg-cyan-400/8 blur-[95px] pointer-events-none" />

                         <div className="relative z-10 mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div className="space-y-1">
                               <div className="flex items-center gap-3">
                                  <Crown size={18} className="text-amber-300" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.34em] text-amber-200/70">Pro Customization</span>
                               </div>
                               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white md:text-3xl">VIP Identity Suite</h3>
                            </div>
                            <span className="w-fit rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.12)]">Pro VIP</span>
                         </div>

                         <div className="relative z-10 grid grid-cols-1 gap-5 xl:grid-cols-2">
                            <motion.div
                               whileHover={{ y: -4 }}
                               transition={{ type: "spring", stiffness: 260, damping: 22 }}
                               className="group/pro-card relative min-h-[265px] overflow-hidden rounded-[2rem] border border-purple-300/10 bg-[#090910]/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_60px_rgba(76,29,149,0.16)] backdrop-blur-xl"
                            >
                               <div className="absolute inset-0 bg-linear-to-br from-purple-400/10 via-white/[0.02] to-pink-400/8 opacity-80 transition-opacity duration-500 group-hover/pro-card:opacity-100" />
                               <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-purple-500/12 blur-[60px] transition-all duration-500 group-hover/pro-card:bg-purple-400/18" />
                               <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                                  <div className="flex items-start justify-between gap-4">
                                     <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-purple-200">
                                           <Sparkles size={16} className="fill-purple-200/20" />
                                           <h4 className="text-lg font-black uppercase tracking-tight text-white">Avatar Frames</h4>
                                        </div>
                                        <p className="max-w-sm text-[10px] font-bold uppercase leading-relaxed tracking-widest text-zinc-500">Animated metallic edges with a softer signature glow.</p>
                                     </div>
                                     <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-400">Selected</span>
                                  </div>

                                  <div className="flex items-center gap-5">
                                     <div className="relative rounded-[2rem] border border-white/10 bg-black/25 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                        <AvatarWithFrame
                                          avatarUrl={displayAvatarUrl}
                                           displayName={name || 'User'}
                                           isPro={isPro}
                                           frameId={selectedFrame}
                                           size="lg"
                                        />
                                     </div>
                                     <div className="min-w-0 space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-zinc-600">Current Frame</p>
                                        <p className="truncate text-xl font-black italic uppercase tracking-tighter text-white">
                                           {PRO_FRAMES.find((frame) => frame.id === selectedFrame)?.name || "Signature Gradient"}
                                        </p>
                                        <p className="text-xs font-medium leading-relaxed text-zinc-500">A refined profile frame for the full Toolverse identity system.</p>
                                     </div>
                                  </div>

                                  <div className="flex flex-wrap gap-3">
                                     <button
                                        onClick={() => setIsFrameModalOpen(true)}
                                        className="group/button flex items-center gap-2 rounded-2xl bg-linear-to-r from-purple-500 via-fuchsia-500 to-amber-300 px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-[0_14px_35px_rgba(168,85,247,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(168,85,247,0.34)] active:scale-98"
                                     >
                                        <LayoutGrid size={14} />
                                        Browse Frames
                                        <ArrowRight size={13} className="transition-transform group-hover/button:translate-x-0.5" />
                                     </button>
                                     {selectedFrame && (
                                        <button
                                           onClick={() => handleApplyFrame(null)}
                                           disabled={isUpdatingFrame}
                                           className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                                        >
                                           Remove
                                        </button>
                                     )}
                                  </div>
                               </div>
                            </motion.div>

                            <motion.div
                               whileHover={{ y: -4 }}
                               transition={{ type: "spring", stiffness: 260, damping: 22 }}
                               className="group/pro-card relative min-h-[265px] overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-[#090910]/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_60px_rgba(8,145,178,0.14)] backdrop-blur-xl"
                            >
                               <div className="absolute inset-0 bg-linear-to-br from-cyan-300/10 via-white/[0.02] to-blue-500/8 opacity-80 transition-opacity duration-500 group-hover/pro-card:opacity-100" />
                               <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-cyan-400/12 blur-[60px] transition-all duration-500 group-hover/pro-card:bg-cyan-300/18" />
                               <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                                  <div className="flex items-start justify-between gap-4">
                                     <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-cyan-200">
                                           <Sparkles size={16} className="fill-cyan-200/20" />
                                           <h4 className="text-lg font-black uppercase tracking-tight text-white">Name Style</h4>
                                        </div>
                                        <p className="max-w-sm text-[10px] font-bold uppercase leading-relaxed tracking-widest text-zinc-500">Premium gradients that travel with your profile.</p>
                                     </div>
                                     <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-400">Selected</span>
                                  </div>

                                  <div className="space-y-4">
                                     <div className="relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-black/30 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                        <div className="absolute inset-x-8 bottom-0 h-px bg-linear-to-r from-transparent via-cyan-200/35 to-transparent" />
                                        <PremiumName name={name || 'BMR.EZ'} isPro={isPro} gradientId={selectedGradient} className="text-3xl font-black uppercase tracking-tighter" />
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-zinc-600">Current Style</p>
                                        <p className="text-xl font-black italic uppercase tracking-tighter text-white">
                                           {NAME_GRADIENTS.find((gradient) => gradient.id === selectedGradient)?.name || "Cyber Purple"}
                                        </p>
                                     </div>
                                  </div>

                                  <div className="flex flex-wrap gap-3">
                                     <button
                                        onClick={() => setIsGradientModalOpen(true)}
                                        className="group/button flex items-center gap-2 rounded-2xl bg-linear-to-r from-cyan-400 via-blue-500 to-purple-500 px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-[0_14px_35px_rgba(6,182,212,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(6,182,212,0.32)] active:scale-98"
                                     >
                                        <LayoutGrid size={14} />
                                        Browse Name Styles
                                        <ArrowRight size={13} className="transition-transform group-hover/button:translate-x-0.5" />
                                     </button>
                                     {selectedGradient && (
                                        <button
                                           onClick={() => handleApplyGradient(null)}
                                           disabled={isUpdatingGradient}
                                           className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                                        >
                                           Remove
                                        </button>
                                     )}
                                  </div>
                               </div>
                            </motion.div>

                            <motion.div
                               whileHover={{ y: -4 }}
                               transition={{ type: "spring", stiffness: 260, damping: 22 }}
                               className="group/pro-card relative min-h-[240px] overflow-hidden rounded-[2rem] border border-amber-300/10 bg-[#08080d]/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_60px_rgba(245,158,11,0.10)] backdrop-blur-xl xl:col-span-2"
                            >
                               <div className="absolute inset-0 bg-linear-to-br from-amber-300/8 via-purple-400/[0.04] to-cyan-300/8 opacity-80 transition-opacity duration-500 group-hover/pro-card:opacity-100" />
                               <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-amber-300/10 blur-[70px]" />
                               <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-cyan-300/10 blur-[80px]" />
                               <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
                                  <div className="space-y-6">
                                     <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-2">
                                           <div className="flex items-center gap-2 text-amber-200">
                                              <Crown size={16} className="fill-amber-200/20" />
                                              <h4 className="text-lg font-black uppercase tracking-tight text-white">Custom Profile Themes</h4>
                                           </div>
                                           <p className="max-w-2xl text-[10px] font-bold uppercase leading-relaxed tracking-widest text-zinc-500">
                                              Give your dashboard, sidebar, navbar, AI chat, and settings a signature Pro atmosphere.
                                           </p>
                                        </div>
                                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-amber-200">Pro Only</span>
                                     </div>

                                     <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-zinc-600">Current Theme</p>
                                        <p className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                           {CUSTOM_THEMES.find((theme) => theme.id === selectedTheme)?.name || "Default Midnight"}
                                        </p>
                                        <p className="text-xs font-medium leading-relaxed text-zinc-500">
                                           Hover theme cards for live preview, then apply the one that feels like your creative identity.
                                        </p>
                                     </div>

                                     <div className="flex flex-wrap gap-3">
                                        <button
                                           onClick={() => setIsThemeModalOpen(true)}
                                           className="group/button flex items-center gap-2 rounded-2xl bg-linear-to-r from-amber-300 via-purple-500 to-cyan-400 px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-[0_14px_35px_rgba(245,158,11,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(6,182,212,0.26)] active:scale-98"
                                        >
                                           <LayoutGrid size={14} />
                                           Browse Themes
                                           <ArrowRight size={13} className="transition-transform group-hover/button:translate-x-0.5" />
                                        </button>
                                        {selectedTheme && (
                                           <button
                                              onClick={() => handleApplyTheme(null)}
                                              disabled={isUpdatingTheme}
                                              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                                           >
                                              Reset Theme
                                           </button>
                                        )}
                                     </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-3">
                                     {CUSTOM_THEMES.map((theme) => (
                                        <div key={theme.id} className={cn("h-20 rounded-2xl border p-2 shadow-inner", theme.previewStyle, selectedTheme === theme.id && "ring-2 ring-white/70")}>
                                           <div className="flex h-full items-end gap-1.5">
                                              {theme.colorDots.map((dot, index) => (
                                                 <span key={index} className={cn("h-2.5 w-2.5 rounded-full border border-white/20", dot)} />
                                              ))}
                                           </div>
                                        </div>
                                     ))}
                                  </div>
                               </div>
                            </motion.div>
                         </div>
                      </section>
                      )}
                   </div>
                )}
                {activeTab === 'credits' && (
                   <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <section className="glass-dark border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/5 blur-[80px] pointer-events-none group-hover:bg-accent-purple/10 transition-colors" />
                            <div className="space-y-8 relative z-10">
                               <div className="flex items-center gap-3 text-accent-purple"><Sparkles size={20} className="animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Permanent Reserve</span></div>
                               <div suppressHydrationWarning className="space-y-1"><h3 className="text-6xl font-black italic uppercase tracking-tighter text-white">{lifetimeCredits}</h3><p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Bought • Never Expires</p></div>
                               <button onClick={() => setIsBuyModalOpen(true)} className="w-full py-4 rounded-xl premium-gradient text-white font-black uppercase tracking-widest text-[9px] shadow-4xl hover:scale-[1.02] active:scale-98 transition-all">Purchase Permanent Credits</button>
                            </div>
                         </section>
                         <section className="glass-dark border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/5 blur-[80px] pointer-events-none group-hover:bg-accent-cyan/10 transition-colors" />
                            <div className="space-y-8 relative z-10">
                               <div className="flex items-center gap-3 text-accent-cyan"><Zap size={20} className="fill-accent-cyan/20" /><span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Daily Allowance</span></div>
                               <div suppressHydrationWarning className="space-y-1"><h3 className="text-6xl font-black italic uppercase tracking-tighter text-white">{dailyCredits} <span className="text-2xl text-zinc-800 tracking-normal">/</span> <span className="text-2xl text-zinc-600">{isPro ? PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS : 50}</span></h3><p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Replenishes Daily</p></div>
                               <div className="space-y-4">
                                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden p-[1px] border border-white/5"><motion.div initial={{ width: 0 }} animate={{ width: `${(dailyCredits / (isPro ? PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS : 50)) * 100}%` }} className="h-full bg-linear-to-r from-accent-cyan to-blue-600 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.2)]" /></div>
                                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-zinc-600"><div className="flex items-center gap-1.5"><Clock size={10} />Resets in {getHoursUntilReset()} hours</div><div className="flex items-center gap-3"><button onClick={refreshCredits} className="hover:text-white transition-colors flex items-center gap-1"><RefreshCcw size={10} /> Sync</button></div></div>
                                </div>
                            </div>
                         </section>
                      </div>
                      <div className="mt-12 flex items-center gap-6"><button onClick={() => setIsBuyModalOpen(true)} className="flex-1 py-5 rounded-2xl premium-gradient text-white font-black uppercase tracking-widest text-[10px] shadow-4xl hover:scale-[1.02] active:scale-98 transition-all">Buy More Credits</button><button onClick={refreshCredits} className="p-5 rounded-2xl glass-dark border border-white/5 text-zinc-500 hover:text-white transition-all"><RefreshCcw size={18} /></button></div>
                      <section className="glass-dark border border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-8">
                         <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90"><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-900" /><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (isPro ? 100 : (messagesUsed / 30) * 100)) / 100} className="text-accent-purple transition-all duration-1000" /></svg>
                            <div className="absolute flex flex-col items-center"><span className="text-4xl font-black text-white italic">{messagesUsed}</span><span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Messages</span></div>
                         </div>
                         <div className="space-y-2"><h4 className="text-sm font-black uppercase tracking-widest text-white">AI Interactions</h4><p className="text-[10px] font-medium text-zinc-500 leading-relaxed uppercase tracking-tight px-4">{isPro ? "Unlimited elite model access active" : `Daily limit: ${messagesUsed}/30 interactions`}</p></div>
                      </section>
                      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6"><h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent-purple italic">What consumes credits?</h4><ul className="space-y-4">{[{ label: "AI Image Generation", value: "5 Credits" }, { label: "Magic Object Removal", value: "3 Credits" }, { label: "Vocal Extraction", value: "8 Credits" }, { label: "Video Processing", value: "10-20 Credits" }].map((item, i) => <li key={i} className="flex items-center justify-between"><span className="text-[11px] font-medium text-zinc-400 uppercase tracking-tight">{item.label}</span><span className="text-[10px] font-black text-white tracking-widest">{item.value}</span></li>)}</ul></div>
                         <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6"><h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent-cyan italic">What is free?</h4><ul className="space-y-4">{[{ label: "PDF Merging", value: "Free" }, { label: "Basic Image Compression", value: "Free" }, { label: "Text Formatting", value: "Free" }, { label: "QR Code Generation", value: "Free" }].map((item, i) => <li key={i} className="flex items-center justify-between"><span className="text-[11px] font-medium text-zinc-400 uppercase tracking-tight">{item.label}</span><span className="text-[10px] font-black text-accent-cyan tracking-widest uppercase">{item.value}</span></li>)}</ul></div>
                      </section>
                   </div>
                )}
                {activeTab === 'security' && (
                   <div className="space-y-8">
                      <section className="glass-dark border border-white/5 rounded-[3rem] p-12 space-y-12 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] pointer-events-none" /><div className="space-y-4"><h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Security Infrastructure</h3><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Protect your creative assets and identity</p></div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6"><div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white"><Lock size={32} /></div><div className="space-y-4"><h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Update Password</h4><p className="text-[11px] font-medium text-zinc-500 leading-relaxed uppercase tracking-tight">We will send a secure reset link to your registered email address.</p><button onClick={handleResetPassword} disabled={isResetting} className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] hover:bg-white hover:text-black transition-all flex items-center gap-3">{isResetting ? <Loader2 size={14} className="animate-spin" /> : "Request Reset Link"}<ArrowRight size={14} /></button></div></div>
                            <div className="space-y-6"><div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white"><ShieldCheck size={32} /></div><div className="space-y-4"><h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Multi-Factor Auth</h4><p className="text-[11px] font-medium text-zinc-500 leading-relaxed uppercase tracking-tight">Add an extra layer of security to your account using 2FA.</p><button className="px-8 py-4 rounded-xl bg-zinc-900 border border-white/5 text-zinc-600 font-black uppercase tracking-widest text-[9px] cursor-not-allowed italic">Coming Soon</button></div></div>
                         </div>
                      </section>
                   </div>
                )}
                {activeTab === 'billing' && (
                     <div className="space-y-8">
                        <section className="glass-dark border border-white/5 rounded-[3rem] p-12 space-y-12 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/5 blur-[80px] pointer-events-none" />
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                             <div className="space-y-4">
                               <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Subscription</h3>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Your current plan and billing cycle</p>
                             </div>
                             <div className={cn(
                               "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs italic border transition-all",
                               isPro 
                                 ? "bg-accent-purple/10 border-accent-purple/20 text-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.2)]" 
                                 : "bg-zinc-800/50 border-white/5 text-zinc-500"
                             )}>
                               {isPro ? "Active Pro Plan" : "Free Explorer"}
                             </div>
                           </div>

                           <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-10">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                 <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center text-accent-purple shadow-2xl relative overflow-hidden group">
                                      <div className="absolute inset-0 bg-accent-purple/5 group-hover:bg-accent-purple/10 transition-colors" />
                                      <Crown size={40} className={cn("relative z-10", isPro && "fill-accent-purple/20")} />
                                    </div>
                                    <div>
                                      <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                        {isPro ? "Lumora Elite Pro" : "Lumora Free"}
                                      </h4>
                                      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mt-1">
                                        {isPro 
                                          ? dbUser?.subscription_status === 'cancelled' 
                                            ? `Pro access ends on: ${new Date(dbUser.plan_expires_at).toLocaleDateString()}`
                                            : `Next billing date: June 1, 2026` 
                                          : "Upgrade for premium AI tools"}
                                      </p>
                                    </div>
                                 </div>

                                 {isPro && (
                                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                       <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Secure & Verified</span>
                                    </div>
                                 )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <button 
                                   onClick={() => isPro ? setIsManageModalOpen(true) : router.push('/pro')}
                                   className="py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 hover:scale-[1.02] active:scale-98 transition-all shadow-xl"
                                 >
                                   {isPro ? "Manage Subscription" : "Upgrade to Pro"}
                                 </button>
                                 <button 
                                   onClick={() => setIsInvoiceModalOpen(true)}
                                   className="py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:border-white/20 transition-all"
                                 >
                                   View Invoices
                                 </button>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {[{ icon: Wallet, label: "Payment Method", value: "Razorpay" }, { icon: Calendar, label: "Cycle", value: "Monthly" }, { icon: Activity, label: "Status", value: isPro ? "Active" : "Standard" }].map((item, i) => (
                                <div key={i} className="p-6 rounded-[1.75rem] bg-white/[0.01] border border-white/5 flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600">
                                      <item.icon size={18} />
                                   </div>
                                   <div>
                                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{item.label}</p>
                                      <p className="text-xs font-bold text-white italic">{item.value}</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </section>
                     </div>
                  )}
                {activeTab === 'preferences' && (
                    <div className="space-y-8">
                       <section className="glass-dark border border-white/5 rounded-[3rem] p-12 space-y-12">
                          <div className="space-y-4">
                             <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Preferences</h3>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Customize your Lumora experience</p>
                          </div>
                          <div className="space-y-6">
                            {[{ label: "Auto-Refresh History", desc: "Keep recently processed files updated in real-time.", icon: History }, { label: "Email Notifications", desc: "Receive updates about new AI tools and features.", icon: Bell }, { label: "High Fidelity Preview", desc: "Show higher resolution previews (higher bandwidth).", icon: ImageIcon }].map((pref, i) => (
                               <div key={i} className="flex items-center justify-between p-8 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                                        <pref.icon size={22} />
                                     </div>
                                     <div className="space-y-1">
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-white">{pref.label}</h4>
                                        <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-tight">{pref.desc}</p>
                                     </div>
                                  </div>
                                  <div className="w-12 h-6 rounded-full bg-zinc-800 relative cursor-pointer">
                                     <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-zinc-600" />
                                  </div>
                               </div>
                            ))}
                          </div>
                       </section>
                    </div>
                 )}
             </motion.div>
          </div>
        </div>
      </div>

      {/* Dynamic Pro Avatar Frames Browser Modal */}
      <AnimatePresence>
        {isPro && isFrameModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10"
          >
            <div className="relative w-full max-w-4xl max-h-[calc(100dvh-2rem)] h-[85dvh] flex flex-col bg-[#030303] border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-4xl">
               {/* Ambient Glows */}
               <div className="absolute top-0 right-0 w-80 h-80 bg-accent-purple/10 blur-[100px] pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-cyan/5 blur-[100px] pointer-events-none" />
               
               {/* Top Header */}
               <div className="p-4 sm:p-6 md:p-8 flex items-center justify-between z-10 border-b border-white/5 bg-black/40 backdrop-blur-md gap-4">
                  <div className="flex items-center gap-4">
                     <div className="p-3 rounded-2xl bg-accent-purple/20 text-accent-purple">
                        <Crown size={24} className="fill-accent-purple/20" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Elite Pro Avatar Frames</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pick a luxurious digital identity frame</p>
                     </div>
                  </div>
                  <button 
                     onClick={() => setIsFrameModalOpen(false)} 
                     className="min-h-11 min-w-11 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center"
                  >
                     <X size={24} />
                  </button>
               </div>

               {/* Grid Frame Selector Body */}
               <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 md:p-12 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                     {PRO_FRAMES.map((frame) => {
                        const isSelected = selectedFrame === frame.id;
                        return (
                           <motion.div 
                              key={frame.id} 
                              whileHover={{ scale: 1.05, y: -4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => !isUpdatingFrame && handleApplyFrame(frame.id)}
                              className={cn(
                                 "p-6 rounded-[2.5rem] bg-[#0b0b11]/30 backdrop-blur-xl border border-white/5 flex flex-col items-center gap-6 cursor-pointer transition-all duration-300 group/frame relative overflow-hidden",
                                 isSelected && "bg-[#0b0b11]/60 border-purple-500/80 shadow-[0_0_35px_rgba(168,85,247,0.35)] scale-105 hover:scale-105 border-2"
                              )}
                           >
                              {/* Ambient Orb Glow behind the card */}
                              <div className={cn(
                                 "absolute -inset-10 rounded-[2.5rem] opacity-0 group-hover/frame:opacity-100 transition-opacity duration-500 blur-2xl -z-10 bg-gradient-to-br",
                                 frame.glowStyles
                              )} />

                              <div className="relative scale-125 my-4 transition-transform duration-500 group-hover/frame:scale-135">
                                 <AvatarWithFrame 
                                    avatarUrl={displayAvatarUrl}
                                    displayName={name || 'User'}
                                    isPro={true}
                                    frameId={frame.id}
                                    size="md"
                                 />
                                 {isSelected && (
                                    <div className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center border border-[#030303] shadow-[0_0_15px_rgba(168,85,247,0.5)] z-30 animate-pulse">
                                       <CheckCircle2 size={12} className="text-white" />
                                    </div>
                                 )}
                              </div>
                              
                              <div className="space-y-2 text-center relative z-10">
                                 <h4 className={cn("text-xs font-black uppercase tracking-wider text-center drop-shadow-md", frame.titleColor || "text-white")}>
                                    {frame.name}
                                 </h4>
                                 <span className={cn(
                                    "inline-block px-2.5 py-0.5 rounded-md text-[7px] font-extrabold uppercase tracking-widest border transition-all duration-300",
                                    isSelected 
                                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30" 
                                      : "bg-white/5 border-white/5 text-zinc-500 group-hover/frame:text-zinc-300 group-hover/frame:border-white/10"
                                 )}>
                                    PRO ELITE
                                 </span>
                              </div>
                              
                              <button 
                                 className={cn(
                                    "w-full py-2.5 rounded-xl text-[8.5px] font-black uppercase tracking-widest border transition-all duration-300 mt-2 shadow-lg",
                                    isSelected 
                                      ? "bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white shadow-[0_0_15px_rgba(168,85,247,0.45)] hover:scale-102 font-black" 
                                      : "bg-white/5 border-white/5 text-zinc-500 group-hover/frame:bg-white group-hover/frame:text-black group-hover/frame:border-white group-hover/frame:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                                 )}
                              >
                                 {isSelected ? "Equipped" : "Select"}
                              </button>
                           </motion.div>
                        );
                     })}
                  </div>
               </div>

               {/* Footer */}
               <div className="p-4 sm:p-6 md:p-8 border-t border-white/5 bg-zinc-950/60 backdrop-blur-md flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">Select any frame to instantly apply it to your account</span>
                  <div className="flex gap-4">
                     {selectedFrame && (
                        <button 
                           onClick={() => { handleApplyFrame(null); }}
                           disabled={isUpdatingFrame}
                           className="px-6 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                           Remove Current Frame
                        </button>
                     )}
                     <button 
                        onClick={() => setIsFrameModalOpen(false)}
                        className="px-8 py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[9px] hover:bg-zinc-200 transition-all shadow-xl"
                     >
                        Done
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Name Styles Browser Modal */}
      <AnimatePresence>
        {isPro && isGradientModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10"
          >
            <div className="relative w-full max-w-4xl max-h-[calc(100dvh-2rem)] h-[85dvh] flex flex-col bg-[#030303] border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-4xl">
               {/* Ambient Glows */}
               <div className="absolute top-0 right-0 w-80 h-80 bg-accent-cyan/10 blur-[100px] pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-purple/5 blur-[100px] pointer-events-none" />
               
               {/* Top Header */}
               <div className="p-4 sm:p-6 md:p-8 flex items-center justify-between z-10 border-b border-white/5 bg-black/40 backdrop-blur-md gap-4">
                  <div className="flex items-center gap-4">
                     <div className="p-3 rounded-2xl bg-accent-cyan/20 text-accent-cyan">
                        <Sparkles size={24} className="fill-accent-cyan/20" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Elite Premium Name Styles</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pick a luxurious glowing text identity style</p>
                     </div>
                  </div>
                  <button 
                     onClick={() => setIsGradientModalOpen(false)} 
                     className="min-h-11 min-w-11 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center"
                  >
                     <X size={24} />
                  </button>
               </div>

               {/* Grid Name Style Selector Body */}
               <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 md:p-12 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                     {NAME_GRADIENTS.map((gradient) => {
                        const isSelected = selectedGradient === gradient.id;
                        return (
                           <motion.div 
                              key={gradient.id} 
                              whileHover={{ scale: 1.05, y: -4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => !isUpdatingGradient && handleApplyGradient(gradient.id)}
                              className={cn(
                                 "p-6 rounded-[2.5rem] bg-[#0b0b11]/30 backdrop-blur-xl border border-white/5 flex flex-col items-center gap-6 cursor-pointer transition-all duration-300 group/gradient relative overflow-hidden",
                                 isSelected && "bg-[#0b0b11]/60 border-cyan-500/80 shadow-[0_0_35px_rgba(6,182,212,0.35)] scale-105 hover:scale-105 border-2"
                              )}
                           >
                              {/* Ambient Orb Glow behind the card */}
                              <div className={cn(
                                 "absolute -inset-10 rounded-[2.5rem] opacity-0 group-hover/gradient:opacity-100 transition-opacity duration-500 blur-2xl -z-10 bg-gradient-to-br",
                                 gradient.previewGlow
                              )} />

                              <div className="text-xl font-black tracking-tight my-4">
                                 <PremiumName name="BMR.EZ" isPro={true} gradientId={gradient.id} className="text-xl font-black uppercase" />
                              </div>
                              
                              <div className="space-y-2 text-center relative z-10">
                                 <h4 className="text-xs font-black uppercase tracking-wider text-center drop-shadow-md text-white">
                                    {gradient.name}
                                 </h4>
                                 <span className={cn(
                                    "inline-block px-2.5 py-0.5 rounded-md text-[7px] font-extrabold uppercase tracking-widest border transition-all duration-300",
                                    isSelected 
                                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" 
                                      : "bg-white/5 border-white/5 text-zinc-500 group-hover/gradient:text-zinc-300 group-hover/gradient:border-white/10"
                                 )}>
                                    PRO ELITE
                                 </span>
                              </div>
                              
                              <button 
                                 className={cn(
                                    "w-full py-2.5 rounded-xl text-[8.5px] font-black uppercase tracking-widest border transition-all duration-300 mt-2 shadow-lg",
                                    isSelected 
                                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-transparent text-white shadow-[0_0_15px_rgba(6,182,212,0.45)] hover:scale-102 font-black" 
                                      : "bg-white/5 border-white/5 text-zinc-500 group-hover/gradient:bg-white group-hover/gradient:text-black group-hover/gradient:border-white group-hover/gradient:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                                 )}
                              >
                                 {isSelected ? "Equipped" : "Select"}
                              </button>
                           </motion.div>
                        );
                     })}
                  </div>
               </div>

               {/* Footer */}
               <div className="p-4 sm:p-6 md:p-8 border-t border-white/5 bg-zinc-950/60 backdrop-blur-md flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">Select any style to instantly apply it to your account</span>
                  <div className="flex gap-4">
                     {selectedGradient && (
                        <button 
                           onClick={() => { handleApplyGradient(null); }}
                           disabled={isUpdatingGradient}
                           className="px-6 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                           Remove Current Style
                        </button>
                     )}
                     <button 
                        onClick={() => setIsGradientModalOpen(false)}
                        className="px-8 py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[9px] hover:bg-zinc-200 transition-all shadow-xl"
                     >
                        Done
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {imageToCrop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10">
            <div className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] h-[80dvh] flex flex-col items-center justify-center bg-[#030303] border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-4xl">
               <div className="absolute top-0 inset-x-0 p-8 flex items-center justify-between z-10 bg-linear-to-b from-black to-transparent"><div className="flex items-center gap-4"><div className="p-3 rounded-2xl bg-accent-purple/20 text-accent-purple"><CropIcon size={24} /></div><div><h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Perfect Your Look</h2><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Crop and align your digital identity</p></div></div><button onClick={() => setImageToCrop(null)} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><X size={24} /></button></div>
               <div className="relative w-full flex-1 mt-10"><Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} cropShape="round" showGrid={false} style={{ containerStyle: { background: 'transparent' }, cropAreaStyle: { border: '2px solid rgba(168, 85, 247, 0.5)' } }} /></div>
               <div className="w-full p-8 md:p-12 space-y-8 bg-zinc-950/80 backdrop-blur-md relative z-10"><div className="space-y-4"><div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2"><span>Optical Zoom</span><span>{Math.round(zoom * 100)}%</span></div><input type="range" value={zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-accent-purple" /></div>
                   <div className="flex gap-4"><button onClick={() => setImageToCrop(null)} className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/5 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Cancel</button><button onClick={handleSaveCroppedImage} disabled={isUploading} className="flex-1 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all shadow-xl disabled:opacity-30">{isUploading ? "Uploading..." : "Save Identity"}</button></div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <BuyCreditsModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
      <ManageSubscriptionModal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)} 
        user={dbUser}
        onCancel={handleCancelSubscription}
        isCancelling={isCancelling}
      />
      <ThemeSelectorModal
        isOpen={isPro && isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={selectedTheme}
        onSelectTheme={handleApplyTheme}
        isUpdating={isUpdatingTheme}
      />
      <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
    </div>
  );
}
