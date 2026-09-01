"use client";

import { useEffect, useCallback } from "react";
import { create } from "zustand";

export interface QuestItem {
  id: string;
  templateId: string;
  type: "daily" | "weekly";
  title: string;
  description: string;
  icon: string;
  category: "creation" | "exploration" | "coding" | "documents" | "community" | "vault" | "mastery" | string;
  target: number;
  current: number;
  rewardCredits: number;
  actionUrl: string;
  actionLabel: string;
  completed: boolean;
  claimed: boolean;
  difficulty?: "normal" | "epic" | "legendary";
}

export interface QuestSectionData {
  quests: QuestItem[];
  totalCompleted: number;
  totalAvailable: number;
  unclaimedCount: number;
  cycleKey: string;
  nextResetUTC: string;
}

export interface QuestsResponse {
  daily: QuestSectionData;
  weekly: QuestSectionData;
  quests?: QuestItem[];
  totalCompleted?: number;
  totalAvailable?: number;
  totalUnclaimed?: number;
  unclaimedCount?: number;
  cycleKey?: string;
  nextResetUTC?: string;
}

function formatCountdown(targetDateStr: string | null, fallbackType: "daily" | "weekly"): string {
  const now = Date.now();
  let targetMs = targetDateStr ? new Date(targetDateStr).getTime() : 0;

  if (!targetMs || isNaN(targetMs)) {
    const nowDate = new Date();
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(nowDate.getTime() + IST_OFFSET_MS);

    if (fallbackType === "daily") {
      let targetYear = istDate.getUTCFullYear();
      let targetMonth = istDate.getUTCMonth();
      let targetDay = istDate.getUTCDate();

      if (istDate.getUTCHours() >= 12) {
        const tomorrow = new Date(Date.UTC(targetYear, targetMonth, targetDay + 1));
        targetYear = tomorrow.getUTCFullYear();
        targetMonth = tomorrow.getUTCMonth();
        targetDay = tomorrow.getUTCDate();
      }
      targetMs = new Date(Date.UTC(targetYear, targetMonth, targetDay, 6, 30, 0, 0)).getTime();
    } else {
      const istDayOfWeek = istDate.getUTCDay();
      let daysUntilNextMon = ((8 - (istDayOfWeek || 7)) % 7) || 7;
      if (istDayOfWeek === 1 && istDate.getUTCHours() < 12) {
        daysUntilNextMon = 0;
      }
      const nextMonDate = new Date(Date.UTC(istDate.getUTCFullYear(), istDate.getUTCMonth(), istDate.getUTCDate() + daysUntilNextMon));
      targetMs = new Date(Date.UTC(nextMonDate.getUTCFullYear(), nextMonDate.getUTCMonth(), nextMonDate.getUTCDate(), 6, 30, 0, 0)).getTime();
    }
  }

  const diff = Math.max(0, targetMs - now);
  if (diff <= 0) return "00h 00m 00s";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

interface QuestStore {
  activeTab: "daily" | "weekly";
  dailyQuests: QuestItem[];
  weeklyQuests: QuestItem[];
  dailyNextResetUTC: string | null;
  weeklyNextResetUTC: string | null;
  dailyTimeRemaining: string;
  weeklyTimeRemaining: string;
  loading: boolean;
  claimingId: string | null;
  isInitialized: boolean;
  setActiveTab: (tab: "daily" | "weekly") => void;
  setClaimingId: (id: string | null) => void;
  setState: (data: Partial<QuestStore>) => void;
}

const useQuestStore = create<QuestStore>((set) => ({
  activeTab: "daily",
  dailyQuests: [],
  weeklyQuests: [],
  dailyNextResetUTC: null,
  weeklyNextResetUTC: null,
  dailyTimeRemaining: "00h 00m 00s",
  weeklyTimeRemaining: "0d 00h 00m",
  loading: true,
  claimingId: null,
  isInitialized: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setClaimingId: (id) => set({ claimingId: id }),
  setState: (data) => set((prev) => ({ ...prev, ...data })),
}));

let questFetchPromise: Promise<void> | null = null;
let lastQuestFetchTime = 0;
let questListenersAttached = false;
const prevKnownCompleted = new Set<string>();

async function fetchGlobalQuests(force = false): Promise<void> {
  const now = Date.now();
  if (!force && questFetchPromise) {
    return questFetchPromise;
  }
  if (!force && now - lastQuestFetchTime < 15_000 && useQuestStore.getState().isInitialized) {
    return;
  }

  lastQuestFetchTime = now;

  questFetchPromise = (async () => {
    try {
      const res = await fetch("/api/user/quests", { cache: "no-store" });
      if (res.ok) {
        const data: QuestsResponse = await res.json();
        const incomingDaily = data.daily?.quests || data.quests || [];
        const incomingWeekly = data.weekly?.quests || [];
        const allIncoming = [...incomingDaily, ...incomingWeekly];

        // Notify new quest completions
        if (useQuestStore.getState().isInitialized && typeof window !== "undefined") {
          for (const q of allIncoming) {
            if (q.completed && !q.claimed && !prevKnownCompleted.has(q.id)) {
              window.dispatchEvent(new CustomEvent("quest-completed", { detail: q }));
            }
          }
        }

        prevKnownCompleted.clear();
        for (const q of allIncoming) {
          if (q.completed) prevKnownCompleted.add(q.id);
        }

        useQuestStore.getState().setState({
          dailyQuests: incomingDaily,
          weeklyQuests: incomingWeekly,
          dailyNextResetUTC: data.daily?.nextResetUTC || data.nextResetUTC || null,
          weeklyNextResetUTC: data.weekly?.nextResetUTC || null,
          loading: false,
          isInitialized: true,
        });
      } else {
        useQuestStore.getState().setState({ loading: false, isInitialized: true });
      }
    } catch (err) {
      console.warn("Failed to load quests:", err);
      useQuestStore.getState().setState({ loading: false, isInitialized: true });
    } finally {
      questFetchPromise = null;
    }
  })();

  return questFetchPromise;
}

function initSingletonQuestSubscriptions() {
  if (typeof window === "undefined" || questListenersAttached) return;
  questListenersAttached = true;

  const updateTimers = () => {
    const { dailyNextResetUTC, weeklyNextResetUTC } = useQuestStore.getState();
    useQuestStore.getState().setState({
      dailyTimeRemaining: formatCountdown(dailyNextResetUTC, "daily"),
      weeklyTimeRemaining: formatCountdown(weeklyNextResetUTC, "weekly"),
    });
  };

  updateTimers();
  setInterval(updateTimers, 1000);

  const handleUpdate = () => {
    void fetchGlobalQuests(true);
  };

  window.addEventListener("quests-updated", handleUpdate);
  window.addEventListener("credits-updated", handleUpdate);
  window.addEventListener("focus", () => {
    void fetchGlobalQuests(false);
  });

  setInterval(() => {
    void fetchGlobalQuests(false);
  }, 60_000);
}

export function useQuests() {
  const store = useQuestStore();

  useEffect(() => {
    initSingletonQuestSubscriptions();
    if (!store.isInitialized) {
      void fetchGlobalQuests();
    }
  }, [store.isInitialized]);

  const claimQuest = async (questId: string, questType?: "daily" | "weekly") => {
    if (store.claimingId) return false;
    store.setClaimingId(questId);

    const targetType = questType || (questId.startsWith("weekly_") ? "weekly" : "daily");

    try {
      const res = await fetch("/api/user/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId, questType: targetType }),
      });

      if (res.ok) {
        if (targetType === "weekly") {
          useQuestStore.getState().setState({
            weeklyQuests: useQuestStore.getState().weeklyQuests.map((q) =>
              q.id === questId || q.templateId === questId ? { ...q, claimed: true } : q
            ),
          });
        } else {
          useQuestStore.getState().setState({
            dailyQuests: useQuestStore.getState().dailyQuests.map((q) =>
              q.id === questId || q.templateId === questId ? { ...q, claimed: true } : q
            ),
          });
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("credits-updated"));
          window.dispatchEvent(new Event("quests-updated"));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to claim quest reward:", err);
      return false;
    } finally {
      store.setClaimingId(null);
    }
  };

  const claimAll = async (section: "daily" | "weekly" | "all" = "all") => {
    const { dailyQuests, weeklyQuests } = store;
    let targets: QuestItem[] = [];

    if (section === "daily" || section === "all") {
      targets.push(...dailyQuests.filter((q) => q.completed && !q.claimed));
    }
    if (section === "weekly" || section === "all") {
      targets.push(...weeklyQuests.filter((q) => q.completed && !q.claimed));
    }

    if (targets.length === 0) return 0;

    let successCount = 0;
    for (const q of targets) {
      const ok = await claimQuest(q.id, q.type || (q.id.startsWith("weekly_") ? "weekly" : "daily"));
      if (ok) successCount++;
    }
    return successCount;
  };

  const dailyUnclaimedCount = store.dailyQuests.filter((q) => q.completed && !q.claimed).length;
  const dailyCompletedCount = store.dailyQuests.filter((q) => q.completed || q.claimed).length;

  const weeklyUnclaimedCount = store.weeklyQuests.filter((q) => q.completed && !q.claimed).length;
  const weeklyCompletedCount = store.weeklyQuests.filter((q) => q.completed || q.claimed).length;

  const unclaimedCount = dailyUnclaimedCount + weeklyUnclaimedCount;
  const completedCount = dailyCompletedCount + weeklyCompletedCount;
  const totalAvailable = (store.dailyQuests.length || 4) + (store.weeklyQuests.length || 4);

  const currentQuests = store.activeTab === "daily" ? store.dailyQuests : store.weeklyQuests;
  const currentUnclaimed = store.activeTab === "daily" ? dailyUnclaimedCount : weeklyUnclaimedCount;
  const currentCompleted = store.activeTab === "daily" ? dailyCompletedCount : weeklyCompletedCount;
  const currentTotal = store.activeTab === "daily" ? store.dailyQuests.length : store.weeklyQuests.length;
  const currentTimeRemaining = store.activeTab === "daily" ? store.dailyTimeRemaining : store.weeklyTimeRemaining;

  return {
    activeTab: store.activeTab,
    setActiveTab: store.setActiveTab,
    quests: currentQuests,
    dailyQuests: store.dailyQuests,
    weeklyQuests: store.weeklyQuests,
    dailyUnclaimedCount,
    dailyCompletedCount,
    weeklyUnclaimedCount,
    weeklyCompletedCount,
    unclaimedCount,
    completedCount,
    totalAvailable,
    currentUnclaimed,
    currentCompleted,
    currentTotal,
    currentTimeRemaining,
    timeRemaining: store.dailyTimeRemaining,
    dailyTimeRemaining: store.dailyTimeRemaining,
    weeklyTimeRemaining: store.weeklyTimeRemaining,
    dailyNextResetUTC: store.dailyNextResetUTC,
    weeklyNextResetUTC: store.weeklyNextResetUTC,
    nextResetUTC: store.dailyNextResetUTC,
    loading: store.loading,
    claimingId: store.claimingId,
    claimQuest,
    claimAll,
    refreshQuests: () => fetchGlobalQuests(true),
  };
}

