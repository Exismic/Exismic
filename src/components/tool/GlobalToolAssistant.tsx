"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { CATEGORIES, TOOLS } from "@/data/tools";
import { ToolAssistantPanel } from "@/components/tool/ToolAssistantPanel";

function normalizePath(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function GlobalToolAssistant() {
  const pathname = usePathname();

  const match = useMemo(() => {
    const currentPath = normalizePath(pathname);
    if (currentPath === "/tools") return null;

    const supportAgentDashboard = currentPath.startsWith("/dashboard/support-agent");
    const tool = supportAgentDashboard
      ? TOOLS.find((item) => item.id === "support-agent")
      : [...TOOLS]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => {
        const href = normalizePath(item.href);
        return currentPath === href || currentPath.startsWith(`${href}/`);
      });

    if (!tool) return null;
    const category = CATEGORIES.find((item) => item.id === tool.category);
    return category ? { tool, category } : null;
  }, [pathname]);

  if (!match) return null;
  return <ToolAssistantPanel tool={match.tool} category={match.category} />;
}
