import SitemapGenerator from "@/components/tool/SitemapGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free XML Sitemap Generator - Build Search Engine Sitemaps Online | Exismic",
  description: "Create valid XML sitemaps for Google Search Console and search engines with customizable update frequency and page priority.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="sitemap-generator"
      categoryId="seo"
      customTitle="XML Sitemap Generator"
      customDescription="Generate valid XML sitemaps for Google Search Console with changefreq and priority metadata."
    >
      <SitemapGenerator />
    </ToolPageShell>
  );
}
