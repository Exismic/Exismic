import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import FlashcardGenerator from "@/components/tool/FlashcardGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free AI Flashcard Generator - Create Digital Study Decks Online | Exismic",
  description: "Instantly create interactive digital flashcards from notes or topics for active recall and revision.",
  canonicalUrl: `${SITE_URL}/tools/flashcard-generator`,
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="flashcard-generator"
      categoryId="student"
      customTitle="AI Flashcard Deck Generator"
      customDescription="Transform notes and study topics into interactive flashcard decks with spaced repetition and active recall."
    >
      <FlashcardGenerator />
    </ToolPageShell>
  );
}
