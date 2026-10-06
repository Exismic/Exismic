export function safeAuthReturnPath(value?: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(value)) return '/dashboard';
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(decoded)) return '/dashboard';
    return new URL(value, 'https://exismic.invalid').origin === 'https://exismic.invalid' ? value : '/dashboard';
  } catch { return '/dashboard'; }
}
