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
          "/chat/",
          "/dashboard/",
          "/favorites",
          "/history",
        ],
      },
      {
        userAgent: "Googlebot",
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
      {
        userAgent: "Bingbot",
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
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: hostName,
  };
}

