import React from "react";
import CarouselGenerator from "@/components/tool/creator/CarouselGenerator";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("carousel-generator", "creator");
}

export default function CarouselGeneratorPage() {
  return <CarouselGenerator />;
}
