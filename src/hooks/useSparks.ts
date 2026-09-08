"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  SPARKS_SHOP_ITEMS,
  SparksShopItem,
  getActiveCosmeticsRotation,
  RotationTimers,
} from "@/config/sparks-shop";

export interface SparksState {
  sparks: number;
  lifetimeSparks: number;
  unlockedAvatarFrames: string[];
  unlockedNameGradients: string[];
  unlockedInsignias: string[];
  unlockedCanopies: string[];
  activeAvatarFrame: string | null;
  activeNameGradient: string | null;
  activeInsignia: string | null;
  activeCanopy: string | null;
  voucherCooldowns?: Record<string, { availableAt: string; remainingMs: number; lastPurchasedAt: string }>;
  hasClaimedFreeSparks?: boolean;
}

let globalSparksState: SparksState = {
  sparks: 0,
  lifetimeSparks: 0,
  unlockedAvatarFrames: [],
  unlockedNameGradients: [],
  unlockedInsignias: [],
  unlockedCanopies: [],
  activeAvatarFrame: null,
  activeNameGradient: null,
  activeInsignia: null,
  activeCanopy: null,
  voucherCooldowns: {},
  hasClaimedFreeSparks: false,
};

let sparksListeners: Array<(state: SparksState) => void> = [];

function notifySparksListeners() {
  sparksListeners.forEach((fn) => fn(globalSparksState));
}

export type CosmeticType =
  | "avatar_frame"
  | "name_gradient"
  | "creator_insignia"
  | "studio_canopy";

export function useSparks() {
  const [state, setState] = useState<SparksState>(globalSparksState);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [equippingId, setEquippingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // 1-second interval to update rotation countdowns live
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [rotationOffset, setRotationOffset] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("exismic:sparks_rotation_offset");
        return stored ? parseInt(stored, 10) || 1 : 1;
      } catch {
        return 1;
      }
    }
    return 1;
  });

  const rerollRotation = useCallback(() => {
    setRotationOffset((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem("exismic:sparks_rotation_offset", String(next));
      } catch {}
      return next;
    });
  }, []);

  const rotation = useMemo(() => {
    return getActiveCosmeticsRotation(currentTime, rotationOffset);
  }, [currentTime, rotationOffset]);

  const fetchSparks = useCallback(async () => {
    try {
      const res = await fetch("/api/user/sparks", { cache: "no-store" });
      if (!res.ok) {
        setTimeout(fetchSparks, 1500);
        return;
      }
      const data = await res.json().catch(() => null);
      if (data?.success && data?.profile) {
        globalSparksState = {
          sparks: data.profile.sparks ?? 0,
          lifetimeSparks: data.profile.lifetimeSparks ?? 0,
          unlockedAvatarFrames: data.profile.unlockedAvatarFrames ?? [],
          unlockedNameGradients: data.profile.unlockedNameGradients ?? [],
          unlockedInsignias: data.profile.unlockedInsignias ?? [],
          unlockedCanopies: data.profile.unlockedCanopies ?? [],
          activeAvatarFrame: data.profile.activeAvatarFrame ?? null,
          activeNameGradient: data.profile.activeNameGradient ?? null,
          activeInsignia: data.profile.activeInsignia ?? null,
          activeCanopy: data.profile.activeCanopy ?? null,
          voucherCooldowns: data.profile.voucherCooldowns ?? {},
          hasClaimedFreeSparks: data.profile.hasClaimedFreeSparks ?? false,
        };
        setState(globalSparksState);
        notifySparksListeners();
      }
    } catch (err) {
      console.warn("[useSparks] Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    sparksListeners.push(setState);
    fetchSparks();

    const handleSparksUpdated = () => fetchSparks();
    
    const handleAvatarUpdated = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail !== undefined) {
        if (custom.detail === globalSparksState.activeAvatarFrame) return;
        globalSparksState = { ...globalSparksState, activeAvatarFrame: custom.detail };
        setState(globalSparksState);
        notifySparksListeners();
      } else {
        fetchSparks();
      }
    };

    const handleGradientUpdated = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail !== undefined) {
        if (custom.detail === globalSparksState.activeNameGradient) return;
        globalSparksState = { ...globalSparksState, activeNameGradient: custom.detail };
        setState(globalSparksState);
        notifySparksListeners();
      } else {
        fetchSparks();
      }
    };

    const handleInsigniaUpdated = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail !== undefined) {
        if (custom.detail === globalSparksState.activeInsignia) return;
        globalSparksState = { ...globalSparksState, activeInsignia: custom.detail };
        setState(globalSparksState);
        notifySparksListeners();
      } else {
        fetchSparks();
      }
    };

    const handleCanopyUpdated = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail !== undefined) {
        if (custom.detail === globalSparksState.activeCanopy) return;
        globalSparksState = { ...globalSparksState, activeCanopy: custom.detail };
        setState(globalSparksState);
        notifySparksListeners();
      } else {
        fetchSparks();
      }
    };

    window.addEventListener("sparks-updated", handleSparksUpdated);
    window.addEventListener("avatar-frame-updated", handleAvatarUpdated);
    window.addEventListener("name-gradient-updated", handleGradientUpdated);
    window.addEventListener("insignia-updated", handleInsigniaUpdated);
    window.addEventListener("canopy-updated", handleCanopyUpdated);

    return () => {
      sparksListeners = sparksListeners.filter((fn) => fn !== setState);
      window.removeEventListener("sparks-updated", handleSparksUpdated);
      window.removeEventListener("avatar-frame-updated", handleAvatarUpdated);
      window.removeEventListener("name-gradient-updated", handleGradientUpdated);
      window.removeEventListener("insignia-updated", handleInsigniaUpdated);
      window.removeEventListener("canopy-updated", handleCanopyUpdated);
    };
  }, [fetchSparks]);

  const redeemItem = async (
    itemId: string
  ): Promise<{ success: boolean; error?: string; item?: SparksShopItem; details?: Record<string, unknown> }> => {
    setRedeemingId(itemId);
    try {
      const res = await fetch("/api/user/sparks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Redemption failed" };
      }

      // Immediate optimistic update
      const item = SPARKS_SHOP_ITEMS.find((i) => i.id === itemId);
      if (item) {
        const isFreeGift = item.type === "free_sparks" || itemId === "sparks_free_gift_100";
        const nextSparks = isFreeGift
          ? globalSparksState.sparks + 100
          : Math.max(0, globalSparksState.sparks - item.costSparks);
        const nextFrames = item.type === "avatar_frame"
          ? [...globalSparksState.unlockedAvatarFrames, String(item.value)]
          : globalSparksState.unlockedAvatarFrames;
        const nextGradients = item.type === "name_gradient"
          ? [...globalSparksState.unlockedNameGradients, String(item.value)]
          : globalSparksState.unlockedNameGradients;
        const nextInsignias = item.type === "creator_insignia"
          ? [...globalSparksState.unlockedInsignias, String(item.value)]
          : globalSparksState.unlockedInsignias;
        const nextCanopies = item.type === "studio_canopy"
          ? [...globalSparksState.unlockedCanopies, String(item.value)]
          : globalSparksState.unlockedCanopies;

        globalSparksState = {
          ...globalSparksState,
          sparks: typeof data.remainingSparks === "number" ? data.remainingSparks : nextSparks,
          lifetimeSparks: isFreeGift ? globalSparksState.lifetimeSparks + 100 : globalSparksState.lifetimeSparks,
          hasClaimedFreeSparks: isFreeGift ? true : globalSparksState.hasClaimedFreeSparks,
          unlockedAvatarFrames: nextFrames,
          unlockedNameGradients: nextGradients,
          unlockedInsignias: nextInsignias,
          unlockedCanopies: nextCanopies,
          activeAvatarFrame: item.type === "avatar_frame" ? String(item.value) : globalSparksState.activeAvatarFrame,
          activeNameGradient: item.type === "name_gradient" ? String(item.value) : globalSparksState.activeNameGradient,
          activeInsignia: item.type === "creator_insignia" ? String(item.value) : globalSparksState.activeInsignia,
          activeCanopy: item.type === "studio_canopy" ? String(item.value) : globalSparksState.activeCanopy,
          voucherCooldowns: data.details?.isVoucher
            ? {
                ...(globalSparksState.voucherCooldowns || {}),
                [itemId]: {
                  availableAt: data.details.cooldownAvailableAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  remainingMs: data.details.cooldownRemainingMs || 7 * 24 * 60 * 60 * 1000,
                  lastPurchasedAt: new Date().toISOString(),
                },
              }
            : globalSparksState.voucherCooldowns,
        };
        setState(globalSparksState);
        notifySparksListeners();
      }

      // Notify other stores
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sparks-updated"));
        window.dispatchEvent(new Event("credits-updated"));
        window.dispatchEvent(new Event("profile-updated"));
        if (item?.type === "avatar_frame") {
          window.dispatchEvent(new CustomEvent("avatar-frame-updated", { detail: String(item.value) }));
        } else if (item?.type === "name_gradient") {
          window.dispatchEvent(new CustomEvent("name-gradient-updated", { detail: String(item.value) }));
        } else if (item?.type === "creator_insignia") {
          window.dispatchEvent(new CustomEvent("insignia-updated", { detail: String(item.value) }));
        } else if (item?.type === "studio_canopy") {
          window.dispatchEvent(new CustomEvent("canopy-updated", { detail: String(item.value) }));
        }
      }

      return { success: true, item: data.item, details: data.details };
    } catch (err) {
      console.error("[useSparks] redeemItem error:", err);
      return { success: false, error: "Network error during redemption" };
    } finally {
      setRedeemingId(null);
    }
  };

  const equipCosmetic = async (type: CosmeticType, value: string | null): Promise<boolean> => {
    setEquippingId(value || "removing");
    try {
      let endpoint = "/api/user/avatar-frame";
      let payload: Record<string, any> = {};
      let eventName = "avatar-frame-updated";

      if (type === "avatar_frame") {
        endpoint = "/api/user/avatar-frame";
        payload = { frameId: value };
        eventName = "avatar-frame-updated";
      } else if (type === "name_gradient") {
        endpoint = "/api/user/name-gradient";
        payload = { gradientId: value };
        eventName = "name-gradient-updated";
      } else if (type === "creator_insignia") {
        endpoint = "/api/user/insignia";
        payload = { insigniaId: value };
        eventName = "insignia-updated";
      } else {
        return false;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (type === "avatar_frame") globalSparksState = { ...globalSparksState, activeAvatarFrame: value };
        else if (type === "name_gradient") globalSparksState = { ...globalSparksState, activeNameGradient: value };
        else if (type === "creator_insignia") globalSparksState = { ...globalSparksState, activeInsignia: value };

        setState(globalSparksState);
        notifySparksListeners();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(eventName, { detail: value }));
          window.dispatchEvent(new Event("profile-updated"));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("[useSparks] equipCosmetic error:", err);
      return false;
    } finally {
      setEquippingId(null);
    }
  };

  return {
    sparks: state.sparks,
    lifetimeSparks: state.lifetimeSparks,
    unlockedAvatarFrames: state.unlockedAvatarFrames,
    unlockedNameGradients: state.unlockedNameGradients,
    unlockedInsignias: state.unlockedInsignias,
    unlockedCanopies: state.unlockedCanopies,
    activeAvatarFrame: state.activeAvatarFrame,
    activeNameGradient: state.activeNameGradient,
    activeInsignia: state.activeInsignia,
    activeCanopy: state.activeCanopy,
    voucherCooldowns: state.voucherCooldowns || {},
    hasClaimedFreeSparks: state.hasClaimedFreeSparks ?? false,
    catalog: rotation.allActiveShopItems,
    weeklyLegendaryItems: rotation.weeklyLegendaryItems,
    threeDayEpicItems: rotation.threeDayEpicItems,
    dailyRareItems: rotation.dailyRareItems,
    timers: rotation.timers,
    loading,
    redeemingId,
    equippingId,
    refreshSparks: fetchSparks,
    redeemItem,
    equipCosmetic,
    rerollRotation,
    rotationOffset,
  };
}
