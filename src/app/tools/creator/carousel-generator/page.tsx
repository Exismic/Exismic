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
      customTitle="AI Social Carousel Generator"
      customDescription="Create multi-slide swipeable carousels for LinkedIn and Instagram with custom themes, clean typography, and instant PDF or ZIP export."
    >
      <CarouselGenerator />
    </ToolPageShell>
  );
}
