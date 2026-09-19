"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Zap, 
  Palette,
  Frame,
  Coins,
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
  Flame, 
  Image as ImageIcon,
  Code2,
  Key,
  Type,
  RotateCcw,
  Eye,
  Trash2,
  AlertTriangle,
  Shield,
  KeyRound,
  Smartphone,
  Check,
  Receipt
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
import { CreatorInsignia, CREATOR_INSIGNIAS } from "@/components/ui/CreatorInsignia";
import { CosmeticsSelectorModal, CosmeticCategory } from "@/components/modals/CosmeticsSelectorModal";
import { Portal } from "@/components/ui/Portal";
import {
  PRO_INCLUDED_AVATAR_FRAMES,
  PRO_INCLUDED_NAME_STYLES,
  PRO_INCLUDED_INSIGNIAS,
} from "@/config/cosmetics-access";
import { forgotPasswordAction } from "@/app/actions/auth";
import { Skeleton, SkeletonLine } from "@/components/ui/Skeleton";
import { TrustedLoginSetup } from "@/components/auth/TrustedLoginSetup";
import { ApiKeyManager } from "@/components/account/ApiKeyManager";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";

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

type TabType = 'profile' | 'security' | 'billing' | 'credits' | 'preferences' | 'developer';
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
  const { credits, dailyCredits, bonusCredits, lifetimeCredits, messagesUsed, isPro, todayClaim, dailyStreak, refreshCredits } = useCredits();
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab && ["profile", "security", "billing", "credits", "preferences", "developer"].includes(requestedTab)) {
      setActiveTab(requestedTab as TabType);
    }
  }, [searchParams]);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isCancellingDeletion, setIsCancellingDeletion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [isUpdatingFrame, setIsUpdatingFrame] = useState(false);
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);

  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [isUpdatingGradient, setIsUpdatingGradient] = useState(false);
  const [isGradientModalOpen, setIsGradientModalOpen] = useState(false);

  const [selectedInsignia, setSelectedInsignia] = useState<string | null>(null);
  const [isUpdatingInsignia, setIsUpdatingInsignia] = useState(false);

  const [activeCosmeticModal, setActiveCosmeticModal] = useState<CosmeticCategory | null>(null);

  // Lock background scroll and handle Escape key for all modal dialogs
  useEffect(() => {
    const isAnyModalOpen =
      isFrameModalOpen ||
      isGradientModalOpen ||
      activeCosmeticModal !== null ||
      Boolean(imageToCrop) ||
      isDeleteModalOpen;

    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsFrameModalOpen(false);
          setIsGradientModalOpen(false);
          setActiveCosmeticModal(null);
          setImageToCrop(null);
          setIsDeleteModalOpen(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isFrameModalOpen, isGradientModalOpen, activeCosmeticModal, imageToCrop, isDeleteModalOpen]);

  const [preferences, setPreferences] = useState<Record<PreferenceKey, boolean>>(DEFAULT_USER_PREFERENCES);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [savingPreference, setSavingPreference] = useState<PreferenceKey | null>(null);

  const displayAvatarUrl = dbUser?.custom_avatar_url || user?.user_metadata?.custom_avatar_url || user?.user_metadata?.avatar_url;

  const userUnlockedFrames: string[] = Array.isArray(dbUser?.unlocked_avatar_frames || dbUser?.unlockedAvatarFrames)
    ? ((dbUser?.unlocked_avatar_frames || dbUser?.unlockedAvatarFrames) as string[])
    : [];
  const userUnlockedGradients: string[] = Array.isArray(dbUser?.unlocked_name_gradients || dbUser?.unlockedNameGradients)
    ? ((dbUser?.unlocked_name_gradients || dbUser?.unlockedNameGradients) as string[])
    : [];
  const userUnlockedInsignias: string[] = Array.isArray(dbUser?.unlocked_insignias || dbUser?.unlockedInsignias)
    ? ((dbUser?.unlocked_insignias || dbUser?.unlockedInsignias) as string[])
    : [];

  useEffect(() => {
    const frame = dbUser?.avatar_frame ?? dbUser?.avatarFrame ?? user?.user_metadata?.avatar_frame ?? null;
    const gradient = dbUser?.name_gradient ?? dbUser?.nameGradient ?? user?.user_metadata?.name_gradient ?? null;
    const insignia = dbUser?.insignia ?? user?.user_metadata?.insignia ?? null;
    setSelectedFrame(frame);
    setSelectedGradient(gradient);
    setSelectedInsignia(insignia);
  }, [dbUser, user]);

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

  const handleApplyInsignia = async (insigniaId: string | null) => {
    const previous = selectedInsignia;
    setSelectedInsignia(insigniaId);
    try {
      setIsUpdatingInsignia(true);
      setStatus(null);
      const res = await fetch('/api/user/insignia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insigniaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update insignia');

      await supabase.auth.updateUser({
        data: { insignia: insigniaId },
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('insignia-updated', { detail: insigniaId }));
      }
      if (dbUser) setDbUser({ ...dbUser, insignia: insigniaId });
      if (user) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            insignia: insigniaId,
          },
        });
      }
      setStatus({ type: 'success', message: insigniaId ? 'Creator Insignia applied!' : 'Insignia removed!' });
      router.refresh();
    } catch (err: any) {
      setSelectedInsignia(previous);
      setStatus({ type: 'error', message: err.message || 'Failed to update insignia' });
    } finally {
      setIsUpdatingInsignia(false);
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== "DELETE") {
      setStatus({ type: "error", message: 'Please type "DELETE" to confirm.' });
      return;
    }

    try {
      setIsDeletingAccount(true);
      setStatus(null);
      const res = await fetch("/api/user/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule account deletion.");

      setIsDeleteModalOpen(false);
      window.location.href = "/auth/login?deleted=true";
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Failed to delete account." });
      setIsDeletingAccount(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      setIsCancellingDeletion(true);
      setStatus(null);
      const res = await fetch("/api/user/account/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "User cancelled deletion in account settings" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel deletion.");

      setStatus({ type: "success", message: "Recovery request submitted! Our team will restore your account." });
      if (dbUser) {
        setDbUser({ ...dbUser, deletionRecoveryRequested: true });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Failed to request recovery." });
    } finally {
      setIsCancellingDeletion(false);
    }
  };

  const [timeUntilReset, setTimeUntilReset] = useState("00h 00m 00s");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istOffsetMs = 5.5 * 60 * 60 * 1000;
      const nowInIst = new Date(now.getTime() + istOffsetMs);
      
      let targetYear = nowInIst.getUTCFullYear();
      let targetMonth = nowInIst.getUTCMonth();
      let targetDay = nowInIst.getUTCDate();

      // If it is 12:00 PM IST or later today, countdown to tomorrow 12:00 PM IST
      if (nowInIst.getUTCHours() >= 12) {
        const tomorrow = new Date(Date.UTC(targetYear, targetMonth, targetDay + 1));
        targetYear = tomorrow.getUTCFullYear();
        targetMonth = tomorrow.getUTCMonth();
        targetDay = tomorrow.getUTCDate();
      }

      // 12:00 PM IST is 06:30:00.000 UTC
      const nextNoonIstUtc = Date.UTC(targetYear, targetMonth, targetDay, 6, 30, 0, 0);
      
      const diff = Math.max(0, nextNoonIstUtc - now.getTime());
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilReset(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabsNavRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabsScroll = useCallback(() => {
    const el = tabsNavRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkTabsScroll, 50);
    window.addEventListener('resize', checkTabsScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkTabsScroll);
    };
  }, [checkTabsScroll, isMounted]);

  // Auto-scroll active tab into center view whenever activeTab changes
  useEffect(() => {
    if (!tabsNavRef.current) return;
    const activeEl = tabsNavRef.current.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsNavRef.current) return;
    const scrollAmount = 140;
    tabsNavRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!isMounted || !user) return <AccountSettingsSkeleton />;

  const navigation = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'credits', label: 'Credits & Usage', icon: Zap },
    { id: 'developer', label: 'Developer API', icon: Code2 },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ];

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15)_0%,rgba(59,130,246,0.08)_40%,transparent_70%)] blur-[100px]" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.025]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 lg:py-16">
        <div className="mb-5 sm:mb-8 lg:mb-10">
          <PageBreadcrumb
            items={[{ label: "Account Settings" }]}
            rightElement={
              <button 
                onClick={() => supabase.auth.signOut().then(() => router.push('/'))} 
                className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.25)] active:scale-95"
              >
                <LogOut size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Sign Out</span>
              </button>
            }
          />
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-10 2xl:gap-12">
          <div className="space-y-4 sm:space-y-6 xl:col-span-3 xl:space-y-8">
             <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between">
                   <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-sm">Settings</h1>
                   {/* Mobile Swipe Cue */}
                   <span className="xl:hidden inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-[10px] font-bold text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                      <span>Swipe</span>
                      <ChevronRight size={11} className="animate-pulse text-purple-400" />
                   </span>
                </div>
                <p className="text-xs font-semibold text-zinc-400">Account details & preferences</p>
             </div>

             {/* Tab Navigation Rack with Edge Fade & Scroll Cue */}
             <div className="relative -mx-3.5 px-3.5 sm:mx-0 sm:px-0 xl:mx-0 xl:px-0">
                {/* Left Fade Hint (Mobile Only) */}
                {canScrollLeft && (
                  <button
                    onClick={() => scrollTabs('left')}
                    aria-label="Scroll left"
                    className="xl:hidden absolute left-0 top-0 bottom-2 w-12 z-20 flex items-center justify-start pl-2 bg-gradient-to-r from-[#030303] via-[#030303]/90 to-transparent cursor-pointer transition-opacity duration-300"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-950/80 border border-purple-400/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                      <ChevronLeft size={13} />
                    </span>
                  </button>
                )}

                {/* Right Fade Hint & Micro Chevron Cue (Mobile Only) */}
                {canScrollRight && (
                  <button
                    onClick={() => scrollTabs('right')}
                    aria-label="Scroll right for more tabs"
                    className="xl:hidden absolute right-0 top-0 bottom-2 w-14 z-20 flex items-center justify-end pr-2 bg-gradient-to-l from-[#030303] via-[#030303]/95 to-transparent cursor-pointer transition-opacity duration-300"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/30 border border-purple-400/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.5)] animate-pulse">
                      <ChevronRight size={13} />
                    </span>
                  </button>
                )}

                <nav
                  ref={tabsNavRef}
                  onScroll={checkTabsScroll}
                  className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 xl:block xl:space-y-2.5 xl:overflow-visible xl:pb-0 no-scrollbar scroll-smooth"
                >
                  {navigation.map((item) => (
                     <button 
                       key={item.id} 
                       data-tab-id={item.id}
                       onClick={() => setActiveTab(item.id as TabType)} 
                       className={cn(
                         "group relative flex min-h-10 sm:min-h-12 shrink-0 items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 transition-all duration-300 xl:w-full xl:gap-3.5 xl:px-5 xl:py-3.5 cursor-pointer overflow-hidden text-xs font-bold", 
                         activeTab === item.id 
                           ? "bg-gradient-to-r from-purple-600/25 via-indigo-600/20 to-purple-900/15 border border-purple-500/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-xl" 
                           : "text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/10"
                       )}
                     >
                       {activeTab === item.id && (
                         <>
                           <motion.div 
                             layoutId="active-tab-accent" 
                             className="hidden xl:block absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-purple-400 to-indigo-400 shadow-[0_0_12px_#a855f7]" 
                           />
                           <motion.div 
                             layoutId="active-tab-accent-mobile" 
                             className="xl:hidden absolute bottom-0 inset-x-2 h-0.5 rounded-full bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 shadow-[0_0_8px_#a855f7]" 
                           />
                         </>
                       )}
                       <item.icon size={16} className={cn("shrink-0 transition-all duration-300", activeTab === item.id ? "text-purple-400 scale-105 sm:scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "text-zinc-500 group-hover:text-zinc-300 group-hover:scale-105 sm:group-hover:scale-110")} />
                       <span className="tracking-wide whitespace-nowrap">{item.label}</span>
                       {activeTab === item.id && (
                         <motion.div layoutId="nav-glow" className="ml-auto w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7] animate-pulse shrink-0" />
                       )}
                     </button>
                  ))}
                </nav>
             </div>
          </div>
          <div className="min-w-0 space-y-5 sm:space-y-8 xl:col-span-9">
             <AnimatePresence>
                {status && (
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("mb-6 sm:mb-8 flex items-start justify-between gap-3 rounded-2xl border p-3.5 sm:p-5 backdrop-blur-2xl sm:items-center shadow-lg", status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "bg-red-500/10 border-red-500/30 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.15)]")}>
                     <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                        {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-400" /> : <AlertCircle size={18} className="shrink-0 text-red-400" />}
                        <span className="break-words text-[10px] font-black uppercase leading-5 tracking-wider sm:tracking-widest">{status.message}</span>
                     </div>
                     <button onClick={() => setStatus(null)} aria-label="Dismiss message" className="flex min-h-9 min-w-9 sm:min-h-10 sm:min-w-10 shrink-0 items-center justify-center rounded-xl hover:bg-white/10 transition-colors cursor-pointer"><X size={16} /></button>
                   </motion.div>
                )}
             </AnimatePresence>
             <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="space-y-5 sm:space-y-8">
                {activeTab === 'profile' && (
                   <div className="space-y-5 sm:space-y-6">
                      {/* Clean Luxury Profile Settings Card */}
                      <div className="relative w-full rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#070814]/90 p-4 sm:p-7 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-3xl">
                         {/* Subtle Ambient Top Glow */}
                         <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

                         <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6 md:gap-10">
                            {/* Avatar */}
                            <div className="relative group/avatar flex flex-col items-center shrink-0">
                               <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 rounded-full opacity-40 blur-lg group-hover/avatar:opacity-70 transition-opacity duration-700 animate-pulse" />
                               <div 
                                 onClick={() => !isUploading && fileInputRef.current?.click()} 
                                 className="relative cursor-pointer group/inner shadow-[0_15px_40px_rgba(0,0,0,0.8)] rounded-2xl sm:rounded-[32px] overflow-hidden border-2 border-white/30 ring-3 sm:ring-4 ring-[#070814]"
                               >
                                 <div className="sm:hidden">
                                   <AvatarWithFrame 
                                     avatarUrl={displayAvatarUrl}
                                     displayName={name || 'User'}
                                     isPro={isPro}
                                     frameId={selectedFrame || undefined}
                                     size="lg"
                                   />
                                 </div>
                                 <div className="hidden sm:block">
                                   <AvatarWithFrame 
                                     avatarUrl={displayAvatarUrl}
                                     displayName={name || 'User'}
                                     isPro={isPro}
                                     frameId={selectedFrame || undefined}
                                     size="xl"
                                   />
                                 </div>
                                 <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/inner:opacity-100 flex flex-col items-center justify-center transition-all duration-300 z-30 backdrop-blur-xs">
                                   <Camera size={18} className="text-purple-300 mb-1 animate-bounce sm:w-5 sm:h-5" />
                                   <span className="text-[8px] font-black uppercase tracking-widest text-white">Change Avatar</span>
                                 </div>
                               </div>
                               <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
                            </div>

                            {/* Identity Summary & Form */}
                            <div className="flex-1 w-full space-y-4 sm:space-y-6 pt-1">
                               <div className="space-y-1 text-center md:text-left">
                                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                                   <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white min-w-0 break-words drop-shadow-md">
                                     <PremiumName 
                                       name={name || 'Anonymous User'} 
                                       isPro={isPro} 
                                       gradientId={selectedGradient} 
                                       insigniaId={selectedInsignia || undefined} 
                                     />
                                   </h2>
                                   <div className={cn(
                                     "px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border",
                                     isPro
                                       ? "bg-purple-500/25 text-purple-200 border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                       : "bg-white/[0.05] text-zinc-400 border-white/10"
                                   )}>
                                     {isPro ? "★ Pro VIP Member" : "Creator Explorer"}
                                   </div>
                                 </div>
                                 <p className="text-xs font-semibold text-zinc-400 break-all">{user.email}</p>
                               </div>

                               <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                                 <div className="space-y-1.5 sm:space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-purple-300/80 ml-1">Full Name</label>
                                   <div className="relative group">
                                     <UserCircle className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-400 transition-colors" size={18} />
                                     <input 
                                       type="text" 
                                       value={name} 
                                       onChange={(e) => setName(e.target.value)} 
                                       className="w-full bg-black/40 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-10 sm:pl-12 pr-4 sm:pr-6 text-sm font-bold text-white focus:bg-black/60 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all shadow-inner" 
                                       placeholder="Enter your full name"
                                     />
                                   </div>
                                 </div>

                                 <div className="space-y-1.5 sm:space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 ml-1">Email Address</label>
                                   <div className="relative">
                                     <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                     <input 
                                       type="text" 
                                       value={user.email} 
                                       readOnly 
                                       className="w-full bg-black/20 border border-white/5 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-10 sm:pl-12 pr-4 sm:pr-6 text-sm font-bold text-zinc-500 cursor-not-allowed select-none" 
                                     />
                                   </div>
                                 </div>

                                 <div className="pt-1 sm:pt-2">
                                   <button 
                                     onClick={handleUpdateProfile} 
                                     disabled={isUpdating || name === (user.user_metadata?.full_name || "")} 
                                     className="group relative isolate flex min-h-11 sm:min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
                                   >
                                     {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
                                     <span>Save Changes</span>
                                   </button>
                                 </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Profile Customization Section - Accessible to All Creators */}
                      <section className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-white/10 bg-[#06070f]/80 p-4 sm:p-7 md:p-8 shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                          {/* Ambient Background Glows */}
                          <div className="pointer-events-none absolute -top-24 left-10 h-64 w-64 rounded-full bg-purple-600/10 blur-[100px]" />
                          <div className="pointer-events-none absolute -bottom-28 right-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />

                          {/* Header Row */}
                          <div className="relative z-10 mb-5 sm:mb-7 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-4 sm:pb-6">
                             <div className="space-y-1 sm:space-y-1.5">
                                <div className="flex items-center gap-2">
                                   <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
                                      <Palette size={12} />
                                   </div>
                                   <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-cyan-300">Creator Identity</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">Profile Customization</h3>
                                <p className="text-xs text-zinc-400 max-w-xl">Equip your unlocked avatar frames, name styles, and insignias. Unlock new looks using Sparks in the Rewards Shop.</p>
                             </div>
                             <div className="flex items-center gap-2 shrink-0">
                                <Link 
                                  href="/rewards" 
                                  className="group flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] active:scale-95"
                                >
                                   <Zap size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
                                   <span>Sparks Rewards Shop</span>
                                   <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                             </div>
                          </div>
                          {/* Main Layout: Live Profile Identity Card (Left) + Customization Studio Slots (Right) */}
                          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                             
                             {/* Left: Centerpiece Live Profile Identity Card */}
                             <div className="lg:col-span-5 relative rounded-xl sm:rounded-[1.75rem] md:rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#0f1120]/95 via-[#090b16]/95 to-[#05060d]/98 p-4 sm:p-6 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex flex-col justify-between">
                                {/* Ambient glow inside identity card */}
                                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl sm:rounded-[1.75rem] md:rounded-[2rem]">
                                   <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-purple-500/15 blur-[70px]" />
                                </div>
                                
                                {/* Card Header: Live indicator & Tier status */}
                                <div className="flex items-center justify-between gap-2 relative z-10">
                                   <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      Live Identity Preview
                                   </span>
                                   {isPro ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-purple-500/15 border border-purple-500/30 text-purple-300">
                                         <Crown size={11} className="text-purple-400" />
                                         PRO VIP
                                      </span>
                                   ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-400">
                                         Creator
                                      </span>
                                   )}
                                 </div>

                                {/* Center Stage: Unified Avatar + Frame + Name + Insignia */}
                                <div className="my-4 sm:my-7 flex flex-col items-center justify-center text-center relative z-10">
                                   <div className="relative mb-3 sm:mb-4">
                                      <div className="sm:hidden">
                                        <AvatarWithFrame
                                           avatarUrl={displayAvatarUrl}
                                           displayName={name || 'Creator'}
                                           isPro={isPro}
                                           frameId={selectedFrame || undefined}
                                           size="lg"
                                        />
                                      </div>
                                      <div className="hidden sm:block">
                                        <AvatarWithFrame
                                           avatarUrl={displayAvatarUrl}
                                           displayName={name || 'Creator'}
                                           isPro={isPro}
                                           frameId={selectedFrame || undefined}
                                           size="xl"
                                        />
                                      </div>
                                   </div>

                                   {/* Name + Insignia Badge */}
                                   <div className="flex items-center justify-center gap-2 flex-wrap max-w-full px-2">
                                      <PremiumName
                                         name={name || 'Exismic Creator'}
                                         isPro={isPro}
                                         gradientId={selectedGradient}
                                         insigniaId={selectedInsignia || undefined}
                                         className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-center"
                                      />
                                   </div>

                                   {/* Handle */}
                                   <p className="mt-1 text-xs font-semibold text-zinc-400">
                                      @{username || (user?.email ? user.email.split('@')[0] : 'creator')}
                                   </p>

                                   {/* Equipped items summary indicators */}
                                   <div className="mt-3 sm:mt-4 flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                                      <span className={cn(
                                         "px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border transition-colors",
                                         selectedFrame ? "bg-purple-500/15 border-purple-500/30 text-purple-300" : "bg-white/5 border-white/10 text-zinc-500"
                                      )}>
                                         Frame: {PRO_FRAMES.find(f => f.id === selectedFrame)?.name || "Default"}
                                      </span>
                                      <span className={cn(
                                         "px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border transition-colors",
                                         selectedGradient ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300" : "bg-white/5 border-white/10 text-zinc-500"
                                      )}>
                                         Style: {NAME_GRADIENTS.find(g => g.id === selectedGradient)?.name || "White"}
                                      </span>
                                      <span className={cn(
                                         "px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border transition-colors",
                                         selectedInsignia ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : "bg-white/5 border-white/10 text-zinc-500"
                                      )}>
                                         Insignia: {CREATOR_INSIGNIAS.find(i => i.id === selectedInsignia)?.name || "None"}
                                      </span>
                                   </div>
                                </div>

                                {/* Card Footer Note */}
                                <div className="relative z-10 flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-zinc-400 border-t border-white/[0.06] pt-3.5 sm:pt-4">
                                   <Eye size={13} className="text-zinc-400 shrink-0" />
                                   <span className="text-center">Live preview across all AI studios & public creations</span>
                                </div>
                             </div>

                             {/* Right: Customization Slots Rack */}
                             <div className="lg:col-span-7 flex flex-col justify-between gap-3 sm:gap-3.5">
                                
                                {/* Slot 1: Avatar Frame */}
                                <div className="group/slot relative rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-r from-[#0c0e1a]/90 via-[#070812]/95 to-[#06070e]/95 p-3.5 sm:p-5 shadow-lg backdrop-blur-xl hover:border-purple-500/40 transition-all">
                                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                                         <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover/slot:scale-105 transition-transform">
                                            <UserCircle size={20} className="sm:w-6 sm:h-6" />
                                         </div>
                                         <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                               <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-400">Avatar Frame</span>
                                               {selectedFrame ? (
                                                  <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                                                     Equipped
                                                  </span>
                                               ) : (
                                                  <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-400">
                                                     Default
                                                  </span>
                                               )}
                                            </div>
                                            <h4 className="text-sm sm:text-base font-bold text-white truncate">
                                               {PRO_FRAMES.find((f) => f.id === selectedFrame)?.name || "Standard Profile"}
                                            </h4>
                                            <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1 sm:line-clamp-none">
                                               {selectedFrame ? "Custom animated ring surrounding your profile picture" : "No custom frame equipped"}
                                            </p>
                                         </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                                         <button
                                            onClick={() => setIsFrameModalOpen(true)}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 hover:border-purple-500/60 text-purple-200 font-bold text-xs transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95 cursor-pointer"
                                         >
                                            <LayoutGrid size={14} />
                                            <span>{selectedFrame ? "Change Frame" : "Browse Frames"}</span>
                                         </button>
                                         {selectedFrame && (
                                            <button
                                               onClick={() => handleApplyFrame(null)}
                                               disabled={isUpdatingFrame}
                                               className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-300 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                                               title="Reset to default frame"
                                            >
                                               <RotateCcw size={14} />
                                            </button>
                                         )}
                                      </div>
                                   </div>
                                </div>

                                {/* Slot 2: Name Style */}
                                <div className="group/slot relative rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-r from-[#0a1120]/90 via-[#060a14]/95 to-[#04060c]/95 p-3.5 sm:p-5 shadow-lg backdrop-blur-xl hover:border-cyan-500/40 transition-all">
                                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                                         <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover/slot:scale-105 transition-transform">
                                            <Type size={18} className="sm:w-5 sm:h-5" />
                                         </div>
                                         <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                               <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-cyan-400">Name Style</span>
                                               {selectedGradient ? (
                                                  <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                                                     Equipped
                                                  </span>
                                               ) : (
                                                  <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-400">
                                                     Default
                                                  </span>
                                               )}
                                            </div>
                                            <h4 className="text-sm sm:text-base font-bold text-white truncate">
                                               {NAME_GRADIENTS.find((g) => g.id === selectedGradient)?.name || "Classic White"}
                                            </h4>
                                            <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1 sm:line-clamp-none">
                                               {selectedGradient ? "Animated glowing gradient applied to your name" : "Standard white typography"}
                                            </p>
                                         </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                                         <button
                                            onClick={() => setIsGradientModalOpen(true)}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 hover:border-cyan-400/60 text-cyan-200 font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 cursor-pointer"
                                         >
                                            <LayoutGrid size={14} />
                                            <span>{selectedGradient ? "Change Style" : "Browse Styles"}</span>
                                         </button>
                                         {selectedGradient && (
                                            <button
                                               onClick={() => handleApplyGradient(null)}
                                               disabled={isUpdatingGradient}
                                               className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-300 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                                               title="Reset to default style"
                                            >
                                               <RotateCcw size={14} />
                                            </button>
                                         )}
                                      </div>
                                   </div>
                                </div>

                                {/* Slot 3: Creator Insignia */}
                                <div className="group/slot relative rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-r from-[#171308]/90 via-[#0d0a04]/95 to-[#080602]/95 p-3.5 sm:p-5 shadow-lg backdrop-blur-xl hover:border-amber-500/40 transition-all">
                                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                                         <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover/slot:scale-105 transition-transform">
                                            <ShieldCheck size={20} className="sm:w-6 sm:h-6" />
                                         </div>
                                         <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                               <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400">Creator Insignia</span>
                                               {selectedInsignia ? (
                                                  <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                                                     Equipped
                                                  </span>
                                               ) : (
                                                  <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-400">
                                                     Default
                                                  </span>
                                               )}
                                            </div>
                                            <h4 className="text-sm sm:text-base font-bold text-white truncate">
                                               {CREATOR_INSIGNIAS.find((i) => i.id === selectedInsignia)?.name || "No Insignia Active"}
                                            </h4>
                                            <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1 sm:line-clamp-none">
                                               {CREATOR_INSIGNIAS.find((i) => i.id === selectedInsignia)?.description || "Signature title emblem displayed next to your username"}
                                            </p>
                                         </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                                         <button
                                            onClick={() => setActiveCosmeticModal("insignia")}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 hover:border-amber-400/60 text-amber-200 font-bold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 cursor-pointer"
                                         >
                                            <LayoutGrid size={14} />
                                            <span>{selectedInsignia ? "Change Insignia" : "Browse Insignias"}</span>
                                         </button>
                                         {selectedInsignia && (
                                            <button
                                               onClick={() => handleApplyInsignia(null)}
                                               disabled={isUpdatingInsignia}
                                               className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-300 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                                               title="Reset to default insignia"
                                            >
                                               <RotateCcw size={14} />
                                            </button>
                                         )}
                                      </div>
                                   </div>
                                </div>

                                {/* Bottom Rewards Shop Promotion Bar */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/[0.08] bg-gradient-to-r from-amber-500/[0.08] via-purple-500/[0.04] to-transparent">
                                   <div className="flex items-center gap-3">
                                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 shrink-0">
                                         <Zap size={15} />
                                      </div>
                                      <div className="min-w-0">
                                         <p className="text-xs font-bold text-white truncate">Looking for new cosmetic drops?</p>
                                         <p className="text-[10px] sm:text-[11px] text-zinc-400 line-clamp-1 sm:line-clamp-none">Unlock limited-edition frames, name styles, and insignias using Sparks in the shop.</p>
                                      </div>
                                   </div>
                                   <Link
                                      href="/rewards"
                                      className="group flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0 active:scale-95"
                                   >
                                      <span>Explore Shop</span>
                                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                   </Link>
                                </div>

                             </div>
                          </div>
                       </section>
                   </div>
                )}
                {activeTab === 'credits' && (
                    <div className="space-y-6 sm:space-y-8">
                       <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                          <section className="group relative isolate overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/5 bg-[linear-gradient(145deg,rgba(12,10,24,0.95),rgba(4,7,12,0.98)_55%,rgba(4,13,17,0.95))] p-5 sm:p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                             <div className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.3),transparent)] opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
                             <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 transition-opacity duration-500 group-hover:opacity-50" />
                             <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent-cyan/10 blur-[80px] opacity-0 transition-all duration-700 group-hover:opacity-20" />
                             
                             <div className="relative z-10 space-y-5 sm:space-y-7">
                                <div className="flex items-center gap-3.5 sm:gap-4">
                                   <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-cyan-500/20 bg-[linear-gradient(115deg,rgba(34,211,238,0.1),rgba(34,211,238,0.02))] text-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.1)] transition-all duration-500 group-hover:scale-110 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10"><Wallet size={18} className="sm:w-5 sm:h-5" /></div>
                                   <span className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.35em] text-cyan-500/70 group-hover:text-cyan-400 transition-colors">Total Balance</span>
                                </div>
                                <div suppressHydrationWarning className="space-y-1">
                                   <h3 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-400 drop-shadow-sm">{credits}</h3>
                                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Daily + Bonus + Permanent</p>
                                </div>
                                <Link href="/shop" className="group/btn relative isolate flex min-h-12 sm:min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl sm:rounded-[14px] bg-[linear-gradient(135deg,#7c3aed,#2563eb_40%,#06b6d4)] text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_14px_35px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-1 hover:brightness-115 hover:shadow-[0_24px_60px_rgba(6,182,212,0.35)] active:scale-95">
                                  <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] opacity-50" />
                                  <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.15),transparent)] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                                  <span className="absolute -inset-1 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_60%)] opacity-0 blur-md transition-opacity duration-500 group-hover/btn:opacity-100" />
                                  <span className="relative z-10 flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                    Open Credit Shop <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                                  </span>
                                </Link>
                             </div>
                          </section>
                          <section className="group relative isolate overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/5 bg-[linear-gradient(145deg,rgba(12,10,24,0.95),rgba(4,7,12,0.98)_55%,rgba(4,13,17,0.95))] p-5 sm:p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-purple-500/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                             <div className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.3),transparent)] opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
                             <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 transition-opacity duration-500 group-hover:opacity-50" />
                             <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent-purple/10 blur-[80px] opacity-0 transition-all duration-700 group-hover:opacity-20" />
                             
                             <div className="relative z-10 space-y-5 sm:space-y-7">
                                <div className="flex items-center gap-3.5 sm:gap-4">
                                   <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-purple-500/20 bg-[linear-gradient(115deg,rgba(168,85,247,0.1),rgba(168,85,247,0.02))] text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all duration-500 group-hover:scale-110 group-hover:border-purple-500/40 group-hover:bg-purple-500/10"><Coins size={18} className="sm:w-5 sm:h-5 text-purple-400" /></div>
                                   <span className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.35em] text-purple-500/70 group-hover:text-purple-400 transition-colors">Permanent Reserve</span>
                                </div>
                                <div suppressHydrationWarning className="space-y-1">
                                   <h3 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-100 to-purple-400 drop-shadow-sm">{lifetimeCredits}</h3>
                                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Bought • Never Expires</p>
                                </div>
                                <button onClick={() => setIsBuyModalOpen(true)} className="group/btn relative isolate flex min-h-12 sm:min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl sm:rounded-[14px] bg-[linear-gradient(135deg,#a855f7,#7c3aed_50%,#4f46e5)] text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_14px_35px_rgba(124,58,237,0.25)] transition-all hover:-translate-y-1 hover:brightness-115 hover:shadow-[0_24px_60px_rgba(168,85,247,0.35)] active:scale-95">
                                  <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] opacity-50" />
                                  <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.15),transparent)] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                                  <span className="absolute -inset-1 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_60%)] opacity-0 blur-md transition-opacity duration-500 group-hover/btn:opacity-100" />
                                  <span className="relative z-10 flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                    Permanent Packs <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                                  </span>
                                </button>
                             </div>
                          </section>
                          <section className="group relative isolate overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/5 bg-[linear-gradient(145deg,rgba(12,10,24,0.95),rgba(4,7,12,0.98)_55%,rgba(4,13,17,0.95))] p-5 sm:p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-500/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                             <div className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent)] opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
                             <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 transition-opacity duration-500 group-hover:opacity-50" />
                             <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 blur-[80px] opacity-0 transition-all duration-700 group-hover:opacity-20" />
                             
                             <div className="relative z-10 space-y-5 sm:space-y-7">
                                <div className="flex items-center gap-3.5 sm:gap-4">
                                   <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-blue-500/20 bg-[linear-gradient(115deg,rgba(59,130,246,0.1),rgba(59,130,246,0.02))] text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-500 group-hover:scale-110 group-hover:border-blue-500/40 group-hover:bg-blue-500/10"><Zap size={18} className="sm:w-5 sm:h-5 fill-blue-500/20" /></div>
                                   <span className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.35em] text-blue-500/70 group-hover:text-blue-400 transition-colors">Daily Allowance</span>
                                </div>
                                <div suppressHydrationWarning className="space-y-1">
                                   <h3 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-400 drop-shadow-sm">{dailyCredits} <span className="text-xl sm:text-2xl text-blue-900 tracking-normal">/</span> <span className="text-xl sm:text-2xl text-blue-500/50">{isPro ? PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS : 50}</span></h3>
                                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Resets Daily at 12:00 PM IST</p>
                                </div>
                                <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-3">
                                   <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${(dailyCredits / (isPro ? PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS : 50)) * 100}%` }} className="h-full bg-linear-to-r from-cyan-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                   </div>
                                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/80">
                                     <div className="flex items-center gap-2 bg-blue-500/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-blue-500/20">
                                       <Clock size={12} className="animate-pulse" /> 
                                       <span className="tabular-nums tracking-widest">Resets In {timeUntilReset}</span>
                                     </div>
                                   </div>
                                 </div>
                             </div>
                          </section>
                       </div>
                       <section className="group relative isolate overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/5 bg-[linear-gradient(145deg,rgba(12,10,24,0.95),rgba(4,7,12,0.98)_55%,rgba(4,13,17,0.95))] p-5 sm:p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                          {/* Premium Accents */}
                          <div className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.3),transparent)] opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 transition-opacity duration-500 group-hover:opacity-50" />
                          <div className="absolute -bottom-10 -right-10 w-48 h-48 blur-[80px] bg-cyan-400 opacity-0 transition-all duration-700 group-hover:opacity-20" />

                          <div className="relative z-20 flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
                             <div className="flex items-center gap-3.5 sm:gap-5">
                                <div className="relative flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-cyan-500/20 bg-[linear-gradient(115deg,rgba(34,211,238,0.1),rgba(34,211,238,0.02))] text-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.1)] transition-all duration-500 group-hover:scale-110 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10">
                                   <Gift size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <p className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.32em] text-cyan-500/70 group-hover:text-cyan-400 transition-colors">Bonus Reserve</p>
                                      {(dailyStreak ?? 0) > 0 ? (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                                          <Flame size={11} className="text-amber-400 animate-pulse fill-amber-400/30" />
                                          {dailyStreak} Day Streak
                                        </span>
                                      ) : (
                                         <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700/50 bg-zinc-800/40 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                           <Flame size={11} className="text-zinc-500" />
                                           0 Day Streak
                                         </span>
                                      )}
                                    </div>
                                    <h4 className="mt-1 text-2xl sm:text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-400 drop-shadow-sm">
                                      {bonusCredits} <span className="text-xl sm:text-2xl text-cyan-200/50">CREDITS</span>
                                    </h4>
                                    <p className="mt-1 text-[11px] sm:text-xs font-medium text-zinc-500">Shop rewards stack separately from your daily allowance and permanent reserve.</p>
                                 </div>
                             </div>
                             <Link href="/shop" className="group/btn relative isolate inline-flex min-h-11 sm:min-h-[52px] w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-xl sm:rounded-[14px] border border-cyan-500/20 bg-[linear-gradient(115deg,rgba(34,211,238,0.1),rgba(34,211,238,0.02))] px-5 sm:px-6 text-[10px] font-black uppercase tracking-widest text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white hover:shadow-[0_20px_50px_rgba(34,211,238,0.25)] active:scale-95">
                               <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.6),transparent)] opacity-50" />
                               <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(34,211,238,0.1),transparent)] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                               <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">
                                 {todayClaim ? "Open Shop" : "Claim Daily Reward"} <ArrowRight size={14} className="text-cyan-400 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:text-cyan-300" />
                                </span>
                             </Link>
                          </div>
                       </section>
                       <div className="mt-6 sm:mt-12 flex items-center gap-3 sm:gap-6">
                         <Link href="/shop" className="group relative isolate flex min-h-[52px] sm:min-h-[64px] flex-1 items-center justify-center gap-2.5 sm:gap-3 overflow-hidden rounded-xl sm:rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#2563eb_40%,#06b6d4)] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white shadow-[0_18px_50px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-1 hover:brightness-115 hover:shadow-[0_24px_70px_rgba(6,182,212,0.35)] active:scale-98">
                            <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] opacity-50" />
                            <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.15),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <span className="absolute -inset-1 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_60%)] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
                            <span className="relative z-10 flex items-center gap-2.5 sm:gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                              Open Credit Shop <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                            </span>
                         </Link>
                         <button onClick={refreshCredits} className="group flex h-[52px] w-[52px] sm:h-[64px] sm:w-[64px] shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-white/5 bg-[linear-gradient(115deg,rgba(255,255,255,0.03),rgba(255,255,255,0.005))] text-zinc-400 shadow-lg transition-all hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_18px_40px_rgba(255,255,255,0.05)] active:scale-95">
                            <RefreshCcw size={18} className="sm:w-5 sm:h-5 transition-transform duration-500 group-hover:rotate-180" />
                         </button>
                       </div>
                       <section className="glass-dark border border-white/5 rounded-2xl sm:rounded-[3rem] p-5 sm:p-10 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
                          <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                             <svg className="w-full h-full transform -rotate-90"><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-900" /><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (isPro ? 100 : (messagesUsed / 30) * 100)) / 100} className="text-accent-purple transition-all duration-1000" /></svg>
                             <div className="absolute flex flex-col items-center"><span className="text-3xl sm:text-4xl font-black text-white italic">{messagesUsed}</span><span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Messages</span></div>
                          </div>
                          <div className="space-y-1.5 sm:space-y-2"><h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-white">AI Interactions</h4><p className="text-[9px] sm:text-[10px] font-medium text-zinc-500 leading-relaxed uppercase tracking-tight px-2 sm:px-4">{isPro ? "Unlimited elite model access active" : `Daily limit: ${messagesUsed}/30 interactions`}</p></div>
                       </section>
                       <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                          <div className="p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4 sm:space-y-6"><h4 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-accent-purple italic">What consumes credits?</h4><ul className="space-y-3 sm:space-y-4">{[{ label: "AI Image Generation", value: "18 Credits" }, { label: "Minecraft Skin Maker", value: "24 Credits" }, { label: "Vocal Extraction", value: "14 Credits" }, { label: "Video Processing", value: "30-35 Credits" }].map((item, i) => <li key={i} className="flex items-center justify-between"><span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-tight">{item.label}</span><span className="text-[10px] font-black text-white tracking-widest">{item.value}</span></li>)}</ul></div>
                          <div className="p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4 sm:space-y-6"><h4 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-accent-cyan italic">What is free?</h4><ul className="space-y-3 sm:space-y-4">{[{ label: "PDF Merging", value: "Free" }, { label: "Basic Image Compression", value: "Free" }, { label: "Text Formatting", value: "Free" }, { label: "QR Code Generation", value: "Free" }].map((item, i) => <li key={i} className="flex items-center justify-between"><span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-tight">{item.label}</span><span className="text-[10px] font-black text-accent-cyan tracking-widest uppercase">{item.value}</span></li>)}</ul></div>
                       </section>
                    </div>
                 )}
                {activeTab === 'security' && (
                    <div className="space-y-6 sm:space-y-8">
                       <TrustedLoginSetup />
                       <section className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-white/[0.09] bg-gradient-to-b from-[#090b16]/95 via-[#06070e]/95 to-[#030408]/98 p-5 sm:p-8 lg:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
                           {/* Ambient Atmospheric Glows */}
                           <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/[0.12] blur-[120px]" />
                           <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-purple-600/[0.12] blur-[120px]" />
                           <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
                            {/* Header */}
                            <div className="relative z-10 mb-6 sm:mb-9 pb-5 sm:pb-7 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                               <div className="space-y-2">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/25 bg-cyan-400/10 text-cyan-300 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                     <ShieldCheck size={13} className="text-cyan-400" />
                                     <span>Account Security</span>
                                  </div>
                                  <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white drop-shadow-sm">
                                     Security & Sign-In
                                  </h3>
                                  <p className="text-xs font-medium text-zinc-400">
                                     Manage your password, login credentials, and account protection settings
                                  </p>
                               </div>
                            </div>

                            {/* Cards Grid */}
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                               {/* Password Card */}
                               <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#101528]/85 via-[#0c0e1e]/85 to-[#070914]/90 p-5 sm:p-7 md:p-8 transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] hover:-translate-y-0.5">
                                  {/* Hover corner flare */}
                                  <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-[70px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                  <div className="space-y-4 sm:space-y-5 relative z-10">
                                     <div className="flex items-center justify-between">
                                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-500 group-hover:scale-105 group-hover:border-cyan-400 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                                           <Lock size={22} className="sm:w-6 sm:h-6" />
                                        </div>
                                     </div>

                                     <div className="space-y-1.5">
                                        <h4 className="text-lg sm:text-xl font-black italic uppercase tracking-tight text-white">Password</h4>
                                        <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                                           Send a secure password reset link to your registered email address.
                                        </p>
                                     </div>

                                     {/* Email Display */}
                                     <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                                           <Mail size={14} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                           <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Account Email</span>
                                           <span className="font-mono text-xs font-bold text-white truncate block">{user.email}</span>
                                        </div>
                                     </div>

                                     <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1">
                                        <KeyRound size={12} className="text-cyan-400 shrink-0" />
                                        <span>Reset link is valid for 15 minutes</span>
                                     </div>
                                  </div>

                                  <button
                                     onClick={handleResetPassword}
                                     disabled={isResetting}
                                     className="group/btn relative isolate mt-6 sm:mt-8 flex min-h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 px-6 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer"
                                  >
                                     <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover/btn:translate-x-full" />
                                     {isResetting ? (
                                        <Loader2 size={16} className="animate-spin text-black" />
                                     ) : (
                                        <>
                                           <Key size={14} className="text-black" />
                                           <span>Send Reset Link</span>
                                           <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                                        </>
                                     )}
                                  </button>
                               </div>

                               {/* Multi-Factor Auth Card */}
                               <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[2rem] border border-purple-500/25 bg-gradient-to-b from-[#15102a]/85 via-[#0e0a20]/85 to-[#090616]/90 p-5 sm:p-7 md:p-8 transition-all duration-500 hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:-translate-y-0.5">
                                  {/* Hover corner flare */}
                                  <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-purple-500/10 blur-[70px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                  <div className="space-y-4 sm:space-y-5 relative z-10">
                                     <div className="flex items-center justify-between">
                                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/15 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-500 group-hover:scale-105 group-hover:border-purple-400 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                                           <Shield size={22} className="sm:w-6 sm:h-6" />
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-purple-500/15 border border-purple-500/30 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
                                           <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" /> Coming Soon
                                        </span>
                                     </div>

                                     <div className="space-y-1.5">
                                        <h4 className="text-lg sm:text-xl font-black italic uppercase tracking-tight text-white">Two-Factor Authentication</h4>
                                        <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                                           Add an extra verification step to your sign-in process with an authenticator app.
                                        </p>
                                     </div>

                                     {/* Feature Capabilities Preview */}
                                     <div className="grid grid-cols-3 gap-2 pt-1">
                                        <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/15 text-center">
                                           <Smartphone size={15} className="text-purple-300" />
                                           <span className="text-[9px] font-bold uppercase tracking-wider text-purple-200">Auth Apps</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/15 text-center">
                                           <KeyRound size={15} className="text-purple-300" />
                                           <span className="text-[9px] font-bold uppercase tracking-wider text-purple-200">Backup Codes</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/15 text-center">
                                           <ShieldCheck size={15} className="text-purple-300" />
                                           <span className="text-[9px] font-bold uppercase tracking-wider text-purple-200">Vault Lock</span>
                                        </div>
                                     </div>

                                     <div className="flex items-center gap-2 text-[11px] text-purple-300/80 pt-1">
                                        <Clock size={12} className="text-purple-400 shrink-0" />
                                        <span>Currently in active development for the next update</span>
                                     </div>
                                  </div>

                                  <div className="mt-6 sm:mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/25 px-6 text-xs font-black uppercase tracking-wider text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                                     <Shield size={14} className="text-purple-400" />
                                     <span>Rollout In Progress</span>
                                  </div>
                               </div>
                            </div>
                         </section>

                         {/* Danger Zone: Account Deletion */}
                         {dbUser?.status === "pending_deletion" || dbUser?.scheduledDeletionAt || dbUser?.scheduled_deletion_at ? (
                            <section className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-amber-500/40 bg-gradient-to-br from-[#1c1409]/90 via-[#130d05]/95 to-[#0b0804]/98 p-5 sm:p-8 lg:p-10 shadow-[0_20px_70px_rgba(245,158,11,0.15)] backdrop-blur-3xl">
                               <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                               <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-amber-500/10 blur-[100px]" />

                               <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                  <div className="space-y-2.5">
                                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/40 bg-amber-400/15 text-amber-300 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                        <Clock size={13} className="text-amber-400" /> Deletion Scheduled
                                     </div>
                                     <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white">
                                        Account Deletion in Progress
                                     </h3>
                                     <p className="text-xs font-medium text-zinc-300 leading-relaxed max-w-xl">
                                        Your account and all creations are scheduled to be permanently deleted on{" "}
                                        <span className="font-bold text-amber-200">
                                           {new Date(dbUser?.scheduledDeletionAt || dbUser?.scheduled_deletion_at).toLocaleDateString(undefined, {
                                              month: "long",
                                              day: "numeric",
                                              year: "numeric"
                                           })}
                                        </span>.
                                     </p>
                                     {dbUser?.deletionRecoveryRequested ? (
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 pt-1">
                                           <CheckCircle2 size={15} /> Recovery request submitted — waiting for confirmation.
                                        </div>
                                     ) : (
                                        <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
                                           <RotateCcw size={13} className="text-amber-400" />
                                           <span>Changed your mind? Cancel anytime before the 7-day safety period expires.</span>
                                        </div>
                                     )}
                                  </div>

                                  {!dbUser?.deletionRecoveryRequested && (
                                     <button
                                        onClick={handleCancelDeletion}
                                        disabled={isCancellingDeletion}
                                        className="group/btn relative isolate flex min-h-12 w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-7 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                                     >
                                        {isCancellingDeletion ? (
                                           <Loader2 size={16} className="animate-spin text-black" />
                                        ) : (
                                           <>
                                              <RotateCcw size={15} className="group-hover/btn:-rotate-45 transition-transform" />
                                              <span>Cancel Deletion & Keep Account</span>
                                           </>
                                        )}
                                     </button>
                                  )}
                               </div>
                            </section>
                         ) : (
                            <section className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-rose-500/30 bg-gradient-to-br from-[#18090d]/90 via-[#100609]/95 to-[#080406]/98 p-5 sm:p-8 lg:p-10 shadow-[0_20px_70px_rgba(244,63,94,0.12)] backdrop-blur-3xl transition-all duration-500 hover:border-rose-500/45 hover:shadow-[0_20px_80px_rgba(244,63,94,0.2)]">
                               {/* Glowing top hazard line */}
                               <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/70 to-transparent" />
                               <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-rose-500/10 blur-[100px]" />

                               <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                  <div className="space-y-2.5">
                                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/35 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                                        <AlertTriangle size={13} className="text-rose-400" />
                                        <span>Danger Zone</span>
                                     </div>
                                     <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white">
                                        Delete Account
                                     </h3>
                                     <p className="text-xs font-medium text-zinc-300 leading-relaxed max-w-xl">
                                        Permanently delete your account and all associated data. You have a 7-day safety window to recover your account if you change your mind.
                                     </p>
                                  </div>

                                  <button
                                     onClick={() => {
                                        setDeleteConfirmText("");
                                        setIsDeleteModalOpen(true);
                                     }}
                                     className="group/btn relative isolate flex min-h-12 w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 px-7 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(244,63,94,0.35)] hover:shadow-[0_0_40px_rgba(244,63,94,0.55)] active:scale-[0.98] transition-all duration-300 cursor-pointer border border-rose-400/40"
                                  >
                                     <Trash2 size={16} className="transition-transform group-hover/btn:scale-110 group-hover/btn:-rotate-6 text-white" />
                                     <span>Delete Account</span>
                                  </button>
                               </div>
                            </section>
                         )}
                    </div>
                 )}
                {activeTab === 'billing' && (
                     <div className="space-y-6 sm:space-y-8">
                        <section className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/[0.06] bg-[#07070b] p-5 sm:p-8 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                           {/* Subtle Background Glows */}
                           <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
                           <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-purple-500/10 blur-[100px]" />
                           
                           {/* Header */}
                           <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 mb-6 sm:mb-8">
                             <div className="space-y-1">
                               <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-[10px] font-black uppercase tracking-wider text-purple-300">
                                 <Crown size={12} className="text-purple-400" />
                                 <span>Plan & Membership</span>
                               </div>
                               <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Subscription</h3>
                               <p className="text-xs text-zinc-400 font-normal">Manage your current membership plan and billing details.</p>
                             </div>
                             
                             <div className="self-start sm:self-auto">
                               {isPro ? (
                                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                                   <span className="relative flex h-2 w-2">
                                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                                     <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400" />
                                   </span>
                                   <span>Active Pro Plan</span>
                                 </div>
                               ) : (
                                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 text-xs font-bold">
                                   <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                   <span>Free Tier</span>
                                 </div>
                               )}
                             </div>
                           </div>

                           {/* Main Card */}
                           <div className="relative z-10 rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#0c0d18]/90 p-6 sm:p-8 lg:p-10 backdrop-blur-2xl mb-6 sm:mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden group">
                             {/* Top hairline sheen */}
                             <div className="pointer-events-none absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                             
                             {/* Ambient Radial Glow */}
                             <div className={cn(
                               "pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-[90px] transition-all",
                               isPro ? "bg-purple-500/15" : "bg-cyan-500/10"
                             )} />

                             <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8">
                               {/* Left side: Emblem & Plan Information */}
                               <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 min-w-0">
                                 {/* Luxury Emblem Container */}
                                 <div className={cn(
                                   "relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl border shadow-xl transition-all duration-300",
                                   isPro 
                                     ? "border-purple-500/30 bg-gradient-to-br from-purple-500/20 via-indigo-500/15 to-transparent text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.2)]" 
                                     : "border-cyan-500/25 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                                 )}>
                                   <Crown size={30} className={cn("sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-105", isPro ? "text-purple-300 fill-purple-400/25" : "text-cyan-300")} />
                                 </div>

                                 {/* Plan Details */}
                                 <div className="min-w-0">
                                   <div className="flex items-center gap-3 flex-wrap">
                                     <h4 className="text-2xl sm:text-3xl font-black italic tracking-normal text-white whitespace-nowrap">
                                       {isPro ? "Exismic Elite Pro" : "Exismic Free"}
                                     </h4>
                                     {isPro ? (
                                       <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                         Active
                                       </span>
                                     ) : (
                                       <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                         Current Plan
                                       </span>
                                     )}
                                   </div>

                                   <p className="text-xs text-zinc-400 font-normal mt-1.5 leading-relaxed">
                                     {isPro 
                                       ? dbUser?.subscription_status === 'cancelled' 
                                         ? <span className="text-amber-400/90 font-medium">Pro access ends on {dbUser?.plan_expires_at ? new Date(dbUser.plan_expires_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'end of period'}.</span>
                                         : dbUser?.subscription_status === 'past_due' || dbUser?.subscription_status === 'halted'
                                         ? <span className="text-rose-400 font-medium">Payment past due — please renew your subscription.</span>
                                         : dbUser?.plan_expires_at
                                         ? `Next renewal on ${new Date(dbUser.plan_expires_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}.`
                                         : "Active membership with unlimited priority access."
                                       : "Includes 50 daily credits replenished every 24 hours with standard speed."}
                                   </p>

                                   {/* Core Feature Badges */}
                                   <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-white/[0.06]">
                                     {isPro ? (
                                       <>
                                         <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-purple-200 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                                           <Check size={12} className="text-emerald-400" /> Unlimited Generations
                                         </span>
                                         <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-purple-200 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                                           <Check size={12} className="text-emerald-400" /> Priority Processing
                                         </span>
                                         <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-purple-200 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                                           <Check size={12} className="text-emerald-400" /> Commercial Rights
                                         </span>
                                       </>
                                     ) : (
                                       <>
                                         <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                                           <Check size={12} className="text-cyan-400" /> 50 Daily Credits
                                         </span>
                                         <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                                           <Check size={12} className="text-cyan-400" /> 50+ Free Tools
                                         </span>
                                         <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                                           <Check size={12} className="text-cyan-400" /> Permanent Retention
                                         </span>
                                       </>
                                     )}
                                   </div>
                                 </div>
                               </div>

                               {/* Right side: Action Buttons */}
                               <div className="flex flex-col sm:flex-row xl:flex-col items-stretch gap-3 shrink-0 sm:self-start xl:self-center w-full sm:w-auto">
                                 {isPro ? (
                                   <button 
                                     onClick={() => setIsManageModalOpen(true)}
                                     className="group relative isolate flex items-center justify-center h-12 px-6 rounded-xl sm:rounded-2xl bg-white text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:bg-zinc-100 transition-all active:scale-[0.98] cursor-pointer"
                                   >
                                     <span>Manage Subscription</span>
                                   </button>
                                 ) : (
                                   <button 
                                     onClick={() => router.push('/pro')}
                                     className="group relative flex items-center justify-center gap-2 h-12 px-7 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(147,51,234,0.35)] hover:shadow-[0_0_35px_rgba(147,51,234,0.5)] hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer"
                                   >
                                     <Zap size={14} className="text-amber-300 fill-amber-300" />
                                     <span>Upgrade to Pro</span>
                                     <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                   </button>
                                 )}

                                 <button 
                                   onClick={() => setIsInvoiceModalOpen(true)}
                                   className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
                                 >
                                   <Receipt size={14} className="text-zinc-400" />
                                   <span>View Invoices</span>
                                 </button>
                               </div>
                             </div>
                           </div>

                           {/* Bottom Info Cards */}
                           <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                             {/* Card 1: Billing */}
                             <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d18]/70 hover:border-white/15 hover:bg-[#0f1020]/90 p-5 sm:p-6 transition-all shadow-lg backdrop-blur-xl group">
                               <div className="flex items-center gap-3.5">
                                 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:border-cyan-400/40 transition-colors">
                                   <Wallet size={19} />
                                 </div>
                                 <div>
                                   <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Billing Method</p>
                                   <p className="text-base font-black tracking-tight text-white mt-0.5">
                                     {isPro ? "Pro Membership" : "Free Forever"}
                                   </p>
                                 </div>
                               </div>
                               <p className="mt-3 text-xs text-zinc-400 font-normal leading-relaxed">
                                 {isPro ? "Managed securely via payment portal" : "No credit card or payment required"}
                               </p>
                             </div>

                             {/* Card 2: Renewal / Reset Cycle */}
                             <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d18]/70 hover:border-white/15 hover:bg-[#0f1020]/90 p-5 sm:p-6 transition-all shadow-lg backdrop-blur-xl group">
                               <div className="flex items-center gap-3.5">
                                 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:border-purple-400/40 transition-colors">
                                   <Calendar size={19} />
                                 </div>
                                 <div>
                                   <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                     {isPro ? "Billing Cycle" : "Credit Refresh"}
                                   </p>
                                   <p className="text-base font-black tracking-tight text-white mt-0.5">
                                     {isPro ? "Monthly" : "Daily Reset"}
                                   </p>
                                 </div>
                               </div>
                               <p className="mt-3 text-xs text-zinc-400 font-normal leading-relaxed">
                                 {isPro 
                                   ? dbUser?.plan_expires_at 
                                     ? `Next charge on ${new Date(dbUser.plan_expires_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` 
                                     : "Monthly renewal active"
                                   : "50 daily credits reset every 24 hours"}
                               </p>
                             </div>

                             {/* Card 3: Account Status */}
                             <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d18]/70 hover:border-white/15 hover:bg-[#0f1020]/90 p-5 sm:p-6 transition-all shadow-lg backdrop-blur-xl group">
                               <div className="flex items-center gap-3.5">
                                 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:border-emerald-400/40 transition-colors">
                                   <Activity size={19} />
                                 </div>
                                 <div>
                                   <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Account Status</p>
                                   <p className="text-base font-black tracking-tight text-white mt-0.5 flex items-center gap-2">
                                     <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                     <span>{isPro ? "Pro Active" : "Active"}</span>
                                   </p>
                                 </div>
                               </div>
                               <p className="mt-3 text-xs text-zinc-400 font-normal leading-relaxed">
                                 {isPro ? "Full access with high priority processing" : "Standard speed with community support"}
                               </p>
                             </div>
                           </div>
                        </section>
                     </div>
                  )}
                {activeTab === 'preferences' && (
                    <div className="space-y-6 sm:space-y-8">
                       <section className="glass-dark space-y-6 sm:space-y-8 rounded-2xl sm:rounded-[2rem] border border-white/5 p-4 sm:p-8 lg:space-y-12 lg:rounded-[3rem] lg:p-12">
                          <div className="space-y-2 sm:space-y-4">
                             <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">Preferences</h3>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Customize your Exismic experience</p>
                          </div>
                          <div className="space-y-4 sm:space-y-6">
                            {isLoadingPreferences ? (
                              Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="flex flex-col gap-4 rounded-2xl sm:rounded-3xl border border-white/5 bg-white/[0.02] p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                                  <div className="flex items-center gap-3.5 sm:gap-4">
                                    <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl" />
                                    <div className="space-y-2 sm:space-y-3">
                                      <SkeletonLine className="h-4 w-48 max-w-[55vw]" />
                                      <SkeletonLine className="w-64 max-w-[65vw]" />
                                      <SkeletonLine className="w-20" />
                                    </div>
                                  </div>
                                  <Skeleton className="h-8 w-14 sm:w-16 rounded-full" />
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
                                   "relative overflow-hidden flex flex-col gap-4 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-[2rem] border transition-all duration-500 sm:flex-row sm:items-center sm:justify-between group",
                                   enabled ? "bg-white/[0.03] border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.05)]" : "bg-white/[0.015] border-white/5 hover:border-white/15"
                                 )}
                               >
                                 {/* Glowing gradient background when enabled */}
                                 {enabled && (
                                   <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(168,85,247,0.08),rgba(34,211,238,0.08))] pointer-events-none" />
                                 )}
                                  
                                  <div className="flex items-center gap-3.5 sm:gap-5 relative z-10 min-w-0">
                                     <div className={cn(
                                       "relative w-11 h-11 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500",
                                       enabled 
                                         ? "bg-[linear-gradient(135deg,rgba(168,85,247,0.2),rgba(34,211,238,0.2))] text-cyan-200 border border-cyan-300/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                                         : "bg-white/5 text-zinc-500 group-hover:text-white border border-transparent group-hover:border-white/10"
                                     )}>
                                        <pref.icon size={20} className={cn("transition-transform duration-500 sm:w-6 sm:h-6", enabled ? "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "group-hover:scale-110")} />
                                        {enabled && <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-cyan-400/20 blur-xl -z-10" />}
                                     </div>
                                     <div className="space-y-1 sm:space-y-1.5 min-w-0">
                                        <h4 className={cn("text-[11px] sm:text-xs font-black uppercase tracking-widest transition-colors", enabled ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "text-zinc-300 group-hover:text-white")}>{pref.label}</h4>
                                        <p className="text-[9px] sm:text-[10px] font-medium text-zinc-500 uppercase tracking-tight">{pref.desc}</p>
                                        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
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
                                      "relative h-8 w-14 sm:h-9 sm:w-[4.5rem] self-end sm:self-auto shrink-0 rounded-full border p-1 transition-all duration-500 disabled:cursor-wait disabled:opacity-60 z-10 outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
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
                                      "relative flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-500",
                                      enabled ? "translate-x-6 sm:translate-x-8 scale-100" : "translate-x-0 bg-zinc-400 scale-90"
                                    )}>
                                      {isSavingThis && <Loader2 size={13} className="animate-spin text-purple-600" />}
                                    </span>
                                  </button>
                               </motion.div>
                              );
                            })}
                          </div>
                       </section>
                    </div>
                 )}
                 {activeTab === 'developer' && (
                    <div className="space-y-8">
                       <ApiKeyManager />
                    </div>
                 )}
             </motion.div>
          </div>
        </div>
      </div>

      {/* Dynamic Pro Avatar Frames Browser Modal */}
      <Portal>
        <AnimatePresence>
          {isFrameModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsFrameModalOpen(false)} 
              className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-2.5 sm:p-6 md:p-10"
            >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[92dvh] h-[88dvh] flex flex-col bg-[#070812] border-2 border-purple-500/40 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_40px_rgba(168,85,247,0.2)]"
            >
               {/* Ambient Glows */}
               <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 bg-purple-600/15 blur-[120px]" />
               <div className="pointer-events-none absolute -bottom-24 left-0 w-96 h-96 bg-cyan-500/10 blur-[120px]" />
               
               {/* Top Header */}
               <div className="p-4 sm:p-7 md:p-8 flex items-center justify-between z-20 border-b border-white/10 bg-[#090a18]/80 backdrop-blur-2xl gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                     <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-purple-400/30 bg-purple-500/15 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        <Crown size={20} className="text-purple-300 fill-purple-400/20" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <h2 className="text-base sm:text-2xl font-black text-white uppercase italic tracking-tight">Avatar Frames</h2>
                          <span className="rounded-full border border-purple-400/30 bg-purple-500/15 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-purple-300">
                            {PRO_FRAMES.length} Styles
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs font-medium text-zinc-400 mt-0.5">Choose a glowing digital frame for your profile</p>
                     </div>
                  </div>
                  <button 
                     onClick={() => setIsFrameModalOpen(false)} 
                     className="group flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer shadow-sm"
                     aria-label="Close modal"
                  >
                     <X size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
               </div>

               {/* Grid Frame Selector Body */}
               <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                     {PRO_FRAMES.map((frame) => {
                        const isSelected = selectedFrame === frame.id;
                        const isIncludedWithPro = PRO_INCLUDED_AVATAR_FRAMES.has(frame.id);
                        const isUnlocked = userUnlockedFrames.includes(frame.id) || (isPro && isIncludedWithPro);
                        return (
                           <motion.div 
                              key={frame.id} 
                              whileHover={{ y: -4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (isUnlocked) {
                                  if (!isUpdatingFrame) handleApplyFrame(frame.id);
                                } else {
                                  setStatus({
                                    type: "error",
                                    message: isIncludedWithPro
                                      ? "Upgrade to Pro to equip this frame, or unlock it in the Sparks Rewards shop!"
                                      : "Unlock this frame with Exismic Sparks in the Rewards shop!",
                                  });
                                }
                              }}
                              className={cn(
                                 "p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-xl border flex flex-col items-center justify-between gap-3 sm:gap-5 cursor-pointer transition-all duration-300 group/frame relative overflow-hidden",
                                 isSelected 
                                   ? "bg-gradient-to-b from-[#16122c]/95 via-[#100d22]/95 to-[#090814]/95 border-purple-400/80 shadow-[0_0_35px_rgba(168,85,247,0.35)]" 
                                   : isUnlocked
                                     ? "bg-gradient-to-b from-[#0c0d18]/80 to-[#06070e]/80 border-white/10 hover:border-purple-400/40 hover:bg-[#101224]/80 shadow-lg"
                                     : "bg-gradient-to-b from-[#08080f]/60 to-[#04040a]/60 border-white/5 opacity-70 hover:opacity-100 shadow-md"
                              )}
                           >
                              {/* Ambient Orb Glow behind the card */}
                              <div className={cn(
                                 "absolute -inset-10 rounded-[2.5rem] opacity-0 group-hover/frame:opacity-100 transition-opacity duration-500 blur-2xl -z-10 bg-gradient-to-br",
                                 frame.glowStyles
                              )} />

                              {/* NEW Tag */}
                              {(frame as { isNew?: boolean }).isNew && (
                                 <div className="absolute top-3 right-3 z-30 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black text-[8px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(34,211,238,0.6)] animate-pulse border border-cyan-300/60">
                                    NEW
                                 </div>
                              )}

                              {/* Frame Preview */}
                              <div className="relative scale-100 sm:scale-110 my-2 sm:my-3 transition-transform duration-500 group-hover/frame:scale-120">
                                 <AvatarWithFrame 
                                    avatarUrl={displayAvatarUrl}
                                    displayName={name || 'User'}
                                    isPro={true}
                                    frameId={frame.id}
                                    size="md"
                                 />
                                 {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center border border-[#070812] shadow-[0_0_12px_rgba(168,85,247,0.8)] z-30">
                                       <CheckCircle2 size={12} className="text-white" />
                                    </div>
                                 )}
                              </div>
                              
                              {/* Frame Title & Badges */}
                              <div className="space-y-1.5 text-center w-full relative z-10">
                                 <h4 className={cn("text-xs font-black uppercase tracking-tight text-center truncate drop-shadow-sm", frame.titleColor || "text-white")}>
                                    {frame.name}
                                 </h4>
                                 <span className={cn(
                                    "inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border transition-all duration-300",
                                    isSelected 
                                      ? "bg-purple-500/25 text-purple-300 border-purple-500/40" 
                                      : isUnlocked
                                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                        : isIncludedWithPro
                                          ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                                          : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                 )}>
                                    {isSelected ? "Equipped" : isUnlocked ? "Unlocked" : isIncludedWithPro ? "Pro Perk" : "Sparks Shop"}
                                 </span>
                              </div>
                              
                              {/* Selection Button */}
                              <button 
                                 type="button"
                                 onClick={(e) => {
                                    if (!isUnlocked) {
                                      e.stopPropagation();
                                      router.push("/rewards");
                                    }
                                 }}
                                 className={cn(
                                    "w-full py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center gap-1.5",
                                    isSelected 
                                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] font-black" 
                                      : isUnlocked
                                        ? "bg-white/[0.05] border border-white/10 text-zinc-300 group-hover/frame:bg-purple-600 group-hover/frame:text-white group-hover/frame:border-purple-500/50 group-hover/frame:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                        : "bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                                 )}
                              >
                                 {isSelected ? (
                                   <>
                                     <CheckCircle2 size={13} className="text-white" />
                                     <span>Equipped</span>
                                   </>
                                 ) : isUnlocked ? (
                                   <span>Select Frame</span>
                                 ) : (
                                   <div className="flex items-center gap-1.5">
                                     <Lock size={12} />
                                     <span>Unlock in Shop</span>
                                   </div>
                                 )}
                              </button>
                           </motion.div>
                        );
                     })}
                  </div>
               </div>

               {/* Footer Toolbar */}
               <div className="p-3.5 sm:p-5 md:p-6 border-t border-white/10 bg-[#070814]/90 backdrop-blur-2xl flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between z-20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                     <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                     <span>Click any frame to preview and instantly equip it</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                     {selectedFrame && (
                        <button 
                           onClick={() => { handleApplyFrame(null); }}
                           disabled={isUpdatingFrame}
                           className="flex-1 sm:flex-initial px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                           Reset
                        </button>
                     )}
                     <button 
                        onClick={() => setIsFrameModalOpen(false)}
                        className="flex-1 sm:flex-initial px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer text-center"
                     >
                        Done
                     </button>
                  </div>
               </div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      {/* Premium Name Styles Browser Modal */}
      <Portal>
        <AnimatePresence>
          {isGradientModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsGradientModalOpen(false)} 
              className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-2.5 sm:p-6 md:p-10"
            >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[92dvh] h-[88dvh] flex flex-col bg-[#070812] border-2 border-cyan-400/40 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_40px_rgba(34,211,238,0.2)]"
            >
               {/* Ambient Glows */}
               <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 bg-cyan-600/15 blur-[120px]" />
               <div className="pointer-events-none absolute -bottom-24 left-0 w-96 h-96 bg-purple-500/10 blur-[120px]" />
               
               {/* Top Header */}
               <div className="p-4 sm:p-7 md:p-8 flex items-center justify-between z-20 border-b border-white/10 bg-[#090a18]/80 backdrop-blur-2xl gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                     <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-cyan-400/30 bg-cyan-500/15 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <Type size={20} className="text-cyan-300" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <h2 className="text-base sm:text-2xl font-black text-white uppercase italic tracking-tight">Name Styles</h2>
                          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-cyan-300">
                            {NAME_GRADIENTS.length} Styles
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs font-medium text-zinc-400 mt-0.5">Select a glowing text style for your name</p>
                     </div>
                  </div>
                  <button 
                     onClick={() => setIsGradientModalOpen(false)} 
                     className="group flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer shadow-sm"
                     aria-label="Close modal"
                  >
                     <X size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
               </div>

               {/* Grid Name Style Selector Body */}
               <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                     {NAME_GRADIENTS.map((gradient) => {
                        const isSelected = selectedGradient === gradient.id;
                        const isIncludedWithPro = PRO_INCLUDED_NAME_STYLES.has(gradient.id);
                        const isUnlocked = userUnlockedGradients.includes(gradient.id) || (isPro && isIncludedWithPro);
                        return (
                           <motion.div 
                              key={gradient.id} 
                              whileHover={{ y: -4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (isUnlocked) {
                                  if (!isUpdatingGradient) handleApplyGradient(gradient.id);
                                } else {
                                  setStatus({
                                    type: "error",
                                    message: isIncludedWithPro
                                      ? "Upgrade to Pro to equip this style, or unlock it in the Sparks Rewards shop!"
                                      : "Unlock this name style with Exismic Sparks in the Rewards shop!",
                                  });
                                }
                              }}
                              className={cn(
                                 "p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-xl border flex flex-col items-center justify-between gap-3 sm:gap-5 cursor-pointer transition-all duration-300 group/gradient relative overflow-hidden",
                                 isSelected 
                                   ? "bg-gradient-to-b from-[#0e172a]/95 via-[#0a101f]/95 to-[#060a14]/95 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.35)]" 
                                   : isUnlocked
                                     ? "bg-gradient-to-b from-[#0c0d18]/80 to-[#06070e]/80 border-white/10 hover:border-cyan-400/40 hover:bg-[#0e1224]/80 shadow-lg"
                                     : "bg-gradient-to-b from-[#08080f]/60 to-[#04040a]/60 border-white/5 opacity-70 hover:opacity-100 shadow-md"
                              )}
                           >
                              {/* Ambient Orb Glow behind the card */}
                              <div className={cn(
                                 "absolute -inset-10 rounded-[2.5rem] opacity-0 group-hover/gradient:opacity-100 transition-opacity duration-500 blur-2xl -z-10 bg-gradient-to-br",
                                 gradient.previewGlow
                              )} />

                              {(gradient as { isNew?: boolean }).isNew && (
                                 <div className="absolute top-3 right-3 z-30 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black text-[8px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(34,211,238,0.6)] animate-pulse border border-cyan-300/60">
                                    NEW
                                 </div>
                              )}

                              <div className="text-lg sm:text-xl font-black tracking-tight my-3 sm:my-4 py-1.5 sm:py-2">
                                 <PremiumName name={name || "Exismic User"} isPro={true} gradientId={gradient.id} className="text-lg sm:text-xl font-black uppercase" />
                              </div>
                              
                              <div className="space-y-1.5 text-center w-full relative z-10">
                                 <h4 className="text-xs font-black uppercase tracking-tight text-center text-white truncate drop-shadow-sm">
                                    {gradient.name}
                                 </h4>
                                 <span className={cn(
                                    "inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border transition-all duration-300",
                                    isSelected 
                                      ? "bg-cyan-500/25 text-cyan-300 border-cyan-500/40" 
                                      : isUnlocked
                                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                        : isIncludedWithPro
                                          ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                                          : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                 )}>
                                    {isSelected ? "Equipped" : isUnlocked ? "Unlocked" : isIncludedWithPro ? "Pro Perk" : "Sparks Shop"}
                                 </span>
                              </div>
                              
                              <button 
                                 type="button"
                                 onClick={(e) => {
                                    if (!isUnlocked) {
                                      e.stopPropagation();
                                      router.push("/rewards");
                                    }
                                 }}
                                 className={cn(
                                    "w-full py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center gap-1.5",
                                    isSelected 
                                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] font-black" 
                                      : isUnlocked
                                        ? "bg-white/[0.05] border border-white/10 text-zinc-300 group-hover/gradient:bg-cyan-500 group-hover/gradient:text-black group-hover/gradient:border-cyan-400 group-hover/gradient:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                                        : "bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                                 )}
                              >
                                 {isSelected ? (
                                   <>
                                     <CheckCircle2 size={13} className="text-white" />
                                     <span>Equipped</span>
                                   </>
                                 ) : isUnlocked ? (
                                   <span>Select Style</span>
                                 ) : (
                                   <div className="flex items-center gap-1.5">
                                     <Lock size={12} />
                                     <span>Unlock in Shop</span>
                                   </div>
                                 )}
                              </button>
                           </motion.div>
                        );
                     })}
                  </div>
               </div>

               {/* Footer Toolbar */}
               <div className="p-3.5 sm:p-5 md:p-6 border-t border-white/10 bg-[#070814]/90 backdrop-blur-2xl flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between z-20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                     <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                     <span>Click any style to preview and apply it</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                     {selectedGradient && (
                        <button 
                           onClick={() => { handleApplyGradient(null); }}
                           disabled={isUpdatingGradient}
                           className="flex-1 sm:flex-initial px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                           Reset
                        </button>
                     )}
                     <button 
                        onClick={() => setIsGradientModalOpen(false)}
                        className="flex-1 sm:flex-initial px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer text-center"
                     >
                        Done
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      <Portal>
        <AnimatePresence>
          {imageToCrop && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setImageToCrop(null)} 
              className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-2.5 sm:p-4 md:p-10"
            >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] h-[82dvh] flex flex-col items-center justify-center bg-[#030303] border border-white/10 rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-4xl"
            >
               <div className="absolute top-0 inset-x-0 p-4 sm:p-8 flex items-center justify-between z-10 bg-linear-to-b from-black to-transparent">
                  <div className="flex items-center gap-3 sm:gap-4">
                     <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-accent-purple/20 text-accent-purple">
                        <CropIcon size={20} className="sm:w-6 sm:h-6" />
                     </div>
                     <div>
                        <h2 className="text-base sm:text-2xl font-black text-white uppercase italic tracking-tighter">Perfect Your Look</h2>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Crop and align your digital identity</p>
                     </div>
                  </div>
                  <button onClick={() => setImageToCrop(null)} className="p-2 sm:p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                     <X size={20} />
                  </button>
               </div>
               <div className="relative w-full flex-1 mt-14 sm:mt-10">
                  <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} cropShape="round" showGrid={false} style={{ containerStyle: { background: 'transparent' }, cropAreaStyle: { border: '2px solid rgba(168, 85, 247, 0.5)' } }} />
               </div>
               <div className="w-full p-4 sm:p-8 md:p-12 space-y-4 sm:space-y-8 bg-zinc-950/80 backdrop-blur-md relative z-10">
                  <div className="space-y-2 sm:space-y-4">
                     <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">
                        <span>Optical Zoom</span>
                        <span>{Math.round(zoom * 100)}%</span>
                     </div>
                     <input type="range" value={zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-accent-purple" />
                  </div>
                  <div className="flex gap-2.5 sm:gap-4">
                     <button onClick={() => setImageToCrop(null)} className="flex-1 py-3 sm:py-5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 text-zinc-400 font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:text-white transition-all">Cancel</button>
                     <button onClick={handleSaveCroppedImage} disabled={isUploading} className="flex-1 py-3 sm:py-5 rounded-xl sm:rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-zinc-200 transition-all shadow-xl disabled:opacity-30">{isUploading ? "Uploading..." : "Save Identity"}</button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </Portal>
      {activeCosmeticModal && (
        <CosmeticsSelectorModal
          isOpen={activeCosmeticModal !== null}
          onClose={() => setActiveCosmeticModal(null)}
          category="insignia"
          currentSelectedId={selectedInsignia}
          unlockedIds={userUnlockedInsignias}
          isPro={isPro}
          proIncludedIds={PRO_INCLUDED_INSIGNIAS}
          onApply={handleApplyInsignia}
          avatarUrl={displayAvatarUrl}
          displayName={name || "User"}
        />
      )}
      <BuyCreditsModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
      <ManageSubscriptionModal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)} 
        user={dbUser}
        onCancel={handleCancelSubscription}
        isCancelling={isCancelling}
      />
      <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />

      {/* Delete Account Modal */}
      <Portal>
        <AnimatePresence>
          {isDeleteModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isDeletingAccount) {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText("");
                }
              }}
              className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg overflow-hidden rounded-2xl sm:rounded-[2rem] border border-rose-500/30 bg-[#090a14] p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(244,63,94,0.15)]"
              >
                {/* Ambient glow */}
                <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-rose-500/15 blur-[90px]" />

                <div className="relative z-10 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
                        <Trash2 size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tight text-white">
                          Delete your account?
                        </h3>
                        <p className="text-[11px] font-bold text-rose-400/90 uppercase tracking-wider">
                          7-Day Grace Period
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!isDeletingAccount) {
                          setIsDeleteModalOpen(false);
                          setDeleteConfirmText("");
                        }
                      }}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Plain English explanation */}
                  <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-zinc-300">
                    <p className="font-medium leading-relaxed">
                      Your account won&apos;t be deleted immediately. We will schedule it to be permanently erased in <span className="font-bold text-white">7 days</span>.
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-zinc-400 list-disc list-inside">
                      <li>You will be logged out right away.</li>
                      <li>You have 7 days to change your mind by signing back in and asking to recover it.</li>
                      <li>If you do not recover it within 7 days, your files, creations, and profile will be permanently deleted forever.</li>
                    </ul>
                  </div>

                  {/* Confirmation Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      To confirm, type <span className="text-white font-mono font-black">DELETE</span> below:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      disabled={isDeletingAccount}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-mono text-white placeholder:text-zinc-600 focus:border-rose-500/60 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeleteConfirmText("");
                      }}
                      disabled={isDeletingAccount}
                      className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-xs font-black uppercase tracking-wider text-zinc-300 hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Keep My Account
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText.trim() !== "DELETE" || isDeletingAccount}
                      className="flex-1 rounded-xl bg-rose-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-rose-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isDeletingAccount ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Scheduling...</span>
                        </>
                      ) : (
                        <span>Schedule Deletion</span>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}
