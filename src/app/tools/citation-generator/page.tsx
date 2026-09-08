import CitationGenerator from "@/components/tool/CitationGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free Academic Citation Generator - APA 7, MLA 9, Chicago & Harvard | Exismic",
  description: "Generate accurate academic citations and bibliographies in APA 7, MLA 9, Chicago, and Harvard formats instantly.",
};

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
