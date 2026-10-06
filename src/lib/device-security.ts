import { createHash, randomBytes, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { createOtpChallenge, consumeOtpChallenge } from '@/lib/auth/security';
import { hasPendingResetCleanup } from '@/lib/auth/reset-cleanup';

export const DEVICE_TOKEN_COOKIE_NAME = "exismic_device_token";
export const DEVICE_TRUST_DAYS = 90;
export const DEVICE_OTP_CHALLENGE_PREFIX = "device_otp:";

export interface ParsedUserAgent {
  os: string;
  browser: string;
  deviceType: "desktop" | "mobile" | "tablet";
  deviceName: string;
}

export function hashDeviceToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateDeviceToken(): string {
  return randomBytes(32).toString("hex");
}

export function generate6DigitOtp(): string {
  return randomInt(100000, 1000000).toString();
}

export function parseUserAgent(userAgent: string = ""): ParsedUserAgent {
  const ua = userAgent.trim();
  if (!ua) {
    return {
      os: "Unknown OS",
      browser: "Unknown Browser",
      deviceType: "desktop",
      deviceName: "Unknown Device",
    };
  }

  // Detect OS
  let os = "Unknown OS";
  if (/Windows NT 10\.0/i.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6\.3/i.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6\.1/i.test(ua)) os = "Windows 7";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/iPhone/i.test(ua)) os = "iOS (iPhone)";
  else if (/iPad/i.test(ua)) os = "iOS (iPad)";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/CrOS/i.test(ua)) os = "Chrome OS";
  else if (/Linux/i.test(ua)) os = "Linux";

  // Detect Browser
  let browser = "Unknown Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  // Device Type
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";
  if (/iPad|Tablet/i.test(ua)) deviceType = "tablet";
  else if (/iPhone|Android|Mobile/i.test(ua)) deviceType = "mobile";

  const deviceName = `${browser} on ${os}`;

  return { os, browser, deviceType, deviceName };
}

export function extractClientIp(headers: Headers): string {
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp && firstIp !== "::1") return firstIp;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp && realIp !== "::1") return realIp;
  
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  return "127.0.0.1";
}

export async function checkIsDeviceTrusted(
  userId: string, email: string, rawDeviceToken?: string, clientIp?: string,
  authVersion = 'initial',
) {
  if (!rawDeviceToken || !/^[a-f0-9]{64}$/.test(rawDeviceToken)) return { isTrusted: false, device: null };
  const tokenHash = hashDeviceToken(rawDeviceToken);
  const emailLower = email.trim().toLowerCase();
  try {
    if (await hasPendingResetCleanup(userId)) return { isTrusted: false, device: null };
    const saved = await prisma.verificationToken.findFirst({ where: { identifier: `browser_trust:${userId}`, token: { startsWith: `browser_trust:v1:${tokenHash}:` }, expires: { gt: new Date() } } });
    if (saved) {
      const data = JSON.parse(Buffer.from(saved.token.split(':')[3], 'base64url').toString()) as { email: string; version: string; deviceName: string; lastIp: string };
      if (data.email === emailLower && data.version === authVersion) return { isTrusted: true, device: { deviceName: data.deviceName, lastIp: clientIp || data.lastIp } };
      return { isTrusted: false, device: null };
    }
    // Honour existing browser cookies only until the first password-version change.
    const device = authVersion === 'initial' ? await prisma.trustedLoginDevice.findFirst({ where: { userId, loginEmail: emailLower, deviceTokenHash: tokenHash, status: 'active', expiresAt: { gt: new Date() }, revokedAt: null } }) : null;
    return { isTrusted: Boolean(device), device };
  } catch (error) {
    console.error('[DeviceSecurity] Device trust could not be checked:', error);
    return { isTrusted: false, device: null };
  }
}

export async function createDeviceVerificationOtp(email: string, userId: string, requestIp: string, userAgent: string) {
  const created = await createOtpChallenge('device', email.trim().toLowerCase(), userId);
  return { challengeId: created.id, otp: created.otp, expiresAt: created.expires, deviceName: parseUserAgent(userAgent).deviceName, ip: requestIp };
}
export async function verifyDeviceOtpCode(email: string, challengeId: string, otpCode: string) {
  const consumed = await consumeOtpChallenge('device', email.trim().toLowerCase(), challengeId, otpCode.trim());
  return consumed ? { valid: true, userId: consumed.userId, error: null } : { valid: false, userId: null, error: 'This code is invalid or has expired. Please request a new code.' };
}

/** Each browser gets a separate hashed token; phone registration stays untouched. */
export async function registerTrustedDevice(userId: string, email: string, userAgent: string, ip: string, authVersion = 'initial') {
  const rawDeviceToken = generateDeviceToken();
  const expiresAt = new Date(Date.now() + DEVICE_TRUST_DAYS * 86400000);
  const deviceName = parseUserAgent(userAgent).deviceName;
  const data = { email: email.trim().toLowerCase(), version: authVersion, deviceName, lastIp: ip };
  await prisma.verificationToken.create({ data: { identifier: `browser_trust:${userId}`, token: `browser_trust:v1:${hashDeviceToken(rawDeviceToken)}:${Buffer.from(JSON.stringify(data)).toString('base64url')}`, expires: expiresAt } });
  return { rawDeviceToken, expiresAt, deviceName };
}
