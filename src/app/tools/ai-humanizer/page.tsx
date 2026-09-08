import AiHumanizer from "@/components/tool/AiHumanizer";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free AI Text Humanizer - Rewrite AI Text to Natural Human Flow | Exismic",
  description: "Transform ChatGPT, Claude, and Gemini drafts into natural, engaging, human-sounding writing with custom tones and instant readability.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="ai-humanizer"
      categoryId="ai"
      customTitle="AI Text Humanizer"
      customDescription="Transform robotic AI drafts into natural, engaging human writing with tone controls and instant clarity."
    >
      <AiHumanizer />
    </ToolPageShell>
  );
}
