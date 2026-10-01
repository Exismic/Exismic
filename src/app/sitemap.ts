import type { MetadataRoute } from "next";
import { CATEGORY_GUIDES, CATEGORY_GUIDE_CONTENT_UPDATED_AT } from "@/data/category-guides";
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
// Update only when the shared guide content changes, never at request/build time.
const TOOL_GUIDE_UPDATE_DATE = new Date("2026-09-29T00:00:00.000Z");
const HOME_UPDATE_DATE = new Date("2026-10-01T00:00:00.000Z");
const V17_RELEASE_DATE = new Date("2026-10-01T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: HOME_UPDATE_DATE,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/pro`,
      lastModified: V17_RELEASE_DATE,
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
      lastModified: V17_RELEASE_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: V17_RELEASE_DATE,
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
      lastModified: V17_RELEASE_DATE,
      changeFrequency: "weekly",
      priority: 0.6,
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
      lastModified: new Date("2026-09-22T00:00:00.000Z"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/delivery-policy`,
      lastModified: LEGAL_UPDATE_DATE,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/dmca`,
      lastModified: LEGAL_UPDATE_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/affiliates`,
      lastModified: COMMERCE_UPDATE_DATE,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/brand`,
      lastModified: CONTENT_UPDATE_DATE,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/developer`,
      lastModified: PLATFORM_UPDATE_DATE,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/developer/docs`,
      lastModified: new Date("2026-09-29T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/changelog`,
      lastModified: V17_RELEASE_DATE,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/giveaway`,
      lastModified: new Date("2026-09-29T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${SITE_URL}/category/${category.id}`,
    lastModified: CATEGORY_GUIDES[category.id]
      ? new Date(CATEGORY_GUIDE_CONTENT_UPDATED_AT)
      : PLATFORM_UPDATE_DATE,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const toolPages: MetadataRoute.Sitemap = TOOLS
    .filter((tool) => !tool.hidden && tool.indexable !== false && tool.href.startsWith("/tools/"))
    .map((tool) => ({
      url: `${SITE_URL}${tool.href}`,
      lastModified: new Date(Math.max(
        TOOL_GUIDE_UPDATE_DATE.getTime(),
        tool.updatedAt ? new Date(tool.updatedAt).getTime() : PLATFORM_UPDATE_DATE.getTime(),
      )),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const uniquePages = new Map(
    [...staticPages, ...categoryPages, ...toolPages, ...blogPages].map((entry) => [entry.url, entry]),
  );
  return [...uniquePages.values()];
}
