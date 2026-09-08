"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Crown,
  Zap,
  Coins,
  ShieldCheck,
  Flame,
  Gift,
  ArrowRight,
  CheckCircle2,
  Check,
  Lock,
  Gem,
  Info,
  Loader2,
  Ticket,
  ChevronRight,
  ChevronDown,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  Layers,
  Palette,
  Clock,
  X,
  RotateCcw,
  Type,
  User,
  Eye,
  EyeOff,
  Copy,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useSparks } from "@/hooks/useSparks";
import {
  SparksShopItem,
  RotationTimers,
  PERMANENT_SHOP_ITEMS,
  FREE_SPARKS_GIFT_EXPIRES_AT,
  formatTimeRemaining,
} from "@/config/sparks-shop";
import { SparkIcon, SparkBadge } from "@/components/ui/SparkIcon";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { DailyQuestsModal } from "@/components/reward/DailyQuestsModal";
import { AvatarWithFrame } from "@/components/ui/AvatarWithFrame";
import { PremiumName } from "@/components/ui/PremiumName";
import { CreatorInsignia } from "@/components/ui/CreatorInsignia";
import { soundController } from "@/components/reward/SoundController";
import { RewardsBackgroundVFX } from "@/components/reward/RewardsBackgroundVFX";
import { getIsIndia } from "@/config/pricing";
import { cn } from "@/lib/utils";

// Card color themes matching /shop luxury obsidian aesthetics
const cardStyles: Record<
  string,
  {
    iconBg: string;
    iconColor: string;
    cardBorder: string;
    ambientGradient: string;
    topBeam: string;
    numberGradient: string;
    conicGradient: string;
    subtitleColor: string;
    titleHoverColor: string;
  }
> = {
  amber: {
    iconBg:
      "border-amber-400/45 bg-gradient-to-br from-amber-500/30 via-orange-950/40 to-black/85 shadow-[0_0_25px_rgba(245,158,11,0.4)]",
    iconColor: "text-amber-300",
    cardBorder:
      "border-2 border-amber-400/80 bg-gradient-to-b from-[#170e08]/98 via-[#0f0a07]/98 to-[#050302]/98 hover:border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.3),0_20px_60px_rgba(0,0,0,0.85)] hover:shadow-[0_0_45px_rgba(245,158,11,0.55),0_25px_70px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-amber-500/20 via-orange-600/12 to-transparent",
    topBeam: "",
    numberGradient:
      "bg-[linear-gradient(110deg,#ffffff,#fde047,#fbbf24,#ffffff)] drop-shadow-[0_0_20px_rgba(245,158,11,0.45)]",
    conicGradient:
      "bg-[conic-gradient(from_0deg,rgba(245,158,11,1)_0%,rgba(234,179,8,1)_33%,rgba(251,191,36,1)_66%,rgba(245,158,11,1)_100%)]",
    subtitleColor: "text-zinc-400 group-hover/card:text-amber-200/90",
    titleHoverColor: "group-hover/card:text-amber-300 group-hover/card:drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]",
  },
  cyan: {
    iconBg:
      "border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 via-blue-900/30 to-black/85 shadow-[0_0_20px_rgba(34,211,238,0.3)]",
    iconColor: "text-cyan-300",
    cardBorder:
      "border-2 border-cyan-400/80 bg-gradient-to-b from-[#0a0d1c]/98 via-[#060813]/98 to-[#030408]/98 hover:border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.3),0_20px_60px_rgba(0,0,0,0.85)] hover:shadow-[0_0_45px_rgba(34,211,238,0.55),0_25px_70px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-cyan-500/18 via-blue-600/10 to-transparent",
    topBeam: "",
    numberGradient:
      "bg-[linear-gradient(110deg,#ffffff,#cffafe,#38bdf8,#ffffff)] drop-shadow-[0_0_18px_rgba(56,189,248,0.4)]",
    conicGradient:
      "bg-[conic-gradient(from_0deg,rgba(6,182,212,1)_0%,rgba(59,130,246,1)_33%,rgba(103,232,249,1)_66%,rgba(6,182,212,1)_100%)]",
    subtitleColor: "text-zinc-400 group-hover/card:text-cyan-200/90",
    titleHoverColor: "group-hover/card:text-cyan-300 group-hover/card:drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]",
  },
  purple: {
    iconBg:
      "border-purple-400/45 bg-gradient-to-br from-purple-500/30 via-fuchsia-950/40 to-black/85 shadow-[0_0_25px_rgba(168,85,247,0.4)]",
    iconColor: "text-purple-300",
    cardBorder:
      "border-2 border-purple-400/80 bg-gradient-to-b from-[#120c22]/98 via-[#0b0817]/98 to-[#04030a]/98 shadow-[0_0_25px_rgba(168,85,247,0.3),0_20px_60px_rgba(0,0,0,0.85)] hover:border-fuchsia-300 hover:shadow-[0_0_50px_rgba(217,70,239,0.55),0_25px_70px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-purple-600/22 via-fuchsia-600/14 to-cyan-500/10",
    topBeam: "",
    numberGradient:
      "bg-[linear-gradient(110deg,#ffffff,#f0abfc,#38bdf8,#ffffff)] drop-shadow-[0_0_20px_rgba(240,171,252,0.5)]",
    conicGradient:
      "bg-[conic-gradient(from_0deg,rgba(168,85,247,1)_0%,rgba(236,72,153,1)_33%,rgba(192,132,252,1)_66%,rgba(168,85,247,1)_100%)]",
    subtitleColor: "text-zinc-400 group-hover/card:text-fuchsia-200/90",
    titleHoverColor: "group-hover/card:text-purple-300 group-hover/card:drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]",
  },
  fuchsia: {
    iconBg:
      "border-pink-400/50 bg-gradient-to-br from-pink-500/35 via-rose-950/45 to-black/85 shadow-[0_0_30px_rgba(244,114,182,0.45)]",
    iconColor: "text-pink-300",
    cardBorder:
      "border-2 border-pink-400/80 bg-gradient-to-b from-[#190a16]/98 via-[#10060e]/98 to-[#040103]/98 shadow-[0_0_25px_rgba(244,114,182,0.3),0_20px_60px_rgba(0,0,0,0.85)] hover:border-pink-300 hover:shadow-[0_0_50px_rgba(244,114,182,0.6),0_25px_70px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-pink-600/25 via-rose-600/15 to-purple-600/12",
    topBeam: "",
    numberGradient:
      "bg-[linear-gradient(110deg,#ffffff,#fbcfe8,#fb7185,#ffffff)] drop-shadow-[0_0_22px_rgba(244,114,182,0.5)]",
    conicGradient:
      "bg-[conic-gradient(from_0deg,rgba(244,114,182,1)_0%,rgba(251,113,133,1)_33%,rgba(192,132,252,1)_66%,rgba(244,114,182,1)_100%)]",
    subtitleColor: "text-zinc-400 group-hover/card:text-pink-200/90",
    titleHoverColor: "group-hover/card:text-pink-300 group-hover/card:drop-shadow-[0_0_12px_rgba(244,114,182,0.45)]",
  },
  emerald: {
    iconBg:
      "border-emerald-400/45 bg-gradient-to-br from-emerald-500/30 via-teal-950/40 to-black/85 shadow-[0_0_25px_rgba(16,185,129,0.35)]",
    iconColor: "text-emerald-300",
    cardBorder:
      "border-2 border-emerald-400/80 bg-gradient-to-b from-[#071510]/98 via-[#040e0b]/98 to-[#020504]/98 hover:border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3),0_20px_60px_rgba(0,0,0,0.85)] hover:shadow-[0_0_45px_rgba(16,185,129,0.55),0_25px_70px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-emerald-500/20 via-teal-600/10 to-transparent",
    topBeam: "",
    numberGradient:
      "bg-[linear-gradient(110deg,#ffffff,#a7f3d0,#34d399,#ffffff)] drop-shadow-[0_0_20px_rgba(52,211,153,0.45)]",
    conicGradient:
      "bg-[conic-gradient(from_0deg,rgba(16,185,129,1)_0%,rgba(45,212,191,1)_33%,rgba(110,231,183,1)_66%,rgba(16,185,129,1)_100%)]",
    subtitleColor: "text-zinc-400 group-hover/card:text-emerald-200/90",
    titleHoverColor: "group-hover/card:text-emerald-300 group-hover/card:drop-shadow-[0_0_12px_rgba(52,211,153,0.45)]",
  },
  rose: {
    iconBg:
      "border-rose-400/45 bg-gradient-to-br from-rose-500/30 via-pink-950/40 to-black/85 shadow-[0_0_25px_rgba(244,63,94,0.35)]",
    iconColor: "text-rose-300",
    cardBorder:
      "border-2 border-rose-400/80 bg-gradient-to-b from-[#17090e]/98 via-[#0f0509]/98 to-[#050204]/98 hover:border-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.3),0_20px_60px_rgba(0,0,0,0.85)] hover:shadow-[0_0_45px_rgba(244,63,94,0.55),0_25px_70px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-rose-500/20 via-pink-600/12 to-transparent",
    topBeam: "",
    numberGradient:
      "bg-[linear-gradient(110deg,#ffffff,#fecdd3,#fb7185,#ffffff)] drop-shadow-[0_0_20px_rgba(251,113,133,0.45)]",
    conicGradient:
      "bg-[conic-gradient(from_0deg,rgba(244,63,94,1)_0%,rgba(251,113,133,1)_33%,rgba(244,114,182,1)_66%,rgba(244,63,94,1)_100%)]",
    subtitleColor: "text-zinc-400 group-hover/card:text-rose-200/90",
    titleHoverColor: "group-hover/card:text-rose-300 group-hover/card:drop-shadow-[0_0_12px_rgba(251,113,133,0.45)]",
  },
  red: {
    iconBg:
      "border-red-500/45 bg-gradient-to-br from-red-600/30 via-rose-950/40 to-black/85 shadow-[0_0_25px_rgba(239,68,68,0.4)]",
    iconColor: "text-red-400",
    cardBorder:
      "border-2 border-red-500/80 bg-gradient-to-b from-[#180808]/98 via-[#100404]/98 to-[#050202]/98 hover:border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.3),0_20px_60px_rgba(0,0,0,0.85)] hover:shadow-[0_0_45px_rgba(239,68,68,0.55),0_25px_70px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-red-600/22 via-orange-600/12 to-transparent",
    topBeam: "",
    numberGradient:
      "bg-[linear-gradient(110deg,#ffffff,#fca5a5,#ef4444,#ffffff)] drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]",
    conicGradient:
      "bg-[conic-gradient(from_0deg,rgba(220,38,38,1)_0%,rgba(239,68,68,1)_33%,rgba(249,115,22,1)_66%,rgba(220,38,38,1)_100%)]",
    subtitleColor: "text-zinc-400 group-hover/card:text-red-300/90",
    titleHoverColor: "group-hover/card:text-red-400 group-hover/card:drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]",
  },
  blue: {
    iconBg:
      "border-blue-500/45 bg-gradient-to-br from-blue-600/30 via-indigo-950/40 to-black/85 shadow-[0_0_25px_rgba(59,130,246,0.4)]",
    iconColor: "text-blue-300",
    cardBorder:
      "border-2 border-blue-400/80 bg-gradient-to-b from-[#070b1a]/98 via-[#040712]/98 to-[#020308]/98 hover:border-blue-300 shadow-[0_0_25px_rgba(59,130,246,0.3),0_20px_60px_rgba(0,0,0,0.85)] hover:shadow-[0_0_45px_rgba(59,130,246,0.55),0_25px_70px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-blue-600/20 via-indigo-600/12 to-transparent",
    topBeam: "",
    numberGradient:
      "bg-[linear-gradient(110deg,#ffffff,#93c5fd,#3b82f6,#ffffff)] drop-shadow-[0_0_20px_rgba(59,130,246,0.45)]",
    conicGradient:
      "bg-[conic-gradient(from_0deg,rgba(37,99,235,1)_0%,rgba(59,130,246,1)_33%,rgba(96,165,250,1)_66%,rgba(37,99,235,1)_100%)]",
    subtitleColor: "text-zinc-400 group-hover/card:text-blue-200/90",
    titleHoverColor: "group-hover/card:text-sky-300 group-hover/card:drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]",
  },
  silver: {
    iconBg:
      "border-slate-300/40 bg-gradient-to-br from-slate-200/20 via-zinc-800/40 to-black/85 shadow-[0_0_20px_rgba(226,232,240,0.3)]",
    iconColor: "text-slate-200",
    cardBorder:
      "border-2 border-slate-300/80 bg-gradient-to-b from-[#12141a]/98 via-[#0c0d12]/98 to-[#050608]/98 hover:border-white shadow-[0_0_25px_rgba(226,232,240,0.25),0_20px_60px_rgba(0,0,0,0.85)] hover:shadow-[0_0_40px_rgba(255,255,255,0.45),0_25px_70px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-slate-300/18 via-zinc-500/10 to-transparent",
    topBeam: "",
    numberGradient:
      "bg-[linear-gradient(110deg,#ffffff,#f1f5f9,#cbd5e1,#ffffff)] drop-shadow-[0_0_18px_rgba(255,255,255,0.4)]",
    conicGradient:
      "bg-[conic-gradient(from_0deg,rgba(226,232,240,1)_0%,rgba(255,255,255,1)_33%,rgba(148,163,184,1)_66%,rgba(226,232,240,1)_100%)]",
    subtitleColor: "text-zinc-400 group-hover/card:text-slate-200/90",
    titleHoverColor: "group-hover/card:text-white group-hover/card:drop-shadow-[0_0_14px_rgba(255,255,255,0.8)]",
  },
};

export default function RewardsPage() {
  const router = useRouter();
  const { user } = useAuth(null);
  const { streakShields, refreshCredits } = useCredits();
  const {
    sparks,
    lifetimeSparks,
    unlockedAvatarFrames,
    unlockedNameGradients,
    unlockedInsignias,
    unlockedCanopies,
    activeAvatarFrame,
    activeNameGradient,
    activeInsignia,
    activeCanopy,
    catalog,
    weeklyLegendaryItems,
    threeDayEpicItems,
    dailyRareItems,
    timers,
    loading,
    redeemItem,
    equipCosmetic,
    equippingId,
    voucherCooldowns,
    hasClaimedFreeSparks,
  } = useSparks();

  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation & Filter Tabs
  const [activeCategory, setActiveCategory] = useState<
    "all" | "perks" | "vouchers" | "weekly" | "three_day" | "daily" | "cosmetics" | "pro" | "credits"
  >("all");

  const [isQuestsModalOpen, setIsQuestsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<SparksShopItem | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccessData, setRedeemSuccessData] = useState<{
    item: SparksShopItem;
    voucherCode?: string;
  } | null>(null);
  const [hasCopiedVoucher, setHasCopiedVoucher] = useState(false);
  const [isActivatingVoucher, setIsActivatingVoucher] = useState(false);
  const [voucherActivatedSuccess, setVoucherActivatedSuccess] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // User-chosen Target Goal Tracking (defaults to null if not chosen)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isGoalPickerOpen, setIsGoalPickerOpen] = useState(false);
  const [isIndia, setIsIndia] = useState<boolean>(() => getIsIndia());

  useEffect(() => {
    let active = true;
    fetch("/api/billing/market", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (active && (data?.market === "IN" || data?.market === "GLOBAL")) {
          setIsIndia(data.countryCode === "UNKNOWN" ? getIsIndia() : data.market === "IN");
        }
      })
      .catch(() => {
        if (active) setIsIndia(getIsIndia());
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("exismic:sparks_target_goal_id");
      if (stored) {
        setSelectedGoalId(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectGoal = (itemId: string | null) => {
    soundController.playClick();
    setSelectedGoalId(itemId);
    setIsGoalPickerOpen(false);
    try {
      if (itemId) {
        localStorage.setItem("exismic:sparks_target_goal_id", itemId);
      } else {
        localStorage.removeItem("exismic:sparks_target_goal_id");
      }
    } catch {
      // ignore
    }
  };

  const selectedGoal = useMemo(() => {
    if (!selectedGoalId) return null;
    return catalog.find((i) => i.id === selectedGoalId) || null;
  }, [catalog, selectedGoalId]);

  const goalProgress = useMemo(() => {
    if (!selectedGoal) return { current: 0, target: 100, percentage: 0, remaining: 0 };
    const current = sparks;
    const target = selectedGoal.costSparks;
    const percentage = Math.min(100, Math.round((current / target) * 100));
    const remaining = Math.max(0, target - current);
    return { current, target, percentage, remaining };
  }, [sparks, selectedGoal]);

  const isItemOwned = (item: SparksShopItem) => {
    if (item.type === "avatar_frame") return unlockedAvatarFrames.includes(String(item.value));
    if (item.type === "name_gradient") return unlockedNameGradients.includes(String(item.value));
    if (item.type === "creator_insignia") return unlockedInsignias.includes(String(item.value));
    if (item.type === "studio_canopy") return unlockedCanopies.includes(String(item.value));
    return false;
  };

  const filteredItems = useMemo(() => {
    let baseList = catalog;
    if (activeCategory === "perks") baseList = catalog.filter((i) => i.category === "perks");
    else if (activeCategory === "vouchers") baseList = catalog.filter((i) => i.category === "vouchers");
    else if (activeCategory === "cosmetics") baseList = catalog.filter((i) => i.category === "cosmetic");
    else if (activeCategory === "weekly") baseList = weeklyLegendaryItems;
    else if (activeCategory === "three_day") baseList = threeDayEpicItems;
    else if (activeCategory === "daily") baseList = dailyRareItems;
    else if (activeCategory === "pro") baseList = catalog.filter((i) => i.category === "pro");
    else if (activeCategory === "credits") baseList = catalog.filter((i) => i.category === "credits");

    // Filter out already claimed free sparks or expired event
    return baseList.filter((item) => {
      if (item.id === "sparks_free_gift_100" || item.type === "free_sparks") {
        if (hasClaimedFreeSparks) return false;
        if (now > FREE_SPARKS_GIFT_EXPIRES_AT.getTime()) return false;
        return true;
      }
      return !isItemOwned(item);
    });
  }, [
    catalog,
    activeCategory,
    weeklyLegendaryItems,
    threeDayEpicItems,
    dailyRareItems,
    unlockedAvatarFrames,
    unlockedNameGradients,
    unlockedInsignias,
    unlockedCanopies,
    hasClaimedFreeSparks,
    now,
  ]);

  const handleToggleMute = () => {
    const muted = soundController.toggleMute();
    setIsMuted(muted);
  };

  const formatVoucherCountdown = (remainingMs: number): string => {
    if (remainingMs <= 0) return "";
    const totalSec = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const handleOpenRedeemModal = (item: SparksShopItem) => {
    soundController.playClick();
    if (!user) {
      router.push("/auth/signin?next=/rewards");
      return;
    }
    if (item.type === "shop_voucher" && voucherCooldowns?.[item.id]) {
      const remaining = new Date(voucherCooldowns[item.id].availableAt).getTime() - Date.now();
      if (remaining > 0) return;
    }
    setSelectedReward(item);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;
    setIsRedeeming(true);
    soundController.playClick();

    try {
      const result = await redeemItem(selectedReward.id);
      if (result.success) {
        soundController.playExplosion(
          selectedReward.rarity === "Mythic" || selectedReward.rarity === "Legendary"
            ? "legendary"
            : "epic"
        );
        confetti({
          particleCount: selectedReward.rarity === "Mythic" ? 160 : 100,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#f59e0b", "#38bdf8", "#ec4899", "#a855f7", "#ffffff"],
        });
        const voucherCode = (result.details as Record<string, unknown> | undefined)?.voucherCode as string | undefined;
        setRedeemSuccessData({
          item: selectedReward,
          voucherCode,
        });
        setHasCopiedVoucher(false);
        setVoucherActivatedSuccess(false);
        setSelectedReward(null);
        void refreshCredits();
      } else {
        alert(result.error || "Redemption could not be processed.");
      }
    } catch {
      alert("Network error during redemption.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCopyVoucher = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setHasCopiedVoucher(true);
      soundController.playClick();
      setTimeout(() => setHasCopiedVoucher(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleActivateVoucher = async (code: string) => {
    setIsActivatingVoucher(true);
    soundController.playClick();
    try {
      const res = await fetch("/api/user/promos/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVoucherActivatedSuccess(true);
        void refreshCredits();
        soundController.playExplosion("legendary");
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#f59e0b", "#38bdf8", "#ec4899", "#ffffff"],
        });
      } else {
        alert(data.error || "Could not activate pass code.");
      }
    } catch {
      alert("Network error activating pass code.");
    } finally {
      setIsActivatingVoucher(false);
    }
  };

  const handleToggleCosmetic = async (item: SparksShopItem, isEquipped: boolean) => {
    soundController.playClick();
    if (item.type === "avatar_frame") {
      await equipCosmetic("avatar_frame", isEquipped ? null : String(item.value));
    } else if (item.type === "name_gradient") {
      await equipCosmetic("name_gradient", isEquipped ? null : String(item.value));
    } else if (item.type === "creator_insignia") {
      await equipCosmetic("creator_insignia", isEquipped ? null : String(item.value));
    } else if (item.type === "studio_canopy") {
      await equipCosmetic("studio_canopy", isEquipped ? null : String(item.value));
    }
  };

  const displayUserName = user?.user_metadata?.full_name || user?.user_metadata?.name || "CREATOR";
  const displayAvatarUrl =
    user?.user_metadata?.custom_avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayUserName)}&backgroundColor=0c0e18`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] px-4 pb-24 pt-4 sm:pt-6 lg:pt-7 text-white selection:bg-amber-500/30 sm:px-6 lg:px-8">
      {/* Background Mesh VFX */}
      <RewardsBackgroundVFX />

      {/* Cyber Glow Ambient Orbs */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-0 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.18),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[680px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12),transparent_66%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px] opacity-35" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl space-y-5 sm:space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <PageBreadcrumb items={[{ label: "Sparks Exchange Vault" }]} />
          <button
            onClick={handleToggleMute}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-zinc-400 backdrop-blur-md transition-all hover:border-amber-400/40 hover:text-amber-300 cursor-pointer"
            title={isMuted ? "Enable Sound Effects" : "Mute Sound Effects"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-amber-400 animate-pulse" />}
            <span>{isMuted ? "Muted" : "Audio FX"}</span>
          </button>
        </div>

        {/* Hero Section */}
        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md"
            >
              <SparkIcon size={15} variant="amber" animated />
              <span>Exismic Sparks Exchange</span>
            </motion.div>
            <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.88] tracking-tight sm:text-7xl lg:text-8xl">
              Spend your{" "}
              <span className="block bg-[linear-gradient(110deg,#ffffff,#fde047,#fbbf24,#f59e0b,#ffffff)] bg-[length:240%_100%] bg-clip-text text-transparent animate-[gradient-shift_8s_ease-in-out_infinite]">
                Exismic Sparks.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-zinc-400 sm:text-lg">
              Earn Sparks by completing daily quests. Spend them on Pro passes, credits, avatar frames, and custom name styles.
            </p>

            {/* Quick Actions Row */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsQuestsModalOpen(true)}
                className="group/btn inline-flex items-center gap-2.5 rounded-2xl border border-amber-400/45 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-orange-500/20 px-5 py-3 text-xs font-black uppercase tracking-wider text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.25)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-amber-300 hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer"
              >
                <Trophy size={16} className="text-amber-300 group-hover/btn:rotate-12 transition-transform" />
                <span>Earn Sparks via Quests</span>
                <ChevronRight size={14} className="text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.06] px-4 py-3 text-xs font-black uppercase tracking-wider text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.15)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-400/15 hover:text-white active:scale-95"
              >
                <Coins size={15} className="text-cyan-300" />
                <span>Instant Credits</span>
              </Link>

              <Link
                href="/rewards/guide"
                className="inline-flex items-center gap-2 rounded-2xl border border-purple-400/30 bg-purple-500/[0.08] px-4 py-3 text-xs font-black uppercase tracking-wider text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-xl transition-all duration-300 hover:border-purple-300 hover:bg-purple-500/20 hover:text-white active:scale-95"
              >
                <HelpCircle size={15} className="text-purple-300" />
                <span>Guide & Policy</span>
              </Link>
            </div>
          </div>

          {/* Treasury HUD Card */}
          <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-amber-400/50 bg-gradient-to-br from-[#120c06]/98 via-[#090603]/98 to-[#030201]/98 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.85),0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-3xl sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-cyan-500/15 blur-3xl" />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,1)]" />
                  <span>Available Sparks</span>
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <p className="bg-gradient-to-r from-white via-amber-100 to-yellow-200 bg-clip-text text-5xl font-black tracking-tight text-transparent drop-shadow-[0_0_35px_rgba(245,158,11,0.35)] sm:text-6xl">
                    {sparks.toLocaleString()}
                  </p>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400/90">
                    Sparks
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-amber-400 shrink-0" />
                  Earned from Quests • Ready to Spend
                </p>
              </div>

              {/* 3D Custom Spark Insignia */}
              <div className="relative group/emblem shrink-0">
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-yellow-500/30 blur-xl transition-all duration-500 group-hover/emblem:opacity-100 opacity-60" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-400/40 bg-gradient-to-br from-[#1c1206]/95 via-[#100a03]/98 to-[#040301]/98 shadow-[0_12px_35px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.25),0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-xl transition-transform duration-500 group-hover/emblem:scale-105">
                  <SparkIcon size={44} variant="amber" animated />
                </div>
              </div>
            </div>

            {/* Interactive Target Goal Selector / Tracker */}
            <div className="relative z-10 mt-6 rounded-2xl border border-amber-400/20 bg-black/40 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Target size={14} className="text-amber-400 shrink-0" />
                  <span className="font-bold text-zinc-400 shrink-0">Savings Goal:</span>
                  {selectedGoal ? (
                    <span className="font-black text-amber-300 truncate">
                      {selectedGoal.title}
                    </span>
                  ) : (
                    <span className="text-zinc-500 italic text-xs truncate">
                      No target set — save freely or pick any reward
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedGoal && (
                    <span className="font-black text-amber-400 font-mono">
                      {goalProgress.percentage}%
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsGoalPickerOpen(!isGoalPickerOpen)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-400/30 bg-amber-400/10 text-[10px] font-black uppercase tracking-wider text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer"
                  >
                    <span>{selectedGoal ? "Change" : "Set Goal"}</span>
                    <ChevronDown size={11} className={cn("transition-transform", isGoalPickerOpen && "rotate-180")} />
                  </button>
                </div>
              </div>

              {/* Goal Picker Dropdown */}
              <AnimatePresence>
                {isGoalPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden border-t border-white/10 pt-3 space-y-2"
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Sparks Vault
                      </p>
                      <p className="text-sm font-black text-white">
                        {unlockedAvatarFrames.length + unlockedNameGradients.length} Owned
                      </p>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {selectedGoalId && (
                        <button
                          type="button"
                          onClick={() => handleSelectGoal(null)}
                          className="w-full flex items-center justify-between p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-left text-xs text-zinc-400 transition-colors cursor-pointer"
                        >
                          <span>✕ Clear Tracked Goal (Free Spending)</span>
                        </button>
                      )}
                      {catalog.filter((item) => !isItemOwned(item)).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectGoal(item.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-2 rounded-xl border text-left text-xs transition-all cursor-pointer",
                            selectedGoalId === item.id
                              ? "border-amber-400/60 bg-amber-500/15 text-amber-200 font-bold"
                              : "border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-black truncate">{item.title}</span>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">({item.category})</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 text-amber-300 font-black text-[11px] font-mono">
                            <SparkIcon size={12} variant="amber" />
                            <span>{item.costSparks.toLocaleString()}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Bar (if a goal is selected) */}
              {selectedGoal && (
                <>
                  <div className="relative mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${goalProgress.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <span>
                      {sparks.toLocaleString()} / {selectedGoal.costSparks.toLocaleString()} Sparks
                    </span>
                    <span>
                      {goalProgress.remaining > 0
                        ? `${goalProgress.remaining.toLocaleString()} more needed`
                        : "Ready to redeem!"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Micro Stats Row: Replaced AI Sparkles with Luxury Gem & Wardrobe Insignias */}
            <div className="relative z-10 mt-4 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md">
                <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                  Lifetime Accumulated
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <SparkIcon size={14} variant="amber" />
                  <span className="text-lg font-black text-white">
                    {lifetimeSparks.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md">
                <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                  Cosmetics Unlocked
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Gem size={15} className="text-fuchsia-400 fill-fuchsia-400/25" />
                  <span className="text-lg font-black text-white">
                    {unlockedAvatarFrames.length + unlockedNameGradients.length} Owned
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category & Rotation Filter Tabs */}
        <section className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scrollbar-none">
            {(
              [
                { id: "all", label: "All Rewards", icon: Layers },
                { id: "weekly", label: `Weekly Vault (${weeklyLegendaryItems.length})`, icon: Crown },
                { id: "three_day", label: `3-Day Vault (${threeDayEpicItems.length})`, icon: Zap },
                { id: "daily", label: `Daily Drops (${dailyRareItems.length})`, icon: RotateCcw },
                { id: "perks", label: "Perks & Shields", icon: ShieldCheck },
                { id: "vouchers", label: "Shop Vouchers", icon: Ticket },
                { id: "cosmetics", label: "All Cosmetics", icon: Gem },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundController.playHover();
                    setActiveCategory(tab.id);
                  }}
                  className={cn(
                    "group relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap",
                    isActive
                      ? "border border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                      : "border border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                  )}
                >
                  <Icon
                    size={14}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-amber-400" : "text-zinc-400 group-hover:text-zinc-200"
                    )}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Reward Cards Grid */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => {
            const style = cardStyles[item.accentColor] || cardStyles.amber;
            const isAffordable = sparks >= item.costSparks;
            const isTarget = selectedGoalId === item.id;

            // Cosmetic Ownership
            const isUnlocked = isItemOwned(item);

            const isEquipped =
              item.type === "avatar_frame"
                ? activeAvatarFrame === item.value
                : item.type === "name_gradient"
                ? activeNameGradient === item.value
                : item.type === "creator_insignia"
                ? activeInsignia === item.value
                : item.type === "studio_canopy"
                ? activeCanopy === item.value
                : false;

            // Rotation reset countdown label
            const rotationCountdown =
              item.rotationTier === "weekly"
                ? `Resets in ${timers.weeklyCountdown}`
                : item.rotationTier === "three_day"
                ? `Resets in ${timers.threeDayCountdown}`
                : item.rotationTier === "daily"
                ? `Resets in ${timers.dailyCountdown}`
                : null;

            // Voucher weekly purchase cooldown
            const cooldownInfo = item.type === "shop_voucher" ? voucherCooldowns?.[item.id] : null;
            const remainingCooldownMs = cooldownInfo
              ? Math.max(0, new Date(cooldownInfo.availableAt).getTime() - now)
              : 0;
            const isOnVoucherCooldown = remainingCooldownMs > 0;
            const voucherCooldownText = isOnVoucherCooldown ? formatVoucherCountdown(remainingCooldownMs) : null;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={cn(
                  "group/card relative flex flex-col justify-between overflow-hidden rounded-[2.25rem] p-1.5 backdrop-blur-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_90px_rgba(0,0,0,0.95)]",
                  style.cardBorder
                )}
              >
                {/* Ambient Card Glow */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-65 transition-opacity duration-300 group-hover/card:opacity-100",
                    style.ambientGradient
                  )}
                />

                <div className="relative z-10 p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Top Row: Rarity + Rotation Timer Badge + Target Pin */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider",
                            item.rarity === "Legendary"
                              ? "border-amber-400/50 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                              : item.rarity === "Epic"
                              ? "border-purple-400/50 bg-purple-500/20 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                              : item.rarity === "Rare"
                              ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
                              : item.rarity === "Mythic"
                              ? "border-pink-400/50 bg-pink-500/20 text-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.25)]"
                              : "border-white/10 bg-white/[0.04] text-zinc-300"
                          )}
                        >
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            item.rarity === "Legendary" ? "bg-amber-400 animate-pulse" :
                            item.rarity === "Epic" ? "bg-purple-400 animate-pulse" :
                            item.rarity === "Mythic" ? "bg-pink-400 animate-pulse" :
                            "bg-cyan-400"
                          )} />
                          {item.rarity}
                        </span>

                        {item.type === "free_sparks" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-950/80 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                            <Clock size={10} className="text-amber-400 animate-pulse" />
                            Ends in {formatTimeRemaining(FREE_SPARKS_GIFT_EXPIRES_AT, new Date(now))}
                          </span>
                        )}

                        {rotationCountdown && item.type !== "free_sparks" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/50 px-2.5 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider text-zinc-300 shadow-sm">
                            <Clock size={10} className="text-amber-400 animate-pulse" />
                            {rotationCountdown}
                          </span>
                        )}

                        {item.type === "shop_voucher" && isOnVoucherCooldown && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/50 bg-purple-950/85 px-2.5 py-0.5 text-[9px] font-black font-mono uppercase tracking-wider text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
                            <Clock size={10} className="text-purple-400 animate-pulse" />
                            Restocks in {voucherCooldownText}
                          </span>
                        )}

                        {item.type === "shop_voucher" && !isOnVoucherCooldown && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/40 bg-purple-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-300">
                            Limit: 1/Week
                          </span>
                        )}

                        {item.popular && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-pink-400/40 bg-pink-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-pink-300 shadow-[0_0_10px_rgba(244,114,182,0.2)]">
                            <Flame size={10} className="fill-pink-400/40" /> Top Pick
                          </span>
                        )}
                      </div>

                      {/* Goal Pin Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          soundController.playClick();
                          setSelectedGoalId(item.id);
                        }}
                        className={cn(
                          "rounded-xl px-2.5 py-1 transition-all cursor-pointer flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider border",
                          isTarget
                            ? "bg-amber-400/25 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border-white/5"
                        )}
                        title={isTarget ? "Target goal active (Click to untrack)" : "Track as primary savings goal"}
                      >
                        <Target size={11} className={isTarget ? "text-amber-400 animate-pulse" : ""} />
                        <span className="hidden sm:inline">{isTarget ? "Tracked" : "Goal"}</span>
                      </button>
                    </div>

                    {/* Middle: Visual Showcase Presentation */}
                    {item.type === "name_gradient" ? (
                      /* HOLOGRAPHIC NAME STAGE */
                      <div className="my-4 space-y-3">
                        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#0e101f]/90 to-[#05060d]/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl group/stage flex flex-col justify-between min-h-[155px]">
                          {/* Inner radiant glow */}
                          <div
                            className={cn(
                              "pointer-events-none absolute -inset-10 rounded-full opacity-30 blur-2xl transition-opacity duration-500 group-hover/stage:opacity-60 bg-gradient-to-r",
                              style.ambientGradient
                            )}
                          />

                          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/[0.06]">
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              Name Preview
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                              {item.rarity}
                            </span>
                          </div>

                          {/* Huge, Radiant, High-Impact Name Style Preview */}
                          <div className="relative z-10 my-2 text-center py-2 overflow-visible">
                            <PremiumName
                              name={displayUserName}
                              isPro={true}
                              gradientId={String(item.value)}
                              className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-normal"
                            />
                          </div>

                          <div className="relative z-10 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[9px] font-medium text-zinc-400">
                            <span className="truncate max-w-[150px]">{item.subtitle}</span>
                            <span className="text-zinc-500">Profile Name Style</span>
                          </div>
                        </div>

                        <div>
                          <p className={cn("text-[10px] font-black uppercase tracking-[0.18em]", style.subtitleColor)}>
                            {item.subtitle}
                          </p>
                          <h3 className={cn("mt-0.5 text-base font-black text-white transition-colors duration-200", style.titleHoverColor)}>
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ) : item.type === "avatar_frame" ? (
                      /* LUXURY CENTERED AVATAR FRAME PEDESTAL STAGE */
                      <div className="my-4 space-y-3">
                        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#0e101f]/90 to-[#05060d]/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl group/stage flex flex-col justify-between min-h-[155px]">
                          {/* Ambient halo behind avatar */}
                          <div
                            className={cn(
                              "pointer-events-none absolute -inset-10 rounded-full opacity-35 blur-2xl transition-opacity duration-500 group-hover/stage:opacity-70 bg-gradient-to-b",
                              style.ambientGradient
                            )}
                          />

                          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/[0.06]">
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Frame Preview
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                              {item.rarity}
                            </span>
                          </div>

                          {/* Centered Avatar Preview */}
                          <div className="relative z-10 my-2 flex items-center justify-center py-1">
                            <div className="relative flex items-center justify-center transition-transform duration-300 group-hover/stage:scale-105">
                              <AvatarWithFrame
                                size={72}
                                frameId={String(item.value)}
                                displayName={displayUserName}
                                avatarUrl={displayAvatarUrl}
                                isPro={true}
                              />
                            </div>
                          </div>

                          <div className="relative z-10 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[9px] font-medium text-zinc-400">
                            <span className="truncate max-w-[150px]">{displayUserName}</span>
                            <span className="text-zinc-500">Profile Avatar</span>
                          </div>
                        </div>

                        <div>
                          <p className={cn("text-[10px] font-black uppercase tracking-[0.18em]", style.subtitleColor)}>
                            {item.subtitle}
                          </p>
                          <h3 className={cn("mt-0.5 text-base font-black text-white transition-colors duration-200", style.titleHoverColor)}>
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ) : item.type === "creator_insignia" ? (
                      /* APEX CREATOR INSIGNIA STAGE */
                      <div className="my-4 space-y-3">
                        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#0e101f]/90 to-[#05060d]/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl group/stage flex flex-col justify-between min-h-[155px]">
                          <div
                            className={cn(
                              "pointer-events-none absolute -inset-10 rounded-full opacity-35 blur-2xl transition-opacity duration-500 group-hover/stage:opacity-70 bg-gradient-to-b",
                              style.ambientGradient
                            )}
                          />
                          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/[0.06]">
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              Badge Preview
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                              {item.rarity}
                            </span>
                          </div>

                          <div className="relative z-10 my-1 flex flex-col items-center justify-center py-2 gap-2">
                            <div className="p-3 rounded-2xl bg-black/60 border border-white/15 shadow-2xl">
                              <CreatorInsignia insigniaId={String(item.value)} size="xl" showTooltip={false} />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white">{displayUserName}</span>
                              <CreatorInsignia insigniaId={String(item.value)} size="sm" showTooltip={false} />
                            </div>
                          </div>

                          <div className="relative z-10 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[9px] font-medium text-zinc-400">
                            <span className="truncate max-w-[150px]">{item.subtitle}</span>
                            <span className="text-zinc-500">Beside Username</span>
                          </div>
                        </div>

                        <div>
                          <p className={cn("text-[10px] font-black uppercase tracking-[0.18em]", style.subtitleColor)}>
                            {item.subtitle}
                          </p>
                          <h3 className={cn("mt-0.5 text-base font-black text-white transition-colors duration-200", style.titleHoverColor)}>
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* STREAK SHIELDS, VOUCHERS, PERKS & LEGACY VIP ACCESS STAGE */
                      <div className="my-4 space-y-3">
                        <div className={cn(
                          "relative overflow-hidden rounded-2xl border p-3.5 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_20px_45px_rgba(0,0,0,0.7)] backdrop-blur-xl group/stage flex flex-col justify-between min-h-[162px] transition-colors duration-300",
                          item.accentColor === "amber"
                            ? "border-amber-500/40 bg-gradient-to-b from-[#1e1105]/90 via-[#100802]/95 to-[#040200]/98"
                            : item.accentColor === "purple"
                            ? "border-purple-500/40 bg-gradient-to-b from-[#180b2a]/90 via-[#0c0516]/95 to-[#040208]/98"
                            : item.accentColor === "fuchsia"
                            ? "border-pink-500/40 bg-gradient-to-b from-[#1c0a22]/90 via-[#0e0511]/95 to-[#040105]/98"
                            : item.accentColor === "emerald"
                            ? "border-emerald-500/40 bg-gradient-to-b from-[#081a14]/90 via-[#030d0a]/95 to-[#010504]/98"
                            : "border-cyan-500/40 bg-gradient-to-b from-[#081824]/90 via-[#040e16]/95 to-[#010408]/98"
                        )}>
                          {/* Ambient radial glow matching rarity */}
                          <div
                            className={cn(
                              "pointer-events-none absolute -inset-6 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover/stage:opacity-75 bg-gradient-to-b",
                              style.ambientGradient
                            )}
                          />

                          {/* Top Row inside Stage: Badge + Tier */}
                          <div className="relative z-10 flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-300">
                              <span className={cn(
                                "h-1.5 w-1.5 rounded-full animate-pulse",
                                item.accentColor === "amber"
                                  ? "bg-amber-400"
                                  : item.accentColor === "purple"
                                  ? "bg-purple-400"
                                  : item.accentColor === "fuchsia"
                                  ? "bg-pink-400"
                                  : item.accentColor === "emerald"
                                  ? "bg-emerald-400"
                                  : "bg-cyan-400"
                              )} />
                              {item.type === "streak_shield"
                                ? "Streak Protection"
                                : item.type === "shop_voucher"
                                ? (Number(item.value) === 20 ? "Monthly Pro Voucher" : "Shop Voucher")
                                : item.type === "credits_emergency"
                                ? "Emergency Refuel"
                                : item.category === "pro"
                                ? "Pro Pass"
                                : "Credits"}
                            </span>
                            <span className={cn(
                              "text-[9px] font-mono font-black uppercase tracking-wider",
                              item.accentColor === "amber"
                                ? "text-amber-300"
                                : item.accentColor === "purple"
                                ? "text-purple-300"
                                : item.accentColor === "fuchsia"
                                ? "text-pink-300"
                                : item.accentColor === "emerald"
                                ? "text-emerald-300"
                                : "text-cyan-300"
                            )}>
                              {item.rarity}
                            </span>
                          </div>

                          {/* Center: Open, Radiant Trophy / Shield / Voucher Emblem */}
                          {item.type === "free_sparks" ? (
                            <div className="relative z-10 my-2 flex flex-col items-center justify-center py-1 gap-2 text-center">
                              <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl border border-amber-400/70 bg-gradient-to-br from-amber-500/40 via-yellow-950/60 to-black/85 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-transform duration-300 group-hover/stage:scale-110">
                                <Gift size={28} className="fill-amber-400/25 text-amber-300 drop-shadow-lg" />
                              </div>

                              <div className="flex flex-col items-center">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xl sm:text-2xl font-black tracking-tight text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] font-mono">
                                    +100
                                  </span>
                                  <span className="text-xs font-black uppercase tracking-wider text-white">
                                    Sparks
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold text-amber-200/90 uppercase tracking-wider mt-0.5">
                                  Special Gift · Available for 7 Days
                                </span>
                              </div>
                            </div>
                          ) : item.type === "streak_shield" ? (
                            <div className="relative z-10 my-2 flex flex-col items-center justify-center py-1 gap-2 text-center">
                              <div className={cn(
                                "relative flex h-13 w-13 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover/stage:scale-110",
                                item.accentColor === "amber"
                                  ? "border-amber-400/60 bg-gradient-to-br from-amber-500/30 to-orange-950/60 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.4)]"
                                  : "border-cyan-400/60 bg-gradient-to-br from-cyan-500/30 to-blue-950/60 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.4)]"
                              )}>
                                <ShieldCheck size={26} className={cn(
                                  "drop-shadow-md",
                                  item.accentColor === "amber" ? "fill-amber-400/20 text-amber-300" : "fill-cyan-400/20 text-cyan-300"
                                )} />
                              </div>

                              <div className="flex flex-col items-center">
                                <span className={cn(
                                  "text-sm sm:text-base font-black uppercase tracking-wide",
                                  item.accentColor === "amber"
                                    ? "text-amber-100 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                                    : "text-cyan-100 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                                )}>
                                  {Number(item.value) > 1 ? `+${item.value} Streak Shields (Bundle)` : "+1 Streak Shield"}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                                  Auto-Preserve Streak · Never Expires
                                </span>
                              </div>
                            </div>
                          ) : item.type === "shop_voucher" ? (
                            <div className="relative z-10 my-2 flex flex-col items-center justify-center py-1 gap-2 text-center">
                              <div className={cn(
                                "relative flex h-13 w-13 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover/stage:scale-110",
                                item.accentColor === "fuchsia"
                                  ? "border-pink-400/60 bg-gradient-to-br from-pink-500/30 to-rose-950/60 text-pink-300 shadow-[0_0_25px_rgba(244,114,182,0.4)]"
                                  : "border-purple-400/60 bg-gradient-to-br from-purple-500/30 to-fuchsia-950/60 text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                              )}>
                                <Ticket size={26} className={cn(
                                  "drop-shadow-md",
                                  item.accentColor === "fuchsia" ? "fill-pink-400/20 text-pink-300" : "fill-purple-400/20 text-purple-300"
                                )} />
                              </div>

                              <div className="flex flex-col items-center">
                                <span className={cn(
                                  "text-sm sm:text-base font-black uppercase tracking-wide",
                                  item.accentColor === "fuchsia"
                                    ? "text-pink-100 drop-shadow-[0_0_10px_rgba(244,114,182,0.6)]"
                                    : "text-purple-100 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                                )}>
                                  {Number(item.value) === 20 ? "20% OFF Pro Pass" : (isIndia ? "₹100 OFF" : "$1.50 OFF")}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                                  {Number(item.value) === 20
                                    ? "Monthly Pro Pass · Single Use"
                                    : (isIndia ? "Single-Use Coupon · Min Order ₹249" : "Single-Use Coupon · Min Order $3.00")}
                                </span>
                              </div>
                            </div>
                          ) : item.type === "credits_emergency" ? (
                            <div className="relative z-10 my-2 flex flex-col items-center justify-center py-1 gap-2 text-center">
                              <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl border border-emerald-400/60 bg-gradient-to-br from-emerald-500/30 to-teal-950/60 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-transform duration-300 group-hover/stage:scale-110">
                                <Zap size={26} className="fill-emerald-400/20 drop-shadow-md" />
                              </div>

                              <div className="flex flex-col items-center">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.7)] font-mono">
                                    +25
                                  </span>
                                  <span className="text-xs font-black uppercase tracking-wider text-white">
                                    Credits
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                                  Emergency Refuel · 24h Pass
                                </span>
                              </div>
                            </div>
                          ) : item.category === "pro" ? (
                            <div className="relative z-10 my-2 flex flex-col items-center justify-center py-1 gap-2 text-center">
                              <div className={cn(
                                "relative flex h-13 w-13 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover/stage:scale-110",
                                style.iconBg
                              )}>
                                <Crown size={26} className="fill-current drop-shadow-md" />
                              </div>

                              <div className="flex flex-col items-center">
                                <div className="flex items-baseline gap-1.5">
                                  <span className={cn("text-xl sm:text-2xl font-black tracking-tight font-mono", style.iconColor)}>
                                    +{item.value}h
                                  </span>
                                  <span className="text-xs font-black uppercase tracking-wider text-white">
                                    Pro Access
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                                  Digital Pass · VIP Creator
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="relative z-10 my-2 flex flex-col items-center justify-center py-1 gap-2 text-center">
                              <div className={cn(
                                "relative flex h-13 w-13 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover/stage:scale-110",
                                style.iconBg
                              )}>
                                <Coins size={26} className="fill-current drop-shadow-md" />
                              </div>

                              <div className="flex flex-col items-center">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xl sm:text-2xl font-black tracking-tight text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] font-mono">
                                    +{item.value}
                                  </span>
                                  <span className="text-xs font-black uppercase tracking-wider text-white">
                                    Credits
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                                  Permanent Balance · Never Expires
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Stage Footer Row */}
                          <div className="relative z-10 flex items-center justify-between border-t border-white/[0.08] pt-1.5 text-[8.5px] font-bold uppercase tracking-wider text-zinc-400">
                            <span className="flex items-center gap-1.5 text-zinc-300">
                              {item.type === "free_sparks" ? (
                                <Gift size={11} className="text-amber-300" />
                              ) : item.type === "streak_shield" ? (
                                <ShieldCheck size={11} className={item.accentColor === "amber" ? "text-amber-300" : "text-cyan-300"} />
                              ) : item.type === "shop_voucher" ? (
                                <Ticket size={11} className={item.accentColor === "fuchsia" ? "text-pink-300" : "text-purple-300"} />
                              ) : item.type === "credits_emergency" ? (
                                <Zap size={11} className="text-emerald-300" />
                              ) : item.category === "pro" ? (
                                <Crown size={11} className={item.rarity === "Mythic" ? "text-pink-300" : item.rarity === "Epic" ? "text-purple-300" : "text-amber-300"} />
                              ) : (
                                <Coins size={11} className="text-cyan-300" />
                              )}
                              <span>
                                {item.type === "free_sparks"
                                  ? "One-Time Free Gift"
                                  : item.type === "streak_shield"
                                  ? `Shield Vault: ${(streakShields ?? 0)}/3`
                                  : item.type === "shop_voucher"
                                  ? (Number(item.value) === 20 ? "Monthly Pro Pass" : "Shop Coupon")
                                  : item.type === "credits_emergency"
                                  ? "Emergency Refuel"
                                  : item.category === "pro"
                                  ? "Digital Pass"
                                  : "Account Top-Up"}
                              </span>
                            </span>
                            <span className={cn(
                              "font-black font-mono",
                              item.type === "free_sparks"
                                ? "text-emerald-300"
                                : item.accentColor === "amber"
                                ? "text-amber-300"
                                : item.accentColor === "purple"
                                ? "text-purple-300"
                                : item.accentColor === "fuchsia"
                                ? "text-pink-300"
                                : item.accentColor === "emerald"
                                ? "text-emerald-300"
                                : "text-cyan-300"
                            )}>
                              {item.type === "free_sparks" ? "100% FREE" : "INSTANT DELIVERY"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className={cn("text-[10px] font-black uppercase tracking-[0.18em]", style.subtitleColor)}>
                            {item.subtitle}
                          </p>
                          <h3 className={cn("mt-0.5 text-base font-black text-white transition-colors duration-200", style.titleHoverColor)}>
                            {item.type === "shop_voucher" && Number(item.value) === 100
                              ? (isIndia ? "₹100 OFF Shop Voucher" : "$1.50 OFF Shop Voucher")
                              : item.title}
                          </h3>
                          <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-400">
                            {item.type === "shop_voucher" && Number(item.value) === 100
                              ? (isIndia
                                  ? "Generates a single-use coupon code valid for ₹100 off purchases of ₹249 or more in the Shop."
                                  : "Generates a single-use coupon code valid for $1.50 off purchases of $3.00 or more in the Shop.")
                              : item.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Price and Redeem/Equip/Remove Action */}
                  <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                          Price
                        </span>
                        {!isUnlocked && (
                          <button
                            type="button"
                            onClick={() => handleSelectGoal(selectedGoalId === item.id ? null : item.id)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer",
                              selectedGoalId === item.id
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                                : "bg-white/[0.04] text-zinc-400 hover:text-white border border-white/5 hover:border-white/20"
                            )}
                            title={selectedGoalId === item.id ? "Click to untrack goal" : "Track this item as your savings goal in the HUD"}
                          >
                            <Target size={10} className={selectedGoalId === item.id ? "text-amber-400" : ""} />
                            <span>{selectedGoalId === item.id ? "Tracked" : "Track Goal"}</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.type === "free_sparks" || item.costSparks === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                            FREE
                          </span>
                        ) : (
                          <>
                            <SparkIcon size={16} variant="amber" />
                            <span className="text-xl font-black text-white">
                              {item.costSparks.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Button: Handles Redeem, Equip, and Remove (Unequip) */}
                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleToggleCosmetic(item, isEquipped)}
                        disabled={equippingId === item.id || equippingId === "removing"}
                        className={cn(
                          "group/equip inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95",
                          isEquipped
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:border-rose-400/50 hover:bg-rose-500/15 hover:text-rose-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            : "border-purple-400/40 bg-purple-500/20 text-purple-200 hover:border-purple-400 hover:bg-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        )}
                        title={isEquipped ? "Click to Remove / Unequip" : "Equip to Profile"}
                      >
                        {equippingId === item.id || equippingId === "removing" ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : isEquipped ? (
                          <>
                            <Check size={13} className="text-emerald-400 group-hover/equip:hidden" />
                            <X size={13} className="text-rose-400 hidden group-hover/equip:inline-block" />
                            <span className="group-hover/equip:hidden">Equipped</span>
                            <span className="hidden group-hover/equip:inline-block">Remove</span>
                          </>
                        ) : (
                          <>
                            <Gem size={13} />
                            <span>Equip</span>
                          </>
                        )}
                      </button>
                    ) : item.type === "free_sparks" ? (
                      <motion.button
                        type="button"
                        onClick={() => handleOpenRedeemModal(item)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group/btn relative flex items-center justify-center overflow-hidden rounded-[18px] p-[2px] isolate transition-all duration-300 cursor-pointer select-none shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)]"
                      >
                        <motion.span
                          aria-hidden="true"
                          className="absolute -inset-[150%] opacity-100 mix-blend-screen bg-[conic-gradient(from_0deg,rgba(245,158,11,1)_0%,rgba(234,179,8,1)_33%,rgba(251,191,36,1)_66%,rgba(245,158,11,1)_100%)]"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="relative flex items-center gap-2 rounded-[16px] border border-amber-400/50 bg-gradient-to-br from-[#1c1206]/98 to-[#0b0803]/98 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-200 backdrop-blur-xl">
                          <Gift size={14} className="text-amber-400" />
                          <span>Claim Gift</span>
                          <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform text-amber-400" />
                        </span>
                      </motion.button>
                    ) : item.type === "streak_shield" && (streakShields ?? 0) >= 3 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] select-none">
                        <ShieldCheck size={13} className="text-cyan-400" />
                        <span>Vault Full (3/3)</span>
                      </span>
                    ) : item.type === "shop_voucher" && isOnVoucherCooldown ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-purple-400/40 bg-purple-950/60 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)] select-none cursor-not-allowed">
                        <Clock size={13} className="text-purple-400 animate-pulse" />
                        <span>Restocks in {voucherCooldownText}</span>
                      </span>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={() => handleOpenRedeemModal(item)}
                        whileHover={isAffordable ? { scale: 1.02 } : undefined}
                        whileTap={isAffordable ? { scale: 0.98 } : undefined}
                        disabled={!isAffordable}
                        className={cn(
                          "group/btn relative flex items-center justify-center overflow-hidden rounded-[18px] p-[2px] isolate transition-all duration-300 cursor-pointer select-none",
                          isAffordable
                            ? "shadow-[0_0_25px_rgba(0,0,0,0.85)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]"
                            : "bg-zinc-800/80 text-zinc-500 opacity-60 cursor-not-allowed"
                        )}
                      >
                        {isAffordable && (
                          <motion.span
                            aria-hidden="true"
                            className={cn(
                              "absolute -inset-[150%] opacity-100 mix-blend-screen",
                              style.conicGradient
                            )}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          />
                        )}

                        <span className="relative flex items-center gap-2 rounded-[16px] border border-white/10 bg-gradient-to-br from-[#0c0c12]/98 to-[#050508]/98 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white backdrop-blur-xl">
                          <SparkIcon size={14} variant="amber" />
                          <span>
                            {isAffordable
                              ? "Redeem"
                              : `Need ${(item.costSparks - sparks).toLocaleString()}`}
                          </span>
                          {isAffordable && (
                            <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                          )}
                        </span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Bottom Banner: Quests Accelerator */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/15 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <Trophy size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                  Want more Sparks?
                </h3>
                <p className="mt-1 text-sm font-medium text-zinc-300">
                  Daily quests give 10–25 Sparks each. Weekly quests give up to 100 Sparks. Zero money required.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsQuestsModalOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-amber-400/50 bg-amber-400 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:bg-amber-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <SparkIcon size={16} variant="amber" />
              <span>Open Creator Quests</span>
            </button>
          </div>
        </section>
      </main>

      {/* Daily Quests Modal */}
      <DailyQuestsModal
        isOpen={isQuestsModalOpen}
        onClose={() => setIsQuestsModalOpen(false)}
      />

      {/* Redemption Confirmation Modal */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReward(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border-2 border-amber-400/50 bg-gradient-to-b from-[#140e06]/98 via-[#0b0803]/98 to-[#030201]/98 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_50px_rgba(245,158,11,0.25)] sm:p-8"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
                  <SparkIcon size={13} variant="amber" />
                  <span>{selectedReward.type === "free_sparks" ? "Claim Your Free Gift" : "Confirm Redemption"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReward(null)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/15 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  {selectedReward.type === "free_sparks" ? (
                    <Gift size={28} className="animate-bounce" style={{ animationDuration: "2s" }} />
                  ) : selectedReward.type === "streak_shield" ? (
                    <ShieldCheck size={28} />
                  ) : selectedReward.type === "shop_voucher" ? (
                    <Ticket size={28} />
                  ) : selectedReward.type === "credits_emergency" ? (
                    <Zap size={28} />
                  ) : selectedReward.category === "pro" ? (
                    <Crown size={28} />
                  ) : selectedReward.category === "cosmetic" ? (
                    <Palette size={28} />
                  ) : (
                    <Coins size={28} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{selectedReward.title}</h3>
                  <p className="text-xs text-zinc-400">{selectedReward.subtitle}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/50 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-400">Current Balance:</span>
                  <SparkBadge amount={sparks} size="sm" variant="amber" />
                </div>
                {selectedReward.type === "free_sparks" ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-400">Free Gift:</span>
                    <span className="font-black text-amber-300">+100 Sparks</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-400">Redemption Cost:</span>
                    <span className="font-black text-rose-400">
                      -{selectedReward.costSparks.toLocaleString()} Sparks
                    </span>
                  </div>
                )}
                <div className="h-[1px] bg-white/10" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">New Balance:</span>
                  <SparkBadge
                    amount={
                      selectedReward.type === "free_sparks"
                        ? sparks + 100
                        : Math.max(0, sparks - selectedReward.costSparks)
                    }
                    size="sm"
                    variant="amber"
                  />
                </div>
              </div>

              {/* Clear Info Note */}
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-cyan-400/20 bg-cyan-950/20 p-3 text-xs text-cyan-200">
                <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  {selectedReward.type === "free_sparks"
                    ? "This gift is completely free for every creator! Claim your 100 Sparks once during this 7-day event."
                    : selectedReward.type === "streak_shield"
                    ? "This shield will automatically protect your daily streak if you ever miss logging in for a day (holds up to 3 shields total)."
                    : selectedReward.type === "shop_voucher"
                    ? "Generates an instant single-use discount coupon code that you can copy and redeem on your next Credit Pack or Pro Pass purchase in the Shop!"
                    : selectedReward.type === "credits_emergency"
                    ? "Adds 25 emergency compute credits immediately to your account to complete your current studio runs (valid for 24 hours)."
                    : selectedReward.type === "pro_pass"
                    ? `This pass provides full Pro access for ${selectedReward.value} hours.`
                    : selectedReward.category === "credits"
                    ? "Credits are added directly to your account immediately with zero cooldown."
                    : "Permanently unlocks this cosmetic in your profile closet. You can equip or remove it at any time."}
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReward(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmRedeem}
                  disabled={isRedeeming}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:bg-amber-300 active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <SparkIcon size={14} variant="amber" />
                      <span>{selectedReward.type === "free_sparks" ? "Claim 100 Free Sparks" : "Confirm Redemption"}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Redemption Success Celebration Modal */}
      <AnimatePresence>
        {redeemSuccessData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRedeemSuccessData(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border-2 border-amber-400/60 bg-gradient-to-b from-[#1c1206]/98 via-[#0e0903]/98 to-[#030201]/98 p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_60px_rgba(245,158,11,0.35)] sm:p-8"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-400/50 bg-gradient-to-br from-amber-500/30 to-yellow-500/10 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                {redeemSuccessData.item.type === "free_sparks" ? (
                  <Gift size={42} className="text-amber-400" />
                ) : (
                  <CheckCircle2 size={42} />
                )}
              </div>

              <h3 className="mt-5 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                {redeemSuccessData.item.type === "free_sparks"
                  ? "+100 Free Sparks Added!"
                  : redeemSuccessData.voucherCode
                  ? "Voucher Code Ready!"
                  : "Reward Claimed!"}
              </h3>
              <p className="mt-2 text-sm text-zinc-300 font-medium">
                {redeemSuccessData.item.type === "free_sparks" ? (
                  <>Enjoy your free gift! Your Sparks are ready to spend in the shop.</>
                ) : (
                  <>
                    You have successfully unlocked{" "}
                    <span className="font-bold text-amber-300">{redeemSuccessData.item.title}</span>!
                  </>
                )}
              </p>

              {/* Shop Voucher Box */}
              {redeemSuccessData.voucherCode && (
                <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-950/20 p-4 text-left">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400/80">
                    <span>
                      {redeemSuccessData.item.id === "sparks_shop_voucher_20pct"
                        ? "20% OFF Monthly Pro Code"
                        : "Shop Discount Code"}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      {redeemSuccessData.item.id === "sparks_shop_voucher_20pct"
                        ? "Monthly Pro Pass only"
                        : (isIndia ? "Min order ₹249" : "Min order $3.00")}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-amber-400/40 bg-black/60 px-3.5 py-2.5">
                    <span className="font-mono text-base font-black tracking-widest text-amber-300 select-all">
                      {redeemSuccessData.voucherCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyVoucher(redeemSuccessData.voucherCode!)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-400/20 active:scale-95 transition-all cursor-pointer"
                    >
                      {hasCopiedVoucher ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-[11px] text-zinc-400 leading-relaxed">
                    Paste this code in the coupon field at checkout in the Shop to receive your discount!
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2.5">
                {redeemSuccessData.voucherCode && (
                  <Link
                    href={redeemSuccessData.item.id === "sparks_shop_voucher_20pct" ? "/pro" : "/shop"}
                    onClick={() => setRedeemSuccessData(null)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-400 to-yellow-400 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:from-amber-300 hover:to-yellow-300 active:scale-95 cursor-pointer"
                  >
                    <Ticket size={14} className="fill-black" />
                    <span>Go to Shop to Use Code</span>
                  </Link>
                )}

                {voucherActivatedSuccess && (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 size={16} />
                    <span>Pro Pass Activated Successfully!</span>
                  </div>
                )}

                {redeemSuccessData.item.category === "cosmetic" && (
                  <button
                    type="button"
                    onClick={() => {
                      equipCosmetic(redeemSuccessData.item.type as "avatar_frame" | "name_gradient", String(redeemSuccessData.item.value));
                      setRedeemSuccessData(null);
                    }}
                    className="w-full rounded-xl border border-purple-400/50 bg-purple-500/20 py-3 text-xs font-black uppercase tracking-wider text-purple-200 hover:bg-purple-500/30 active:scale-95 cursor-pointer"
                  >
                    Equip to Profile Now
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setRedeemSuccessData(null)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-black uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
