"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  rightElement?: React.ReactNode;
  className?: string;
}

export function PageBreadcrumb({ items, rightElement, className }: PageBreadcrumbProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-zinc-400", className)}>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
        <Link 
          href="/" 
          className="hover:text-white transition-colors flex items-center gap-1.5 text-zinc-400 group"
        >
          <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">
            <ExismicMark size={18} />
          </span>
          <span className="font-bold tracking-tight text-zinc-300 group-hover:text-white">Exismic</span>
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.active;
          return (
            <React.Fragment key={index}>
              <ChevronRight size={13} className="text-zinc-600 shrink-0" />
              {isLast || !item.href ? (
                <span className="text-cyan-300 font-bold tracking-tight">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-zinc-400 hover:text-white font-medium transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {rightElement && (
        <div className="flex items-center gap-2 shrink-0">
          {rightElement}
        </div>
      )}
    </div>
  );
}
