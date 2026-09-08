import FlashcardGenerator from "@/components/tool/FlashcardGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free AI Flashcard Generator - Create Digital Study Decks Online | Exismic",
  description: "Instantly create interactive digital flashcards from notes or topics for active recall and revision.",
};

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
