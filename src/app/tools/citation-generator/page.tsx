import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import CitationGenerator from "@/components/tool/CitationGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Academic Citation Generator - APA 7, MLA 9, Chicago & Harvard | Exismic",
  description: "Generate accurate academic citations and bibliographies in APA 7, MLA 9, Chicago, and Harvard formats instantly.",
  canonicalUrl: `${SITE_URL}/tools/citation-generator`,
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="citation-generator"
      categoryId="student"
      customTitle="Academic Citation Generator"
      customDescription="Generate accurate reference citations and bibliographies in APA 7, MLA 9, Chicago, and Harvard formats."
    >
      <CitationGenerator />
    </ToolPageShell>
  );
}
