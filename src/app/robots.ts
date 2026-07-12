import type { MetadataRoute } from "next";
import { SEO_INDEXING_ENABLED, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/account/",
        "/admin/",
        "/chat/",
        "/dashboard/",
        "/favorites",
        "/history",
      ],
    },
    host: SITE_URL,
  };
  return SEO_INDEXING_ENABLED
    ? { ...base, sitemap: `${SITE_URL}/sitemap.xml` }
    : base;
}
