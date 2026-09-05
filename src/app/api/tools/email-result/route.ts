import { NextRequest, NextResponse } from "next/server";
import { getOptionalApiUser, getRequestIp, checkDistributedRateLimit } from "@/lib/api-security";
import { sendToolResultEmail } from "@/lib/emails";
import { prisma } from "@/lib/prisma";
import { normalizeHistoryToolType, inferResultFileType } from "@/lib/results";

// Disposable / temporary email domain blocklist to preserve deliverability
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "trashmail.com",
  "sharklasers.com",
  "dispostable.com",
  "getnada.com",
  "fakemailgenerator.com",
  "yopmail.com",
  "throwawaymail.com",
  "mohmal.com",
  "burnermail.io",
  "inboxkitten.com",
  "crazymailing.com",
  "tmpmail.net",
  "tempail.com",
  "generator.email",
  "emailondeck.com",
  "tempmail.ninja",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "tinemail.com",
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      toolType,
      toolName,
      title,
      content,
      fileUrl,
      metadata,
    } = body as {
      email?: string;
      toolType?: string;
      toolName?: string;
      title?: string;
      content?: string;
      fileUrl?: string;
      metadata?: Record<string, unknown>;
    };

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const domain = cleanEmail.split("@")[1];
    if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      return NextResponse.json(
        {
          error:
            "Temporary and disposable email addresses are not supported. Please provide a standard personal or work email address.",
        },
        { status: 400 }
      );
    }

    if (!content?.trim() && !fileUrl?.trim()) {
      return NextResponse.json(
        { error: "No content or file provided to email." },
        { status: 400 }
      );
    }

    // Auth check
    const user = await getOptionalApiUser();
    const clientIp = getRequestIp(req);

    // Rate Limiting Policy
    if (user) {
      // Authenticated Creator: 10 emails / 24h, 15s cooldown
      const cooldownKey = `email_cooldown:usr:${user.id}`;
      const cooldown = await checkDistributedRateLimit(cooldownKey, 1, 15_000);
      if (!cooldown.allowed) {
        return NextResponse.json(
          {
            error: `Please wait ${cooldown.retryAfter} seconds before requesting another email.`,
            retryAfter: cooldown.retryAfter,
          },
          { status: 429 }
        );
      }

      const dailyKey = `email_daily:usr:${user.id}`;
      const daily = await checkDistributedRateLimit(
        dailyKey,
        10,
        24 * 60 * 60 * 1000
      );
      if (!daily.allowed) {
        return NextResponse.json(
          {
            error:
              "You have reached your daily limit of 10 result emails. Please try again tomorrow.",
            remaining: 0,
          },
          { status: 429 }
        );
      }
    } else {
      // Anonymous Guest: 2 emails / 24h, 60s cooldown
      const cooldownKey = `email_cooldown:ip:${clientIp}`;
      const cooldown = await checkDistributedRateLimit(cooldownKey, 1, 60_000);
      if (!cooldown.allowed) {
        return NextResponse.json(
          {
            error: `Please wait ${cooldown.retryAfter}s before sending another export.`,
            retryAfter: cooldown.retryAfter,
          },
          { status: 429 }
        );
      }

      const dailyKey = `email_daily:ip:${clientIp}`;
      const daily = await checkDistributedRateLimit(
        dailyKey,
        2,
        24 * 60 * 60 * 1000
      );
      if (!daily.allowed) {
        return NextResponse.json(
          {
            error:
              "You have reached the free guest limit of 2 emailed exports per 24 hours. Create a free Exismic account to send up to 10 exports daily.",
            guestLimitReached: true,
            remaining: 0,
          },
          { status: 429 }
        );
      }
    }

    // Send Email
    const emailSent = await sendToolResultEmail({
      email: cleanEmail,
      toolType: toolType || "studio",
      toolName: toolName || "Exismic Tool",
      title: title || "Your Generation",
      content: content?.trim(),
      fileUrl: fileUrl?.trim(),
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "Could not send email at this time. Please try again later." },
        { status: 500 }
      );
    }

    // If authenticated, automatically preserve in UserFile library
    if (user && toolType) {
      try {
        const normalizedToolType = normalizeHistoryToolType(toolType);
        const inferredFileType = inferResultFileType({
          toolType: normalizedToolType,
          resultUrl: fileUrl,
        });

        await prisma.userFile.create({
          data: {
            userId: user.id,
            toolType: normalizedToolType,
            originalName: title || `${toolName || 'Tool'} Output`,
            resultUrl: fileUrl || null,
            fileType: inferredFileType,
            status: "completed",
            metadata: {
              ...(metadata || {}),
              emailedTo: cleanEmail,
              contentSnippet: content ? content.slice(0, 500) : null,
            },
          },
        });
      } catch (err) {
        console.warn("[Email Result] Non-fatal error auto-saving to library:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Result sent successfully to ${cleanEmail}`,
    });
  } catch (error) {
    console.error("[EMAIL_RESULT_POST]", error);
    return NextResponse.json(
      { error: "Failed to process email delivery request." },
      { status: 500 }
    );
  }
}
