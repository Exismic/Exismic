"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Loader } from "@/components/ui/Loader";
import { motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const LoaderContext = createContext({
  setIsLoading: (loading: boolean) => {},
});

export const useLoader = () => useContext(LoaderContext);

export function AppLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle initial page load
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle route changes
  useEffect(() => {
    // We can show a brief loading state on route changes if desired
    // setIsLoading(true);
    // const timer = setTimeout(() => setIsLoading(false), 500);
    // return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <LoaderContext.Provider value={{ setIsLoading }}>
      {mounted && <Loader isLoading={isLoading} />}
      <div 
        suppressHydrationWarning
        className={cn(
          "transition-opacity duration-700 ease-in-out",
          mounted && isLoading ? "opacity-0 pointer-events-none select-none" : "opacity-100"
        )}
      >
        {children}
      </div>
    </LoaderContext.Provider>
  );
}
