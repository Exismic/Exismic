import { createHash, randomBytes } from "crypto";

export const TRUSTED_LOGIN_DEVICE_DAYS = 90;
export const TRUSTED_LOGIN_CHALLENGE_MINUTES = 5;

export function normalizeLoginEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashDeviceToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createDeviceToken() {
  return randomBytes(32).toString("base64url");
}

export function createTrustedLoginToken() {
  return randomBytes(32).toString("base64url");
}

export function hashTrustedLoginToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function trustedDeviceExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TRUSTED_LOGIN_DEVICE_DAYS);
  return expiresAt;
}

export function trustedLoginChallengeExpiry() {
  return new Date(Date.now() + TRUSTED_LOGIN_CHALLENGE_MINUTES * 60 * 1000);
}

export function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function isMobileUserAgent(userAgent: string) {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
}

export function describeLoginDevice(userAgent: string) {
  if (/iPhone/i.test(userAgent)) return "iPhone";
  if (/iPad/i.test(userAgent)) return "iPad";
  if (/Android/i.test(userAgent)) return "Android device";
  if (/Windows/i.test(userAgent)) return "Windows computer";
  if (/Macintosh|Mac OS X/i.test(userAgent)) return "Mac";
  if (/Linux/i.test(userAgent)) return "Linux computer";
  return "Unknown device";
}
