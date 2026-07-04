import { NextResponse } from "next/server";
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
      return NextResponse.json({ error: "Invalid approval response." }, { status: 400 });
    }

    const challenge = await prisma.trustedLoginChallenge.findUnique({
      where: { id: parsed.data.challengeId },
      select: {
        id: true,
        status: true,
        approvalTokenHash: true,
        expiresAt: true,
      },
    });

    if (
      !challenge ||
      challenge.approvalTokenHash !== hashTrustedLoginToken(parsed.data.approvalToken)
    ) {
      return NextResponse.json({ error: "This login request is invalid." }, { status: 403 });
    }

    if (challenge.expiresAt <= new Date()) {
      await prisma.trustedLoginChallenge.updateMany({
        where: { id: challenge.id, status: "pending" },
        data: { status: "expired" },
      });
      return NextResponse.json({ error: "This login request has expired." }, { status: 410 });
    }

    if (challenge.status !== "pending") {
      return NextResponse.json({
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
      return NextResponse.json({ error: "This login request has expired." }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      status: parsed.data.decision,
    });
  } catch (error) {
    console.error("[Trusted Login Respond]", error);
    return NextResponse.json(
      { error: "Could not update this login request." },
      { status: 500 },
    );
  }
}
