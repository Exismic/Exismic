import MetaDescriptionGenerator from "@/components/tool/MetaDescriptionGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free AI Meta Description Generator - SERP Description Tool | Exismic",
  description: "Create high-converting, keyword-optimized meta descriptions under 160 characters for maximum search clicks.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="meta-description-generator"
      categoryId="seo"
      customTitle="Meta Description Generator"
      customDescription="Create clear, keyword-optimized meta descriptions under 160 characters with live SERP preview."
    >
      <MetaDescriptionGenerator />
    </ToolPageShell>
  );
}
