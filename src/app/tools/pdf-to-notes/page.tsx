import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import PdfToNotes from "@/components/tool/PdfToNotes";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free AI PDF to Notes Converter - Summarize Study Material | Exismic",
  description: "Convert textbook PDFs and lecture notes into organized AI study guides, summaries, and revision notes.",
  canonicalUrl: `${SITE_URL}/tools/pdf-to-notes`,
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="pdf-to-notes"
      categoryId="student"
      customTitle="PDF to AI Study Notes"
      customDescription="Synthesize textbook chapters and lecture documents into structured study notes, core definitions, and revision Q&As."
    >
      <PdfToNotes />
    </ToolPageShell>
  );
}
