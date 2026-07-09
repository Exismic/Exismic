import { NextResponse } from "next/server";
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
      return NextResponse.json({ error: "Invalid approval check." }, { status: 400 });
    }

    const challenge = await prisma.trustedLoginChallenge.findUnique({
      where: { id: parsed.data.challengeId },
    });

    if (
      !challenge ||
      challenge.browserTokenHash !== hashTrustedLoginToken(parsed.data.browserToken)
    ) {
      return NextResponse.json({ error: "This login request is invalid." }, { status: 403 });
    }

    if (challenge.expiresAt <= new Date() && challenge.status === "pending") {
      await prisma.trustedLoginChallenge.update({
        where: { id: challenge.id },
        data: { status: "expired" },
      });
      return NextResponse.json({ status: "expired" });
    }

    if (challenge.status !== "approved") {
      return NextResponse.json({ status: challenge.status });
    }

    if (challenge.consumedAt) {
      return NextResponse.json({ status: "consumed" });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: challenge.loginEmail,
    });

    if (error || !data?.properties?.hashed_token) {
      console.error("[Trusted Login Session]", error?.message || "No login token returned");
      return NextResponse.json(
        { error: "Approval succeeded, but Exismic could not create the session." },
        { status: 500 },
      );
    }

    const consumed = await prisma.trustedLoginChallenge.updateMany({
      where: {
        id: challenge.id,
        status: "approved",
        consumedAt: null,
      },
      data: {
        status: "consumed",
        consumedAt: new Date(),
      },
    });

    if (!consumed.count) {
      return NextResponse.json({ status: "consumed" });
    }

    const callbackUrl = new URL("/auth/callback", siteUrl(request));
    callbackUrl.searchParams.set("token_hash", data.properties.hashed_token);
    callbackUrl.searchParams.set("type", "magiclink");
    callbackUrl.searchParams.set("next", challenge.returnUrl);

    return NextResponse.json({
      status: "approved",
      actionLink: callbackUrl.toString(),
    });
  } catch (error) {
    console.error("[Trusted Login Status]", error);
    return NextResponse.json(
      { error: "Could not check phone approval." },
      { status: 500 },
    );
  }
}
