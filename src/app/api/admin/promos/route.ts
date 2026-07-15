import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";

export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, promos });
  } catch (error) {
    console.error("[ADMIN_PROMOS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { code, bonusCredits, maxRedemptions, expiresAt } = body;

    if (!code?.trim() || !bonusCredits) {
      return NextResponse.json({ error: "code and bonusCredits are required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 400 });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: cleanCode,
        bonusCredits: parseInt(bonusCredits, 10),
        maxRedemptions: maxRedemptions ? parseInt(maxRedemptions, 10) : 100,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    });

    return NextResponse.json({ success: true, promo });
  } catch (error) {
    console.error("[ADMIN_PROMOS_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Promo code deleted." });
  } catch (error) {
    console.error("[ADMIN_PROMOS_DELETE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
