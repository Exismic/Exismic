import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  // Fast-path: Let API routes handle their own specific auth/responses without double-checking in proxy
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const rawPath = request.nextUrl.pathname;
  const normalizedPath = (rawPath.length > 1 && rawPath.endsWith('/'))
    ? rawPath.slice(0, -1)
    : rawPath;

  const publicPages = new Set([
    "/",
    "/about",
    "/help",
    "/careers",
    "/shop",
    "/cookies",
    "/changelog",
    "/privacy-policy",
    "/terms-of-service",
    "/appeal",
    "/giveaway",
    "/giveaways",
    "/rewards",
    "/redeem",
    "/pricing",
    "/pro",
    "/tools",
    "/blog",
    "/features",
    "/roadmap",
    "/status",
    "/community",
    "/creators",
    "/gallery",
    "/explore",
    "/trending",
    "/marketplace",
    "/templates",
    "/wallpapers",
    "/ai-art",
    "/guides",
    "/docs",
    "/press",
    "/affiliates",
    "/partners",
    "/creators-program",
    "/compare",
    "/alternatives"
  ]);

  const isPublicRoute =
    publicPages.has(normalizedPath) ||
    normalizedPath.startsWith('/auth') ||
    normalizedPath.startsWith('/developer') ||
    normalizedPath.startsWith('/community') ||
    normalizedPath.startsWith('/category') ||
    normalizedPath.startsWith('/tools') ||
    normalizedPath.startsWith('/tool') ||
    normalizedPath.startsWith('/pro') ||
    normalizedPath.startsWith('/pricing') ||
    normalizedPath.startsWith('/blog') ||
    normalizedPath.startsWith('/rewards') ||
    normalizedPath.startsWith('/shop') ||
    normalizedPath.startsWith('/help') ||
    normalizedPath.startsWith('/terms-of-service') ||
    normalizedPath.startsWith('/privacy-policy') ||
    normalizedPath.startsWith('/cookies') ||
    normalizedPath.startsWith('/changelog') ||
    normalizedPath.startsWith('/about') ||
    normalizedPath.startsWith('/careers') ||
    normalizedPath.startsWith('/giveaway') ||
    normalizedPath.startsWith('/giveaways') ||
    normalizedPath.startsWith('/redeem') ||
    normalizedPath.startsWith('/appeal') ||
    normalizedPath.startsWith('/guidelines') ||
    normalizedPath.startsWith('/docs') ||
    normalizedPath.startsWith('/guides') ||
    normalizedPath.startsWith('/u/') ||
    normalizedPath.startsWith('/sitemap') ||
    normalizedPath.startsWith('/robots') ||
    normalizedPath.endsWith('.txt') ||
    normalizedPath.endsWith('.xml') ||
    normalizedPath.endsWith('.json');

  if (isPublicRoute) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Fast check: if no auth cookie is present, redirect to login without network delay
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes("auth-token") || c.name.startsWith("sb-")
  );

  if (!hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('returnUrl', rawPath);
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh session if expired - required for Server Components
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('returnUrl', rawPath);
    return NextResponse.redirect(url);
  }

  return response;
}

