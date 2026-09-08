import React from "react";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { isToolUnavailable } from "@/lib/tool-reliability";
import { SupportAgentMaintenanceScreen } from "@/components/support-agent/SupportAgentMaintenanceScreen";
import { AlertTriangle, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SupportAgentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isUnavailable = isToolUnavailable("support-agent");

  if (!isUnavailable) {
    return <>{children}</>;
  }

  // Check admin status
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    isAdmin = dbUser?.role === "admin" || isAdminEmail(user.email);
  }

  // Non-admins see the Maintenance Screen
  if (!isAdmin) {
    return <SupportAgentMaintenanceScreen isAdmin={false} />;
  }

  // Admins see a bypass notice bar at the top, followed by the children
  return (
    <div className="relative min-h-screen">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-amber-500/30 bg-[#0c0904]/90 px-4 py-2.5 text-xs backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <Wrench size={14} className="animate-spin text-amber-400" />
          <span>Support Agent is currently in Maintenance Mode</span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-wider rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-amber-200">
            Admin View Active
          </span>
        </div>
        <p className="text-[11px] text-zinc-400">Public visitors see the maintenance screen</p>
      </div>
      {children}
    </div>
  );
}
