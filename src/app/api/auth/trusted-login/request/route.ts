import { consumeAuthLimit } from "@/lib/auth/security";
import { hasPendingResetCleanup } from "@/lib/auth/reset-cleanup";
import { safeAuthReturnPath } from "@/lib/auth/redirect";
import { publicJson } from "@/lib/public-json";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequestIp, rateLimitResponse } from "@/lib/api-security";
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
      return publicJson(
        { error: parsed.error.issues[0]?.message || "Invalid login request." },
        { status: 400 },
      );
    }

    const email = normalizeLoginEmail(parsed.data.email);
    const allowed = await consumeAuthLimit(`phone-request-ip:${getRequestIp(request)}`, 20, 15 * 60 * 1000)
      && await consumeAuthLimit(`phone-request-email:${email}`, 5, 15 * 60 * 1000);
    if (!allowed) return rateLimitResponse(900);

    const device = await prisma.trustedLoginDevice.findFirst({
      where: { loginEmail: email, status: "active" },
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
      return publicJson(
        {
          error:
            "Phone approval is not ready for this account. Sign in normally and register it in Settings > Security.",
        },
        { status: 404 },
      );
    }

    const account = await prisma.user.findUnique({ where: { id: device.userId }, select: { status: true } });
    if (await hasPendingResetCleanup(device.userId)) return publicJson({ error: 'Please sign in with your password to finish a security update.' }, { status: 403 });
    if (!account || account.status !== "active") return publicJson({ error: "This account cannot sign in right now." }, { status: 403 });

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
    const returnUrl = safeAuthReturnPath(parsed.data.returnUrl);
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
      return publicJson(
        {
          error:
            "Exismic could not reach the registered phone. Open Settings on that phone and refresh the registration.",
        },
        { status: 503 },
      );
    }

    return publicJson({
      success: true,
      challengeId: challenge.id,
      expiresAt: expiresAt.toISOString(),
      deviceName: device.deviceName,
      message: `Approval sent to ${device.deviceName}.`,
    });
  } catch (error) {
    console.error("[Trusted Login Request]", error);
    return publicJson(
      { error: "Could not start phone approval. Please try again." },
      { status: 500 },
    );
  }
}
