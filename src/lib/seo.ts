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
  keywords?: string[];
}

function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "https://exismic.xyz";
  const withProtocol = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
  return withProtocol.trim().replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl();
export const SEO_INDEXING_ENABLED = process.env.SEO_INDEXING_ENABLED === "true";

export function constructMetadata({
  title = "Exismic - All-in-One AI Tools | Image, Video, Audio & More",
  description = "Create, edit, convert, and enhance images, video, audio, PDFs, and documents with Exismic's focused AI tools.",
  image = "/og-image.png",
  icons = "/exismic-app-icon-transparent.png?v=1",
  noIndex = false,
  canonicalUrl,
  type = 'website',
  keywords,
}: MetadataProps = {}): Metadata {
  const resolvedCanonicalUrl = canonicalUrl
    ? `${SITE_URL}${new URL(canonicalUrl, SITE_URL).pathname}`
    : undefined;
  const shouldIndex = SEO_INDEXING_ENABLED && !noIndex;
  
  return {
    title,
    description,
    applicationName: 'Exismic',
    creator: 'Exismic',
    publisher: 'Exismic',
    category: 'technology',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    verification: {
      google: "8BBWHS5KOph0mfoJRgzFXCePJogKxSd33dFUFhdRi4w",
    },
    keywords: keywords || [
      "AI tools", "free background remover", "AI image generator", 
      "vocal remover", "AI writer", "photo restorer", "PDF tools", 
      "exismic", "AI video editor", "magic eraser online", "screenshot to code",
      "AI resume builder", "social caption generator", "invoice generator"
    ],
    openGraph: {
      title,
      description,
      url: resolvedCanonicalUrl || SITE_URL,
      siteName: "Exismic AI",
      locale: 'en_US',
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
      creator: "@exismicai",
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
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: {
        index: shouldIndex,
        follow: shouldIndex,
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
    title: tool.seoTitle || `${tool.name} - Free AI Powered Online Tool | Exismic`,
    description: tool.seoDescription || tool.description,
    canonicalUrl: `${SITE_URL}${tool.href}`,
    noIndex: tool.indexable === false,
    keywords: tool.seoKeywords || [
      tool.name.toLowerCase(),
      `${tool.name.toLowerCase()} online`,
      `${tool.name.toLowerCase()} free`,
      `${tool.category} tools`,
      'Exismic',
    ],
  });
}

export function getCategoryMetadata(categoryId: string) {
  const category = CATEGORIES.find(c => c.id === categoryId);
  if (!category) return constructMetadata();

  return constructMetadata({
    title: `${category.name} - Professional AI Tools Online | Exismic`,
    description: `Access our elite suite of AI-powered ${category.name.toLowerCase()}. ${category.description} Free, fast, and studio-grade results.`,
    canonicalUrl: `${SITE_URL}/category/${category.id}`,
    keywords: [
      category.name.toLowerCase(),
      `online ${category.name.toLowerCase()}`,
      `free ${category.name.toLowerCase()}`,
      'AI tools',
      'Exismic',
    ],
  });
}
