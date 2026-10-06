import { publicJson } from "@/lib/public-json";
export async function POST() {
  return publicJson({ error: "Third-party gift-card payments are no longer accepted. Please use the secure checkout or an Exismic gift voucher." }, { status: 410 });
}
