import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { hasSeenWelcome: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error updating welcome modal status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
