"use client";

import { useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PRICING_CONFIG } from '@/config/pricing';
import { create } from 'zustand';

export interface CreditState {
  dailyCredits: number;
  bonusCredits: number;
  lifetimeCredits: number;
  creditsLastReset: string;
  aiMessagesToday: number;
  aiMessagesReset: string;
  plan: 'free' | 'pro';
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

export function useCredits() {
  const supabase = useMemo(() => createClient(), []);
  const store = useCreditStore();
  const { 
    userId, state, loading, showUpsell, notification, countdown,
    setUserId, setState, updateState, setLoading, setShowUpsell, setNotification, setCountdown
  } = store;

  // Robust session and countdown initialization for every hook instance
  useEffect(() => {
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
        
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        
        if (hours === 0 && minutes === 0 && seconds === 0) {
          window.location.reload();
        }
      } catch (err) {
        console.error("Countdown error:", err);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const newUserId = session?.user?.id || null;
      if (useCreditStore.getState().userId !== newUserId) {
        setUserId(newUserId);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id || null;
      if (useCreditStore.getState().userId !== newUserId) {
        setUserId(newUserId);
      }
    });

    return () => {
      clearInterval(timer);
      subscription.unsubscribe();
    };
  }, [supabase, setCountdown, setUserId]);

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, [setNotification]);

  const fetchCredits = useCallback(async () => {
    // Re-verify auth state before each fetch
    if (!userId) return;
    
    // Prevent refetching if we already have the state and are not loading
    if (useCreditStore.getState().state) {
      setLoading(false);
      return;
    }

    try {
      // Use no-store to avoid Next.js caching across users or sessions
      const response = await fetch(`/api/user/credits?t=${Date.now()}`, { cache: 'no-store' });
      
      if (response.status === 401) {
        setLoading(false);
        return;
      }

      const json = await response.json();

      if (json.success && json.data) {
        const data = json.data;
        setState({
          dailyCredits: data.dailyCredits,
          bonusCredits: data.bonusCredits || 0,
          lifetimeCredits: data.lifetimeCredits,
          creditsLastReset: data.lastReset || new Date().toISOString(),
          aiMessagesToday: data.aiMessagesToday || 0,
          aiMessagesReset: new Date().toISOString(),
          plan: data.plan || 'free',
          todayClaim: data.todayClaim || null,
        });
      } else {
        console.warn('Credits API returned error:', json.error);
      }
    } catch (err) {
      console.warn('Failed to fetch credits via API:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, setState, setLoading]);

  useEffect(() => {
    if (userId) {
      fetchCredits();
    } else {
      setLoading(false);
    }
  }, [userId, fetchCredits, setLoading]);

  // Real-time listener specifically for the current user
  useEffect(() => {
    if (!userId) return;

    const channelId = `credits-${userId}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'User',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const data = payload.new;
          updateState({
            dailyCredits: data.daily_credits,
            bonusCredits: data.bonus_credits,
            lifetimeCredits: data.lifetime_credits,
            aiMessagesToday: data.ai_messages_today,
            plan: data.plan,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, updateState]);

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
    refreshCredits: () => {
      // Force fetch by skipping state check
      if (userId) {
        // Fetch in background to allow smooth number count animation without skeleton flash
        fetch(`/api/user/credits?t=${Date.now()}`, { cache: 'no-store' })
          .then(res => res.json())
          .then(json => {
            if (json.success && json.data) {
              setState({
                dailyCredits: json.data.dailyCredits,
                bonusCredits: json.data.bonusCredits || 0,
                lifetimeCredits: json.data.lifetimeCredits,
                creditsLastReset: json.data.lastReset || new Date().toISOString(),
                aiMessagesToday: json.data.aiMessagesToday || 0,
                aiMessagesReset: new Date().toISOString(),
                plan: json.data.plan || 'free',
                todayClaim: json.data.todayClaim || null,
              });
            }
          });
      }
    },
    countdown
  };
}
