import { NextRequest, NextResponse } from "next/server";
import { PRICING_CONFIG } from "@/config/pricing";
import { createNotification } from "@/lib/notifications";
import { getCreditPackagePrice, getProPrice } from "@/lib/payment-pricing";
import {
  capturePayPalOrder,
  getPayPalCapture,
  isPayPalSandboxEnabled,
  parsePayPalCustomId,
} from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { sendCreditsPurchasedEmail, sendProWelcomeEmail } from "@/lib/emails";
import { createClient } from "@/utils/supabase/server";

type CapturePayPalBody = {
  orderId?: string;
};

function buildInvoiceId(paymentId: string) {
  return `PAYPAL-${paymentId.slice(-8).toUpperCase()}`;
}

function amountsMatch(actual: number, expected: number) {
  return Math.round(actual * 100) === Math.round(expected * 100);
}

export async function POST(req: NextRequest) {
  try {


    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = (await req.json()) as CapturePayPalBody;
    if (!orderId) {
      return NextResponse.json({ error: "Missing PayPal order id." }, { status: 400 });
    }

    const existingByOrder = await prisma.paymentTransaction.findFirst({
      where: { provider: "paypal", providerOrderId: orderId },
    });

    if (existingByOrder) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        plan: existingByOrder.kind,
        currency: existingByOrder.currency,
        message: "PayPal order was already captured.",
      });
    }

    const capture = await capturePayPalOrder(orderId);
    const { purchaseUnit, paymentCapture, captureId, status, currency, amount } = getPayPalCapture(capture);
    const customContext = parsePayPalCustomId(purchaseUnit?.custom_id);

    if (!paymentCapture?.id || String(status).toUpperCase() !== "COMPLETED") {
      return NextResponse.json({ error: "PayPal payment is not completed yet." }, { status: 400 });
    }

    if (!customContext || customContext.userId !== user.id) {
      console.error("[PayPal] Capture user mismatch", {
        sessionUserId: user.id,
        customUserId: customContext?.userId,
        orderId,
        captureId,
      });
      return NextResponse.json({ error: "This PayPal order does not belong to your account." }, { status: 403 });
    }

    if (currency !== "USD" || customContext.currency !== "USD") {
      return NextResponse.json({ error: "PayPal checkout currently accepts USD only." }, { status: 400 });
    }

    const existingByCapture = await prisma.paymentTransaction.findUnique({
      where: { providerPaymentId: captureId },
    });

    if (existingByCapture) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        plan: existingByCapture.kind,
        currency: existingByCapture.currency,
        message: "PayPal payment was already verified.",
      });
    }

    let emailSent = false;

    if (customContext.plan === "credits") {
      const packagePrice = getCreditPackagePrice(customContext.tierId || undefined, "USD");

      if (!packagePrice) {
        return NextResponse.json({ error: "Invalid credit package selected." }, { status: 400 });
      }

      if (!amountsMatch(amount, packagePrice.amount)) {
        return NextResponse.json({ error: "PayPal amount does not match the selected credit package." }, { status: 400 });
      }

      const tier = packagePrice.tier;

      await prisma.$transaction([
        prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split("@")[0],
            lifetimeCredits: { increment: tier.credits },
          },
          create: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split("@")[0],
            plan: "free",
            dailyCredits: 50,
            bonusCredits: 0,
            lifetimeCredits: tier.credits,
          },
        }),
        prisma.paymentTransaction.create({
          data: {
            provider: "paypal",
            providerPaymentId: captureId,
            providerOrderId: orderId,
            userId: user.id,
            kind: "credits",
            amount: packagePrice.amountMinor,
            currency: "USD",
            metadata: {
              tierId: tier.id,
              credits: tier.credits,
              paypalStatus: status,
              paypalOrderId: capture.id,
            },
          },
        }),
        prisma.creditTransaction.create({
          data: {
            userId: user.id,
            amount: tier.credits,
            balanceType: "permanent",
            transactionType: "purchase",
            description: `Purchased ${tier.credits} permanent credits with PayPal`,
            metadata: {
              tierId: tier.id,
              provider: "paypal",
              providerPaymentId: captureId,
              providerOrderId: orderId,
            },
          },
        }),
      ]);

      emailSent = await sendCreditsPurchasedEmail(user.email, {
        credits: tier.credits,
        amount: packagePrice.display,
        invoiceId: buildInvoiceId(captureId),
      });
    } else {
      const proPrice = getProPrice("USD");

      if (!amountsMatch(amount, proPrice.amount)) {
        return NextResponse.json({ error: "PayPal amount does not match Exismic Pro pricing." }, { status: 400 });
      }

      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await prisma.$transaction([
        prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split("@")[0],
            plan: "pro",
            subscriptionId: orderId,
            subscriptionStatus: "active",
            planExpiresAt: nextBillingDate,
            aiGenerationsLimit: 1000,
            dailyCredits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS,
          },
          create: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split("@")[0],
            plan: "pro",
            subscriptionId: orderId,
            subscriptionStatus: "active",
            planExpiresAt: nextBillingDate,
            aiGenerationsLimit: 1000,
            dailyCredits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS,
            bonusCredits: 0,
            lifetimeCredits: 0,
          },
        }),
        prisma.paymentTransaction.create({
          data: {
            provider: "paypal",
            providerPaymentId: captureId,
            providerOrderId: orderId,
            userId: user.id,
            kind: "pro",
            amount: proPrice.amountMinor,
            currency: "USD",
            metadata: {
              planExpiresAt: nextBillingDate.toISOString(),
              paypalStatus: status,
              paypalOrderId: capture.id,
            },
          },
        }),
      ]);

      emailSent = await sendProWelcomeEmail(user.email, {
        invoiceId: buildInvoiceId(captureId),
        amount: proPrice.display,
        date: nextBillingDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      });
    }

    try {
      await createNotification(
        user.id,
        customContext.plan === "credits" ? "Credits added" : "Pro activated",
        customContext.plan === "credits"
          ? "Your PayPal credit purchase was verified."
          : "Your PayPal Pro purchase was verified.",
        "success",
      );
    } catch (notificationError) {
      console.error("[PayPal] Notification failed:", notificationError);
    }

    return NextResponse.json({
      success: true,
      plan: customContext.plan,
      currency: "USD",
      emailSent,
    });
  } catch (error) {
    console.error("[PayPal] Capture route failed:", error);
    const message = error instanceof Error ? error.message : "Could not verify PayPal payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
