import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import {
  createTrustedLoginToken,
  describeLoginDevice,
  hashTrustedLoginToken,
  normalizeLoginEmail,
  requestIp,
  trustedLoginChallengeExpiry,
} from "@/lib/trusted-login";
import { sendLoginApprovalPush } from "@/lib/trusted-login-push";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  email: z.string().email(),
  browserToken: z.string().min(32).max(256),
  returnUrl: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid login request." },
        { status: 400 },
      );
    }

    const email = normalizeLoginEmail(parsed.data.email);
    const limiter = checkRateLimit(
      `trusted-login-request:${email}:${getRequestIp(request)}`,
      5,
      15 * 60 * 1000,
    );
    if (!limiter.allowed) return rateLimitResponse(limiter.retryAfter);

    const device = await prisma.trustedLoginDevice.findUnique({
      where: { loginEmail: email },
    });

    if (
      !device ||
      device.status !== "active" ||
      device.revokedAt ||
      device.expiresAt <= new Date() ||
      !device.pushEndpoint ||
      !device.pushP256dh ||
      !device.pushAuth
    ) {
      return NextResponse.json(
        {
          error:
            "Phone approval is not ready for this account. Sign in normally and register it in Settings > Security.",
        },
        { status: 404 },
      );
    }

    await prisma.trustedLoginChallenge.updateMany({
      where: {
        loginEmail: email,
        status: "pending",
      },
      data: {
        status: "expired",
      },
    });

    const approvalToken = createTrustedLoginToken();
    const userAgent = request.headers.get("user-agent") || "";
    const returnUrl =
      parsed.data.returnUrl?.startsWith("/") ? parsed.data.returnUrl : "/dashboard";
    const expiresAt = trustedLoginChallengeExpiry();
    const challenge = await prisma.trustedLoginChallenge.create({
      data: {
        userId: device.userId,
        deviceId: device.id,
        loginEmail: email,
        browserTokenHash: hashTrustedLoginToken(parsed.data.browserToken),
        approvalTokenHash: hashTrustedLoginToken(approvalToken),
        requestIp: requestIp(request),
        requestDevice: describeLoginDevice(userAgent),
        requestUserAgent: userAgent,
        returnUrl,
        expiresAt,
      },
    });

    try {
      await sendLoginApprovalPush(
        {
          endpoint: device.pushEndpoint,
          keys: {
            p256dh: device.pushP256dh,
            auth: device.pushAuth,
          },
        },
        {
          challengeId: challenge.id,
          approvalToken,
          email,
          requestIp: challenge.requestIp || "Unknown network",
          requestDevice: challenge.requestDevice || "Unknown device",
          requestedAt: challenge.createdAt.toISOString(),
        },
      );
    } catch (error) {
      const statusCode =
        typeof error === "object" && error && "statusCode" in error
          ? Number(error.statusCode)
          : undefined;

      await prisma.trustedLoginChallenge.update({
        where: { id: challenge.id },
        data: { status: "delivery_failed" },
      });

      if (statusCode === 404 || statusCode === 410) {
        await prisma.trustedLoginDevice.update({
          where: { id: device.id },
          data: {
            status: "push_expired",
            notificationPermission: "expired",
            pushEndpoint: null,
            pushP256dh: null,
            pushAuth: null,
          },
        });
      }

      console.error("[Trusted Login Push]", error);
      return NextResponse.json(
        {
          error:
            "Lumora could not reach the registered phone. Open Settings on that phone and refresh the registration.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      challengeId: challenge.id,
      expiresAt: expiresAt.toISOString(),
      deviceName: device.deviceName,
      message: `Approval sent to ${device.deviceName}.`,
    });
  } catch (error) {
    console.error("[Trusted Login Request]", error);
    return NextResponse.json(
      { error: "Could not start phone approval. Please try again." },
      { status: 500 },
    );
  }
}
