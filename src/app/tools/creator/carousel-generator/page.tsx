import React from "react";
import CarouselGenerator from "@/components/tool/creator/CarouselGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("carousel-generator", "creator");
}

export default function CarouselGeneratorPage() {
  return (
    <ToolPageShell
      toolId="carousel-generator"
      categoryId="creator"
      customTitle="AI Social Carousel & Slide Deck Generator"
      customDescription="Design multi-slide PDF carousels for LinkedIn and Instagram with custom themes, fonts, and instant ZIP export."
    >
      <CarouselGenerator />
    </ToolPageShell>
  );
}
