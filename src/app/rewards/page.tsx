"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Star,
  Flame,
  Zap,
  Crown,
  CheckCircle2,
  Gift,
  ArrowRight,
  HelpCircle,
  BarChart2,
  Calendar,
  ExternalLink,
  Target,
  Trophy,
  Loader2,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Check,
  MessageSquare,
  Ticket,
  Copy,
  ArrowLeft,
  Coins,
  QrCode,
  Layers,
  ChevronUp,
  Volume2,
  VolumeX,
  Clock,
  Award,
  Radio,
  Cpu,
  RefreshCw,
  Compass,
  CheckCheck
} from "lucide-react";
import {
  RewardItem,
  EarningQuest,
  DailyPoll,
  RewardProfileData,
  REWARDS_CATALOG,
  EARNING_QUESTS,
} from "@/config/rewards";
import { cn } from "@/lib/utils";
import { RedeemPromoModal } from "@/components/modals/RedeemPromoModal";
import { RewardsBackgroundVFX } from "@/components/reward/RewardsBackgroundVFX";
import { TargetSelectorModal } from "@/components/reward/TargetSelectorModal";
import { soundController } from "@/components/reward/SoundController";

interface TriviaClientQuestion {
  id: number;
  question: string;
  options: string[];
}

export type ToastTopic =
  | "streak"
  | "trivia"
  | "poll"
  | "quest"
  | "vault"
  | "copy"
  | "target"
  | "sound"
  | "error"
  | "info";

export interface ToastPayload {
  title: string;
  message?: string;
  points?: string;
  topic?: ToastTopic;
  type?: "success" | "error" | "info";
}

export default function RewardsPage() {
  const router = useRouter();

  // Core States
  const [profile, setProfile] = useState<RewardProfileData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayTrivia, setTodayTrivia] = useState<TriviaClientQuestion[]>([]);
  const [todayPoll, setTodayPoll] = useState<DailyPoll | null>(null);
  const [catalog, setCatalog] = useState<RewardItem[]>(REWARDS_CATALOG);
  const [quests, setQuests] = useState<EarningQuest[]>(EARNING_QUESTS);

  // Sound Mute
  const [isMuted, setIsMuted] = useState(false);

  // Tabs
  const [activeQuestTab, setActiveQuestTab] = useState<"all" | "growth" | "partner" | "community">("all");
  const [activeCatalogTab, setActiveCatalogTab] = useState<"all" | "credits" | "pro" | "cosmetic">("all");

  // Interaction Modals
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizReviewData, setQuizReviewData] = useState<any[] | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
  const [isVotingPoll, setIsVotingPoll] = useState(false);

  // Quest Submit Modal
  const [activeSubmittingQuest, setActiveSubmittingQuest] = useState<EarningQuest | null>(null);
  const [questProofUrl, setQuestProofUrl] = useState("");
  const [isCompletingQuest, setIsCompletingQuest] = useState(false);

  // Target Selector Modal
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Redemption & Voucher States
  const [selectedRedeemReward, setSelectedRedeemReward] = useState<RewardItem | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<{
    reward: RewardItem;
    voucherCode: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // In-App Promo Code Modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [prefilledPromoCode, setPrefilledPromoCode] = useState("");

  // Toast
  const [toastData, setToastData] = useState<ToastPayload | null>(null);

  const showToast = (
    payloadOrText: ToastPayload | string,
    fallbackType: "success" | "error" | "info" = "info",
    fallbackTopic: ToastTopic = "info"
  ) => {
    if (typeof payloadOrText === "string") {
      setToastData({
        title: payloadOrText,
        type: fallbackType,
        topic: fallbackTopic,
      });
    } else {
      setToastData(payloadOrText);
    }
    setTimeout(() => setToastData(null), 4000);
  };

  const triggerConfetti = (rarity: "normal" | "epic" | "legendary" = "normal") => {
    try {
      soundController.playExplosion(rarity);
      confetti({
        particleCount: rarity === "legendary" ? 140 : rarity === "epic" ? 90 : 60,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#38bdf8", "#a855f7", "#fbbf24", "#34d399", "#f43f5e", "#ffffff"],
      });
    } catch {}
  };

  const handleToggleMute = () => {
    const muted = soundController.toggleMute();
    setIsMuted(muted);
    showToast({
      title: muted ? "Audio Effects Muted" : "Audio Effects Enabled",
      message: muted ? "Tactile audio feedback disabled" : "Tactile Web Audio feedback active",
      topic: "sound",
      type: "info",
    });
  };

  const fetchRewardsData = async () => {
    try {
      const res = await fetch("/api/rewards/profile", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setIsLoggedIn(data.isLoggedIn);
        setTodayTrivia(data.todayTrivia || []);
        setTodayPoll(data.todayPoll || null);
        if (data.catalog) setCatalog(data.catalog);
        if (data.quests) setQuests(data.quests);
      }
    } catch (err) {
      console.warn("Failed to fetch rewards profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const selectedGoal = useMemo(() => {
    if (!profile) return catalog.find((r) => r.id === "reward_pro_30d") || catalog[0];
    return (
      catalog.find((r) => r.id === profile.selectedGoalId) ||
      catalog.find((r) => r.id === "reward_pro_30d") ||
      catalog[0]
    );
  }, [profile, catalog]);

  const goalProgress = useMemo(() => {
    if (!profile || !selectedGoal) return { current: 0, target: 8000, percentage: 0 };
    const current = profile.points || 0;
    const target = selectedGoal.costPoints || 100;
    const percentage = Math.min(100, Math.round((current / target) * 100));
    return { current, target, percentage };
  }, [profile, selectedGoal]);

  // Today's completion count (Check-in, Trivia, Poll)
  const completedDropsCount = useMemo(() => {
    if (!profile) return 0;
    let count = 0;
    if (profile.hasCheckedInToday) count++;
    if (profile.hasCompletedQuizToday) count++;
    if (profile.hasVotedPollToday) count++;
    return count;
  }, [profile]);

  const handleCopyVoucher = (code: string) => {
    soundController.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      showToast({
        title: "Voucher Code Copied!",
        message: "Ready to paste & redeem for instant credits or Pro.",
        topic: "copy",
        type: "success",
      });
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleDailyCheckIn = async () => {
    soundController.playClick();
    if (!isLoggedIn) {
      router.push("/auth/signin?next=/rewards");
      return;
    }
    if (profile?.hasCheckedInToday) return;

    setIsCheckingIn(true);
    try {
      const res = await fetch("/api/rewards/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: "daily_check_in" }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                points: data.newTotal,
                lifetimePoints: prev.lifetimePoints + data.pointsAwarded,
                hasCheckedInToday: true,
                currentStreak: data.streak,
              }
            : null
        );
        triggerConfetti(data.streak >= 7 ? "legendary" : "normal");
        showToast({
          title: "Daily Drop Claimed!",
          message: `Streak extended to ${data.streak} ${data.streak === 1 ? "Day" : "Days"}! 🔥`,
          points: `+${data.pointsAwarded} RP`,
          topic: "streak",
          type: "success",
        });
      } else {
        showToast({
          title: "Check-in Failed",
          message: data.error || "Could not claim daily drop.",
          topic: "error",
          type: "error",
        });
      }
    } catch {
      showToast({
        title: "Check-in Error",
        message: "Failed to connect to server.",
        topic: "error",
        type: "error",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleQuizSubmit = async () => {
    soundController.playClick();
    if (!isLoggedIn) {
      router.push("/auth/signin?next=/rewards");
      return;
    }

    const answersArray = todayTrivia.map((_, idx) => quizAnswers[idx] ?? -1);
    if (answersArray.some((ans) => ans === -1)) {
      showToast({
        title: "Incomplete Trivia",
        message: "Please answer all 3 questions first before submitting.",
        topic: "trivia",
        type: "error",
      });
      return;
    }

    setIsSubmittingQuiz(true);
    try {
      const res = await fetch("/api/rewards/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: "daily_quiz",
          answers: answersArray,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuizSubmitted(true);
        setQuizReviewData(data.triviaReview || null);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                points: data.newTotal,
                lifetimePoints: prev.lifetimePoints + data.pointsAwarded,
                hasCompletedQuizToday: true,
              }
            : null
        );
        triggerConfetti("epic");
        showToast({
          title: "Tech Trivia Complete!",
          message: "Trivia reward points added to your balance.",
          points: `+${data.pointsAwarded} RP`,
          topic: "trivia",
          type: "success",
        });
      } else {
        showToast({
          title: "Submission Failed",
          message: data.error || "Could not submit trivia answers.",
          topic: "error",
          type: "error",
        });
      }
    } catch {
      showToast({
        title: "Quiz Error",
        message: "Failed to submit answers.",
        topic: "error",
        type: "error",
      });
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handlePollVote = async (optionId: string) => {
    soundController.playClick();
    if (!isLoggedIn) {
      router.push("/auth/signin?next=/rewards");
      return;
    }
    if (profile?.hasVotedPollToday) return;

    setSelectedPollOption(optionId);
    setIsVotingPoll(true);
    try {
      const res = await fetch("/api/rewards/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: "daily_poll",
          pollOptionId: optionId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                points: data.newTotal,
                lifetimePoints: prev.lifetimePoints + data.pointsAwarded,
                hasVotedPollToday: true,
              }
            : null
        );
        setTodayPoll((prev) =>
          prev
            ? {
                ...prev,
                totalVotes: prev.totalVotes + 1,
                options: prev.options.map((opt) =>
                  opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
                ),
              }
            : null
        );
        soundController.playShine();
        showToast({
          title: "Poll Vote Recorded!",
          message: "Points credited to your balance.",
          points: `+${data.pointsAwarded} RP`,
          topic: "poll",
          type: "success",
        });
      } else {
        showToast({
          title: "Vote Failed",
          message: data.error || "Could not record vote.",
          topic: "error",
          type: "error",
        });
      }
    } catch {
      showToast({
        title: "Poll Error",
        message: "Failed to submit vote.",
        topic: "error",
        type: "error",
      });
    } finally {
      setIsVotingPoll(false);
    }
  };

  const handleQuestClick = async (quest: EarningQuest) => {
    soundController.playClick();
    if (!isLoggedIn) {
      router.push("/auth/signin?next=/rewards");
      return;
    }

    if (profile?.completedQuestIds?.includes(quest.id)) {
      showToast({
        title: "Quest Already Completed",
        message: "You have already collected points for this quest.",
        topic: "quest",
        type: "info",
      });
      return;
    }

    if (quest.type === "submit_url") {
      setActiveSubmittingQuest(quest);
      setQuestProofUrl("");
      return;
    }

    if (quest.actionUrl) {
      window.open(quest.actionUrl, "_blank", "noopener,noreferrer");
    }

    setIsCompletingQuest(true);
    try {
      const res = await fetch("/api/rewards/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: quest.id }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                points: data.newTotal,
                lifetimePoints: prev.lifetimePoints + data.pointsAwarded,
                completedQuestIds: [...prev.completedQuestIds, quest.id],
              }
            : null
        );
        triggerConfetti("normal");
        showToast({
          title: "Bounty Reward Claimed!",
          message: `${quest.title} completed successfully.`,
          points: `+${data.pointsAwarded} RP`,
          topic: "quest",
          type: "success",
        });
      }
    } catch {
    } finally {
      setIsCompletingQuest(false);
    }
  };

  const handleSubmitProofQuest = async () => {
    soundController.playClick();
    if (!activeSubmittingQuest) return;
    if (!questProofUrl.trim()) {
      showToast({
        title: "Link Required",
        message: "Please provide a verification link or note.",
        topic: "quest",
        type: "error",
      });
      return;
    }

    setIsCompletingQuest(true);
    try {
      const res = await fetch("/api/rewards/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: activeSubmittingQuest.id,
          proofUrl: questProofUrl.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                points: data.newTotal,
                lifetimePoints: prev.lifetimePoints + data.pointsAwarded,
                completedQuestIds: [...prev.completedQuestIds, activeSubmittingQuest.id],
              }
            : null
        );
        triggerConfetti("epic");
        showToast({
          title: "Bounty Proof Submitted!",
          message: `Verification received for ${activeSubmittingQuest.title}.`,
          points: `+${data.pointsAwarded} RP`,
          topic: "quest",
          type: "success",
        });
        setActiveSubmittingQuest(null);
      } else {
        showToast({
          title: "Submission Failed",
          message: data.error || "Failed to submit bounty proof.",
          topic: "error",
          type: "error",
        });
      }
    } catch {
      showToast({
        title: "Submission Error",
        message: "Failed to submit proof.",
        topic: "error",
        type: "error",
      });
    } finally {
      setIsCompletingQuest(false);
    }
  };

  const handleSetGoal = async (reward: RewardItem) => {
    soundController.playClick();
    if (!isLoggedIn) {
      router.push("/auth/signin?next=/rewards");
      return;
    }

    try {
      await fetch("/api/rewards/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedGoalId: reward.id }),
      });
      setProfile((prev) => (prev ? { ...prev, selectedGoalId: reward.id } : null));
      soundController.playShine();
      showToast({
        title: "Target Goal Updated!",
        message: `Now tracking progress towards ${reward.title}.`,
        topic: "target",
        type: "success",
      });
    } catch {
      showToast({
        title: "Update Failed",
        message: "Failed to update target goal.",
        topic: "error",
        type: "error",
      });
    }
  };

  const handleConfirmRedemption = async () => {
    if (!selectedRedeemReward) return;

    setIsRedeeming(true);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: selectedRedeemReward.id }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                points: data.remainingPoints,
                recentRedemptions: [
                  {
                    id: `red_${Date.now()}`,
                    rewardTitle: selectedRedeemReward.title,
                    costPoints: selectedRedeemReward.costPoints,
                    voucherCode: data.voucherCode,
                    redeemedAt: new Date().toISOString(),
                    status: "active",
                  },
                  ...prev.recentRedemptions,
                ],
              }
            : null
        );
        setGeneratedVoucher({
          reward: selectedRedeemReward,
          voucherCode: data.voucherCode,
        });
        setSelectedRedeemReward(null);
        triggerConfetti("legendary");
      } else {
        showToast({
          title: "Redemption Failed",
          message: data.error || "Could not redeem voucher code.",
          topic: "error",
          type: "error",
        });
      }
    } catch {
      showToast({
        title: "Network Error",
        message: "Failed to connect to server during redemption.",
        topic: "error",
        type: "error",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const filteredQuests = useMemo(() => {
    if (activeQuestTab === "all") return quests;
    return quests.filter((q) => q.category === activeQuestTab);
  }, [quests, activeQuestTab]);

  const filteredCatalog = useMemo(() => {
    if (activeCatalogTab === "all") return catalog;
    return catalog.filter((r) => r.category === activeCatalogTab);
  }, [catalog, activeCatalogTab]);

  // Streak Stepper Days 1..7 data
  const streakDays = [
    { day: 1, points: "+15 RP" },
    { day: 2, points: "+20 RP" },
    { day: 3, points: "+25 RP" },
    { day: 4, points: "+30 RP" },
    { day: 5, points: "+35 RP" },
    { day: 6, points: "+40 RP" },
    { day: 7, points: "+65 RP", isMega: true },
  ];

  return (
    <div className="relative min-h-screen bg-[#04050a] text-zinc-100 selection:bg-amber-500/25 selection:text-amber-200">
      {/* Background Cyber Mesh & Canvas VFX */}
      <RewardsBackgroundVFX />

      {/* Insane Gamified Toast Notification */}
      <AnimatePresence>
        {toastData && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.92, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, scale: 0.92, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className={cn(
              "fixed top-20 right-4 sm:right-8 z-50 overflow-hidden rounded-2xl border p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl min-w-[320px] max-w-md",
              toastData.topic === "streak" &&
                "border-orange-500/50 bg-gradient-to-r from-[#200e06]/95 via-[#130904]/95 to-[#080402]/95 shadow-[0_0_40px_rgba(249,115,22,0.35)]",
              toastData.topic === "trivia" &&
                "border-purple-500/50 bg-gradient-to-r from-[#1a0e2f]/95 via-[#10091d]/95 to-[#07040d]/95 shadow-[0_0_40px_rgba(168,85,247,0.35)]",
              toastData.topic === "poll" &&
                "border-cyan-500/50 bg-gradient-to-r from-[#0a1827]/95 via-[#060f19]/95 to-[#03070c]/95 shadow-[0_0_40px_rgba(6,182,212,0.35)]",
              toastData.topic === "quest" &&
                "border-amber-400/50 bg-gradient-to-r from-[#1c1607]/95 via-[#120e04]/95 to-[#070501]/95 shadow-[0_0_40px_rgba(245,158,11,0.35)]",
              toastData.topic === "vault" &&
                "border-amber-400/60 bg-gradient-to-r from-[#211708]/95 via-[#140e04]/95 to-[#080501]/95 shadow-[0_0_50px_rgba(245,158,11,0.45)]",
              toastData.topic === "copy" &&
                "border-cyan-400/50 bg-gradient-to-r from-[#091827]/95 via-[#050e18]/95 to-[#02070c]/95 shadow-[0_0_35px_rgba(6,182,212,0.3)]",
              toastData.topic === "target" &&
                "border-amber-400/50 bg-gradient-to-r from-[#1c1607]/95 via-[#120e04]/95 to-[#070501]/95 shadow-[0_0_35px_rgba(245,158,11,0.35)]",
              toastData.topic === "error" &&
                "border-rose-500/50 bg-gradient-to-r from-[#23090e]/95 via-[#150509]/95 to-[#090204]/95 shadow-[0_0_40px_rgba(244,63,94,0.35)]",
              (!toastData.topic || toastData.topic === "info" || toastData.topic === "sound") &&
                "border-white/[0.12] bg-[#0c0e18]/95 shadow-[0_0_30px_rgba(255,255,255,0.08)]"
            )}
          >
            {/* Top Laser Accent Beam */}
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-[2px]",
                toastData.topic === "streak" &&
                  "bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 shadow-[0_0_15px_rgba(249,115,22,0.9)]",
                toastData.topic === "trivia" &&
                  "bg-gradient-to-r from-purple-500 via-fuchsia-400 to-indigo-400 shadow-[0_0_15px_rgba(168,85,247,0.9)]",
                toastData.topic === "poll" &&
                  "bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300 shadow-[0_0_15px_rgba(6,182,212,0.9)]",
                (toastData.topic === "quest" || toastData.topic === "vault" || toastData.topic === "target") &&
                  "bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 shadow-[0_0_15px_rgba(245,158,11,0.9)]",
                toastData.topic === "copy" &&
                  "bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300 shadow-[0_0_15px_rgba(6,182,212,0.9)]",
                toastData.topic === "error" &&
                  "bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 shadow-[0_0_15px_rgba(244,63,94,0.9)]",
                (!toastData.topic || toastData.topic === "info" || toastData.topic === "sound") &&
                  "bg-gradient-to-r from-zinc-400 via-white to-zinc-400"
              )}
            />

            <div className="flex items-center gap-3.5">
              {/* Topic-Specific Pedestal Icon */}
              <div
                className={cn(
                  "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-lg",
                  toastData.topic === "streak" &&
                    "border-orange-400/40 bg-gradient-to-br from-orange-500/30 to-amber-500/10 text-orange-300 shadow-[0_0_18px_rgba(249,115,22,0.5)]",
                  toastData.topic === "trivia" &&
                    "border-purple-400/40 bg-gradient-to-br from-purple-500/30 to-fuchsia-500/10 text-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.5)]",
                  toastData.topic === "poll" &&
                    "border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 to-blue-500/10 text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.5)]",
                  (toastData.topic === "quest" || toastData.topic === "target") &&
                    "border-amber-400/40 bg-gradient-to-br from-amber-500/30 to-yellow-500/10 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.5)]",
                  toastData.topic === "vault" &&
                    "border-amber-400/50 bg-gradient-to-br from-amber-500/35 to-orange-500/15 text-amber-300 shadow-[0_0_22px_rgba(245,158,11,0.6)]",
                  toastData.topic === "copy" &&
                    "border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 to-blue-500/10 text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.5)]",
                  toastData.topic === "error" &&
                    "border-rose-400/40 bg-gradient-to-br from-rose-500/30 to-red-500/10 text-rose-300 shadow-[0_0_18px_rgba(244,63,94,0.5)]",
                  (!toastData.topic || toastData.topic === "info" || toastData.topic === "sound") &&
                    "border-white/[0.12] bg-white/[0.06] text-zinc-200"
                )}
              >
                {toastData.topic === "streak" ? (
                  <Flame className="h-5 w-5 fill-orange-400 text-orange-400 animate-pulse" />
                ) : toastData.topic === "trivia" ? (
                  <HelpCircle className="h-5 w-5 text-purple-300" />
                ) : toastData.topic === "poll" ? (
                  <BarChart2 className="h-5 w-5 text-cyan-300" />
                ) : toastData.topic === "quest" ? (
                  <Zap className="h-5 w-5 fill-amber-300 text-amber-300" />
                ) : toastData.topic === "vault" ? (
                  <Gift className="h-5 w-5 text-amber-300 animate-bounce" />
                ) : toastData.topic === "target" ? (
                  <Target className="h-5 w-5 text-amber-300 animate-spin [animation-duration:10s]" />
                ) : toastData.topic === "copy" ? (
                  <CheckCheck className="h-5 w-5 text-cyan-300" />
                ) : toastData.topic === "sound" ? (
                  <Volume2 className="h-5 w-5 text-zinc-300" />
                ) : toastData.topic === "error" ? (
                  <ShieldCheck className="h-5 w-5 text-rose-400" />
                ) : (
                  <Coins className="h-5 w-5 fill-amber-400 text-amber-400" />
                )}
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  {toastData.topic === "streak"
                    ? "DAILY DROP • STREAK"
                    : toastData.topic === "trivia"
                    ? "TECH TRIVIA • COMPLETED"
                    : toastData.topic === "poll"
                    ? "COMMUNITY POLL • VOTED"
                    : toastData.topic === "quest"
                    ? "BOUNTY • CLAIMED"
                    : toastData.topic === "vault"
                    ? "REWARDS SHOP • UNLOCKED"
                    : toastData.topic === "target"
                    ? "TARGET GOAL • UPDATED"
                    : toastData.topic === "copy"
                    ? "VOUCHER CODE • COPIED"
                    : toastData.topic === "error"
                    ? "SYSTEM ALERT"
                    : "EXISMIC REWARDS"}
                </div>
                <div className="font-black text-sm text-white truncate mt-0.5">
                  {toastData.title}
                </div>
                {toastData.message && (
                  <div className="text-xs text-zinc-400 truncate mt-0.5">
                    {toastData.message}
                  </div>
                )}
              </div>

              {/* Points Pill */}
              {toastData.points && (
                <div className="shrink-0 flex items-center gap-1 font-mono text-xs font-black text-amber-200 bg-amber-400/15 border border-amber-400/35 px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  {toastData.points}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* HEADER BAR */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050711]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-6">
            <Link
              href="/rewards"
              onMouseEnter={() => soundController.playHover()}
              className="group flex items-center gap-3"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/25 via-orange-500/20 to-yellow-600/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                <Star className="h-4 w-4 fill-amber-300 animate-pulse" />
                <div className="absolute inset-0 rounded-xl bg-amber-400/20 opacity-0 blur-md group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black uppercase tracking-wider text-white">
                    Exismic{" "}
                    <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                      Rewards
                    </span>
                  </span>
                  <span className="hidden sm:inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.2 text-[9px] font-mono font-black uppercase tracking-widest text-amber-300">
                    Hub
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium hidden md:inline-block">
                  Earn free Pro &amp; credits
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 pl-6 border-l border-white/[0.08] text-xs font-bold text-zinc-400">
              <a
                href="#drops"
                onMouseEnter={() => soundController.playHover()}
                className="px-3 py-1.5 rounded-lg hover:text-amber-300 hover:bg-white/[0.04] transition-all"
              >
                Daily Drops
              </a>
              <a
                href="#bounties"
                onMouseEnter={() => soundController.playHover()}
                className="px-3 py-1.5 rounded-lg hover:text-cyan-300 hover:bg-white/[0.04] transition-all"
              >
                Bounties
              </a>
              <a
                href="#shop"
                onMouseEnter={() => soundController.playHover()}
                className="px-3 py-1.5 rounded-lg hover:text-purple-300 hover:bg-white/[0.04] transition-all"
              >
                Rewards Shop
              </a>
              <a
                href="#codes"
                onMouseEnter={() => soundController.playHover()}
                className="px-3 py-1.5 rounded-lg hover:text-amber-300 hover:bg-white/[0.04] transition-all"
              >
                My Codes
              </a>
            </nav>
          </div>

          {/* Right Header Bar Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Point Counter with Glowing Shimmer */}
            <div
              onMouseEnter={() => soundController.playHover()}
              className="relative group flex items-center gap-2 overflow-hidden rounded-xl border border-amber-400/35 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-orange-500/5 px-3.5 py-1.5 shadow-[0_0_18px_rgba(245,158,11,0.2)] hover:border-amber-400/60 transition-all"
            >
              <div className="absolute inset-x-0 -top-full h-full bg-gradient-to-b from-white/20 to-transparent group-hover:top-full transition-all duration-700 pointer-events-none" />
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                <Star className="h-3 w-3 fill-black" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-black text-amber-200 tracking-wide">
                  {(profile?.points || 0).toLocaleString()}{" "}
                  <span className="text-[10px] text-amber-400 font-bold">RP</span>
                </span>
              </div>
            </div>

            {/* Sound Effects Toggle */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-zinc-900/60 text-zinc-400 hover:border-white/[0.2] hover:text-white transition-all"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-zinc-500" /> : <Volume2 className="h-4 w-4 text-amber-300" />}
            </button>

            {/* Redeem Promo Code Modal Trigger */}
            <button
              onClick={() => {
                soundController.playClick();
                setPrefilledPromoCode("");
                setIsPromoModalOpen(true);
              }}
              onMouseEnter={() => soundController.playHover()}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 px-3.5 py-1.5 text-xs font-bold text-zinc-200 hover:border-cyan-400/50 hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
            >
              <QrCode className="h-3.5 w-3.5 text-cyan-400" /> Redeem Code
            </button>

            {/* Back to Studio */}
            <Link
              href="/"
              onMouseEnter={() => soundController.playHover()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/25 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Studio
            </Link>
          </div>
        </div>
      </header>


      {/* ======================================================== */}
      {/* MAIN GAMIFIED CONTENT */}
      {/* ======================================================== */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* ======================================================== */}
        {/* HERO SECTION */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-b from-[#0f1324]/95 via-[#090b17]/95 to-[#05060e]/95 p-6 sm:p-8 lg:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(245,158,11,0.08)] backdrop-blur-xl">
          {/* Top Multi-Gradient Neon Laser Beam */}
          <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-amber-400 via-cyan-400 via-purple-400 to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-pulse" />

          {/* Decorative Cyber Notches */}
          <div className="pointer-events-none absolute -top-12 -left-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Headline & Status HUD */}
            <div className="space-y-5 lg:col-span-7">
              {/* Clean Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                </span>
                Zero-Cost Rewards • 100% Free
              </div>

              {/* Main Glowing Title */}
              <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl text-white leading-[1.05]">
                Level Up &amp; Unlock <br />
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 via-orange-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(245,158,11,0.45)]">
                  Free Pro &amp; Credits.
                </span>
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-zinc-300">
                Complete daily drops, test your tech trivia skills, and try partner tools to collect Reward Points. Generate instant voucher codes to activate credits or Pro passes with zero payment.
              </p>

              {/* Stats HUD Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* 1. Points Balance Card */}
                <div
                  onMouseEnter={() => soundController.playHover()}
                  className="group flex items-center gap-3.5 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-[#131728] to-[#0a0c16] px-4 py-3 shadow-[0_0_25px_rgba(245,158,11,0.1)] transition-all hover:border-amber-400/60 hover:scale-[1.02]"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                    <Star className="h-5 w-5 fill-black" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-300/80">
                      Points Balance
                    </div>
                    <div className="font-mono text-xl font-black text-white">
                      {(profile?.points || 0).toLocaleString()}{" "}
                      <span className="text-xs text-amber-400 font-bold">RP</span>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500">
                      Lifetime: {(profile?.lifetimePoints || 0).toLocaleString()} RP
                    </div>
                  </div>
                </div>

                {/* 2. Streak Flame Card */}
                <div
                  onMouseEnter={() => soundController.playHover()}
                  className="group flex items-center gap-3.5 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 via-[#131728] to-[#0a0c16] px-4 py-3 shadow-[0_0_25px_rgba(249,115,22,0.1)] transition-all hover:border-orange-500/60 hover:scale-[1.02]"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-rose-400 text-black shadow-[0_0_20px_rgba(249,115,22,0.6)]">
                    <Flame className="h-5 w-5 fill-black animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-orange-300/80">
                      Daily Streak
                    </div>
                    <div className="font-mono text-xl font-black text-white">
                      {profile?.currentStreak || 0}{" "}
                      <span className="text-xs text-orange-400 font-bold">
                        {(profile?.currentStreak || 0) === 1 ? "Day" : "Days"}
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-orange-300/80">
                      {profile?.currentStreak && profile.currentStreak >= 7
                        ? "🔥 Mega Drop Active"
                        : "Next Mega Drop: Day 7"}
                    </div>
                  </div>
                </div>

                {/* 3. Daily Completion Meter */}
                <div
                  onMouseEnter={() => soundController.playHover()}
                  className="group flex items-center gap-3.5 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-[#131728] to-[#0a0c16] px-4 py-3 shadow-[0_0_25px_rgba(6,182,212,0.1)] transition-all hover:border-cyan-500/60 hover:scale-[1.02]"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                    <CheckCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300/80">
                      Today's Drops
                    </div>
                    <div className="font-mono text-xl font-black text-white">
                      {completedDropsCount}{" "}
                      <span className="text-xs text-cyan-400 font-bold">/ 3 Done</span>
                    </div>
                    <div className="text-[9px] font-mono text-cyan-300/80">
                      {completedDropsCount === 3 ? "All Complete! ✨" : "Claim drops below"}
                    </div>
                  </div>
                </div>

                {!isLoggedIn && (
                  <Link
                    href="/auth/signin?next=/rewards"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-white via-zinc-100 to-zinc-200 px-5 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
                  >
                    Sign In <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column: Holographic Target Reward Vault Card */}
            <div className="lg:col-span-5">
              <div
                onMouseEnter={() => soundController.playHover()}
                className="relative overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-b from-[#12162a]/95 via-[#0b0e1d]/95 to-[#060814]/95 p-6 shadow-[0_0_40px_rgba(245,158,11,0.15)] backdrop-blur-2xl transition-all"
              >
                {/* Glowing Laser Border Line */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400" />

                <div className="flex items-center justify-between pb-3 text-xs text-zinc-400">
                  <span className="font-black uppercase tracking-wider flex items-center gap-2 text-amber-300">
                    <Target className="h-4 w-4 animate-spin [animation-duration:12s]" /> Target Reward
                  </span>
                  <span className="font-mono font-black text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
                    {goalProgress.percentage}%
                  </span>
                </div>

                {selectedGoal && (
                  <div className="flex items-start justify-between gap-4 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">
                          {selectedGoal.title}
                        </span>
                        <span className="font-mono text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                          {selectedGoal.badge || "PRO PASS"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {selectedGoal.description}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="font-mono text-sm font-black text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                        {selectedGoal.costPoints.toLocaleString()} RP
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div className="mt-4 space-y-2">
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-900 border border-white/[0.08]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goalProgress.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="relative h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-[size:16px_16px] animate-[move-stripe_1.5s_linear_infinite]" />
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                    <span className="font-mono text-[11px]">
                      <strong className="text-white">{(profile?.points || 0).toLocaleString()}</strong> / {selectedGoal?.costPoints.toLocaleString()} RP
                    </span>
                    <button
                      onClick={() => {
                        soundController.playClick();
                        setIsTargetModalOpen(true);
                      }}
                      className="font-bold text-amber-400 hover:text-amber-200 flex items-center gap-1 hover:underline transition-all"
                    >
                      <Compass className="h-3.5 w-3.5" /> Switch Target
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: DAILY DROPS ARCADE */}
        {/* ======================================================== */}
        <section id="drops" className="space-y-5 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/25 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider text-white">
                  Daily Drops
                </h2>
                <p className="text-xs text-zinc-400">
                  Collect free daily points every 24 hours to fuel your rewards progress.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <Clock className="h-3.5 w-3.5 text-amber-400" /> Resets every 24h at 00:00 UTC
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Card 1: 7-Day Streak Drop with Visual Stepper */}
            <div
              onMouseEnter={() => soundController.playHover()}
              className="flex flex-col justify-between rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#111425]/90 via-[#0a0c18]/90 to-[#060710]/90 p-6 shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]"
            >
              <div>
                <div className="flex items-center justify-between pb-3">
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-lg">
                    +15 to +65 RP
                  </span>
                  {profile?.hasCheckedInToday ? (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      <Check className="h-3.5 w-3.5" /> Claimed Today
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-orange-300 flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400 animate-pulse" /> Ready to Claim
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400 fill-orange-400" /> 7-Day Streak Road
                </h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Log in daily to scale your streak. Reach Day 7 to open the +65 RP Mega Bonus Chest!
                </p>

                {/* Visual 7-Day Stepper Nodes */}
                <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
                  {streakDays.map((node) => {
                    const currentStreak = profile?.currentStreak || 0;
                    const isPassed = currentStreak >= node.day;
                    const isCurrent = currentStreak + 1 === node.day && !profile?.hasCheckedInToday;

                    return (
                      <div
                        key={node.day}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-xl border py-2 px-1 transition-all",
                          node.isMega && "border-amber-400/50 bg-amber-400/10 text-amber-200",
                          isPassed && "border-emerald-500/40 bg-emerald-950/40 text-emerald-300",
                          isCurrent && "border-amber-400 bg-amber-400/20 text-amber-200 ring-2 ring-amber-400/40 animate-pulse",
                          !isPassed && !isCurrent && !node.isMega && "border-white/[0.06] bg-zinc-900/40 text-zinc-500"
                        )}
                      >
                        <span className="text-[9px] font-mono font-bold uppercase">D{node.day}</span>
                        {node.isMega ? (
                          <Gift className="h-3.5 w-3.5 my-0.5 text-amber-300" />
                        ) : isPassed ? (
                          <Check className="h-3.5 w-3.5 my-0.5 text-emerald-400" />
                        ) : (
                          <Coins className="h-3.5 w-3.5 my-0.5 text-zinc-500" />
                        )}
                        <span className="text-[8px] font-mono font-black">{node.points}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                {profile?.hasCheckedInToday ? (
                  <div className="w-full text-center py-3 text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Drop Claimed • Check back tomorrow
                  </div>
                ) : (
                  <button
                    onClick={handleDailyCheckIn}
                    disabled={isCheckingIn}
                    onMouseEnter={() => soundController.playHover()}
                    className="relative group w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_45px_rgba(245,158,11,0.8)] active:scale-98 transition-all disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center justify-center gap-2">
                      {isCheckingIn ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Flame className="h-4 w-4 fill-black text-black" /> Claim Daily Drop (+15 RP)
                        </>
                      )}
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Card 2: Daily AI Tech Trivia */}
            <div
              onMouseEnter={() => soundController.playHover()}
              className="flex flex-col justify-between rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#17122c]/90 via-[#0d091d]/90 to-[#060410]/90 p-6 shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]"
            >
              <div>
                <div className="flex items-center justify-between pb-3">
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-400/10 border border-purple-400/25 px-2.5 py-1 rounded-lg">
                    +30 RP
                  </span>
                  {profile?.hasCompletedQuizToday ? (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      <Check className="h-3.5 w-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                      <Cpu className="h-3.5 w-3.5 animate-pulse" /> 3 Questions Ready
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-purple-400" /> Daily Tech Trivia
                </h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Answer 3 quick tech, coding &amp; AI questions. Earn 10 points per correct answer!
                </p>

                {/* Trivia Matrix Preview Box */}
                <div className="mt-4 rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Questions:</span>
                    <span className="font-mono font-bold text-purple-300">3 AI / Web Questions</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Reward:</span>
                    <span className="font-mono font-bold text-purple-300">+10 RP per answer</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Difficulty:</span>
                    <span className="font-mono text-purple-300 font-bold">Adaptive</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    soundController.playClick();
                    setIsQuizModalOpen(true);
                  }}
                  onMouseEnter={() => soundController.playHover()}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition-all",
                    profile?.hasCompletedQuizToday
                      ? "border border-purple-500/40 bg-purple-950/40 text-purple-200 hover:bg-purple-900/50"
                      : "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_45px_rgba(168,85,247,0.8)] active:scale-98"
                  )}
                >
                  {profile?.hasCompletedQuizToday ? (
                    <>
                      <Check className="h-4 w-4" /> View Quiz Review
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Play Tech Trivia (+30 RP)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 3: Community Pulse Poll */}
            <div
              onMouseEnter={() => soundController.playHover()}
              className="flex flex-col justify-between rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#10192a]/90 via-[#0a0f1c]/90 to-[#040810]/90 p-6 shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all hover:border-cyan-500/60 hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]"
            >
              <div>
                <div className="flex items-center justify-between pb-3">
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-400/10 border border-cyan-400/25 px-2.5 py-1 rounded-lg">
                    +20 RP
                  </span>
                  {profile?.hasVotedPollToday ? (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      <Check className="h-3.5 w-3.5" /> Voted
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <Radio className="h-3.5 w-3.5 animate-pulse" /> Live Voting
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-cyan-400" /> Community Pulse Poll
                </h3>
                <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                  {todayPoll?.question || "Vote to claim instant points and shape future features."}
                </p>

                {/* Poll Options */}
                <div className="mt-4 space-y-2">
                  {todayPoll?.options?.map((option) => {
                    const percentage =
                      todayPoll.totalVotes > 0
                        ? Math.round((option.votes / todayPoll.totalVotes) * 100)
                        : 0;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handlePollVote(option.id)}
                        disabled={profile?.hasVotedPollToday || isVotingPoll}
                        onMouseEnter={() => soundController.playHover()}
                        className={cn(
                          "relative w-full overflow-hidden rounded-xl border p-2.5 text-left text-xs transition-all",
                          profile?.hasVotedPollToday
                            ? "border-white/[0.08] bg-zinc-900/60"
                            : "border-white/[0.08] bg-zinc-900/40 hover:border-cyan-400/50 hover:bg-zinc-900/80"
                        )}
                      >
                        {profile?.hasVotedPollToday && (
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                        <div className="relative z-10 flex items-center justify-between px-1">
                          <span className="text-zinc-200 line-clamp-1 font-medium">{option.text}</span>
                          {profile?.hasVotedPollToday && (
                            <span className="font-mono text-xs font-black text-cyan-300 pl-2">
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
                <span className="text-[11px] font-mono text-zinc-500">
                  {todayPoll?.totalVotes || 0} community members voted
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: BOUNTIES & OFFERS */}
        {/* ======================================================== */}
        <section id="bounties" className="space-y-5 scroll-mt-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 border border-cyan-400/25 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider text-white">
                  Bounties &amp; Quests
                </h2>
                <p className="text-xs text-zinc-400">
                  Complete social missions and partner trials to claim large bonus points.
                </p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs font-bold">
              {[
                { id: "all", label: "All Missions" },
                { id: "growth", label: "Social & Bounty" },
                { id: "partner", label: "Partner Free Trials" },
                { id: "community", label: "Community" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundController.playClick();
                    setActiveQuestTab(tab.id as any);
                  }}
                  onMouseEnter={() => soundController.playHover()}
                  className={cn(
                    "rounded-xl px-3.5 py-1.5 transition-all",
                    activeQuestTab === tab.id
                      ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] font-black"
                      : "border border-white/[0.08] bg-zinc-900/60 text-zinc-400 hover:border-white/[0.2] hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuests.map((quest) => {
              const isCompleted = profile?.completedQuestIds?.includes(quest.id);

              return (
                <div
                  key={quest.id}
                  onMouseEnter={() => soundController.playHover()}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-3xl border p-5 transition-all duration-300",
                    isCompleted
                      ? "border-emerald-500/20 bg-emerald-950/[0.07] opacity-75"
                      : "border-white/[0.08] bg-gradient-to-b from-[#0c0f1e]/90 to-[#070914]/90 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:scale-[1.01]"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2">
                      <span className="font-mono text-[10px] font-black text-cyan-300 bg-cyan-400/10 border border-cyan-400/25 px-2.5 py-0.5 rounded-lg shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                        {quest.badge}
                      </span>
                      {quest.partnerName && (
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                          {quest.partnerName}
                        </span>
                      )}
                    </div>
                    <div className="text-base font-bold text-white mt-1 group-hover:text-cyan-200 transition-colors">
                      {quest.title}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {quest.description}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/[0.06]">
                    {isCompleted ? (
                      <div className="text-center py-2 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 bg-emerald-950/30 rounded-xl border border-emerald-500/20">
                        <Check className="h-4 w-4" /> Quest Completed
                      </div>
                    ) : (
                      <button
                        onClick={() => handleQuestClick(quest)}
                        disabled={isCompletingQuest}
                        onMouseEnter={() => soundController.playHover()}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-400/35 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent py-2.5 text-xs font-black uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/25 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-98 transition-all"
                      >
                        {quest.actionLabel} <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: REWARDS SHOP */}
        {/* ======================================================== */}
        <section id="shop" className="space-y-5 scroll-mt-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/25 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Gift className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider text-white">
                  Rewards Shop
                </h2>
                <p className="text-xs text-zinc-400">
                  Redeem earned points for unique voucher codes and activate compute or Pro immediately.
                </p>
              </div>
            </div>

            {/* Catalog Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs font-bold">
              {[
                { id: "all", label: "All Items" },
                { id: "credits", label: "⚡ Credits Top-Ups" },
                { id: "pro", label: "👑 Pro Passes" },
                { id: "cosmetic", label: "✨ Cosmetics" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundController.playClick();
                    setActiveCatalogTab(tab.id as any);
                  }}
                  onMouseEnter={() => soundController.playHover()}
                  className={cn(
                    "rounded-xl px-3.5 py-1.5 transition-all",
                    activeCatalogTab === tab.id
                      ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] font-black"
                      : "border border-white/[0.08] bg-zinc-900/60 text-zinc-400 hover:border-white/[0.2] hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCatalog.map((reward) => {
              const userPoints = profile?.points || 0;
              const canAfford = userPoints >= reward.costPoints;
              const isSelectedGoal = profile?.selectedGoalId === reward.id;

              return (
                <div
                  key={reward.id}
                  onMouseEnter={() => soundController.playHover()}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#111425]/90 via-[#0a0c18]/90 to-[#05060f]/90 p-6 shadow-[0_0_30px_rgba(0,0,0,0.6)] hover:border-amber-400/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:scale-[1.01] transition-all"
                >
                  {/* Top Laser Accent */}
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-[2px]",
                      reward.category === "pro"
                        ? "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300"
                        : reward.category === "cosmetic"
                        ? "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400"
                        : "bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
                    )}
                  />

                  <div>
                    <div className="flex items-center justify-between pb-3">
                      <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                        {reward.badge || reward.category}
                      </span>
                      {isSelectedGoal && (
                        <span className="text-[11px] font-black text-amber-300 flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full">
                          <Target className="h-3 w-3" /> Active Target
                        </span>
                      )}
                    </div>

                    {/* Glowing Pedestal Icon */}
                    <div className="my-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all">
                      {reward.category === "pro" ? (
                        <Crown className="h-6 w-6" />
                      ) : reward.category === "cosmetic" ? (
                        <Star className="h-6 w-6" />
                      ) : (
                        <Zap className="h-6 w-6" />
                      )}
                    </div>

                    <div className="text-lg font-black text-white group-hover:text-amber-200 transition-colors">
                      {reward.title}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {reward.description}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-medium">Cost</span>
                      <span className="font-mono font-black text-amber-300 text-base">
                        {reward.costPoints.toLocaleString()} RP
                      </span>
                    </div>

                    {canAfford ? (
                      <button
                        onClick={() => {
                          soundController.playClick();
                          setSelectedRedeemReward(reward);
                        }}
                        onMouseEnter={() => soundController.playHover()}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.8)] active:scale-98 transition-all"
                      >
                        <Ticket className="h-4 w-4 fill-black" /> Claim Voucher Code
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSetGoal(reward)}
                        onMouseEnter={() => soundController.playHover()}
                        className={cn(
                          "w-full py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border",
                          isSelectedGoal
                            ? "border-amber-400/40 bg-amber-400/15 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                            : "border-white/[0.08] bg-zinc-900/60 text-zinc-300 hover:border-amber-400/40 hover:text-white"
                        )}
                      >
                        {isSelectedGoal
                          ? "Current Target Goal"
                          : `Need ${(reward.costPoints - userPoints).toLocaleString()} more RP (Set Target)`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: MY CLAIMED CODES TERMINAL */}
        {/* ======================================================== */}
        <section
          id="codes"
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0c0f1f]/95 to-[#060812]/95 p-6 sm:p-8 space-y-5 scroll-mt-24 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/[0.08] gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/25">
                <Ticket className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-wider text-white">
                  My Claimed Voucher Codes
                </h2>
                <p className="text-xs text-zinc-400">
                  Your generated vouchers are saved here and ready for activation anytime.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundController.playClick();
                setPrefilledPromoCode("");
                setIsPromoModalOpen(true);
              }}
              onMouseEnter={() => soundController.playHover()}
              className="rounded-xl border border-amber-400/35 bg-gradient-to-r from-amber-400/15 to-transparent px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-300 hover:bg-amber-400 hover:text-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              Redeem Code on Exismic
            </button>
          </div>

          {profile?.recentRedemptions && profile.recentRedemptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {profile.recentRedemptions.map((red: any) => (
                <div
                  key={red.id}
                  onMouseEnter={() => soundController.playHover()}
                  className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 hover:border-amber-400/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{red.rewardTitle}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Claimed {new Date(red.redeemedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                      {red.costPoints.toLocaleString()} RP
                    </span>
                  </div>

                  {red.voucherCode && (
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                      <div className="flex-1 font-mono text-xs font-black text-amber-300 bg-black/80 px-3 py-2 rounded-xl border border-amber-400/20 select-all tracking-wider">
                        {red.voucherCode}
                      </div>
                      <button
                        onClick={() => handleCopyVoucher(red.voucherCode)}
                        className="p-2 rounded-xl border border-white/[0.1] bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all"
                        title="Copy Code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          soundController.playClick();
                          setPrefilledPromoCode(red.voucherCode);
                          setIsPromoModalOpen(true);
                        }}
                        className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-black hover:brightness-110 transition-all"
                      >
                        Redeem
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center space-y-2">
              <Ticket className="h-8 w-8 text-zinc-600 mx-auto" />
              <div className="text-xs font-bold text-zinc-400">No claimed vouchers yet.</div>
              <p className="text-[11px] text-zinc-500">
                Complete daily drops and bounties above to collect Reward Points!
              </p>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#030408] py-10 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-zinc-300">Exismic Rewards</span>
          </div>
          <div className="flex items-center gap-6 text-zinc-400">
            <Link href="/terms-of-service" className="hover:text-zinc-200">Terms</Link>
            <Link href="/privacy-policy" className="hover:text-zinc-200">Privacy</Link>
            <Link href="/help" className="hover:text-zinc-200">Support</Link>
            <Link href="/" className="text-amber-400 hover:text-amber-200 font-bold">Studio</Link>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* GAMIFIED MODAL: TECH TRIVIA */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isQuizModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-purple-500/40 bg-gradient-to-b from-[#140f26] via-[#0d091a] to-[#070510] p-6 text-white shadow-[0_0_60px_rgba(168,85,247,0.2)]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-white">
                      Daily Tech Trivia
                    </h3>
                    <p className="text-xs text-zinc-400">10 RP per correct answer • Instant credit</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuizModalOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {todayTrivia.map((q, qIndex) => {
                  const review = quizReviewData ? quizReviewData[qIndex] : null;

                  return (
                    <div
                      key={q.id}
                      className="space-y-3 rounded-2xl border border-white/[0.08] bg-zinc-900/50 p-4"
                    >
                      <div className="text-xs font-bold text-white flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-mono text-[11px] text-purple-300 border border-purple-500/30">
                          {qIndex + 1}
                        </span>
                        <span>{q.question}</span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIndex) => {
                          const isSelected = quizAnswers[qIndex] === optIndex;
                          const isCorrect = review ? review.correctIndex === optIndex : null;

                          return (
                            <button
                              key={optIndex}
                              onClick={() => {
                                soundController.playClick();
                                !quizSubmitted &&
                                  setQuizAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
                              }}
                              disabled={quizSubmitted || profile?.hasCompletedQuizToday}
                              onMouseEnter={() => soundController.playHover()}
                              className={cn(
                                "flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs transition-all",
                                isCorrect === true &&
                                  "border-emerald-500 bg-emerald-950/50 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
                                isCorrect === false &&
                                  isSelected &&
                                  "border-rose-500 bg-rose-950/50 text-rose-200",
                                isCorrect === null &&
                                  isSelected &&
                                  "border-purple-400 bg-purple-950/60 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]",
                                isCorrect === null &&
                                  !isSelected &&
                                  "border-white/[0.08] bg-zinc-900/60 hover:border-purple-400/40 hover:bg-zinc-900"
                              )}
                            >
                              <span className="font-medium">{opt}</span>
                              {isCorrect === true && (
                                <Check className="h-4 w-4 text-emerald-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {review && (
                        <div className="mt-2 rounded-xl bg-purple-950/40 p-3 text-[11px] text-purple-200 border border-purple-500/30 leading-relaxed">
                          💡 <strong>Explanation:</strong> {review.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-white/[0.08] pt-4">
                <button
                  onClick={() => setIsQuizModalOpen(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
                >
                  Close
                </button>
                {!profile?.hasCompletedQuizToday && !quizSubmitted && (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={isSubmittingQuiz}
                    className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:brightness-110 disabled:opacity-50"
                  >
                    {isSubmittingQuiz ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Submit Answers (+30 RP)"
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: SUBMIT BOUNTY PROOF */}
      {/* ======================================================== */}
      <AnimatePresence>
        {activeSubmittingQuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="relative w-full max-w-md rounded-3xl border border-cyan-400/40 bg-[#0d1020] p-6 text-white shadow-2xl"
            >
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                {activeSubmittingQuest.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                {activeSubmittingQuest.description}
              </p>

              <div className="mt-4">
                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-300">
                  Verification Link / Note:
                </label>
                <input
                  type="text"
                  placeholder="https://tiktok.com/@... or youtube link"
                  value={questProofUrl}
                  onChange={(e) => setQuestProofUrl(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setActiveSubmittingQuest(null)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitProofQuest}
                  disabled={isCompletingQuest}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 px-5 py-2 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 disabled:opacity-50"
                >
                  {isCompletingQuest ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Proof"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: CONFIRM REDEMPTION */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedRedeemReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="relative w-full max-w-md rounded-3xl border border-amber-400/40 bg-gradient-to-b from-[#141224] to-[#090814] p-6 text-white shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            >
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Claim Reward Voucher
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                You are about to spend{" "}
                <strong className="text-amber-300">
                  {selectedRedeemReward.costPoints.toLocaleString()} RP
                </strong>{" "}
                for:
              </p>

              <div className="my-4 rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] p-4">
                <div className="text-sm font-black text-white">{selectedRedeemReward.title}</div>
                <div className="text-xs text-zinc-400 mt-1">{selectedRedeemReward.description}</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedRedeemReward(null)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRedemption}
                  disabled={isRedeeming}
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-5 py-2 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 disabled:opacity-50"
                >
                  {isRedeeming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Generate Voucher Code"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: CODE DISPLAY POPUP (VAULT UNLOCK REVEAL) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {generatedVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 16 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/60 bg-gradient-to-b from-[#1c1430] via-[#100b20] to-[#080512] p-8 text-center text-white shadow-[0_0_80px_rgba(245,158,11,0.4)]"
            >
              {/* Radiant Light Beam */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-orange-400 shadow-[0_0_25px_rgba(245,158,11,1)]" />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/20 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                <Gift className="h-7 w-7 animate-bounce" />
              </div>

              <h3 className="mt-4 text-lg font-black uppercase tracking-wider text-white">
                Voucher Unlocked!
              </h3>
              <p className="text-xs text-zinc-400 mt-1">{generatedVoucher.reward.title}</p>

              {/* Perforated Holographic Code Card */}
              <div className="my-5 rounded-2xl border border-amber-400/40 bg-black/90 p-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <div className="font-mono text-2xl font-black text-amber-300 select-all tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.7)]">
                  {generatedVoucher.voucherCode}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCopyVoucher(generatedVoucher.voucherCode)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-zinc-800 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-zinc-700 transition-all"
                >
                  <Copy className="h-4 w-4" /> {copiedCode ? "Copied!" : "Copy Code"}
                </button>
                <button
                  onClick={() => {
                    const codeToRedeem = generatedVoucher.voucherCode;
                    setGeneratedVoucher(null);
                    setPrefilledPromoCode(codeToRedeem);
                    setIsPromoModalOpen(true);
                  }}
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:brightness-110 transition-all"
                >
                  Redeem Now
                </button>
              </div>

              <button
                onClick={() => setGeneratedVoucher(null)}
                className="mt-4 text-xs font-medium text-zinc-500 hover:text-zinc-300"
              >
                Close &amp; View All Vouchers
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TARGET SELECTOR MODAL */}
      <TargetSelectorModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        catalog={catalog}
        selectedGoalId={profile?.selectedGoalId || "reward_pro_30d"}
        userPoints={profile?.points || 0}
        onSelectTarget={handleSetGoal}
      />

      {/* IN-APP PROMO MODAL */}
      <RedeemPromoModal
        isOpen={isPromoModalOpen}
        initialCode={prefilledPromoCode}
        onClose={() => {
          setIsPromoModalOpen(false);
          setPrefilledPromoCode("");
        }}
      />
    </div>
  );
}
