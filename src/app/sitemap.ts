import type { MetadataRoute } from "next";
import { CATEGORIES, TOOLS } from "@/data/tools";
import { BLOG_POSTS } from "@/lib/blog-data";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 86400; // Cache sitemap for 24 hours at edge

// Stable, meaningful modification timestamps reflecting actual releases and updates
const PLATFORM_UPDATE_DATE = new Date("2026-09-20T00:00:00.000Z");
const LEGAL_UPDATE_DATE = new Date("2026-09-01T00:00:00.000Z");
const PRO_UPDATE_DATE = new Date("2026-09-19T00:00:00.000Z");
const CONTENT_UPDATE_DATE = new Date("2026-09-15T00:00:00.000Z");
const COMMERCE_UPDATE_DATE = new Date("2026-09-18T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: PLATFORM_UPDATE_DATE,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/pro`,
      lastModified: PRO_UPDATE_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pro/benefits`,
      lastModified: PRO_UPDATE_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: PLATFORM_UPDATE_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: CONTENT_UPDATE_DATE,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/help`,
      lastModified: CONTENT_UPDATE_DATE,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(BLOG_POSTS[0]?.publishedAt || "2026-09-08"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/careers`,
      lastModified: PLATFORM_UPDATE_DATE,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: COMMERCE_UPDATE_DATE,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: COMMERCE_UPDATE_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: LEGAL_UPDATE_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      lastModified: LEGAL_UPDATE_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cookies`,
      lastModified: LEGAL_UPDATE_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/refund-policy`,
      lastModified: PLATFORM_UPDATE_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/changelog`,
      lastModified: PLATFORM_UPDATE_DATE,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/giveaway`,
      lastModified: CONTENT_UPDATE_DATE,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${SITE_URL}/category/${category.id}`,
    lastModified: PLATFORM_UPDATE_DATE,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const toolPages: MetadataRoute.Sitemap = TOOLS
    .filter((tool) => tool.indexable !== false && tool.href.startsWith("/tools/"))
    .map((tool) => ({
      url: `${SITE_URL}${tool.href}`,
      lastModified: tool.updatedAt ? new Date(tool.updatedAt) : PLATFORM_UPDATE_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const uniquePages = new Map(
    [...staticPages, ...categoryPages, ...toolPages, ...blogPages].map((entry) => [entry.url, entry]),
  );
  return [...uniquePages.values()];
}
