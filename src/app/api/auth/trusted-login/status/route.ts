import { consumeAuthLimit } from "@/lib/auth/security";
import { hasPendingResetCleanup } from "@/lib/auth/reset-cleanup";
import { safeAuthReturnPath } from "@/lib/auth/redirect";
import { requestIp } from "@/lib/trusted-login";
import { publicJson } from "@/lib/public-json";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashTrustedLoginToken } from "@/lib/trusted-login";
import { createAdminClient } from "@/utils/supabase/admin";
import { getServerSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const statusSchema = z.object({
  challengeId: z.string().min(10).max(100),
  browserToken: z.string().min(32).max(256),
});

function siteUrl(request: Request) {
  return getServerSiteUrl(request);
}

export async function POST(request: Request) {
  try {
    const parsed = statusSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return publicJson({ error: "Invalid approval check." }, { status: 400 });
    }

    if (!await consumeAuthLimit(`phone-status:${requestIp(request)}`, 600, 15 * 60 * 1000)) return publicJson({ error: "Too many attempts. Please try again later." }, { status: 429 });
    const challenge = await prisma.trustedLoginChallenge.findUnique({
      where: { id: parsed.data.challengeId },
    });

    if (
      !challenge ||
      challenge.browserTokenHash !== hashTrustedLoginToken(parsed.data.browserToken)
    ) {
      return publicJson({ error: "This login request is invalid." }, { status: 403 });
    }

    if (challenge.expiresAt <= new Date()) {
      await prisma.trustedLoginChallenge.update({
        where: { id: challenge.id },
        data: { status: "expired" },
      });
      return publicJson({ status: "expired" });
    }

    if (challenge.status !== "approved") {
      return publicJson({ status: challenge.status });
    }

    if (challenge.consumedAt) {
      return publicJson({ status: "consumed" });
    }

    const consumed = await prisma.trustedLoginChallenge.updateMany({
      where: {
        id: challenge.id,
        status: "approved",
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        status: "consumed",
        consumedAt: new Date(),
      },
    });

    if (!consumed.count) {
      return publicJson({ status: "consumed" });
    }

    const account = await prisma.user.findUnique({ where: { id: challenge.userId }, select: { status: true } });
    const device = await prisma.trustedLoginDevice.findUnique({ where: { id: challenge.deviceId } });
    if (!account || account.status !== "active" || !device || device.userId !== challenge.userId || device.loginEmail !== challenge.loginEmail || device.status !== "active" || device.revokedAt || device.expiresAt <= new Date() || await hasPendingResetCleanup(challenge.userId)) {
      return publicJson({ status: "expired" });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: challenge.loginEmail,
    });

    if (error || !data?.properties?.hashed_token) {
      console.error("[Trusted Login Session]", error?.message || "No login token returned");
      return publicJson(
        { error: "Approval succeeded, but Exismic could not create the session." },
        { status: 500 },
      );
    }

    const callbackUrl = new URL("/auth/callback", siteUrl(request));
    callbackUrl.searchParams.set("token_hash", data.properties.hashed_token);
    callbackUrl.searchParams.set("type", "magiclink");
    callbackUrl.searchParams.set("next", safeAuthReturnPath(challenge.returnUrl));

    return publicJson({
      status: "approved",
      actionLink: callbackUrl.toString(),
    });
  } catch (error) {
    console.error("[Trusted Login Status]", error);
    return publicJson(
      { error: "Could not check phone approval." },
      { status: 500 },
    );
  }
}
