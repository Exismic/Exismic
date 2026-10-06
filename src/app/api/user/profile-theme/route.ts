import { publicJson } from "@/lib/public-json";
export async function POST() {
  return publicJson(
    { message: "Profile themes have been discontinued." },
    { status: 410 }
  );
}
