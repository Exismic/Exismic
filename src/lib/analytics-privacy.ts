export function isPrivateAnalyticsUrl(value: string): boolean {
  try {
    const url = new URL(value, 'https://www.exismic.xyz');
    return url.pathname === '/auth' || url.pathname.startsWith('/auth/')
      || ['token', 'token_hash', 'code', 'password', 'linkToken'].some(key => url.searchParams.has(key));
  } catch { return true; }
}

export function safeAnalyticsEvent<T extends { url: string }>(event: T): T | null {
  if (isPrivateAnalyticsUrl(event.url)) return null;
  const url = new URL(event.url, 'https://www.exismic.xyz');
  url.search = '';
  url.hash = '';
  return { ...event, url: url.toString() };
}
