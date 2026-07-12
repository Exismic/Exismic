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
  Gift,
  LayoutGrid,
  ChevronLeft,
  Loader2,
  RefreshCcw,
  ArrowRight,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { getFunctionalStorageItem, setFunctionalStorageItem } from "@/lib/cookie-consent";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Skeleton, SkeletonLine } from "@/components/ui/Skeleton";
import { TrustedLoginSetup } from "@/components/auth/TrustedLoginSetup";

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
type PreferenceKey = 'autoRefreshHistory' | 'emailNotifications' | 'highFidelityPreview';

const DEFAULT_USER_PREFERENCES: Record<PreferenceKey, boolean> = {
  autoRefreshHistory: true,
  emailNotifications: true,
  highFidelityPreview: false,
};

const PREFERENCE_ITEMS: Array<{ key: PreferenceKey; label: string; desc: string; icon: typeof History }> = [
  { key: 'autoRefreshHistory', label: "Auto-Refresh History", desc: "Keep recently processed files updated in real-time.", icon: History },
  { key: 'emailNotifications', label: "Email Notifications", desc: "Receive updates about new AI tools and features.", icon: Bell },
  { key: 'highFidelityPreview', label: "High Fidelity Preview", desc: "Show higher resolution previews when available.", icon: ImageIcon },
];

function AccountSettingsSkeleton() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#030303] px-4 py-10 text-white sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
        <aside className="space-y-8 lg:col-span-3">
          <div className="space-y-3">
            <SkeletonLine className="h-8 w-40" />
            <SkeletonLine className="w-48" />
          </div>
          <div className="flex gap-2 overflow-hidden lg:block lg:space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-36 shrink-0 rounded-2xl lg:w-full" />
            ))}
          </div>
        </aside>
        <main className="space-y-8 lg:col-span-9">
          <section className="rounded-[2rem] border border-white/5 bg-white/[0.025] p-5 md:rounded-[3rem] md:p-12">
            <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
              <Skeleton className="h-32 w-32 rounded-[2rem]" />
              <div className="w-full flex-1 space-y-7">
                <div className="space-y-3">
                  <SkeletonLine className="h-8 w-64 max-w-[70vw]" />
                  <SkeletonLine className="w-56 max-w-[60vw]" />
                </div>
                <div className="grid gap-4">
                  <Skeleton className="h-14 rounded-2xl" />
                  <Skeleton className="h-14 rounded-2xl" />
                  <Skeleton className="h-12 w-40 rounded-2xl" />
                </div>
              </div>
            </div>
          </section>
          <section className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-[1.75rem]" />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { credits, dailyCredits, bonusCredits, lifetimeCredits, messagesUsed, isPro, refreshCredits } = useCredits();
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab && ["profile", "security", "billing", "credits", "preferences"].includes(requestedTab)) {
      setActiveTab(requestedTab as TabType);
    }
  }, [searchParams]);
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
  const [preferences, setPreferences] = useState<Record<PreferenceKey, boolean>>(DEFAULT_USER_PREFERENCES);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [savingPreference, setSavingPreference] = useState<PreferenceKey | null>(null);

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
      const res = await fetch(`/api/user/profile?t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.success && json.user) { 
        setDbUser(json.user); 
        setUsername(json.user.username || ""); 
      }
    }
    loadData();
  }, [supabase, router]);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const localPreferences = getFunctionalStorageItem('exismic:user-preferences');
        if (localPreferences) {
          setPreferences({ ...DEFAULT_USER_PREFERENCES, ...JSON.parse(localPreferences) });
        }

        const response = await fetch('/api/user/preferences', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load preferences');
        const nextPreferences = { ...DEFAULT_USER_PREFERENCES, ...data.preferences };
        setPreferences(nextPreferences);
        if (typeof window !== 'undefined') {
          setFunctionalStorageItem('exismic:user-preferences', JSON.stringify(nextPreferences));
          window.dispatchEvent(new CustomEvent('exismic-preferences-updated', { detail: nextPreferences }));
          document.documentElement.dataset.highFidelityPreview = nextPreferences.highFidelityPreview ? 'true' : 'false';
        }
      } catch (error) {
        console.error('[Settings] Failed to load preferences:', error);
      } finally {
        setIsLoadingPreferences(false);
      }
    }

    if (user) void loadPreferences();
  }, [user]);

  const handlePreferenceToggle = async (key: PreferenceKey) => {
    const previous = preferences;
    const nextPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(nextPreferences);
    setSavingPreference(key);
    setStatus(null);

    if (typeof window !== 'undefined') {
      setFunctionalStorageItem('exismic:user-preferences', JSON.stringify(nextPreferences));
      window.dispatchEvent(new CustomEvent('exismic-preferences-updated', { detail: nextPreferences }));
      document.documentElement.dataset.highFidelityPreview = nextPreferences.highFidelityPreview ? 'true' : 'false';
    }

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: nextPreferences[key] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save preference');
      const savedPreferences = { ...DEFAULT_USER_PREFERENCES, ...data.preferences };
      setPreferences(savedPreferences);
      if (typeof window !== 'undefined') {
        setFunctionalStorageItem('exismic:user-preferences', JSON.stringify(savedPreferences));
        window.dispatchEvent(new CustomEvent('exismic-preferences-updated', { detail: savedPreferences }));
        document.documentElement.dataset.highFidelityPreview = savedPreferences.highFidelityPreview ? 'true' : 'false';
      }
      setStatus({ type: 'success', message: 'Preferences updated.' });
    } catch (error: any) {
      setPreferences(previous);
      if (typeof window !== 'undefined') {
        setFunctionalStorageItem('exismic:user-preferences', JSON.stringify(previous));
        window.dispatchEvent(new CustomEvent('exismic-preferences-updated', { detail: previous }));
        document.documentElement.dataset.highFidelityPreview = previous.highFidelityPreview ? 'true' : 'false';
      }
      setStatus({ type: 'error', message: error.message || 'Failed to save preference.' });
    } finally {
      setSavingPreference(null);
    }
  };

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
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: publicUrl })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile picture');
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
      const response = await fetch('/api/payments/cancel', {
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

  const [timeUntilReset, setTimeUntilReset] = useState("00h 00m 00s");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Daily reset is at 12:00 PM IST, which is 06:30 AM UTC
      const target = new Date();
      target.setUTCHours(6, 30, 0, 0);
      
      // If current time is past today's reset time, next reset is tomorrow
      if (now.getTime() >= target.getTime()) {
        target.setUTCDate(target.getUTCDate() + 1);
      }
      
      const diff = target.getTime() - now.getTime();
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilReset(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted || !user) return <AccountSettingsSkeleton />;

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
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-10 2xl:gap-12">
          <div className="space-y-6 xl:col-span-3 xl:space-y-8">
             <div className="space-y-2">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Settings</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Account Infrastructure</p>
             </div>
             <nav className="flex gap-2 overflow-x-auto pb-2 xl:block xl:space-y-2 xl:overflow-visible xl:pb-0">
                {navigation.map((item) => (
                   <button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={cn("group flex min-h-12 shrink-0 items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 xl:w-full xl:gap-4 xl:px-6 xl:py-4", activeTab === item.id ? "bg-white/[0.05] border border-white/10 text-white shadow-2xl" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] border border-transparent")}>
                     <item.icon size={18} className={cn("transition-all", activeTab === item.id ? "text-accent-purple" : "group-hover:scale-110")} />
                     <span className="font-black uppercase tracking-widest text-[10px]">{item.label}</span>
                     {activeTab === item.id && <motion.div layoutId="nav-glow" className="ml-auto w-1 h-1 rounded-full bg-accent-purple shadow-[0_0_10px_#7c3aed]" />}
                   </button>
                ))}
             </nav>
          </div>
          <div className="min-w-0 space-y-8 xl:col-span-9">
             <AnimatePresence>
                {status && (
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("mb-8 flex items-start justify-between gap-3 rounded-2xl border p-4 backdrop-blur-2xl sm:items-center sm:p-5", status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400")}>
                     <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                        {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                        <span className="break-words text-[10px] font-black uppercase leading-5 tracking-wider sm:tracking-widest">{status.message}</span>
                     </div>
                     <button onClick={() => setStatus(null)} aria-label="Dismiss message" className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-xl hover:bg-white/5"><X size={16} /></button>
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
                                     frameId={selectedFrame || undefined}
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
                                           frameId={selectedFrame || undefined}
                                           size="lg"
                                        />
                                     </div>
                                     <div className="min-w-0 space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-zinc-600">Current Frame</p>
                                        <p className="truncate text-xl font-black italic uppercase tracking-tighter text-white">
                                           {PRO_FRAMES.find((frame) => frame.id === selectedFrame)?.name || "Signature Gradient"}
                                        </p>
                                        <p className="text-xs font-medium leading-relaxed text-zinc-500">A refined profile frame for the full Exismic identity system.</p>
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
                      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                         <section className="group relative isolate overflow-hidden rounded-[2.5rem] border border-white/5 bg-[linear-gradient(145deg,rgba(12,10,24,0.95),rgba(4,7,12,0.98)_55%,rgba(4,13,17,0.95))] p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                            <div className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.3),transparent)] opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 transition-opacity duration-500 group-hover:opacity-50" />
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent-cyan/10 blur-[80px] opacity-0 transition-all duration-700 group-hover:opacity-20" />
                            
                            <div className="relative z-10 space-y-7">
                               <div className="flex items-center gap-4">
                                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-[linear-gradient(115deg,rgba(34,211,238,0.1),rgba(34,211,238,0.02))] text-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.1)] transition-all duration-500 group-hover:scale-110 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10"><Wallet size={20} /></div>
                                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-500/70 group-hover:text-cyan-400 transition-colors">Total Balance</span>
                               </div>
                               <div suppressHydrationWarning className="space-y-1">
                                  <h3 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-400 drop-shadow-sm sm:text-6xl">{credits}</h3>
                                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Daily + Bonus + Permanent</p>
                               </div>
                               <Link href="/shop" className="group/btn relative isolate flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,#7c3aed,#2563eb_40%,#06b6d4)] text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_14px_35px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-1 hover:brightness-115 hover:shadow-[0_24px_60px_rgba(6,182,212,0.35)] active:scale-95">
                                 <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] opacity-50" />
                                 <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.15),transparent)] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                                 <span className="absolute -inset-1 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_60%)] opacity-0 blur-md transition-opacity duration-500 group-hover/btn:opacity-100" />
                                 <span className="relative z-10 flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                   Open Credit Shop <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                                 </span>
                               </Link>
                            </div>
                         </section>
                         <section className="group relative isolate overflow-hidden rounded-[2.5rem] border border-white/5 bg-[linear-gradient(145deg,rgba(12,10,24,0.95),rgba(4,7,12,0.98)_55%,rgba(4,13,17,0.95))] p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-purple-500/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                            <div className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.3),transparent)] opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 transition-opacity duration-500 group-hover:opacity-50" />
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent-purple/10 blur-[80px] opacity-0 transition-all duration-700 group-hover:opacity-20" />
                            
                            <div className="relative z-10 space-y-7">
                               <div className="flex items-center gap-4">
                                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-[linear-gradient(115deg,rgba(168,85,247,0.1),rgba(168,85,247,0.02))] text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all duration-500 group-hover:scale-110 group-hover:border-purple-500/40 group-hover:bg-purple-500/10"><Sparkles size={20} className="animate-pulse" /></div>
                                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-purple-500/70 group-hover:text-purple-400 transition-colors">Permanent Reserve</span>
                               </div>
                               <div suppressHydrationWarning className="space-y-1">
                                  <h3 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-100 to-purple-400 drop-shadow-sm sm:text-6xl">{lifetimeCredits}</h3>
                                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Bought • Never Expires</p>
                               </div>
                               <button onClick={() => setIsBuyModalOpen(true)} className="group/btn relative isolate flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,#a855f7,#7c3aed_50%,#4f46e5)] text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_14px_35px_rgba(124,58,237,0.25)] transition-all hover:-translate-y-1 hover:brightness-115 hover:shadow-[0_24px_60px_rgba(168,85,247,0.35)] active:scale-95">
                                 <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] opacity-50" />
                                 <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.15),transparent)] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                                 <span className="absolute -inset-1 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_60%)] opacity-0 blur-md transition-opacity duration-500 group-hover/btn:opacity-100" />
                                 <span className="relative z-10 flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                   Permanent Packs <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                                 </span>
                               </button>
                            </div>
                         </section>
                         <section className="group relative isolate overflow-hidden rounded-[2.5rem] border border-white/5 bg-[linear-gradient(145deg,rgba(12,10,24,0.95),rgba(4,7,12,0.98)_55%,rgba(4,13,17,0.95))] p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-500/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                            <div className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent)] opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 transition-opacity duration-500 group-hover:opacity-50" />
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 blur-[80px] opacity-0 transition-all duration-700 group-hover:opacity-20" />
                            
                            <div className="relative z-10 space-y-7">
                               <div className="flex items-center gap-4">
                                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-[linear-gradient(115deg,rgba(59,130,246,0.1),rgba(59,130,246,0.02))] text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-500 group-hover:scale-110 group-hover:border-blue-500/40 group-hover:bg-blue-500/10"><Zap size={20} className="fill-blue-500/20" /></div>
                                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-500/70 group-hover:text-blue-400 transition-colors">Daily Allowance</span>
                               </div>
                               <div suppressHydrationWarning className="space-y-1">
                                  <h3 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-400 drop-shadow-sm sm:text-6xl">{dailyCredits} <span className="text-2xl text-blue-900 tracking-normal">/</span> <span className="text-2xl text-blue-500/50">{isPro ? PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS : 50}</span></h3>
                                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Replenishes Daily</p>
                               </div>
                               <div className="space-y-4 pt-3">
                                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(dailyCredits / (isPro ? PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS : 50)) * 100}%` }} className="h-full bg-linear-to-r from-cyan-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/80">
                                    <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                                      <Clock size={12} className="animate-pulse" /> 
                                      <span className="tabular-nums tracking-widest">Resets In {timeUntilReset}</span>
                                    </div>
                                  </div>
                                </div>
                            </div>
                         </section>
                      </div>
                      <section className="group relative isolate overflow-hidden rounded-[2.5rem] border border-white/5 bg-[linear-gradient(145deg,rgba(12,10,24,0.95),rgba(4,7,12,0.98)_55%,rgba(4,13,17,0.95))] p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                         {/* Premium Accents */}
                         <div className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.3),transparent)] opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
                         <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 transition-opacity duration-500 group-hover:opacity-50" />
                         <div className="absolute -bottom-10 -right-10 w-48 h-48 blur-[80px] bg-cyan-400 opacity-0 transition-all duration-700 group-hover:opacity-20" />

                         <div className="relative z-20 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-5">
                               <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-[linear-gradient(115deg,rgba(34,211,238,0.1),rgba(34,211,238,0.02))] text-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.1)] transition-all duration-500 group-hover:scale-110 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10">
                                  <Gift size={24} />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-cyan-500/70 group-hover:text-cyan-400 transition-colors">Bonus Reserve</p>
                                  <h4 className="mt-1 text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-400 drop-shadow-sm">
                                    {bonusCredits} <span className="text-2xl text-cyan-200/50">CREDITS</span>
                                  </h4>
                                  <p className="mt-1 text-xs font-medium text-zinc-500">Shop rewards stack separately from your daily allowance and permanent reserve.</p>
                               </div>
                            </div>
                            <Link href="/shop" className="group/btn relative isolate inline-flex min-h-[52px] items-center justify-center gap-2 overflow-hidden rounded-[14px] border border-cyan-500/20 bg-[linear-gradient(115deg,rgba(34,211,238,0.1),rgba(34,211,238,0.02))] px-6 text-[10px] font-black uppercase tracking-widest text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white hover:shadow-[0_20px_50px_rgba(34,211,238,0.25)] active:scale-95">
                              <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.6),transparent)] opacity-50" />
                              <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(34,211,238,0.1),transparent)] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                              <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">
                                Claim Daily Reward <ArrowRight size={14} className="text-cyan-400 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:text-cyan-300" />
                              </span>
                            </Link>
                         </div>
                      </section>
                      <div className="mt-12 flex items-center gap-4 sm:gap-6">
                        <Link href="/shop" className="group relative isolate flex min-h-[64px] flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#2563eb_40%,#06b6d4)] text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_18px_50px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-1 hover:brightness-115 hover:shadow-[0_24px_70px_rgba(6,182,212,0.35)] active:scale-98">
                           <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] opacity-50" />
                           <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.15),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                           <span className="absolute -inset-1 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_60%)] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
                           <span className="relative z-10 flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                             Open Credit Shop <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                           </span>
                        </Link>
                        <button onClick={refreshCredits} className="group flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-[linear-gradient(115deg,rgba(255,255,255,0.03),rgba(255,255,255,0.005))] text-zinc-400 shadow-lg transition-all hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_18px_40px_rgba(255,255,255,0.05)] active:scale-95">
                           <RefreshCcw size={20} className="transition-transform duration-500 group-hover:rotate-180" />
                        </button>
                      </div>
                      <section className="glass-dark border border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-8">
                         <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90"><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-900" /><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (isPro ? 100 : (messagesUsed / 30) * 100)) / 100} className="text-accent-purple transition-all duration-1000" /></svg>
                            <div className="absolute flex flex-col items-center"><span className="text-4xl font-black text-white italic">{messagesUsed}</span><span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Messages</span></div>
                         </div>
                         <div className="space-y-2"><h4 className="text-sm font-black uppercase tracking-widest text-white">AI Interactions</h4><p className="text-[10px] font-medium text-zinc-500 leading-relaxed uppercase tracking-tight px-4">{isPro ? "Unlimited elite model access active" : `Daily limit: ${messagesUsed}/30 interactions`}</p></div>
                      </section>
                      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6"><h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent-purple italic">What consumes credits?</h4><ul className="space-y-4">{[{ label: "AI Image Generation", value: "18 Credits" }, { label: "Minecraft Skin Maker", value: "24 Credits" }, { label: "Vocal Extraction", value: "14 Credits" }, { label: "Video Processing", value: "30-35 Credits" }].map((item, i) => <li key={i} className="flex items-center justify-between"><span className="text-[11px] font-medium text-zinc-400 uppercase tracking-tight">{item.label}</span><span className="text-[10px] font-black text-white tracking-widest">{item.value}</span></li>)}</ul></div>
                         <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6"><h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent-cyan italic">What is free?</h4><ul className="space-y-4">{[{ label: "PDF Merging", value: "Free" }, { label: "Basic Image Compression", value: "Free" }, { label: "Text Formatting", value: "Free" }, { label: "QR Code Generation", value: "Free" }].map((item, i) => <li key={i} className="flex items-center justify-between"><span className="text-[11px] font-medium text-zinc-400 uppercase tracking-tight">{item.label}</span><span className="text-[10px] font-black text-accent-cyan tracking-widest uppercase">{item.value}</span></li>)}</ul></div>
                      </section>
                   </div>
                )}
                {activeTab === 'security' && (
                   <div className="space-y-8">
                      <TrustedLoginSetup />
                      <section className="glass-dark relative space-y-8 overflow-hidden rounded-[2rem] border border-white/5 p-5 sm:p-8 lg:space-y-12 lg:rounded-[3rem] lg:p-12">
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
                        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.05] bg-[#07070b] p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                          {/* Subtle Background Glows */}
                          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
                          <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-purple-500/10 blur-[100px]" />
                          
                          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                            <div className="space-y-3">
                              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-sm">Subscription</h3>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Your current plan and billing cycle</p>
                            </div>
                            <div className={cn(
                              "inline-flex items-center justify-center px-6 py-3 rounded-full font-black uppercase tracking-[0.2em] text-[10px] border transition-all",
                              isPro 
                                ? "bg-purple-500/10 border-purple-500/20 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.15)]" 
                                : "bg-white/[0.03] border-white/10 text-zinc-400"
                            )}>
                              {isPro ? "Active Pro Plan" : "Free Explorer"}
                            </div>
                          </div>

                          {/* Main Card */}
                          <div className="relative z-10 rounded-[2rem] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-6 sm:p-10 backdrop-blur-xl mb-8">
                            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                            
                            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/50 shadow-2xl group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  <Crown size={36} className={cn("relative z-10 transition-transform duration-500 group-hover:scale-110", isPro ? "text-purple-400 fill-purple-400/20" : "text-zinc-500")} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h4 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">
                                      {isPro ? "Exismic Elite Pro" : "Exismic Free"}
                                    </h4>
                                    {isPro && (
                                      <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
                                    {isPro 
                                      ? dbUser?.subscription_status === 'cancelled' 
                                        ? <span className="text-amber-400/80">Pro access ends on: {new Date(dbUser.plan_expires_at).toLocaleDateString()}</span>
                                        : `Next billing date: June 1, 2026` 
                                      : "Upgrade for premium AI tools"}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                <button 
                                  onClick={() => isPro ? setIsManageModalOpen(true) : router.push('/pro')}
                                  className="group relative isolate flex items-center justify-center min-w-[200px] h-14 overflow-hidden rounded-2xl bg-white px-8 text-[11px] font-black uppercase tracking-widest text-black shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95"
                                >
                                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-shine" />
                                  <span className="relative z-10">{isPro ? "Manage Subscription" : "Upgrade to Pro"}</span>
                                </button>
                                <button 
                                  onClick={() => setIsInvoiceModalOpen(true)}
                                  className="group flex items-center justify-center min-w-[180px] h-14 rounded-2xl border border-white/10 bg-white/[0.02] px-8 text-[11px] font-black uppercase tracking-widest text-zinc-300 transition-all hover:bg-white/[0.06] hover:border-white/20 hover:text-white"
                                >
                                  View Invoices
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Stats */}
                          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
                            {[{ icon: Wallet, label: "Billing", value: "Secure checkout", color: "text-blue-400" }, 
                              { icon: Calendar, label: "Cycle", value: "Monthly", color: "text-purple-400" }, 
                              { icon: Activity, label: "Status", value: isPro ? "Active" : "Standard", color: isPro ? "text-emerald-400" : "text-zinc-400" }].map((item, i) => (
                              <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 transition-all hover:bg-white/[0.03] hover:border-white/10">
                                 <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                   <item.icon size={48} className={item.color} />
                                 </div>
                                 <div className="relative z-10 flex items-center gap-4">
                                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-zinc-900/50 shadow-inner transition-colors group-hover:bg-zinc-800/50", item.color)}>
                                       <item.icon size={20} />
                                    </div>
                                    <div>
                                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">{item.label}</p>
                                       <p className="mt-1 text-sm font-black italic tracking-tight text-zinc-200">{item.value}</p>
                                    </div>
                                 </div>
                              </div>
                            ))}
                          </div>
                        </section>
                     </div>
                  )}
                {activeTab === 'preferences' && (
                    <div className="space-y-8">
                       <section className="glass-dark space-y-8 rounded-[2rem] border border-white/5 p-5 sm:p-8 lg:space-y-12 lg:rounded-[3rem] lg:p-12">
                          <div className="space-y-4">
                             <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Preferences</h3>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Customize your Exismic experience</p>
                          </div>
                          <div className="space-y-6">
                            {isLoadingPreferences ? (
                              Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="flex flex-col gap-5 rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                                  <div className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-2xl" />
                                    <div className="space-y-3">
                                      <SkeletonLine className="h-4 w-48 max-w-[55vw]" />
                                      <SkeletonLine className="w-64 max-w-[65vw]" />
                                      <SkeletonLine className="w-20" />
                                    </div>
                                  </div>
                                  <Skeleton className="h-8 w-16 rounded-full" />
                                </div>
                              ))
                            ) : PREFERENCE_ITEMS.map((pref) => {
                              const enabled = preferences[pref.key];
                              const isSavingThis = savingPreference === pref.key;
                              return (
                               <motion.div 
                                 layout
                                 initial={{ opacity: 0, y: 15 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 whileHover={{ scale: 1.01, y: -2 }}
                                 transition={{ duration: 0.4, ease: "easeOut" }}
                                 key={pref.key} 
                                 className={cn(
                                   "relative overflow-hidden flex flex-col gap-5 p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 sm:flex-row sm:items-center sm:justify-between group",
                                   enabled ? "bg-white/[0.03] border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.05)]" : "bg-white/[0.015] border-white/5 hover:border-white/15"
                                 )}
                               >
                                 {/* Glowing gradient background when enabled */}
                                 {enabled && (
                                   <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(168,85,247,0.08),rgba(34,211,238,0.08))] pointer-events-none" />
                                 )}
                                  
                                  <div className="flex items-center gap-5 relative z-10">
                                     <div className={cn(
                                       "relative w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500",
                                       enabled 
                                         ? "bg-[linear-gradient(135deg,rgba(168,85,247,0.2),rgba(34,211,238,0.2))] text-cyan-200 border border-cyan-300/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                                         : "bg-white/5 text-zinc-500 group-hover:text-white border border-transparent group-hover:border-white/10"
                                     )}>
                                        <pref.icon size={24} className={cn("transition-transform duration-500", enabled ? "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "group-hover:scale-110")} />
                                        {enabled && <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-xl -z-10" />}
                                     </div>
                                     <div className="space-y-1.5">
                                        <h4 className={cn("text-[11px] sm:text-xs font-black uppercase tracking-widest transition-colors", enabled ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "text-zinc-300 group-hover:text-white")}>{pref.label}</h4>
                                        <p className="text-[9px] sm:text-[10px] font-medium text-zinc-500 uppercase tracking-tight">{pref.desc}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <div className={cn("w-1.5 h-1.5 rounded-full", enabled ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" : "bg-zinc-700")} />
                                          <p className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.2em]",
                                            enabled ? "text-cyan-300" : "text-zinc-600"
                                          )}>
                                            {isSavingThis ? "Saving..." : enabled ? "Active" : "Disabled"}
                                          </p>
                                        </div>
                                     </div>
                                  </div>
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={enabled}
                                    disabled={isLoadingPreferences || Boolean(savingPreference)}
                                    onClick={() => void handlePreferenceToggle(pref.key)}
                                    className={cn(
                                      "relative h-9 w-[4.5rem] shrink-0 rounded-full border p-1 transition-all duration-500 disabled:cursor-wait disabled:opacity-60 z-10 outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                                      enabled
                                        ? "border-purple-400/50 bg-[linear-gradient(135deg,#a855f7,#06b6d4)] shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                                        : "border-white/10 bg-zinc-800/80 hover:bg-zinc-700/80 hover:border-white/20"
                                    )}
                                  >
                                    <span className={cn(
                                      "absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity duration-300",
                                      enabled && "opacity-100 animate-pulse"
                                    )} />
                                    <span className={cn(
                                      "relative flex items-center justify-center h-7 w-7 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-500",
                                      enabled ? "translate-x-8 scale-100" : "translate-x-0 bg-zinc-400 scale-90"
                                    )}>
                                      {isSavingThis && <Loader2 size={14} className="animate-spin text-purple-600" />}
                                    </span>
                                  </button>
                               </motion.div>
                              );
                            })}
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
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10"
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
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10"
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10">
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
