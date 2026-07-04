import { Metadata } from 'next';
import { TOOLS, CATEGORIES } from '@/data/tools';

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
  type?: 'website' | 'article';
}

export const SITE_URL = "https://www.lumoraai.online";

export function constructMetadata({
  title = "Lumora - All-in-One AI Tools | Image, Video, Audio & More",
  description = "The elite AI-powered studio. Remove backgrounds, generate images, edit videos, restore photos, and create music — everything you need in one simple place.",
  image = "/og-image.png",
  icons = "/favicon.png",
  noIndex = false,
  canonicalUrl,
  type = 'website',
}: MetadataProps = {}): Metadata {
  const resolvedCanonicalUrl = canonicalUrl?.replace(
    /^https:\/\/lumoraai\.online(?=\/|$)/,
    SITE_URL,
  );
  
  return {
    title,
    description,
    verification: {
      google: "8BBWHS5KOph0mfoJRgzFXCePJogKxSd33dFUFhdRi4w",
    },
    keywords: [
      "AI tools", "free background remover", "AI image generator", 
      "vocal remover", "AI writer", "photo restorer", "PDF tools", 
      "lumora", "AI video editor", "magic eraser online", "screenshot to code",
      "AI resume builder", "social caption generator", "invoice generator"
    ],
    openGraph: {
      title,
      description,
      url: resolvedCanonicalUrl || SITE_URL,
      siteName: "Lumora AI",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@lumoraai",
    },
    icons: {
      icon: icons,
      shortcut: icons,
      apple: icons,
    },
    metadataBase: new URL(SITE_URL),
    alternates: resolvedCanonicalUrl
      ? {
          canonical: resolvedCanonicalUrl,
        }
      : undefined,
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function getToolMetadata(toolId: string, categoryId?: string) {
  const routeHref = categoryId ? `/tools/${categoryId}/${toolId}` : null;
  const tool = TOOLS.find(
    (candidate) =>
      candidate.id === toolId ||
      candidate.id === `${categoryId}-${toolId}` ||
      candidate.href === routeHref,
  );
  if (!tool) return constructMetadata();

  return constructMetadata({
    title: tool.seoTitle || `${tool.name} - Free AI Powered Online Tool | Lumora`,
    description: tool.seoDescription || tool.description,
    canonicalUrl: `${SITE_URL}${tool.href}`,
  });
}

export function getCategoryMetadata(categoryId: string) {
  const category = CATEGORIES.find(c => c.id === categoryId);
  if (!category) return constructMetadata();

  return constructMetadata({
    title: `${category.name} - Professional AI Tools Online | Lumora`,
    description: `Access our elite suite of AI-powered ${category.name.toLowerCase()}. ${category.description} Free, fast, and studio-grade results.`,
    canonicalUrl: `${SITE_URL}/category/${category.id}`,
  });
}
