import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Request-scoped deduplicated server auth user getter.
 * Powered by React.cache(), ensuring that throughout a single incoming HTTP request,
 * any number of layouts, pages, or server components call this function and get
 * the EXACT same promise and result with ZERO duplicate network round-trips to Supabase.
 */
export const getCachedAuthUser = cache(async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const hasAuthCookie = allCookies.some(
      (c) =>
        c.name.startsWith("sb-") ||
        c.name.includes("auth") ||
        c.name.includes("token") ||
        c.name.includes("session")
    );

    if (!hasAuthCookie) {
      return null;
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user || null;
  } catch (error) {
    console.error("[GET_CACHED_AUTH_USER_ERROR]", error);
    return null;
  }
});
