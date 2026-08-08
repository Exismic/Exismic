import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { PRICING_CONFIG } from "@/config/pricing";
import { sendAdminGiftCardReviewEmail } from "@/lib/emails";

function validateCodeLength(type: string, rawCode: string): { isValid: boolean; error?: string } {
  const sanitized = rawCode.replace(/[\s-]/g, "").toUpperCase();
  if (!sanitized) return { isValid: false, error: "Gift card code cannot be empty." };

  if (type === "minecoins" || type === "xbox") {
    if (sanitized.length !== 25) {
      return { isValid: false, error: `Code must be exactly 25 characters (entered ${sanitized.length}).` };
    }
  } else if (type === "gplay") {
    if (sanitized.length !== 16) {
      return { isValid: false, error: `Google Play gift code must be exactly 16 characters (entered ${sanitized.length}).` };
    }
  } else if (type === "amazon") {
    if (sanitized.length < 14 || sanitized.length > 15) {
      return { isValid: false, error: `Amazon claim code must be 14-15 characters (entered ${sanitized.length}).` };
    }
  } else if (sanitized.length < 6) {
    return { isValid: false, error: "Voucher code must be at least 6 characters." };
  }

  return { isValid: true };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { planId, giftCardType = "minecoins", giftCardCode } = body;

    const validation = validateCodeLength(giftCardType, giftCardCode || "");
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const cleanCode = (giftCardCode || "").trim().toUpperCase();

    // Determine plan price & credits
    let credits = 0;
    let planName = "Custom Package";

    if (planId === "pro" || planId === "pro_yearly") {
      credits = planId === "pro_yearly" ? PRICING_CONFIG.PRO_YEARLY_PLAN.DAILY_CREDITS : PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS;
      planName = planId === "pro_yearly" ? "Exismic Pro Yearly Membership" : "Exismic Pro Membership";
    } else {
      const tier = PRICING_CONFIG.CREDIT_PACKAGES.find((t) => t.id === planId || t.billingPlanId === planId);
      if (tier) {
        credits = tier.credits + tier.bonusCredits;
        planName = tier.label;
      }
    }


    // Check recent submissions limit (prevent spamming codes)
    const recentSubmissions = await prisma.paymentOrder.count({
      where: {
        userId: user.id,
        gateway: "gift_card",
        createdAt: { gte: new Date(Date.now() - 3600_000) }, // past 1 hour
      },
    });

    if (recentSubmissions >= 5) {
      return NextResponse.json(
        { error: "Too many gift code submissions. Please wait before submitting more." },
        { status: 429 }
      );
    }

    // Create payment order with PENDING_VERIFICATION status
    const paymentOrder = await prisma.paymentOrder.create({
      data: {
        userId: user.id,
        planId: planId || "starter",
        market: "GLOBAL",
        currency: "USD",
        amount: 0,
        gateway: "gift_card",
        status: "PENDING_VERIFICATION",
        credits,
        metadata: {
          giftCardType,
          giftCardCode: cleanCode,
          planName,
          userEmail: user.email,
          submittedAt: new Date().toISOString(),
          requiresManualVerification: true,
        },
      },
    });

    // Notify admins via in-app notifications and email
    try {
      const adminUsers = await prisma.user.findMany({
        where: {
          OR: [
            { role: "admin" },
            { role: "superadmin" },
            { email: "syedyaseeralirayan@gmail.com" },
          ],
        },
        select: { id: true, email: true },
      });

      // 1. Create in-app Notification for each admin account
      if (adminUsers.length > 0) {
        const notificationData = adminUsers.map((admin) => ({
          userId: admin.id,
          title: "🎁 New Gift Card Review Request",
          message: `User ${user.email || "Unknown"} submitted a ${giftCardType.toUpperCase()} gift card for ${planName} (Order #${paymentOrder.id.slice(0, 8)}).`,
          type: "warning",
        }));

        await prisma.notification.createMany({
          data: notificationData,
        }).catch((err) => {
          console.error("[GiftCardSubmit] Failed to create admin notifications:", err);
        });
      }

      // 2. Dispatch email to syedyaseeralirayan@gmail.com and any additional admin emails
      const adminEmails = new Set<string>();
      adminEmails.add("syedyaseeralirayan@gmail.com");
      adminUsers.forEach((admin) => {
        if (admin.email) adminEmails.add(admin.email.toLowerCase());
      });

      for (const targetAdminEmail of Array.from(adminEmails)) {
        sendAdminGiftCardReviewEmail({
          orderId: paymentOrder.id,
          userEmail: user.email || "Unknown User",
          userId: user.id,
          giftCardType,
          giftCardCode: cleanCode,
          planName,
          credits,
          adminEmail: targetAdminEmail,
        }).catch((err) => {
          console.error(`[GiftCardSubmit] Failed to send review email to ${targetAdminEmail}:`, err);
        });
      }
    } catch (notifyErr) {
      console.error("[GiftCardSubmit] Error notifying admin:", notifyErr);
    }

    return NextResponse.json({
      success: true,
      orderId: paymentOrder.id,
      status: "PENDING_VERIFICATION",
      message: "Gift card submitted successfully for manual verification.",
    });
  } catch (err) {
    console.error("[GiftCardSubmit] Error processing gift code:", err);
    return NextResponse.json({ error: "Failed to submit gift code." }, { status: 500 });
  }
}
