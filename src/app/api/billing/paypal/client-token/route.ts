import { NextResponse } from "next/server";
import { getPayPalClientId, getPayPalClientToken } from "@/lib/paypal";

export async function GET() {
  try {
    const clientId = getPayPalClientId();
    if (!clientId) {
      return NextResponse.json({ error: "PayPal is not configured" }, { status: 503 });
    }
    const clientToken = await getPayPalClientToken();
    return NextResponse.json({
      clientId,
      clientToken,
    });
  } catch (error) {
    console.error("[PayPal Client Token] Error:", error);
    return NextResponse.json({ error: "Could not retrieve PayPal token" }, { status: 500 });
  }
}
