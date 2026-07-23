import { type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|exismic-push-sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav|ogg|aac|flac|m4a)$).*)",
  ],
};
