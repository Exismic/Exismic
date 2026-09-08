import LoremIpsumGenerator from "@/components/tool/LoremIpsumGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free Lorem Ipsum Generator - Create Custom Dummy Text | Exismic",
  description: "Generate dummy Lorem Ipsum placeholder text for web design, mockups, and layout prototypes.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="lorem-ipsum-generator"
      categoryId="developer"
      customTitle="Lorem Ipsum Generator"
      customDescription="Generate dummy placeholder text in paragraphs, sentences, or words with optional HTML tag formatting."
    >
      <LoremIpsumGenerator />
    </ToolPageShell>
  );
}
