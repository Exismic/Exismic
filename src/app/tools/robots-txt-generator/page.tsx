import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import RobotsTxtGenerator from "@/components/tool/RobotsTxtGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Robots.txt Generator - Create Search Engine Robot Instructions | Exismic",
  description: "Generate valid robots.txt files for Googlebot, Bingbot, and web crawlers with Disallow rules and Sitemap integration.",
  canonicalUrl: `${SITE_URL}/tools/robots-txt-generator`,
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="robots-txt-generator"
      categoryId="seo"
      customTitle="Robots.txt Generator"
      customDescription="Visual robots.txt builder with User-Agent rules, Disallow paths, and Sitemap integration."
    >
      <RobotsTxtGenerator />
    </ToolPageShell>
  );
}
