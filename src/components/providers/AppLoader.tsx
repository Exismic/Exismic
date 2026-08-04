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
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <LoaderContext.Provider value={{ setIsLoading }}>
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
