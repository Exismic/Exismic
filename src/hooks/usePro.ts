"use client";

import { useEffect, useCallback } from "react";
import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export interface ProUserRecord {
  id?: string;
  name?: string | null;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
  plan?: string | null;
  planType?: string | null;
  is_pro?: boolean;
  subscriptionStatus?: string | null;
  subscription_status?: string | null;
  planExpiresAt?: string | Date | null;
  plan_expires_at?: string | Date | null;
  avatar_frame?: string | null;
  name_gradient?: string | null;
  custom_avatar_url?: string | null;
  discord_user_id?: string | null;
  aiGenerationsUsed?: number;
  aiGenerationsLimit?: number;
  nextResetDate?: string | Date | null;
  role?: string | null;
}

function resolveProStatus(data: ProUserRecord | null) {
  if (!data) return false;
  if (data.is_pro === true) return true;

  const plan = (data.plan || data.planType || "free").toLowerCase();
  const subscriptionStatus = (data.subscriptionStatus || data.subscription_status || "none").toLowerCase();
  const rawExpiry = data.planExpiresAt || data.plan_expires_at;
  const expiresAt = rawExpiry ? new Date(rawExpiry) : null;

  const isProPlan = plan.includes("pro") || (plan !== "free" && plan !== "none");
  const isSubActive = subscriptionStatus === "active" || subscriptionStatus === "pro";
  const hasEntitlement = isProPlan || isSubActive;

  return hasEntitlement && (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt > new Date());
}

let profileRequest: Promise<ProUserRecord | null> | null = null;
let profileCache: { data: ProUserRecord; fetchedAt: number } | null = null;

async function fetchCanonicalProfile(force = false): Promise<ProUserRecord | null> {
  if (!force && profileCache && Date.now() - profileCache.fetchedAt < 30_000) {
    return profileCache.data;
  }
  if (profileRequest) return profileRequest;

  profileRequest = fetch("/api/user/profile", {
    cache: "no-store",
    credentials: "same-origin",
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const json = await response.json();
      if (!json.success || !json.user) {
        return null;
      }
      const data = json.user as ProUserRecord;
      profileCache = { data, fetchedAt: Date.now() };
      return data;
    })
    .catch(() => null)
    .finally(() => {
      profileRequest = null;
    });

  return profileRequest;
}

interface ProStore {
  isPro: boolean;
  isLoading: boolean;
  user: ProUserRecord | null;
  authUser: User | null;
  isInitialized: boolean;
  setState: (data: Partial<ProStore>) => void;
}

const useProStore = create<ProStore>((set) => ({
  isPro: false,
  isLoading: true,
  user: null,
  authUser: null,
  isInitialized: false,
  setState: (data) => set((prev) => ({ ...prev, ...data })),
}));

let proFetchPromise: Promise<void> | null = null;
let singletonListenersAttached = false;
let globalChannel: any = null;

async function loadGlobalProStatus(showLoading = false, force = false): Promise<void> {
  if (showLoading && !useProStore.getState().isInitialized) {
    useProStore.getState().setState({ isLoading: true });
  }

  if (proFetchPromise && !force) {
    return proFetchPromise;
  }

  proFetchPromise = (async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const currentAuthUser = session?.user || null;

      if (!session?.user?.email) {
        useProStore.getState().setState({
          authUser: null,
          user: null,
          isPro: false,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      const data = await fetchCanonicalProfile(force);
      if (data) {
        useProStore.getState().setState({
          authUser: currentAuthUser,
          user: data,
          isPro: resolveProStatus(data),
          isLoading: false,
          isInitialized: true,
        });
      } else {
        useProStore.getState().setState({
          authUser: currentAuthUser,
          user: null,
          isPro: false,
          isLoading: false,
          isInitialized: true,
        });
        if (currentAuthUser) {
          setTimeout(() => {
            if (!useProStore.getState().user) {
              void loadGlobalProStatus(false, true);
            }
          }, 1500);
        }
      }
    } catch (err) {
      console.error("usePro status refresh error:", err);
      useProStore.getState().setState({ isLoading: false, isInitialized: true });
    } finally {
      proFetchPromise = null;
    }
  })();

  return proFetchPromise;
}

function initSingletonProSubscriptions() {
  if (typeof window === "undefined" || singletonListenersAttached) return;
  singletonListenersAttached = true;

  const supabase = createClient();

  // 1. Single Realtime Channel
  try {
    const channelId = `pro_updates_global_${Math.random().toString(36).substring(7)}`;
    globalChannel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'User',
        },
        async (payload: any) => {
          const { data }: any = await supabase.auth.getSession();
          const session = data?.session;
          const changedUser = {
            ...(payload.old as ProUserRecord),
            ...(payload.new as ProUserRecord),
          };

          if (
            session?.user?.id &&
            (changedUser.id === session.user.id ||
              (session.user.email && changedUser.email === session.user.email))
          ) {
            void loadGlobalProStatus(false, true);
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn("Failed to subscribe to pro realtime updates:", err);
  }

  // 2. Auth State Change
  supabase.auth.onAuthStateChange(() => {
    profileCache = null;
    void loadGlobalProStatus(true, true);
  });

  // 3. Window & Tab Listeners
  const refreshSilent = () => {
    if (document.visibilityState === "visible") {
      void loadGlobalProStatus(false, false);
    }
  };
  const refreshForced = () => void loadGlobalProStatus(false, true);

  window.addEventListener("focus", refreshSilent);
  window.addEventListener("exismic:pro-status-changed", refreshForced);
  document.addEventListener("visibilitychange", refreshSilent);
}

export function usePro() {
  const store = useProStore();

  useEffect(() => {
    initSingletonProSubscriptions();
    if (!store.isInitialized) {
      void loadGlobalProStatus(true);
    }
  }, [store.isInitialized]);

  const refresh = useCallback(() => {
    return loadGlobalProStatus(true, true);
  }, []);

  return {
    isPro: store.isPro,
    isLoading: store.isLoading,
    user: store.user,
    authUser: store.authUser,
    refresh,
  };
}

