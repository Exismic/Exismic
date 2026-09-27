"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Loader } from "@/components/ui/Loader";
import { AppLaunchSplash } from "@/components/ui/AppLaunchSplash";
import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

const LoaderContext = createContext({
  setIsLoading: (loading: boolean) => {},
});

export const useLoader = () => useContext(LoaderContext);

export function AppLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showInitialSplash, setShowInitialSplash] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    try {
      // Read splash param safely on client without causing Next.js useSearchParams Suspense de-opt
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const splashParam = urlParams?.get("splash");
      const hasLaunched = typeof window !== "undefined" ? sessionStorage.getItem("exismic_initial_launch_seen") : "true";

      // Only show on first site visit per session (or when explicitly testing via ?splash=true)
      if (!hasLaunched || splashParam === "true") {
        setShowInitialSplash(true);
        sessionStorage.setItem("exismic_initial_launch_seen", "true");

        const timer = setTimeout(() => {
          setShowInitialSplash(false);
        }, 1250); // 1.25s snappy duration like Instagram / Threads

        return () => clearTimeout(timer);
      }
    } catch {
      setShowInitialSplash(false);
    }
  }, []);

  // When pathname changes, navigation completed immediately
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Global Ultra-Fast Route Warmup: Proactively prefetches routes on mouseover or touchstart
  // Users hover or touch ~100-300ms before click, so route chunk is already cached in memory for a 0ms instant transition!
  useEffect(() => {
    const handleRouteHover = (e: MouseEvent | TouchEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('#') &&
        targetAttr !== '_blank'
      ) {
        try {
          router.prefetch(href);
        } catch {
          // Ignore prefetch error
        }
      }
    };

    document.addEventListener('mouseover', handleRouteHover, { capture: true, passive: true });
    document.addEventListener('touchstart', handleRouteHover, { capture: true, passive: true });
    return () => {
      document.removeEventListener('mouseover', handleRouteHover, { capture: true });
      document.removeEventListener('touchstart', handleRouteHover, { capture: true });
    };
  }, [router]);

  // Global link click listener: detects internal navigation clicks instantly
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Only trigger for internal links that don't open in new tab
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        targetAttr !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const currentUrl = window.location.pathname + window.location.search;
        if (href !== currentUrl && !href.startsWith('#')) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => document.removeEventListener('click', handleDocumentClick, { capture: true });
  }, []);

  return (
    <LoaderContext.Provider value={{ setIsLoading }}>
      {/* Ultra-Responsive Glowing Top Laser on Navigation */}
      {isNavigating && (
        <div className="fixed top-0 inset-x-0 z-[999999] h-[2.5px] bg-zinc-950/60 pointer-events-none overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-[navProgress_1.2s_ease-in-out_infinite]" />
        </div>
      )}
      {/* Instagram / App Initial Launch Splash (Only on First Visit per Session) */}
      <AnimatePresence>
        {mounted && showInitialSplash && (
          <AppLaunchSplash onDismiss={() => setShowInitialSplash(false)} />
        )}
      </AnimatePresence>

      {mounted && isLoading && <Loader isLoading={isLoading} />}
      <div 
        suppressHydrationWarning
        className="opacity-100"
      >
        {children}
      </div>
    </LoaderContext.Provider>
  );
}
