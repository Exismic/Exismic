import type { NextRequest } from "next/server";
import { handleAudioProcessingRequest } from "@/lib/audio-route";

export const maxDuration = 600;

export async function POST(request: NextRequest) {
  return handleAudioProcessingRequest(request, "stem-separation");
}
