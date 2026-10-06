/** Keep server/provider diagnostics out of customer-facing messages. */
export function publicErrorMessage(value: unknown, status = 500): string {
  const fallback = status === 429 ? 'Too many requests. Please wait a moment and try again.'
    : status === 401 ? 'Please sign in again to continue.'
    : status === 404 ? 'We couldn’t find what you requested. Please check and try again.'
    : status === 503 ? 'This service is temporarily unavailable. Please try again shortly.'
    : 'We couldn’t complete this request. Please try again in a moment.';
  if (status >= 500 || typeof value !== 'string' || !value.trim() || value.length > 350) return fallback;
  const technical = /(?:vercel|prisma|sqlstate|econn\w+|stack\s?trace|environment\s?variables?|service[_ -]?role|\b(?:GROQ|SUPABASE|RAZORPAY|PAYPAL|OPENAI|HF)_[A-Z_]+\b|(?:add|set|missing|configure).{0,60}(?:api[_ -]?key|secret)|(?:model|provider).{0,80}(?:deprecated|decommissioned|outdated|unsupported|not found|does not exist|invalid|retired)|(?:invalid|unsupported).{0,30}model|internal server|configuration error|\bat \w+\s*\([^)]*:\d+)/i;
  return technical.test(value) ? fallback : value.trim();
}

export function publicErrorPayload<T>(body: T, status: number): T {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return status >= 400 ? { error: publicErrorMessage(body, status) } as T : body;
  const input = body as Record<string, unknown>;
  const isError = status >= 400 || input.success === false || Boolean(input.error);
  if (!isError) return body;
  const safe: Record<string, unknown> = status >= 500 ? { ...(input.success === false ? { success: false } : {}) } : { ...input };
  if (status >= 500) {
    if (typeof input.retryable === 'boolean') safe.retryable = input.retryable;
    if (typeof input.requestId === 'string' && /^[a-f0-9-]{36}$/i.test(input.requestId)) safe.requestId = input.requestId;
  }
  for (const key of ['details', 'detail', 'debug', 'stack', 'trace', 'cause', 'providerError', 'rawError', 'response']) delete safe[key];
  const message = publicErrorMessage(input.error || input.message, status);
  if ('error' in input || status >= 400 || input.success === false) safe.error = message;
  if ('message' in input) safe.message = publicErrorMessage(input.message, status);
  return safe as T;
}
