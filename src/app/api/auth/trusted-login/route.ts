import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRequestIp, rateLimitResponse, requireApiUser } from "@/lib/api-security";
import {
  hashDeviceToken,
  isMobileUserAgent,
  normalizeLoginEmail,
  requestIp,
  trustedDeviceExpiry,
} from "@/lib/trusted-login";

export const dynamic = "force-dynamic";

const enrollmentSchema = z.object({
  email: z.string().email(),
  deviceToken: z.string().min(32).max(256),
  deviceName: z.string().trim().min(2).max(120),
  platform: z.string().trim().min(1).max(80),
  browserName: z.string().trim().min(1).max(80),
  osVersion: z.string().trim().max(80).optional(),
  deviceModel: z.string().trim().max(120).optional(),
  notificationPermission: z.literal("granted"),
  pushSubscription: z.object({
    endpoint: z.string().url().max(4096),
    expirationTime: z.number().nullable(),
    keys: z.object({
      p256dh: z.string().min(20).max(1024),
      auth: z.string().min(8).max(1024),
    }),
  }),
});

function verifiedIdentityEmails(user: Awaited<ReturnType<typeof requireApiUser>>) {
  if (user instanceof NextResponse) return [];

  const emails = new Set<string>();
  if (user.email && (user.email_confirmed_at || user.confirmed_at || user.identities?.length)) {
    emails.add(normalizeLoginEmail(user.email));
  }

  for (const identity of user.identities ?? []) {
    const identityEmail = identity.identity_data?.email;
    if (typeof identityEmail === "string") {
      emails.add(normalizeLoginEmail(identityEmail));
    }
  }

  return [...emails];
}

function serializeDevice(device: {
  id: string;
  loginEmail: string;
  deviceName: string;
  platform: string | null;
  browserName: string | null;
  osVersion: string | null;
  deviceModel: string | null;
  notificationPermission: string | null;
  setupCompletedAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  pushEndpoint: string | null;
}) {
  return {
    id: device.id,
    loginEmail: device.loginEmail,
    deviceName: device.deviceName,
    platform: device.platform,
    browserName: device.browserName,
    osVersion: device.osVersion,
    deviceModel: device.deviceModel,
    notificationPermission: device.notificationPermission,
    setupCompletedAt: device.setupCompletedAt.toISOString(),
    lastSeenAt: device.lastSeenAt.toISOString(),
    expiresAt: device.expiresAt.toISOString(),
    pushReady: Boolean(device.pushEndpoint),
  };
}

export async function GET() {
  try {
    const user = await requireApiUser();
    if (user instanceof NextResponse) return user;

    const device = await prisma.trustedLoginDevice.findFirst({
      where: {
        userId: user.id,
        status: "active",
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    return NextResponse.json({
      success: true,
      emails: verifiedIdentityEmails(user),
      device: device ? serializeDevice(device) : null,
    });
  } catch (error) {
    console.error("[Trusted Login GET]", error);
    return NextResponse.json(
      { error: "Could not load trusted login settings." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    if (user instanceof NextResponse) return user;

    const limiter = checkRateLimit(
      `trusted-login-enroll:${user.id}:${getRequestIp(request)}`,
      5,
      60 * 60 * 1000,
    );
    if (!limiter.allowed) return rateLimitResponse(limiter.retryAfter);

    const parsed = enrollmentSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid trusted phone details." },
        { status: 400 },
      );
    }

    const selectedEmail = normalizeLoginEmail(parsed.data.email);
    if (!verifiedIdentityEmails(user).includes(selectedEmail)) {
      return NextResponse.json(
        { error: "Choose a verified email connected to this Lumora account." },
        { status: 403 },
      );
    }

    const userAgent = request.headers.get("user-agent") || "";
    if (!isMobileUserAgent(userAgent)) {
      return NextResponse.json(
        {
          error:
            "Open Lumora Settings on the phone you want to register, then complete setup there.",
        },
        { status: 400 },
      );
    }

    const deviceTokenHash = hashDeviceToken(parsed.data.deviceToken);
    const emailOwner = await prisma.trustedLoginDevice.findUnique({
      where: { loginEmail: selectedEmail },
      select: { userId: true },
    });
    if (emailOwner && emailOwner.userId !== user.id) {
      return NextResponse.json(
        { error: "This login email is already registered to another Lumora account." },
        { status: 409 },
      );
    }

    const tokenOwner = await prisma.trustedLoginDevice.findUnique({
      where: { deviceTokenHash },
      select: { userId: true },
    });
    if (tokenOwner && tokenOwner.userId !== user.id) {
      return NextResponse.json(
        { error: "This phone is already registered to another Lumora account." },
        { status: 409 },
      );
    }

    const endpointOwner = await prisma.trustedLoginDevice.findUnique({
      where: { pushEndpoint: parsed.data.pushSubscription.endpoint },
      select: { userId: true },
    });
    if (endpointOwner && endpointOwner.userId !== user.id) {
      return NextResponse.json(
        { error: "This phone notification subscription belongs to another Lumora account." },
        { status: 409 },
      );
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email || selectedEmail,
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          selectedEmail.split("@")[0],
      },
    });

    const now = new Date();
    const device = await prisma.trustedLoginDevice.upsert({
      where: { userId: user.id },
      update: {
        loginEmail: selectedEmail,
        deviceTokenHash,
        deviceName: parsed.data.deviceName,
        deviceType: "phone",
        platform: parsed.data.platform,
        browserName: parsed.data.browserName,
        osVersion: parsed.data.osVersion || null,
        deviceModel: parsed.data.deviceModel || null,
        notificationPermission: parsed.data.notificationPermission,
        pushEndpoint: parsed.data.pushSubscription.endpoint,
        pushP256dh: parsed.data.pushSubscription.keys.p256dh,
        pushAuth: parsed.data.pushSubscription.keys.auth,
        status: "active",
        lastIp: requestIp(request),
        userAgent,
        setupCompletedAt: now,
        lastSeenAt: now,
        expiresAt: trustedDeviceExpiry(),
        revokedAt: null,
      },
      create: {
        userId: user.id,
        loginEmail: selectedEmail,
        deviceTokenHash,
        deviceName: parsed.data.deviceName,
        deviceType: "phone",
        platform: parsed.data.platform,
        browserName: parsed.data.browserName,
        osVersion: parsed.data.osVersion || null,
        deviceModel: parsed.data.deviceModel || null,
        notificationPermission: parsed.data.notificationPermission,
        pushEndpoint: parsed.data.pushSubscription.endpoint,
        pushP256dh: parsed.data.pushSubscription.keys.p256dh,
        pushAuth: parsed.data.pushSubscription.keys.auth,
        status: "active",
        lastIp: requestIp(request),
        userAgent,
        setupCompletedAt: now,
        lastSeenAt: now,
        expiresAt: trustedDeviceExpiry(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful. This phone can now receive Lumora login approvals.",
      device: serializeDevice(device),
    });
  } catch (error) {
    console.error("[Trusted Login POST]", error);
    return NextResponse.json(
      { error: "Could not finish trusted phone registration." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const user = await requireApiUser();
    if (user instanceof NextResponse) return user;

    await prisma.trustedLoginDevice.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: {
        status: "revoked",
        revokedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Trusted Login DELETE]", error);
    return NextResponse.json(
      { error: "Could not remove the trusted phone." },
      { status: 500 },
    );
  }
}
