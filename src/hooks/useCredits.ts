"use client";

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PRICING_CONFIG } from '@/config/pricing';
import { create } from 'zustand';

declare global {
  interface Window {
    __exismicFetchIntercepted?: boolean;
    __exismicXhrIntercepted?: boolean;
    refreshExismicCredits?: () => void;
  }
}

export interface CreditState {
  dailyCredits: number;
  bonusCredits: number;
  lifetimeCredits: number;
  creditsLastReset: string;
  aiMessagesToday: number;
  aiMessagesReset: string;
  plan: 'free' | 'pro';
  dailyStreak?: number;
  streakShields?: number;
  streakFreezeUsedAt?: string | null;
  streakMilestonesClaimed?: string[];
  todayClaim?: { amount: number; rarity: string; type?: "temporary" | "permanent" } | null;
}

const FREE_LIMITS = {
  credits: 50,
  messages: Infinity // Unlimited messages, but subject to priority/load
};

const PRO_LIMITS = {
  credits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS,
  messages: Infinity
};

interface CreditStore {
  userId: string | null;
  state: CreditState | null;
  loading: boolean;
  showUpsell: boolean;
  notification: { message: string; type: 'success' | 'info' | 'warning' } | null;
  countdown: string;
  isInitialized: boolean;
  setUserId: (id: string | null) => void;
  setState: (state: CreditState | null | ((prev: CreditState | null) => CreditState | null)) => void;
  updateState: (partial: Partial<CreditState>) => void;
  setLoading: (l: boolean) => void;
  setShowUpsell: (s: boolean) => void;
  setNotification: (n: { message: string; type: 'success' | 'info' | 'warning' } | null) => void;
  setCountdown: (c: string) => void;
  setIsInitialized: (i: boolean) => void;
}

const useCreditStore = create<CreditStore>((set) => ({
  userId: null,
  state: null,
  loading: true,
  showUpsell: false,
  notification: null,
  countdown: "",
  isInitialized: false,
  setUserId: (id) => set((current) => {
    if (current.userId === id) return {};

    return {
      userId: id,
      state: null,
      loading: Boolean(id),
      isInitialized: false,
    };
  }),
  setState: (updater) => set((prev) => ({
    state: typeof updater === 'function' ? updater(prev.state) : updater
  })),
  updateState: (partial) => set((prev) => ({
    state: prev.state ? { ...prev.state, ...partial } : null
  })),
  setLoading: (l) => set({ loading: l }),
  setShowUpsell: (s) => set({ showUpsell: s }),
  setNotification: (n) => set({ notification: n }),
  setCountdown: (c) => set({ countdown: c }),
  setIsInitialized: (i) => set({ isInitialized: i }),
}));

let activeCreditsChannel: any = null;
let activeCreditsUserId: string | null = null;
let creditsFetchPromise: Promise<void> | null = null;
let globalCreditsInitialized = false;

function initGlobalCreditsListeners() {
  if (typeof window === "undefined" || globalCreditsInitialized) return;
  globalCreditsInitialized = true;

  // 1. Intercept native window.fetch calls
  if (!window.__exismicFetchIntercepted) {
    window.__exismicFetchIntercepted = true;
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);
      try {
        const url = typeof args[0] === "string" ? args[0] : (args[0] as any)?.url || "";
        const isToolActivity = 
          url.includes("/api/tools") || 
          url.includes("/api/chat") || 
          url.includes("/api/upload") || 
          url.includes("/api/remove-bg") || 
          url.includes("/api/shop") ||
          url.includes("/api/community");

        if (isToolActivity && response.ok) {
          setTimeout(() => {
            if (window.refreshExismicCredits) window.refreshExismicCredits();
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("quests-updated"));
            }
          }, 800);
        }
      } catch (err) {
        console.warn("[Credits Intercept Fetch Error]:", err);
      }
      return response;
    };
  }

  // 2. Intercept XMLHttpRequests
  if (!window.__exismicXhrIntercepted) {
    window.__exismicXhrIntercepted = true;
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string | URL, ...args: any[]) {
      (this as any).__exismicUrl = typeof url === "string" ? url : url.toString();
      return (originalOpen as any).apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, ...args: any[]) {
      this.addEventListener("load", () => {
        const url = (this as any).__exismicUrl || "";
        const isToolActivity = 
          url.includes("/api/tools") || 
          url.includes("/api/chat") || 
          url.includes("/api/upload") || 
          url.includes("/api/remove-bg") || 
          url.includes("/api/shop") ||
          url.includes("/api/community");

        if (isToolActivity && this.status >= 200 && this.status < 300) {
          setTimeout(() => {
            if (window.refreshExismicCredits) window.refreshExismicCredits();
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("quests-updated"));
            }
          }, 800);
        }
      });
      return (originalSend as any).apply(this, args);
    };
  }

  // 3. Global single Countdown Timer
  const updateCountdown = () => {
    try {
      const now = new Date();
      const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const nowIST = new Date(istString);
      
      const nextResetIST = new Date(nowIST);
      nextResetIST.setHours(12, 0, 0, 0); 
      
      if (nowIST.getTime() >= nextResetIST.getTime()) {
        nextResetIST.setDate(nextResetIST.getDate() + 1);
      }
      
      const diff = nextResetIST.getTime() - nowIST.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      useCreditStore.getState().setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      
      if (hours === 0 && minutes === 0 && seconds === 0) {
        if (window.refreshExismicCredits) window.refreshExismicCredits();
      }
    } catch (err) {
      console.error("Countdown error:", err);
    }
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 4. Global Auth session & listener
  const supabase = createClient();
  const updateSessionUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const newUserId = session?.user?.id || null;
    if (useCreditStore.getState().userId !== newUserId) {
      useCreditStore.getState().setUserId(newUserId);
    }
  };
  void updateSessionUser();

  supabase.auth.onAuthStateChange((_event: any, session: any) => {
    const newUserId = session?.user?.id || null;
    if (useCreditStore.getState().userId !== newUserId) {
      useCreditStore.getState().setUserId(newUserId);
    }
  });

  // 5. Window focus refresh
  window.addEventListener("focus", () => {
    if (window.refreshExismicCredits) window.refreshExismicCredits();
  });
}

export function useCredits() {
  const supabase = useMemo(() => createClient(), []);
  const store = useCreditStore();
  const { 
    userId, state, loading, showUpsell, notification, countdown,
    setUserId, setState, updateState, setLoading, setShowUpsell, setNotification, setCountdown
  } = store;

  // Memoized background refresh function with request deduplication
  const lastRefreshRef = useRef<number>(0);
  const refreshCredits = useCallback((force?: boolean | unknown) => {
    const isForce = typeof force === "boolean" ? force : false;
    const now = Date.now();
    if (!isForce && now - lastRefreshRef.current < 2000) return;
    lastRefreshRef.current = now;

    if (useCreditStore.getState().userId) {
      fetch(`/api/user/credits?t=${now}`, { cache: 'no-store' })
        .then(async (res) => {
          if (!res.ok) return null;
          return res.json().catch(() => null);
        })
        .then(json => {
          if (json?.success && json?.data) {
            setState({
              dailyCredits: json.data.dailyCredits,
              bonusCredits: json.data.bonusCredits || 0,
              lifetimeCredits: json.data.lifetimeCredits,
              creditsLastReset: json.data.lastReset || new Date().toISOString(),
              aiMessagesToday: json.data.aiMessagesToday || 0,
              aiMessagesReset: new Date().toISOString(),
              plan: json.data.plan || 'free',
              dailyStreak: json.data.dailyStreak || 0,
              streakShields: json.data.streakShields ?? 0,
              streakFreezeUsedAt: json.data.streakFreezeUsedAt || null,
              streakMilestonesClaimed: json.data.streakMilestonesClaimed || [],
              todayClaim: json.data.todayClaim || null,
            });
          }
        })
        .catch(err => console.warn("[CREDITS_REFRESH_SKIP]", err));
    }
  }, [setState]);

  useEffect(() => {
    initGlobalCreditsListeners();
    if (typeof window !== "undefined") {
      window.refreshExismicCredits = refreshCredits;
    }
  }, [refreshCredits]);

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, [setNotification]);

  const fetchCredits = useCallback(async () => {
    if (!userId) return;
    if (useCreditStore.getState().state) {
      setLoading(false);
      return;
    }
    if (creditsFetchPromise) {
      return creditsFetchPromise;
    }

    creditsFetchPromise = (async () => {
      try {
        const response = await fetch(`/api/user/credits?t=${Date.now()}`, { cache: 'no-store' });
        
        if (response.status === 401) {
          setLoading(false);
          return;
        }

        if (!response.ok) {
          setLoading(false);
          // Auto-retry once after 1.5s if cold start or temporary failure
          setTimeout(() => {
            if (!useCreditStore.getState().state && useCreditStore.getState().userId) {
              void fetchCredits();
            }
          }, 1500);
          return;
        }

        const json = await response.json().catch(() => null);

        if (json?.success && json?.data) {
          const data = json.data;
          setState({
            dailyCredits: data.dailyCredits,
            bonusCredits: data.bonusCredits || 0,
            lifetimeCredits: data.lifetimeCredits,
            creditsLastReset: data.lastReset || new Date().toISOString(),
            aiMessagesToday: data.aiMessagesToday || 0,
            aiMessagesReset: new Date().toISOString(),
            plan: data.plan || 'free',
            dailyStreak: data.dailyStreak || 0,
            streakShields: data.streakShields ?? 0,
            streakFreezeUsedAt: data.streakFreezeUsedAt || null,
            streakMilestonesClaimed: data.streakMilestonesClaimed || [],
            todayClaim: data.todayClaim || null,
          });
        }
      } catch (err) {
        console.warn('Failed to fetch credits via API:', err);
      } finally {
        setLoading(false);
        creditsFetchPromise = null;
      }
    })();

    return creditsFetchPromise;
  }, [userId, setState, setLoading]);

  useEffect(() => {
    if (userId) {
      void fetchCredits();
    } else {
      setLoading(false);
    }
  }, [userId, fetchCredits, setLoading]);

  // Subscribe to real-time credit updates (safe singleton per user)
  useEffect(() => {
    if (!userId) {
      if (activeCreditsChannel) {
        try {
          supabase.removeChannel(activeCreditsChannel);
        } catch {
          // Ignore
        }
        activeCreditsChannel = null;
        activeCreditsUserId = null;
      }
      return;
    }

    if (activeCreditsUserId === userId && activeCreditsChannel) {
      return;
    }

    if (activeCreditsChannel) {
      try {
        supabase.removeChannel(activeCreditsChannel);
      } catch {
        // Ignore
      }
      activeCreditsChannel = null;
    }

    const channelId = `realtime-credits-${userId}-${Math.random().toString(36).slice(2, 9)}`;
    activeCreditsUserId = userId;

    const channel = supabase.channel(channelId);
    activeCreditsChannel = channel;

    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'User',
          filter: `id=eq.${userId}`,
        },
        (payload: any) => {
          const data = payload?.new;
          if (data) {
            useCreditStore.getState().updateState({
              dailyCredits: data.daily_credits,
              bonusCredits: data.bonus_credits,
              lifetimeCredits: data.lifetime_credits,
              aiMessagesToday: data.ai_messages_today,
              plan: data.plan,
            });
          }
        }
      )
  }, [userId, supabase]);

  const deductCredits = async (amount: number) => {
    if (!userId || !state) return false;

    try {
      const response = await fetch('/api/user/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deduct', amount })
      });

      const json = await response.json();

      if (json.success) {
        // Optimistically deduct locally immediately for zero latency feedback
        const currentDaily = useCreditStore.getState().state?.dailyCredits ?? 0;
        const currentBonus = useCreditStore.getState().state?.bonusCredits ?? 0;
        const currentLifetime = useCreditStore.getState().state?.lifetimeCredits ?? 0;

        let remaining = amount;
        let newDaily = currentDaily;
        let newBonus = currentBonus;
        let newLifetime = currentLifetime;

        if (newDaily >= remaining) {
          newDaily -= remaining;
          remaining = 0;
        } else {
          remaining -= newDaily;
          newDaily = 0;
        }

        if (remaining > 0) {
          if (newBonus >= remaining) {
            newBonus -= remaining;
            remaining = 0;
          } else {
            remaining -= newBonus;
            newBonus = 0;
          }
        }

        if (remaining > 0) {
          newLifetime = Math.max(0, newLifetime - remaining);
        }

        updateState({
          dailyCredits: newDaily,
          bonusCredits: newBonus,
          lifetimeCredits: newLifetime
        });

        showNotification(`${amount} credits deducted`, 'info');
        return true;
      } else {
        if (json.error === 'Insufficient credits') {
          setShowUpsell(true);
        }
        console.error("Deduction failed:", json.error);
        return false;
      }
    } catch (err) {
      console.error("Deduction error:", err);
      return false;
    }
  };

  const addCredits = async (amount: number) => {
    void amount;
    showNotification('Credits can only be added after verified payment.', 'warning');
    return false;
  };

  const consumeMessage = async () => {
    if (!userId) return false;
    
    if (!state || loading) {
      await fetchCredits();
    }

    if (!useCreditStore.getState().state) {
      console.warn("[Credits] State missing after fetch, but bypassing to allow chat for user:", userId);
      return true;
    }

    const currentState = useCreditStore.getState().state!;
    const limit = currentState.plan === 'pro' ? PRO_LIMITS.messages : FREE_LIMITS.messages;
    
    if (currentState.plan === 'free' && currentState.aiMessagesToday >= limit) {
      setShowUpsell(true);
      return true;
    }

    try {
      updateState({ aiMessagesToday: currentState.aiMessagesToday + 1 });

      await fetch('/api/user/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'consume-message', amount: 1 })
      });

      return true; 
    } catch (err) {
      console.warn("Credit check failed, but allowing message due to safety bypass:", err);
      return true;
    }
  };

  return {
    credits: (state?.lifetimeCredits ?? 0) + (state?.dailyCredits ?? 0) + (state?.bonusCredits ?? 0),
    dailyCredits: state?.dailyCredits ?? 0,
    bonusCredits: state?.bonusCredits ?? 0,
    lifetimeCredits: state?.lifetimeCredits ?? 0,
    purchasedCredits: state?.lifetimeCredits ?? 0,
    messagesUsed: state?.aiMessagesToday ?? 0,
    plan: state?.plan ?? 'free',
    isPro: state?.plan === 'pro',
    dailyStreak: state?.dailyStreak ?? 0,
    streakShields: state?.streakShields ?? 0,
    streakFreezeUsedAt: state?.streakFreezeUsedAt ?? null,
    streakMilestonesClaimed: state?.streakMilestonesClaimed ?? [],
    todayClaim: state?.todayClaim ?? null,
    loading,
    userId,
    deductCredits,
    addCredits,
    consumeMessage,
    showUpsell,
    setShowUpsell,
    notification,
    toast: showNotification,
    refreshCredits,
    updateState,
    countdown
  };
}
