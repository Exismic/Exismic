const PRODUCTION_SITE_URL = "https://exismicai.online";

function trimUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

function isLocalUrl(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(trimUrl(url));
}

export function getServerSiteUrl(request?: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const requestOrigin = request ? new URL(request.url).origin : "";

  if (requestOrigin && isLocalUrl(requestOrigin) && process.env.NODE_ENV === "development") {
    return trimUrl(requestOrigin);
  }

  if (configuredUrl && !isLocalUrl(configuredUrl)) {
    return trimUrl(configuredUrl);
  }

  if (requestOrigin && !isLocalUrl(requestOrigin)) {
    return trimUrl(requestOrigin);
  }

  return PRODUCTION_SITE_URL;
}

export function getClientSiteUrl() {
  if (typeof window !== "undefined") {
    const currentOrigin = window.location.origin;
    if (isLocalUrl(currentOrigin)) return trimUrl(currentOrigin);
  }

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl && !isLocalUrl(configuredUrl)) {
    return trimUrl(configuredUrl);
  }

  if (typeof window !== "undefined") {
    const currentOrigin = window.location.origin;
    if (!isLocalUrl(currentOrigin)) return trimUrl(currentOrigin);
  }

  return PRODUCTION_SITE_URL;
}

