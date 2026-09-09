import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getCachedMaintenanceConfig = unstable_cache(
  async () => {
    try {
      return await prisma.systemConfig.findUnique({
        where: { key: "maintenance_mode" },
      });
    } catch {
      return null;
    }
  },
  ["system-maintenance-config"],
  {
    revalidate: 60,
    tags: ["system-config"],
  }
);

export const getCachedActiveAnnouncements = unstable_cache(
  async () => {
    try {
      return await prisma.announcement.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      return [];
    }
  },
  ["active-announcements"],
  {
    revalidate: 60,
    tags: ["announcements"],
  }
);

export const getCachedUserRoleStatus = unstable_cache(
  async (userId: string) => {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, status: true, email: true },
      });
    } catch {
      return null;
    }
  },
  ["user-role-status"],
  {
    revalidate: 60,
    tags: ["user-role"],
  }
);
