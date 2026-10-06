import { publicJson } from "@/lib/public-json";
import { getPayPalClientId, getPayPalClientToken } from "@/lib/paypal";

export async function GET() {
  try {
    const clientId = getPayPalClientId();
    if (!clientId) {
      return publicJson({ error: "PayPal is not configured" }, { status: 503 });
    }
    const clientToken = await getPayPalClientToken();
    return publicJson({
      clientId,
      clientToken,
    });
  } catch (error) {
    console.error("[PayPal Client Token] Error:", error);
    return publicJson({ error: "Could not retrieve PayPal token" }, { status: 500 });
  }
}
