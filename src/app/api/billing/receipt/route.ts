import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { findBillingReceipt } from "@/lib/billing/receipts";
import { createReceiptPdf } from "@/lib/billing/receipt-pdf";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please sign in to view your receipt." }, { status: 401 });
    const transactionId = request.nextUrl.searchParams.get("transactionId");
    const orderId = request.nextUrl.searchParams.get("orderId");
    if (!transactionId && (!orderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId))) return NextResponse.json({ error: "A valid payment reference is required." }, { status: 400 });
    const receipt = await findBillingReceipt(user.id, { transactionId, orderId });
    if (!receipt) return NextResponse.json({ error: "A confirmed payment receipt was not found for this account." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
    if (request.nextUrl.searchParams.get("format") === "json") return NextResponse.json({ receipt }, { headers: { "Cache-Control": "private, no-store" } });
    const pdf = await createReceiptPdf(receipt);
    const filename = receipt.reference.replace(/[^a-zA-Z0-9_-]/g, "_");
    return new Response(new Uint8Array(pdf), { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Exismic-Receipt-${filename}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    console.error("[Billing] Receipt unavailable:", error);
    return NextResponse.json({ error: "Your receipt could not be loaded. Please try again or contact billing@exismic.xyz." }, { status: 500 });
  }
}
