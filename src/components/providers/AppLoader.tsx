"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Loader } from "@/components/ui/Loader";
import { usePathname, useSearchParams } from "next/navigation";

const LoaderContext = createContext({
  setIsLoading: (loading: boolean) => {},
});

export const useLoader = () => useContext(LoaderContext);

export function AppLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  // When pathname or searchParams change, navigation completed
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

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
      {mounted && isLoading && <Loader isLoading={isLoading} />}
      <div 
        suppressHydrationWarning
        className="opacity-100 transition-opacity duration-300 ease-in-out"
      >
        {children}
      </div>
    </LoaderContext.Provider>
  );
}
