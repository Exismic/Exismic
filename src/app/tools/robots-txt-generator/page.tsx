import RobotsTxtGenerator from "@/components/tool/RobotsTxtGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free Robots.txt Generator - Create Search Engine Robot Instructions | Exismic",
  description: "Generate valid robots.txt files for Googlebot, Bingbot, and web crawlers with Disallow rules and Sitemap integration.",
};

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
