import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "0.0.0.0"],
  serverExternalPackages: ["pdf-parse"],
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/minecraft-skin",
        destination: "/tools/image/minecraft-skin",
        permanent: false,
      },
      {
        source: "/tools/minecraft-skin-maker",
        destination: "/tools/image/minecraft-skin",
        permanent: false,
      },
      {
        source: "/tools/image-eraser",
        destination: "/tools/image/eraser",
        permanent: false,
      },
      {
        source: "/tools/image-compressor",
        destination: "/tools/image/compressor",
        permanent: false,
      },
      {
        source: "/tools/image-resizer",
        destination: "/tools/image/resizer",
        permanent: false,
      },
      {
        source: "/tools/image-converter",
        destination: "/tools/image/converter",
        permanent: false,
      },
      {
        source: "/tools/image-generator",
        destination: "/tools/ai/img-gen",
        permanent: false,
      },
      {
        source: "/tools/ai-img-gen",
        destination: "/tools/ai/img-gen",
        permanent: false,
      },
      {
        source: "/tools/hook-script-generator",
        destination: "/tools/creator/hook-script-generator",
        permanent: false,
      },
      {
        source: "/giveaways",
        destination: "/giveaway",
        permanent: false,
      },
    ];
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "clsx",
      "tailwind-merge",
      "@supabase/supabase-js",
      "uuid",
    ],
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
