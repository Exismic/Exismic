import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  const hostName = SITE_URL.replace(/^https?:\/\//i, "").replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account/",
          "/admin/",
          "/auth/",
          "/chat/",
          "/dashboard/",
          "/favorites",
          "/history",
          "/tools/ai/chat/",
          "/tools/support-agent/widget-test/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/account/",
          "/admin/",
          "/auth/",
          "/chat/",
          "/dashboard/",
          "/favorites",
          "/history",
          "/tools/ai/chat/",
          "/tools/support-agent/widget-test/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/account/",
          "/admin/",
          "/auth/",
          "/chat/",
          "/dashboard/",
          "/favorites",
          "/history",
          "/tools/ai/chat/",
          "/tools/support-agent/widget-test/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: hostName,
  };
}

