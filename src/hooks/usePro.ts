"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  theme_preference?: string | null;
  profile_theme?: string | null;
  discord_user_id?: string | null;
  aiGenerationsUsed?: number;
  aiGenerationsLimit?: number;
  nextResetDate?: string | Date | null;
}

function resolveProStatus(data: ProUserRecord | null) {
  if (typeof data?.is_pro === "boolean") return data.is_pro;

  const plan = (data?.plan || data?.planType || "free").toLowerCase();
  const subscriptionStatus = (data?.subscriptionStatus || data?.subscription_status || "none").toLowerCase();
  const rawExpiry = data?.planExpiresAt || data?.plan_expires_at;
  const expiresAt = rawExpiry ? new Date(rawExpiry) : null;
  const hasEntitlement = plan === "pro" || subscriptionStatus === "active";

  return hasEntitlement && (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt > new Date());
}

let profileRequest: Promise<ProUserRecord> | null = null;
let profileCache: { data: ProUserRecord; fetchedAt: number } | null = null;

async function fetchCanonicalProfile(force = false) {
  if (!force && profileCache && Date.now() - profileCache.fetchedAt < 15_000) {
    return profileCache.data;
  }
  if (profileRequest) return profileRequest;

  profileRequest = fetch("/api/user/profile", {
    cache: "no-store",
    credentials: "same-origin",
  })
    .then(async (response) => {
      const json = await response.json();
      if (!response.ok || !json.success || !json.user) {
        throw new Error(json.error || "Could not verify membership");
      }
      const data = json.user as ProUserRecord;
      profileCache = { data, fetchedAt: Date.now() };
      return data;
    })
    .finally(() => {
      profileRequest = null;
    });

  return profileRequest;
}

export function usePro() {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<ProUserRecord | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const loadProStatus = useCallback(async (showLoading = false, force = false) => {
    if (showLoading) setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthUser(session?.user || null);

      if (!session?.user?.email) {
        setUser(null);
        setIsPro(false);
        return;
      }

      const data = await fetchCanonicalProfile(force);
      setUser(data);
      setIsPro(resolveProStatus(data));
    } catch (err) {
      // Keep the last verified entitlement during a transient request failure.
      // A failed refresh must never make an active member look like a Free user.
      console.error("usePro status refresh error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadProStatus(true);

    const channelId = `pro_updates_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'User',
        },
        async (payload) => {
          const { data: { session } } = await supabase.auth.getSession();
          const changedUser = {
            ...(payload.old as ProUserRecord),
            ...(payload.new as ProUserRecord),
          };

          if (
            session?.user?.id &&
            (changedUser.id === session.user.id ||
              (session.user.email && changedUser.email === session.user.email))
          ) {
            // Re-read the canonical server result instead of trusting a partial
            // realtime payload with database column naming.
            void loadProStatus(false, true);
          }
        }
      )
      .subscribe();

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadProStatus(false);
    };
    const refreshAfterAccountChange = () => void loadProStatus(false);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      profileCache = null;
      void loadProStatus(true, true);
    });

    window.addEventListener("focus", refreshAfterAccountChange);
    window.addEventListener("exismic:pro-status-changed", refreshAfterAccountChange);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      void supabase.removeChannel(channel);
      subscription.unsubscribe();
      window.removeEventListener("focus", refreshAfterAccountChange);
      window.removeEventListener("exismic:pro-status-changed", refreshAfterAccountChange);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadProStatus, supabase]);

  const refresh = useCallback(
    () => loadProStatus(true, true),
    [loadProStatus]
  );

  return { isPro, isLoading, user, authUser, refresh };
}
