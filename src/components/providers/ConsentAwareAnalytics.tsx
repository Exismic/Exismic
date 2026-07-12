"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  hasAnalyticsConsent,
  type StoredCookieConsent,
} from "@/lib/cookie-consent";

const CLARITY_PROJECT_ID = "q6s4m5v6k8";
const CLARITY_SCRIPT_ID = "microsoft-clarity";

type ClarityCommand = (...args: unknown[]) => void;

declare global {
  interface Window {
    clarity?: ClarityCommand & { q?: unknown[][] };
  }
}

function ensureClarityQueue(): ClarityCommand & { q?: unknown[][] } {
  if (window.clarity) return window.clarity;

  const clarity = ((...args: unknown[]) => {
    clarity.q = clarity.q ?? [];
    clarity.q.push(args);
  }) as ClarityCommand & { q?: unknown[][] };

  window.clarity = clarity;
  return clarity;
}

function clearClarityCookies() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  for (const name of ["_clck", "_clsk"]) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${window.location.hostname}; SameSite=Lax${secure}`;
  }
}

function grantAnalyticsConsent() {
  const clarity = ensureClarityQueue();
  clarity("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: "granted",
  });

  if (document.getElementById(CLARITY_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = CLARITY_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  document.head.appendChild(script);
}

function denyAnalyticsConsent() {
  if (window.clarity) {
    window.clarity("consentv2", {
      ad_Storage: "denied",
      analytics_Storage: "denied",
    });
    window.clarity("consent", false);
  }

  clearClarityCookies();
}

export function ConsentAwareAnalytics() {
  useEffect(() => {
    if (hasAnalyticsConsent()) {
      grantAnalyticsConsent();
    } else {
      denyAnalyticsConsent();
    }

    const handleConsentChange = (event: Event) => {
      const consentEvent = event as CustomEvent<StoredCookieConsent>;
      if (consentEvent.detail?.preferences.analytics) {
        grantAnalyticsConsent();
      } else {
        denyAnalyticsConsent();
      }
    };

    window.addEventListener(
      COOKIE_CONSENT_CHANGED_EVENT,
      handleConsentChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        handleConsentChange as EventListener,
      );
    };
  }, []);

  return null;
}
