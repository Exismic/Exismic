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
          className="flex min-w-0 flex-1 flex-col bg-[#030303]"
        >
          {!isAuthRoute ? <Navbar /> : null}
          <div
            suppressHydrationWarning
            className="no-scrollbar relative flex flex-1 flex-col overflow-y-auto"
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
