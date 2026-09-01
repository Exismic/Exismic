"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { MagicCommandPalette } from "@/components/layout/MagicCommandPalette";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalToolAssistant } from "@/components/tool/GlobalToolAssistant";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
import { QuestCompletionToast } from "@/components/reward/QuestCompletionToast";
import { createClient } from "@/utils/supabase/client";

type AppShellProps = {
  children: React.ReactNode;
  hasSession: boolean;
};

export function AppShell({ children, hasSession }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [clientHasSession, setClientHasSession] = useState(hasSession);
  const refreshedForSessionRef = useRef(false);
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");
  const isRewardsRoute = pathname === "/rewards" || pathname.startsWith("/rewards");
  const isStandaloneRoute = isAuthRoute || isRewardsRoute;
  const isOverviewPage = pathname === "/" || pathname === "/dashboard" || pathname === "/tools";

  // Dynamic Background Colors based on route
  let primaryGlow = "rgba(139,92,246,0.12)"; // Purple (Default)
  let secondaryGlow = "rgba(6,182,212,0.12)"; // Cyan (Default)
  let tertiaryGlow = "rgba(236,72,153,0.08)"; // Pink (Default)

  if (pathname.includes("/image")) {
    primaryGlow = "rgba(6,182,212,0.18)"; // Cyan
    secondaryGlow = "rgba(59,130,246,0.15)"; // Blue
    tertiaryGlow = "rgba(14,165,233,0.1)"; // Light Blue
  } else if (pathname.includes("/video")) {
    primaryGlow = "rgba(139,92,246,0.18)"; // Violet
    secondaryGlow = "rgba(168,85,247,0.15)"; // Purple
    tertiaryGlow = "rgba(124,58,237,0.1)"; // Deep Violet
  } else if (pathname.includes("/audio")) {
    primaryGlow = "rgba(236,72,153,0.18)"; // Pink
    secondaryGlow = "rgba(244,63,94,0.15)"; // Rose
    tertiaryGlow = "rgba(217,70,239,0.1)"; // Fuchsia
  } else if (pathname.includes("/ai")) {
    primaryGlow = "rgba(99,102,241,0.18)"; // Indigo
    secondaryGlow = "rgba(139,92,246,0.15)"; // Violet
    tertiaryGlow = "rgba(79,70,229,0.1)"; // Deep Indigo
  } else if (pathname.includes("/productivity") || pathname.includes("/developer") || pathname.includes("/code") || pathname.includes("/units")) {
    primaryGlow = "rgba(16,185,129,0.18)"; // Emerald
    secondaryGlow = "rgba(20,184,166,0.15)"; // Teal
    tertiaryGlow = "rgba(34,197,94,0.1)"; // Green
  } else if (pathname.includes("/pdf")) {
    primaryGlow = "rgba(239,68,68,0.18)"; // Red
    secondaryGlow = "rgba(249,115,22,0.15)"; // Orange
    tertiaryGlow = "rgba(248,113,113,0.1)"; // Light Red
  }

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      const nextHasSession = Boolean(session);
      setClientHasSession(nextHasSession);

      if (nextHasSession && !hasSession && !refreshedForSessionRef.current) {
        refreshedForSessionRef.current = true;
        router.refresh();
      }
    };

    void syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (!mounted) return;

      const nextHasSession = Boolean(session);
      setClientHasSession(nextHasSession);

      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && !refreshedForSessionRef.current) {
        refreshedForSessionRef.current = true;
        router.refresh();
      }

      if (event === "SIGNED_OUT") {
        refreshedForSessionRef.current = false;
        router.refresh();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hasSession, router]);

  return (
    <>
      <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-[#020202]" suppressHydrationWarning>
        {clientHasSession && !isStandaloneRoute ? <Sidebar /> : null}
        <main
          suppressHydrationWarning
          className="relative flex min-w-0 flex-1 flex-col h-full overflow-hidden bg-[#020202] isolate"
        >
          {/* Global Ambient Background Studio - Ultra Lightweight Hardware-Accelerated */}
          {!isOverviewPage && !isStandaloneRoute && (
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#030305]">
              {/* Native CSS Multi-point Radial Glows (Zero GPU blur overhead) */}
              <div 
                className="absolute inset-0 transition-opacity duration-1000"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 5% 5%, ${primaryGlow} 0%, transparent 50%),
                    radial-gradient(circle at 95% 95%, ${secondaryGlow} 0%, transparent 50%),
                    radial-gradient(circle at 50% 30%, ${tertiaryGlow} 0%, transparent 40%)
                  `
                }}
              />
              {/* Subtle Vignette for depth */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#030305_100%)]" />
            </div>
          )}

          {/* If NOT on landing page or user is logged in, keep Navbar pinned above scroll content. If on landing page (logged out), Navbar scrolls with page */}
          {(pathname !== "/" || clientHasSession) && !isStandaloneRoute ? <Navbar /> : null}
          <div
            id="app-main-content"
            suppressHydrationWarning
            className="relative flex-1 overflow-y-auto overflow-x-hidden min-h-0 z-10 scroll-smooth"
          >
            {pathname === "/" && !clientHasSession && !isStandaloneRoute ? <Navbar /> : null}
            <div className="flex min-h-full flex-col justify-between">
              <div className="w-full flex-1">{children}</div>
              {!isStandaloneRoute ? <Footer /> : null}
            </div>
          </div>
        </main>
      </div>
      {!isStandaloneRoute ? <MagicCommandPalette /> : null}
      {!isStandaloneRoute && pathname !== "/" ? <GlobalToolAssistant /> : null}
      {!isStandaloneRoute && clientHasSession ? <WelcomeModal /> : null}
      {!isStandaloneRoute && clientHasSession ? <QuestCompletionToast /> : null}
    </>
  );
}
