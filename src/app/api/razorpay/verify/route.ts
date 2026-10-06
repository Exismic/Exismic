import { publicJson } from "@/lib/public-json";
export async function POST() {
  return publicJson(
    { error: "This verification endpoint has been retired. Refresh the page and try again." },
    { status: 410 },
  );
}
