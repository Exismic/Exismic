"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { MagicCommandPalette } from "@/components/layout/MagicCommandPalette";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalToolAssistant } from "@/components/tool/GlobalToolAssistant";
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
      <div className="flex min-h-screen" suppressHydrationWarning>
        {clientHasSession && !isAuthRoute ? <Sidebar /> : null}
        <main
          suppressHydrationWarning
          className="relative flex min-w-0 flex-1 flex-col bg-[#020202] isolate"
        >
          {/* Global Ambient Background Studio - Insane Mode */}
          {!isOverviewPage && (
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#030305]">
              {/* Massive Orbiting Gradient Orbs */}
              <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] animate-[spin_40s_linear_infinite] origin-bottom-right">
                <div 
                  className="w-full h-full rounded-full blur-[100px] mix-blend-screen opacity-60 transition-colors duration-1000"
                  style={{ background: `radial-gradient(circle, ${primaryGlow}, transparent 70%)` }}
                />
              </div>
              
              <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] animate-[spin_50s_linear_infinite_reverse] origin-top-left">
                <div 
                  className="w-full h-full rounded-full blur-[100px] mix-blend-screen opacity-50 transition-colors duration-1000"
                  style={{ background: `radial-gradient(circle, ${secondaryGlow}, transparent 70%)` }}
                />
              </div>

              <div className="absolute top-[20%] left-[30%] w-[50vw] h-[50vw] animate-[pulse_15s_ease-in-out_infinite]">
                <div 
                  className="w-full h-full rounded-full blur-[100px] mix-blend-screen opacity-40 transition-colors duration-1000"
                  style={{ background: `radial-gradient(circle, ${tertiaryGlow}, transparent 70%)` }}
                />
              </div>

              {/* Premium Frosted Glass Overlay */}
              <div className="absolute inset-0 backdrop-blur-[120px] bg-[#030305]/50" />

              {/* Cinematic Noise Texture Overlay */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] mix-blend-overlay" />
              
              {/* Vignette for depth */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#030305_120%)]" />
            </div>
          )}

          {!isAuthRoute ? <Navbar /> : null}
          <div
            suppressHydrationWarning
            className="no-scrollbar relative flex flex-1 flex-col overflow-y-auto z-10"
          >
            <div className="flex-1">{children}</div>
            {!isAuthRoute ? <Footer /> : null}
            <div
              suppressHydrationWarning
              className="grain pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
            />
          </div>
        </main>
      </div>
      {!isAuthRoute ? <MagicCommandPalette /> : null}
      {!isAuthRoute ? <GlobalToolAssistant /> : null}
    </>
  );
}
