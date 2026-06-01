"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { usePro } from "@/hooks/usePro";

export function ProfileThemeProvider({ children }: { children: React.ReactNode }) {
  const { isPro, user: dbUser } = usePro();
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();

  const applyTheme = useCallback((themeId: string | null) => {
    if (typeof document === "undefined") return;
    
    // List of theme classes to clear
    const themes = [
      "theme-cyber-pulse",
      "theme-luxury-void",
      "theme-cosmic-nebula",
      "theme-neon-shadow",
      "theme-royal-eclipse",
      "theme-minimal-frost"
    ];

    document.documentElement.classList.remove(...themes);
    document.body.classList.remove(...themes);

    if (themeId) {
      document.documentElement.classList.add(`theme-${themeId}`);
      document.body.classList.add(`theme-${themeId}`);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleThemeUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      applyTheme(customEvent.detail);
    };

    window.addEventListener("profile-theme-updated", handleThemeUpdate);
    return () => {
      window.removeEventListener("profile-theme-updated", handleThemeUpdate);
    };
  }, [applyTheme]);

  useEffect(() => {
    // Only apply if pro member
    if (isPro) {
      const theme =
        session?.user?.user_metadata?.theme_preference ??
        session?.user?.user_metadata?.profile_theme ??
        dbUser?.theme_preference ??
        dbUser?.profile_theme ??
        null;
      applyTheme(theme);
    } else {
      applyTheme(null);
    }
  }, [session, dbUser, isPro, applyTheme]);

  return <>{children}</>;
}
