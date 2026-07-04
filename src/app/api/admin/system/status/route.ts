import { NextResponse } from "next/server";
import { isAdminConfigured, isAdminEmail } from "@/lib/admin";
import { getSystemDiagnostics } from "@/lib/system-diagnostics";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin access is not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Admin sign in required" }, { status: 401 });
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const diagnostics = await getSystemDiagnostics();
  return NextResponse.json(diagnostics);
}
