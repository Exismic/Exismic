"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Laptop, 
  FolderArchive, 
  Workflow, 
  LayoutGrid, 
  Crown, 
  HelpCircle, 
  ChevronUp, 
  ArrowRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DockItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  color: string;
}

const DOCK_ITEMS: DockItem[] = [
  { id: "hero", label: "Exismic", icon: Laptop, color: "#38bdf8" },
  { id: "deliverables", label: "Files", icon: FolderArchive, color: "#f59e0b" },
  { id: "workflows", label: "Together", icon: Workflow, color: "#ec4899" },
  { id: "tools", label: "Tools", icon: LayoutGrid, color: "#06b6d4" },
  { id: "pro", label: "Plans", icon: Crown, color: "#a855f7" },
  { id: "faq", label: "FAQ", icon: HelpCircle, color: "#10b981" },
];

export function FloatingNavDock() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const mainContent = document.getElementById("app-main-content");

    const handleScroll = () => {
      const currentScrollY = mainContent ? mainContent.scrollTop : window.scrollY;
      setIsScrolled(currentScrollY > 120);

      // Determine active section based on scroll offset
      const sections = DOCK_ITEMS.map((item) => document.getElementById(item.id));
      const scrollPosition = currentScrollY + 280;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section) {
          const top = mainContent
            ? section.offsetTop
            : section.getBoundingClientRect().top + window.scrollY;
          if (top <= scrollPosition) {
            setActiveSection(DOCK_ITEMS[i].id);
            break;
          }
        }
      }
    };

    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      if (mainContent) {
        mainContent.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(id);
    const mainContent = document.getElementById("app-main-content");

    if (target) {
      if (mainContent) {
        const targetRect = target.getBoundingClientRect();
        const containerRect = mainContent.getBoundingClientRect();
        const relativeTop = targetRect.top - containerRect.top + mainContent.scrollTop - 40;
        mainContent.scrollTo({ top: Math.max(0, relativeTop), behavior: "smooth" });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setActiveSection(id);
    }
  };

  const scrollToTop = () => {
    const mainContent = document.getElementById("app-main-content");
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveSection("hero");
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[70] pointer-events-auto select-none transition-all duration-300",
        isScrolled ? "scale-100 opacity-100" : "scale-[0.98] opacity-95 hover:opacity-100"
      )}
    >
          {/* 2px Gradient Border Wrapper with Neon Glow */}
          <div className="relative p-[1.5px] rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 via-amber-400 to-emerald-400 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.22)] backdrop-blur-2xl">
            
            {/* Inner Glass Dock Shell */}
            <nav 
              aria-label="Page Navigation Dock"
              className="relative px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-[#0a0c16]/90 backdrop-blur-3xl flex items-center gap-1 sm:gap-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
            >
              {DOCK_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => scrollToSection(item.id, e)}
                    className={cn(
                      "relative group/dock flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs transition-all duration-300 cursor-pointer transform-gpu active:scale-95",
                      isActive
                        ? "text-white font-extrabold shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                    )}
                    aria-label={`Jump to ${item.label}`}
                  >
                    {/* Active Pill Spring Highlight */}
                    {isActive && (
                      <motion.div
                        layoutId="activeDockIndicator"
                        className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <Icon 
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-300 group-hover/dock:scale-110 relative z-10 shrink-0",
                        isActive ? "scale-105" : "opacity-80"
                      )}
                      style={{ color: isActive ? item.color : undefined }}
                    />

                    <span className="relative z-10 hidden md:inline text-[11px] uppercase tracking-wider">
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* Elegant Divider */}
              <div className="w-px h-4 bg-white/15 mx-1 shrink-0" />

              {/* Quick Jump to Top */}
              <button
                type="button"
                onClick={scrollToTop}
                className="w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all hover:scale-110 active:scale-90 shrink-0 cursor-pointer"
                aria-label="Back to top"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>

              {/* Instant Launch Action Pill */}
              <Link
                href="/tools"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-400 text-black font-extrabold text-[10px] uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <span>Start</span>
                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
              </Link>

            </nav>
          </div>
    </div>
  );
}
