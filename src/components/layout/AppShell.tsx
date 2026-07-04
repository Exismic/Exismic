"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { MagicCommandPalette } from "@/components/layout/MagicCommandPalette";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalToolAssistant } from "@/components/tool/GlobalToolAssistant";

type AppShellProps = {
  children: React.ReactNode;
  hasSession: boolean;
};

export function AppShell({ children, hasSession }: AppShellProps) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");

  return (
    <>
      <div className="flex min-h-screen" suppressHydrationWarning>
        {hasSession && !isAuthRoute ? <Sidebar /> : null}
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
