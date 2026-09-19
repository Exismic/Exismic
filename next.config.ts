import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "localhost", "0.0.0.0"],
  serverExternalPackages: ["pdf-parse"],
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
    ],
  },
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
      {
        source: "/auth/signup",
        destination: "/auth/login?tab=signup",
        permanent: false,
      },
      // Verified Duplicate/Ghost Category Aliases (Canonical = Short /tools/[slug] Route)
      { source: "/tools/image/meme-generator", destination: "/tools/meme-generator", permanent: true },
      { source: "/tools/audio/sfx-generator", destination: "/tools/sfx-generator", permanent: true },
      { source: "/tools/ai/support-agent", destination: "/tools/support-agent", permanent: true },
      { source: "/tools/ai/landing-page-generator", destination: "/tools/landing-page-generator", permanent: true },
      { source: "/tools/ai/youtube-summarizer", destination: "/tools/youtube-summarizer", permanent: true },
      { source: "/tools/ai/qr-generator", destination: "/tools/qr-generator", permanent: true },
      { source: "/tools/ai/text-to-3d", destination: "/tools/text-to-3d", permanent: true },
      { source: "/tools/audio/ambient-mixer", destination: "/tools/ambient-mixer", permanent: true },
      { source: "/tools/productivity/discord-card", destination: "/tools/discord-card", permanent: true },
      { source: "/tools/productivity/qr-code", destination: "/tools/qr-code", permanent: true },
      { source: "/tools/productivity/hashtag-generator", destination: "/tools/hashtag-generator", permanent: true },
      { source: "/tools/productivity/typing-test", destination: "/tools/typing-test", permanent: true },
      { source: "/tools/productivity/resume-builder", destination: "/tools/resume-builder", permanent: true },
      { source: "/tools/productivity/resume-analyzer", destination: "/tools/resume-analyzer", permanent: true },
      { source: "/tools/productivity/invoice-generator", destination: "/tools/invoice-generator", permanent: true },
      { source: "/tools/ai/social-caption-generator", destination: "/tools/social-caption-generator", permanent: true },
      { source: "/tools/ai/ai-humanizer", destination: "/tools/ai-humanizer", permanent: true },
      { source: "/tools/ai/ai-detector", destination: "/tools/ai-detector", permanent: true },
      { source: "/tools/ai/grammar-checker", destination: "/tools/grammar-checker", permanent: true },
      { source: "/tools/productivity/resume-bullet-generator", destination: "/tools/resume-bullet-generator", permanent: true },
      { source: "/tools/ai/email-reply-generator", destination: "/tools/email-reply-generator", permanent: true },
      { source: "/tools/productivity/cover-letter-generator", destination: "/tools/cover-letter-generator", permanent: true },
      { source: "/tools/business/gst-calculator", destination: "/tools/gst-calculator", permanent: true },
      { source: "/tools/business/profit-margin-calculator", destination: "/tools/profit-margin-calculator", permanent: true },
      { source: "/tools/business/emi-calculator", destination: "/tools/emi-calculator", permanent: true },
      { source: "/tools/business/salary-calculator", destination: "/tools/salary-calculator", permanent: true },
      { source: "/tools/seo/meta-title-generator", destination: "/tools/meta-title-generator", permanent: true },
      { source: "/tools/seo/meta-description-generator", destination: "/tools/meta-description-generator", permanent: true },
      { source: "/tools/seo/robots-txt-generator", destination: "/tools/robots-txt-generator", permanent: true },
      { source: "/tools/seo/sitemap-generator", destination: "/tools/sitemap-generator", permanent: true },
      { source: "/tools/seo/keyword-density-checker", destination: "/tools/keyword-density-checker", permanent: true },
      { source: "/tools/seo/schema-markup-generator", destination: "/tools/schema-markup-generator", permanent: true },
      { source: "/tools/developer/base64-encoder", destination: "/tools/base64-encoder", permanent: true },
      { source: "/tools/developer/uuid-generator", destination: "/tools/uuid-generator", permanent: true },
      { source: "/tools/developer/hash-generator", destination: "/tools/hash-generator", permanent: true },
      { source: "/tools/developer/regex-tester", destination: "/tools/regex-tester", permanent: true },
      { source: "/tools/developer/lorem-ipsum-generator", destination: "/tools/lorem-ipsum-generator", permanent: true },
      { source: "/tools/student/pdf-to-notes", destination: "/tools/pdf-to-notes", permanent: true },
      { source: "/tools/student/flashcard-generator", destination: "/tools/flashcard-generator", permanent: true },
      { source: "/tools/student/citation-generator", destination: "/tools/citation-generator", permanent: true },
      { source: "/tools/student/math-solver", destination: "/tools/math-solver", permanent: true },
      { source: "/tools/developer/sql-builder", destination: "/tools/sql-builder", permanent: true },
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
