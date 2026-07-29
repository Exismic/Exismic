import RobotsTxtGenerator from "@/components/tool/RobotsTxtGenerator";

export const metadata = {
  title: "Free Robots.txt Generator - Create Search Engine Robot Instructions | Exismic",
  description: "Generate valid robots.txt files for Googlebot, Bingbot, and web crawlers with Disallow rules and Sitemap integration.",
};

export default function Page() {
  return <RobotsTxtGenerator />;
}
