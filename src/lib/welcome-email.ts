import "server-only";

import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/emails";

const WELCOME_EMAIL_CLAIM = "welcome_email_claim";
const WELCOME_EMAIL_SENT = "welcome_email_sent";
const CLAIM_TIMEOUT_MS = 10 * 60 * 1000;

export type WelcomeEmailResult =
  | "sent"
  | "already_sent"
  | "in_progress"
  | "failed";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function acquireWelcomeClaim(email: string) {
  const now = new Date();

  try {
    await prisma.authRateLimit.create({
      data: {
        email,
        type: WELCOME_EMAIL_CLAIM,
        lastRequestedAt: now,
      },
    });
    return true;
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;
  }

  const staleBefore = new Date(now.getTime() - CLAIM_TIMEOUT_MS);
  const reclaimed = await prisma.authRateLimit.updateMany({
    where: {
      email,
      type: WELCOME_EMAIL_CLAIM,
      lastRequestedAt: { lte: staleBefore },
    },
    data: { lastRequestedAt: now },
  });

  return reclaimed.count === 1;
}

export async function sendWelcomeEmailOnce(
  rawEmail: string,
): Promise<WelcomeEmailResult> {
  const email = normalizeEmail(rawEmail);
  if (!email) return "failed";

  const sentMarker = await prisma.authRateLimit.findUnique({
    where: {
      email_type: { email, type: WELCOME_EMAIL_SENT },
    },
    select: { id: true },
  });
  if (sentMarker) return "already_sent";

  const claimed = await acquireWelcomeClaim(email);
  if (!claimed) return "in_progress";

  try {
    const emailHash = createHash("sha256").update(email).digest("hex");
    const sent = await sendWelcomeEmail(email, `welcome/${emailHash}`);

    if (!sent) {
      await prisma.authRateLimit.deleteMany({
        where: { email, type: WELCOME_EMAIL_CLAIM },
      });
      return "failed";
    }

    await prisma.$transaction([
      prisma.authRateLimit.upsert({
        where: {
          email_type: { email, type: WELCOME_EMAIL_SENT },
        },
        update: { lastRequestedAt: new Date() },
        create: {
          email,
          type: WELCOME_EMAIL_SENT,
          lastRequestedAt: new Date(),
        },
      }),
      prisma.authRateLimit.deleteMany({
        where: { email, type: WELCOME_EMAIL_CLAIM },
      }),
    ]);

    return "sent";
  } catch (error) {
    console.error(`[Auth] Welcome email failed for ${email}:`, error);
    await prisma.authRateLimit.deleteMany({
      where: { email, type: WELCOME_EMAIL_CLAIM },
    }).catch(() => undefined);
    return "failed";
  }
}
