import { publicJson } from "@/lib/public-json";
export async function POST() {
  return publicJson(
    {
      error: "This legacy processing endpoint has been retired. Use the dedicated PDF merger, splitter, compressor, or converter endpoint.",
    },
    { status: 410 },
  );
}
