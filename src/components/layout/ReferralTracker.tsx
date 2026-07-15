"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      // Save referral code in a cookie with a 30-day expiry
      document.cookie = `exismic_referral=${encodeURIComponent(ref.trim())}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure`;
      // Backup in localStorage
      localStorage.setItem("exismic_referral", ref.trim());
    }
  }, [searchParams]);

  return null;
}
