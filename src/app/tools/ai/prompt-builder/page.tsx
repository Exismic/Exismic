import React from "react";
import PromptBuilderStudio from "@/components/tool/ai/PromptBuilderStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("prompt-builder", "ai");
}

export default function PromptBuilderPage() {
  return (
    <ToolPageShell
      toolId="prompt-builder"
      categoryId="ai"
      customTitle="AI Mega-Prompt Builder"
      customDescription="Transform simple 1-line ideas into master-grade prompt engineering protocols for ChatGPT, Claude, Gemini, and DeepSeek. Free client-side tool with XML tags and Chain-of-Thought reasoning."
    >
      <PromptBuilderStudio />
    </ToolPageShell>
  );
}
