"use client";

import { track } from "@vercel/analytics";

export type EventProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * Universal safe telemetry dispatcher for Exismic
 * Sends to Vercel Analytics and Microsoft Clarity
 */
export function trackEvent(name: string, properties?: EventProperties): void {
  if (typeof window === "undefined") return;

  try {
    // 1. Vercel Analytics Custom Event
    const cleanProps: Record<string, string | number | boolean> = {};
    if (properties) {
      for (const [key, val] of Object.entries(properties)) {
        if (val !== undefined && val !== null) {
          cleanProps[key] = val;
        }
      }
    }
    track(name, cleanProps);

    // 2. Microsoft Clarity Event
    if (typeof (window as any).clarity === "function") {
      (window as any).clarity("event", name);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Telemetry] ${name}`, cleanProps);
    }
  } catch (err) {
    // Fail silently so tracking never breaks user workflows
    console.warn("[Telemetry Error]", err);
  }
}

// Typed Funnel Trackers

export function trackToolRun(toolId: string, category?: string) {
  trackEvent("tool_run", { toolId, category });
}

export function trackToolSuccess(toolId: string, durationMs?: number) {
  trackEvent("tool_success", { toolId, durationMs });
}

export function trackToolError(toolId: string, errorMsg?: string, code?: string) {
  trackEvent("tool_error", { toolId, errorMsg: errorMsg?.slice(0, 100), code });
}

export function trackAuthWallHit(toolId: string) {
  trackEvent("auth_wall_hit", { toolId });
}

export function trackCreditWallHit(toolId: string, required?: number, available?: number) {
  trackEvent("credit_wall_hit", { toolId, required, available });
}

export function trackWorkflowTransition(sourceTool: string, targetTool: string) {
  trackEvent("workflow_transition", { sourceTool, targetTool });
}

export function trackPricingView(source: string = "direct") {
  trackEvent("pricing_viewed", { source });
}

export function trackUpgradeClick(source: string, plan: string = "pro") {
  trackEvent("upgrade_clicked", { source, plan });
}

export function trackCheckoutStart(planId: string, gateway: string, amount: number) {
  trackEvent("checkout_started", { planId, gateway, amount });
}
