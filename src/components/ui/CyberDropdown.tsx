"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

interface CyberDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  themeColor?: "cyan" | "orange" | "pink" | "emerald" | "indigo" | "purple" | "amber";
  disabled?: boolean;
}

export function CyberDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className,
  themeColor = "cyan",
  disabled = false,
}: CyberDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  // Theme color maps
  const colorStyles = {
    amber: {
      borderFocus: "border-amber-500 ring-1 ring-amber-500/30",
      borderHover: "hover:border-amber-500/40",
      menuBorder: "border-amber-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(245,158,11,0.2)]",
      activeItem: "bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
      checkIcon: "text-amber-400",
      badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      chevronOpen: "text-amber-400",
    },
    cyan: {
      borderFocus: "border-cyan-500 ring-1 ring-cyan-500/30",
      borderHover: "hover:border-cyan-500/40",
      menuBorder: "border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(6,182,212,0.2)]",
      activeItem: "bg-cyan-500/20 text-cyan-200 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]",
      checkIcon: "text-cyan-400",
      badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      chevronOpen: "text-cyan-400",
    },
    orange: {
      borderFocus: "border-orange-500 ring-1 ring-orange-500/30",
      borderHover: "hover:border-orange-500/40",
      menuBorder: "border-orange-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(249,115,22,0.2)]",
      activeItem: "bg-orange-500/20 text-orange-200 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
      checkIcon: "text-orange-400",
      badge: "bg-orange-500/10 text-orange-300 border-orange-500/30",
      chevronOpen: "text-orange-400",
    },
    pink: {
      borderFocus: "border-pink-500 ring-1 ring-pink-500/30",
      borderHover: "hover:border-pink-500/40",
      menuBorder: "border-pink-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(236,72,153,0.2)]",
      activeItem: "bg-pink-500/20 text-pink-200 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.2)]",
      checkIcon: "text-pink-400",
      badge: "bg-pink-500/10 text-pink-300 border-pink-500/30",
      chevronOpen: "text-pink-400",
    },
    emerald: {
      borderFocus: "border-emerald-500 ring-1 ring-emerald-500/30",
      borderHover: "hover:border-emerald-500/40",
      menuBorder: "border-emerald-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(16,185,129,0.2)]",
      activeItem: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
      checkIcon: "text-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      chevronOpen: "text-emerald-400",
    },
    indigo: {
      borderFocus: "border-indigo-500 ring-1 ring-indigo-500/30",
      borderHover: "hover:border-indigo-500/40",
      menuBorder: "border-indigo-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(99,102,241,0.2)]",
      activeItem: "bg-indigo-500/20 text-indigo-200 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]",
      checkIcon: "text-indigo-400",
      badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
      chevronOpen: "text-indigo-400",
    },
    purple: {
      borderFocus: "border-purple-500 ring-1 ring-purple-500/30",
      borderHover: "hover:border-purple-500/40",
      menuBorder: "border-purple-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(168,85,247,0.2)]",
      activeItem: "bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
      checkIcon: "text-purple-400",
      badge: "bg-purple-500/10 text-purple-300 border-purple-500/30",
      chevronOpen: "text-purple-400",
    },
  }[themeColor];

  return (
    <div className={cn("space-y-1.5 relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-zinc-300 block">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-2xl border bg-black/60 px-4 py-3 text-xs font-bold text-white transition-all flex items-center justify-between group cursor-pointer backdrop-blur-md",
          isOpen
            ? colorStyles.borderFocus
            : cn("border-white/10", colorStyles.borderHover),
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded-full border", colorStyles.badge)}>
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={15}
          className={cn(
            "text-zinc-400 transition-transform duration-200 shrink-0",
            isOpen ? cn("rotate-180", colorStyles.chevronOpen) : "group-hover:text-white"
          )}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 right-0 z-50 mt-1.5 rounded-2xl bg-[#0b0e17] border p-1.5 space-y-1 max-h-64 overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.98)] ring-1 ring-white/10",
            colorStyles.menuBorder
          )}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between group cursor-pointer border",
                  isSelected
                    ? cn("border", colorStyles.activeItem)
                    : "border-transparent text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                )}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded-full border", colorStyles.badge)}>
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {opt.description && (
                    <span className="text-[10px] font-normal text-zinc-400 mt-0.5 truncate">
                      {opt.description}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check size={14} className={cn("shrink-0", colorStyles.checkIcon)} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
