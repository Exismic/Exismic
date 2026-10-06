import { publicJson } from "@/lib/public-json";
export async function POST() {
  return publicJson(
    {
      error: "This legacy upload endpoint has been retired. Use the dedicated tool API route for the selected Exismic tool.",
    },
    { status: 410 }
  );
}
