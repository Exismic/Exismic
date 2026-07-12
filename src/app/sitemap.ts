import type { MetadataRoute } from "next";
import { CATEGORIES, TOOLS } from "@/data/tools";
import { BLOG_POSTS } from "@/lib/blog-data";
import { SEO_INDEXING_ENABLED, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SEO_INDEXING_ENABLED) return [];

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/pro`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pro/benefits`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/tools`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/help`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/careers`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/shop`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${SITE_URL}/category/${category.id}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const toolPages: MetadataRoute.Sitemap = TOOLS
    .filter((tool) => tool.indexable !== false && tool.href.startsWith("/tools/"))
    .map((tool) => ({
      url: `${SITE_URL}${tool.href}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const uniquePages = new Map(
    [...staticPages, ...categoryPages, ...toolPages, ...blogPages].map((entry) => [entry.url, entry]),
  );
  return [...uniquePages.values()];
}
