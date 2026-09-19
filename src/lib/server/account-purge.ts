import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Completely and permanently purges a user's data across:
 * 1. Supabase Storage (uploaded assets & cloud drive files)
 * 2. Prisma Database (cascading deletes across all relations)
 * 3. Supabase Auth (auth.users entry)
 */
export async function permanentlyPurgeUserAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const adminSupabase = createAdminClient();

    // 1. Delete user files from Supabase Storage
    try {
      const userFiles = await prisma.userFile.findMany({
        where: { userId },
        select: { originalUrl: true, resultUrl: true },
      });

      const extractPath = (url: string | null): string | null => {
        if (!url) return null;
        try {
          const parsed = new URL(url);
          const parts = parsed.pathname.split("/exismic-drive/");
          return parts.length > 1 ? parts[1] : null;
        } catch {
          return null;
        }
      };

      if (userFiles.length > 0) {
        const filePaths = userFiles
          .flatMap((f) => [extractPath(f.originalUrl), extractPath(f.resultUrl)])
          .filter((p): p is string => Boolean(p));

        if (filePaths.length > 0) {
          await adminSupabase.storage.from("exismic-drive").remove(filePaths);
        }
      }
    } catch (storageErr) {
      console.warn(`[Purge] Storage cleanup warning for ${userId}:`, storageErr);
    }

    // 2. Delete user record in database (cascades across all user relations)
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (dbErr) {
      console.warn(`[Purge] DB delete warning for ${userId}:`, dbErr);
    }

    // 3. Delete user from Supabase Auth
    try {
      await adminSupabase.auth.admin.deleteUser(userId);
    } catch (authErr) {
      console.warn(`[Purge] Auth delete warning for ${userId}:`, authErr);
    }

    return { success: true };
  } catch (error) {
    console.error(`[Purge] Failed to purge user ${userId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to permanently purge user.",
    };
  }
}
