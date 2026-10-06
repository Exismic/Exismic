import { consumeAuthLimit } from "@/lib/auth/security";
import { requestIp } from "@/lib/trusted-login";
import { publicJson } from "@/lib/public-json";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashTrustedLoginToken } from "@/lib/trusted-login";

export const dynamic = "force-dynamic";

const responseSchema = z.object({
  challengeId: z.string().min(10).max(100),
  approvalToken: z.string().min(32).max(256),
  decision: z.enum(["approved", "denied"]),
});

export async function POST(request: Request) {
  try {
    const parsed = responseSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return publicJson({ error: "Invalid approval response." }, { status: 400 });
    }

    if (!await consumeAuthLimit(`phone-respond:${requestIp(request)}`, 60, 15 * 60 * 1000)) return publicJson({ error: "Too many attempts. Please try again later." }, { status: 429 });
    const challenge = await prisma.trustedLoginChallenge.findUnique({
      where: { id: parsed.data.challengeId },
      select: {
        id: true,
        status: true,
        approvalTokenHash: true,
        expiresAt: true,
        userId: true,
        deviceId: true,
      },
    });

    if (
      !challenge ||
      challenge.approvalTokenHash !== hashTrustedLoginToken(parsed.data.approvalToken)
    ) {
      return publicJson({ error: "This login request is invalid." }, { status: 403 });
    }

    if (challenge.expiresAt <= new Date()) {
      await prisma.trustedLoginChallenge.updateMany({
        where: { id: challenge.id, status: "pending" },
        data: { status: "expired" },
      });
      return publicJson({ error: "This login request has expired." }, { status: 410 });
    }

    const account = await prisma.user.findUnique({ where: { id: challenge.userId }, select: { status: true } });
    const device = await prisma.trustedLoginDevice.findUnique({ where: { id: challenge.deviceId } });
    if (!account || account.status !== "active" || !device || device.status !== "active" || device.revokedAt || device.expiresAt <= new Date()) return publicJson({ error: "This login request has expired." }, { status: 410 });

    if (challenge.status !== "pending") {
      return publicJson({
        success: true,
        status: challenge.status,
      });
    }

    const result = await prisma.trustedLoginChallenge.updateMany({
      where: {
        id: challenge.id,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      data: {
        status: parsed.data.decision,
        respondedAt: new Date(),
      },
    });

    if (!result.count) {
      return publicJson({ error: "This login request has expired." }, { status: 410 });
    }

    return publicJson({
      success: true,
      status: parsed.data.decision,
    });
  } catch (error) {
    console.error("[Trusted Login Respond]", error);
    return publicJson(
      { error: "Could not update this login request." },
      { status: 500 },
    );
  }
}
