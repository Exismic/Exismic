import { useState, useEffect, useCallback } from "react";
import { useCredits } from "./useCredits";
import { usePro } from "./usePro";

export interface DashboardStats {
  creditsRemaining: number;
  dailyCredits: number;
  lifetimeCredits: number;
  toolsUsedToday: number;
  totalGenerations: number;
  plan: string;
  isPro: boolean;
  loading: boolean;
}

let usageSummaryCache: { data: { toolsUsedToday: number; totalGenerations: number }; fetchedAt: number } | null = null;
let usageSummaryPromise: Promise<{ toolsUsedToday: number; totalGenerations: number } | null> | null = null;

export function useDashboardStats() {
  const { credits, dailyCredits, lifetimeCredits, plan, userId, loading: creditsLoading } = useCredits();
  const { isPro: verifiedIsPro, isLoading: proLoading, user: proUser, authUser } = usePro();
  const [stats, setStats] = useState({
    toolsUsedToday: usageSummaryCache?.data?.toolsUsedToday || 0,
    totalGenerations: usageSummaryCache?.data?.totalGenerations || 0,
    loading: !usageSummaryCache,
  });

  const fetchUsageStats = useCallback(async () => {
    if (!userId) return;

    if (usageSummaryCache && Date.now() - usageSummaryCache.fetchedAt < 20_000) {
      setStats({
        toolsUsedToday: usageSummaryCache.data.toolsUsedToday,
        totalGenerations: usageSummaryCache.data.totalGenerations,
        loading: false,
      });
      return;
    }

    if (usageSummaryPromise) {
      const data = await usageSummaryPromise;
      if (data) {
        setStats({
          toolsUsedToday: data.toolsUsedToday,
          totalGenerations: data.totalGenerations,
          loading: false,
        });
      }
      return;
    }

    usageSummaryPromise = (async () => {
      try {
        const response = await fetch("/api/files/history?summary=1", {
          cache: "no-store",
        });
        
        if (!response.ok) return null;
        const summary = await response.json();
        const data = {
          toolsUsedToday: summary.toolsUsedToday || 0,
          totalGenerations: summary.totalGenerations || 0,
        };
        usageSummaryCache = { data, fetchedAt: Date.now() };
        return data;
      } catch (error) {
        console.warn("Error fetching dashboard stats:", error);
        return null;
      } finally {
        usageSummaryPromise = null;
      }
    })();

    const result = await usageSummaryPromise;
    if (result) {
      setStats({
        toolsUsedToday: result.toolsUsedToday,
        totalGenerations: result.totalGenerations,
        loading: false,
      });
    } else {
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUsageStats();
    }
  }, [userId, fetchUsageStats]);

  useEffect(() => {
    if (!userId) return;
    const refreshTimer = window.setInterval(fetchUsageStats, 30_000);
    return () => window.clearInterval(refreshTimer);
  }, [userId, fetchUsageStats]);

  const isPro = Boolean(
    verifiedIsPro ||
    plan === "pro" ||
    proUser?.is_pro
  );

  return {
    creditsRemaining: credits,
    dailyCredits,
    lifetimeCredits,
    toolsUsedToday: stats.toolsUsedToday,
    totalGenerations: stats.totalGenerations,
    plan: isPro ? "pro" : plan,
    isPro,
    loading: creditsLoading || stats.loading || proLoading
  };
}
