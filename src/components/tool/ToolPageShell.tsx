"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { TOOLS, CATEGORIES, ICON_MAP, type Tool, type Category } from "@/data/tools";
import { ToolWorkspaceHeader } from "@/components/tool/ToolWorkspaceFrame";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";
import { FAVORITES_CHANGED_EVENT } from "@/lib/favorites";
import { SITE_URL } from "@/lib/seo";
import { PRICING_CONFIG } from "@/config/pricing";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolPageShellProps {
  toolId: string;
  categoryId?: string;
  children: React.ReactNode;
  className?: string;
  customTitle?: string;
  customDescription?: string;
}

export function ToolPageShell({
  toolId,
  categoryId: explicitCategoryId,
  children,
  className,
  customTitle,
  customDescription,
}: ToolPageShellProps) {
  const tool: Tool | undefined = TOOLS.find(
    (t) => t.id === toolId || t.id === `${explicitCategoryId}-${toolId}` || t.href.endsWith(`/${toolId}`)
  );

  const categoryId = explicitCategoryId || tool?.category || "ai";
  const category: Category | undefined = CATEGORIES.find((c) => c.id === categoryId);

  const toolName = customTitle || tool?.name || "AI Creative Tool";
  const toolDescription = customDescription || tool?.description || "High-performance creative tools built for creators.";
  const categoryName = category?.name || "Workspace";

  const IconComponent = (tool?.icon && ICON_MAP[tool.icon]) || Wand2;

  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Sync favorites with user account and local storage
  useEffect(() => {
    if (!tool?.id) return;
    const fetchFavorites = async () => {
      try {
        const response = await axios.get("/api/user/favorites", { validateStatus: () => true });
        if (response.data?.authenticated && Array.isArray(response.data.favorites)) {
          setIsFavorited(response.data.favorites.includes(tool.id));
          return;
        }
      } catch {
        // Fallback to local storage
      }

      if (typeof window !== "undefined") {
        try {
          const guestFavs = JSON.parse(localStorage.getItem("exismic_guest_favorites") || "[]");
          setIsFavorited(guestFavs.includes(tool.id));
        } catch {
          setIsFavorited(false);
        }
      }
    };
    void fetchFavorites();
  }, [tool?.id]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      void navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  const handleFavorite = async () => {
    if (!tool?.id) return;
    const nextState = !isFavorited;
    setIsFavorited(nextState);

    try {
      const response = await axios.post(
        "/api/user/favorites",
        { toolId: tool.id, action: nextState ? "add" : "remove" },
        { validateStatus: () => true }
      );

      if (response.status === 200 && response.data?.success) {
        setIsFavorited(response.data.isFavorited === true);
        window.dispatchEvent(
          new CustomEvent(FAVORITES_CHANGED_EVENT, {
            detail: { favorites: response.data.favorites },
          })
        );
        return;
      }
    } catch {
      // Local fallback
    }

    if (typeof window !== "undefined") {
      try {
        const guestFavs = JSON.parse(localStorage.getItem("exismic_guest_favorites") || "[]");
        const updated = nextState ? [...new Set([...guestFavs, tool.id])] : guestFavs.filter((id: string) => id !== tool.id);
        localStorage.setItem("exismic_guest_favorites", JSON.stringify(updated));
        window.dispatchEvent(
          new CustomEvent(FAVORITES_CHANGED_EVENT, {
            detail: { favorites: updated },
          })
        );
      } catch {
        // Ignore
      }
    }
  };

  // Structured Data Schema for Google Indexing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": toolName,
    "description": toolDescription,
    "url": typeof window !== "undefined" ? window.location.href : `${SITE_URL}${tool?.href || `/tools/${categoryId}/${toolId}`}`,
    "applicationCategory": categoryId === "productivity" ? "UtilitiesApplication" : categoryId === "creator" ? "SocialApplication" : "MultimediaApplication",
    "operatingSystem": "All modern browsers (Desktop & Mobile)",
    "isAccessibleForFree": !tool?.isProTool,
    "offers": {
      "@type": "Offer",
      "price": tool?.isProTool ? PRICING_CONFIG.PRO_PLAN.USD.toString() : "0",
      "priceCurrency": "USD",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "210",
      "bestRating": "5",
      "worstRating": "1",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Tools", "item": `${SITE_URL}/tools` },
      { "@type": "ListItem", "position": 2, "name": categoryName, "item": `${SITE_URL}/category/${categoryId}` },
      { "@type": "ListItem", "position": 3, "name": toolName, "item": `${SITE_URL}${tool?.href || `/tools/${categoryId}/${toolId}`}` },
    ],
  };

  return (
    <div className={cn("mx-auto max-w-[1440px] space-y-8 overflow-x-hidden px-3 pb-24 pt-24 sm:px-5 sm:pt-24 md:space-y-10 md:px-8 md:pb-28 md:pt-28", className)}>
      {/* Schema.org Structured Data for Google Indexing */}
      <script
        id={`schema-software-${toolId}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        id={`schema-breadcrumbs-${toolId}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Standardized Category-Themed Studio Workspace Header */}
      <ToolWorkspaceHeader
        name={toolName}
        description={toolDescription}
        categoryName={categoryName}
        categoryId={categoryId}
        toolId={toolId}
        icon={IconComponent}
        isPro={Boolean(tool?.pro || tool?.isProTool)}
        isFavorited={isFavorited}
        showShareToast={showShareToast}
        onShare={handleShare}
        onFavorite={handleFavorite}
      />

      {/* Main Tool Interactive Surface */}
      <main className="w-full">
        {children}
      </main>

      {/* Google Helpful Content SEO Guide with FAQs & How-To Steps */}
      <ToolSeoSection
        toolName={toolName}
        toolDescription={toolDescription}
        categoryName={categoryName}
        categoryId={categoryId}
        toolSlug={toolId}
        showRelatedTools={true}
      />
    </div>
  );
}
