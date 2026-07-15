import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";

const DEFAULT_CONFIGS: Record<string, string> = {
  maintenance_mode: "false",
  free_plan_daily_credits: "50",
  pro_plan_daily_credits: "1000",
};

export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const dbConfigs = await prisma.systemConfig.findMany();
    
    // Combine db values with static defaults
    const configs: Record<string, string> = { ...DEFAULT_CONFIGS };
    for (const cfg of dbConfigs) {
      configs[cfg.key] = cfg.value;
    }

    return NextResponse.json({
      success: true,
      configs,
    });
  } catch (error) {
    console.error("[ADMIN_CONFIGS_GET]", error);
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
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "key and value are required" }, { status: 400 });
    }

    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error("[ADMIN_CONFIGS_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
