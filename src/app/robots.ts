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
          "/tools/creator/device-mockup",
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
          "/tools/creator/device-mockup",
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
          "/tools/creator/device-mockup",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: hostName,
  };
}

