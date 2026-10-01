"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTION_IDS = [
  "hero",
  "capabilities",
  "deliverables",
  "workflows",
  "tools",
  "actions",
  "pro",
  "faq",
  "final-cta",
];

const SECTION_LABELS: Record<string, string> = {
  hero: "Overview",
  capabilities: "Capabilities",
  deliverables: "Deliverables",
  workflows: "Workflows",
  tools: "Tools",
  actions: "Starting Points",
  pro: "Plans & Pro",
  faq: "FAQ",
  "final-cta": "Get Started",
};

let currentAnimationId: number | null = null;

/**
 * Butter-smooth scroll engine using requestAnimationFrame and quintic easeInOut.
 * Temporarily relaxes CSS scroll-behavior so browser native fighting doesn't jitter.
 */
function smoothScrollTo(element: HTMLElement | Window, targetY: number, duration: number = 380) {
  if (currentAnimationId !== null) {
    cancelAnimationFrame(currentAnimationId);
  }

  const isWindow = element instanceof Window;
  const startY = isWindow ? window.scrollY : (element as HTMLElement).scrollTop;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;

  const startTime = performance.now();
  const htmlEl = !isWindow ? (element as HTMLElement) : null;
  const prevBehavior = htmlEl ? htmlEl.style.scrollBehavior : "";
  if (htmlEl) {
    htmlEl.style.scrollBehavior = "auto";
  }

  // Snappy cubic easeInOut: quick responsive acceleration, silky fast finish
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeInOutCubic(progress);
    const currentY = startY + distance * eased;

    if (isWindow) {
      window.scrollTo(0, currentY);
    } else if (htmlEl) {
      htmlEl.scrollTop = currentY;
    }

    if (progress < 1) {
      currentAnimationId = requestAnimationFrame(step);
    } else {
      if (htmlEl) {
        htmlEl.style.scrollBehavior = prevBehavior;
      }
      currentAnimationId = null;
    }
  }

  currentAnimationId = requestAnimationFrame(step);
}

export function LandingScrollControls() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const mainContent = document.getElementById("app-main-content");

    const checkScrollState = () => {
      const isWindow = !mainContent;
      const scrollTop = isWindow ? window.scrollY : mainContent.scrollTop;
      const scrollHeight = isWindow ? document.documentElement.scrollHeight : mainContent.scrollHeight;
      const clientHeight = isWindow ? window.innerHeight : mainContent.clientHeight;
      const maxScroll = Math.max(1, scrollHeight - clientHeight);

      const progress = Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));
      setScrollProgress(progress);

      setCanScrollUp(scrollTop > 40);
      setCanScrollDown(scrollTop < maxScroll - 40);

      // Determine currently visible section
      const containerTop = isWindow ? 0 : mainContent.getBoundingClientRect().top;
      let currentSectionId = "hero";

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const relativeTop = isWindow ? rect.top : rect.top - containerTop;
        if (relativeTop <= clientHeight * 0.45) {
          currentSectionId = id;
        }
      }
      setActiveSection(currentSectionId);
    };

    if (mainContent) {
      mainContent.addEventListener("scroll", checkScrollState, { passive: true });
    }
    window.addEventListener("scroll", checkScrollState, { passive: true });
    window.addEventListener("resize", checkScrollState, { passive: true });

    checkScrollState();

    return () => {
      if (mainContent) {
        mainContent.removeEventListener("scroll", checkScrollState);
      }
      window.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, []);

  const handleScrollUp = () => {
    const mainContent = document.getElementById("app-main-content");
    const container = mainContent || window;
    const isWindow = !mainContent;
    const currentY = isWindow ? window.scrollY : mainContent.scrollTop;
    const clientHeight = isWindow ? window.innerHeight : mainContent.clientHeight;

    const step = Math.max(400, clientHeight * 0.85);
    const targetY = Math.max(0, currentY - step);

    smoothScrollTo(container, targetY, 380);
  };

  const handleScrollDown = () => {
    const mainContent = document.getElementById("app-main-content");
    const container = mainContent || window;
    const isWindow = !mainContent;
    const currentY = isWindow ? window.scrollY : mainContent.scrollTop;
    const scrollHeight = isWindow ? document.documentElement.scrollHeight : mainContent.scrollHeight;
    const clientHeight = isWindow ? window.innerHeight : mainContent.clientHeight;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);

    const step = Math.max(400, clientHeight * 0.85);
    const targetY = Math.min(maxScroll, currentY + step);

    smoothScrollTo(container, targetY, 380);
  };

  // Circular gauge values for 26x26 SVG
  const radius = 9.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <aside 
      aria-label="Page navigation controls" 
      className="fixed bottom-20 right-5 sm:bottom-24 sm:right-7 z-40 pointer-events-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex items-center">
        
        {/* Floating Context Tooltip Pill (Left Flyout on Hover) */}
        <div 
          className={cn(
            "absolute right-full mr-2.5 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full pointer-events-none transition-all duration-300 transform-gpu whitespace-nowrap",
            "bg-[#080914]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.85)]",
            isHovered 
              ? "opacity-100 translate-x-0 scale-100" 
              : "opacity-0 translate-x-2 scale-95"
          )}
        >
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
          </span>
          <span className="text-[11px] font-semibold text-zinc-200">
            {SECTION_LABELS[activeSection] || "Overview"}
          </span>
          <span className="text-[10px] font-mono font-medium text-cyan-300 pl-1.5 border-l border-white/10">
            {scrollProgress}%
          </span>
        </div>

        {/* Minimalist Glassmorphism Capsule HUD */}
        <div className="relative group/console">
          
          {/* Subtle Ambient Glow Aura */}
          <div className="absolute -inset-1 rounded-full bg-cyan-500/10 blur-xl opacity-0 group-hover/console:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Frosted Smoked Glass Chamber */}
          <div className="relative flex flex-col items-center gap-1 p-1 rounded-full bg-[#080914]/85 backdrop-blur-2xl border border-white/10 hover:border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.9),0_0_24px_rgba(6,182,212,0.18)] transition-all duration-300">
            
            {/* Scroll Up Button */}
            <button
              type="button"
              onClick={handleScrollUp}
              disabled={!canScrollUp}
              aria-label="Scroll up"
              title={canScrollUp ? "Scroll up" : "At top of page"}
              className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 relative",
                canScrollUp
                  ? "text-zinc-400 hover:text-white hover:bg-white/[0.08] active:scale-90 cursor-pointer"
                  : "text-zinc-600 opacity-20 cursor-default"
              )}
            >
              <ChevronUp className="w-4 h-4 stroke-[2.2]" />
            </button>

            {/* Hairline Divider */}
            <div className="w-3.5 h-px bg-white/[0.08]" />

            {/* Precision Circular Progress Dial */}
            <div 
              className="relative w-6 h-6 flex items-center justify-center cursor-default group/gauge my-0.5"
              title={`Scroll: ${scrollProgress}% • ${SECTION_LABELS[activeSection] || "Overview"}`}
            >
              <svg className="w-6 h-6 -rotate-90" viewBox="0 0 26 26">
                {/* Background Track */}
                <circle
                  cx="13"
                  cy="13"
                  r={radius}
                  className="stroke-white/10"
                  strokeWidth="1.75"
                  fill="none"
                />
                {/* Gradient Arc */}
                <defs>
                  <linearGradient id="hud-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <circle
                  cx="13"
                  cy="13"
                  r={radius}
                  stroke="url(#hud-ring-grad)"
                  strokeWidth="1.75"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-150"
                />
              </svg>
              
              {/* Digital Readout */}
              <span className="absolute text-[7.5px] font-mono font-bold tracking-tight text-zinc-400 group-hover/gauge:text-white transition-colors">
                {scrollProgress}
              </span>
            </div>

            {/* Hairline Divider */}
            <div className="w-3.5 h-px bg-white/[0.08]" />

            {/* Scroll Down Button */}
            <button
              type="button"
              onClick={handleScrollDown}
              disabled={!canScrollDown}
              aria-label="Scroll down"
              title={canScrollDown ? "Scroll down" : "At bottom of page"}
              className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 relative",
                canScrollDown
                  ? "text-zinc-400 hover:text-white hover:bg-white/[0.08] active:scale-90 cursor-pointer"
                  : "text-zinc-600 opacity-20 cursor-default"
              )}
            >
              <ChevronDown className="w-4 h-4 stroke-[2.2]" />
            </button>

          </div>
        </div>

      </div>
    </aside>
  );
}
