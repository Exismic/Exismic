import React from "react";
import { MaintenanceScreen } from "@/components/layout/MaintenanceScreen";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Maintenance | Exismic",
  description: "Exismic is currently undergoing scheduled updates.",
};

export default async function MaintenancePage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      let isAdmin = Boolean(
        (user.email && isAdminEmail(user.email)) ||
        user.app_metadata?.role === "admin" ||
        user.user_metadata?.role === "admin"
      );

      if (!isAdmin && user.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, email: true },
          });
          isAdmin = dbUser?.role === "admin" || (dbUser?.email ? isAdminEmail(dbUser.email) : false);
        } catch {
          // Ignore db read error
        }
      }

      if (isAdmin) {
        redirect("/");
      }
    }
  } catch {
    // Ignore auth lookup errors
  }

  return <MaintenanceScreen />;
}
