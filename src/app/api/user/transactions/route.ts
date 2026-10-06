import { publicJson } from "@/lib/public-json";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return publicJson({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.paymentTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return publicJson({ success: true, data: transactions });
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return publicJson({ error: "Internal Error" }, { status: 500 });
  }
}
