import { createHash, randomBytes, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

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
  userId: string,
  email: string,
  rawDeviceToken?: string,
  clientIp?: string,
) {
  if (!rawDeviceToken || !rawDeviceToken.trim()) {
    return { isTrusted: false, device: null };
  }

  const tokenHash = hashDeviceToken(rawDeviceToken.trim());

  try {
    const device = await prisma.trustedLoginDevice.findFirst({
      where: {
        deviceTokenHash: tokenHash,
        status: "active",
        expiresAt: { gt: new Date() },
        revokedAt: null,
      },
    });

    if (!device) {
      return { isTrusted: false, device: null };
    }

    // Verify user match
    const emailLower = email.trim().toLowerCase();
    if (device.userId !== userId && device.loginEmail !== emailLower) {
      return { isTrusted: false, device: null };
    }

    // Update last seen in background
    void prisma.trustedLoginDevice.update({
      where: { id: device.id },
      data: {
        lastSeenAt: new Date(),
        lastIp: clientIp || device.lastIp,
      },
    }).catch((err) => {
      console.error("[DeviceSecurity] Failed to update device lastSeenAt:", err);
    });

    return { isTrusted: true, device };
  } catch (error) {
    console.error("[DeviceSecurity] Error checking device trust:", error);
    return { isTrusted: false, device: null };
  }
}

export async function createDeviceVerificationOtp(
  email: string,
  userId: string,
  requestIp: string,
  userAgent: string,
) {
  const emailLower = email.trim().toLowerCase();
  const otp = generate6DigitOtp();
  const challengeId = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const parsedUa = parseUserAgent(userAgent);

  // Clear existing device OTP tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: emailLower,
      token: { startsWith: DEVICE_OTP_CHALLENGE_PREFIX },
    },
  });

  // Store token in DB: "device_otp:<challengeId>:<otp>:<userId>"
  const tokenString = `${DEVICE_OTP_CHALLENGE_PREFIX}${challengeId}:${otp}:${userId}`;
  await prisma.verificationToken.create({
    data: {
      identifier: emailLower,
      token: tokenString,
      expires: expiresAt,
    },
  });

  return {
    challengeId,
    otp,
    expiresAt,
    deviceName: parsedUa.deviceName,
    ip: requestIp,
  };
}

export async function verifyDeviceOtpCode(
  email: string,
  challengeId: string,
  otpCode: string,
) {
  const emailLower = email.trim().toLowerCase();
  const cleanOtp = otpCode.trim();

  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      identifier: emailLower,
      token: {
        startsWith: `${DEVICE_OTP_CHALLENGE_PREFIX}${challengeId}:${cleanOtp}:`,
      },
      expires: { gt: new Date() },
    },
  });

  if (!tokenRecord) {
    return { valid: false, userId: null, error: "Invalid or expired verification code." };
  }

  const parts = tokenRecord.token.split(":");
  const userId = parts[3];

  if (!userId) {
    return { valid: false, userId: null, error: "Verification error. Please sign in again." };
  }

  // Delete consumed token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: tokenRecord.identifier,
        token: tokenRecord.token,
      },
    },
  });

  return { valid: true, userId, error: null };
}

export async function registerTrustedDevice(
  userId: string,
  email: string,
  userAgent: string,
  ip: string,
) {
  const emailLower = email.trim().toLowerCase();
  const rawDeviceToken = generateDeviceToken();
  const deviceTokenHash = hashDeviceToken(rawDeviceToken);
  const parsedUa = parseUserAgent(userAgent);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + DEVICE_TRUST_DAYS);

  await prisma.trustedLoginDevice.create({
    data: {
      userId,
      loginEmail: emailLower,
      deviceTokenHash,
      deviceName: parsedUa.deviceName,
      deviceType: parsedUa.deviceType,
      platform: parsedUa.os,
      browserName: parsedUa.browser,
      status: "active",
      lastIp: ip,
      userAgent,
      expiresAt,
    },
  });

  return {
    rawDeviceToken,
    expiresAt,
    deviceName: parsedUa.deviceName,
  };
}
