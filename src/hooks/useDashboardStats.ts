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

export function useDashboardStats() {
  const { credits, dailyCredits, lifetimeCredits, plan, userId, loading: creditsLoading } = useCredits();
  const { isPro: verifiedIsPro, isLoading: proLoading, user: proUser, authUser } = usePro();
  const [stats, setStats] = useState({
    toolsUsedToday: 0,
    totalGenerations: 0,
    loading: true
  });
  const fetchUsageStats = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch("/api/files/history?summary=1", {
        cache: "no-store",
      });
      
      if (response.status === 401) {
        // Handle unauthenticated or stale session gracefully
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      if (!response.ok) {
        throw new Error(`Usage summary failed with ${response.status}`);
      }
      const summary = await response.json();

      setStats({
        toolsUsedToday: summary.toolsUsedToday || 0,
        totalGenerations: summary.totalGenerations || 0,
        loading: false
      });
    } catch (error) {
      console.warn("Error fetching dashboard stats:", error);
      setStats(prev => ({ ...prev, loading: false }));
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
    proUser?.role === "admin" ||
    proUser?.is_pro ||
    authUser?.email === "syedyaseeralirayan@gmail.com" ||
    proUser?.email === "syedyaseeralirayan@gmail.com"
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
