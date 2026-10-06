import { publicJson } from "@/lib/public-json";
function legacyAuthDisabled() {
  return publicJson(
    { error: "This authentication endpoint is no longer available." },
    { status: 410 },
  );
}

export const GET = legacyAuthDisabled;
export const POST = legacyAuthDisabled;
