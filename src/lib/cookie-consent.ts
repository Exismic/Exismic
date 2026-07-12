export const COOKIE_CONSENT_STORAGE_KEY = "exismic_cookie_consent";
export const COOKIE_CONSENT_COOKIE_NAME = "exismic_cookie_consent";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_CHANGED_EVENT = "exismic:cookie-consent";
export const OPEN_COOKIE_PREFERENCES_EVENT = "exismic:open-cookie-preferences";

export type CookiePreferences = {
  essential: true;
  analytics: boolean;
  functional: boolean;
};

export type StoredCookieConsent = {
  version: typeof COOKIE_CONSENT_VERSION;
  preferences: CookiePreferences;
  updatedAt: string;
};

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  functional: false,
};

const OPTIONAL_FUNCTIONAL_STORAGE_KEYS = [
  "i18nextLng",
  "exismic:user-preferences",
  "exismic_safe_mode",
  "exismic_student_mode",
  "exismic_chat_mode",
  "exismic_image_history",
  "exismic_logo_history",
  "exismic_invoice_draft_v2",
  "exismic_resume_data_v2",
  "exismic_typing_leaderboard",
  "exismic_typing_streak",
] as const;

function normalizePreferences(value: unknown): CookiePreferences | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<CookiePreferences>;
  if (
    typeof candidate.analytics !== "boolean" ||
    typeof candidate.functional !== "boolean"
  ) {
    return null;
  }

  return {
    essential: true,
    analytics: candidate.analytics,
    functional: candidate.functional,
  };
}

function normalizeConsent(value: unknown): StoredCookieConsent | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<StoredCookieConsent> &
    Partial<CookiePreferences>;

  // Migrate the original unversioned preference object.
  const preferences = normalizePreferences(
    candidate.version === COOKIE_CONSENT_VERSION
      ? candidate.preferences
      : candidate,
  );

  if (!preferences) return null;

  return {
    version: COOKIE_CONSENT_VERSION,
    preferences,
    updatedAt:
      candidate.version === COOKIE_CONSENT_VERSION &&
      typeof candidate.updatedAt === "string"
        ? candidate.updatedAt
        : new Date().toISOString(),
  };
}

function parseConsent(raw: string | null): StoredCookieConsent | null {
  if (!raw) return null;

  try {
    return normalizeConsent(JSON.parse(raw));
  } catch {
    return null;
  }
}

function readConsentCookie(): StoredCookieConsent | null {
  if (typeof document === "undefined") return null;

  const prefix = `${COOKIE_CONSENT_COOKIE_NAME}=`;
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!cookie) return null;

  try {
    return parseConsent(decodeURIComponent(cookie.slice(prefix.length)));
  } catch {
    return null;
  }
}

export function readCookieConsent(): StoredCookieConsent | null {
  if (typeof window === "undefined") return null;

  let localConsent: StoredCookieConsent | null = null;
  try {
    localConsent = parseConsent(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY),
    );
  } catch {
    // Storage can be unavailable in privacy-focused browser modes.
  }

  return localConsent ?? readConsentCookie();
}

export function saveCookieConsent(
  preferences: CookiePreferences,
): StoredCookieConsent {
  const consent: StoredCookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    preferences: {
      essential: true,
      analytics: Boolean(preferences.analytics),
      functional: Boolean(preferences.functional),
    },
    updatedAt: new Date().toISOString(),
  };

  if (typeof window === "undefined") return consent;

  const serialized = JSON.stringify(consent);
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, serialized);
    if (!consent.preferences.functional) {
      for (const key of OPTIONAL_FUNCTIONAL_STORAGE_KEYS) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // The first-party cookie below remains the fallback consent record.
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(serialized)}; Max-Age=15552000; Path=/; SameSite=Lax${secure}`;

  window.dispatchEvent(
    new CustomEvent<StoredCookieConsent>(COOKIE_CONSENT_CHANGED_EVENT, {
      detail: consent,
    }),
  );

  return consent;
}

export function hasAnalyticsConsent(): boolean {
  return readCookieConsent()?.preferences.analytics === true;
}

export function hasFunctionalConsent(): boolean {
  return readCookieConsent()?.preferences.functional === true;
}

export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
  }
}

export function getFunctionalStorageItem(key: string): string | null {
  if (typeof window === "undefined" || !hasFunctionalConsent()) return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setFunctionalStorageItem(key: string, value: string): boolean {
  if (typeof window === "undefined" || !hasFunctionalConsent()) return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeFunctionalStorageItem(key: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to remove when storage is unavailable.
  }
}
