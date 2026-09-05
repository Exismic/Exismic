import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { getOrCreateUser } from "@/lib/user-access";

// Quota definitions in bytes
export const FREE_STORAGE_BYTES = 50 * 1024 * 1024; // 50 MB
export const PRO_STORAGE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB
export const FREE_MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const PRO_MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export async function GET() {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    const isPro = dbUser.plan === "pro" || dbUser.subscriptionStatus === "active";
    const totalBytes = isPro ? PRO_STORAGE_BYTES : FREE_STORAGE_BYTES;
    const maxUploadBytes = isPro ? PRO_MAX_UPLOAD_BYTES : FREE_MAX_UPLOAD_BYTES;

    // Fetch user files to compute storage
    const files = await prisma.userFile.findMany({
      where: { userId: dbUser.id },
      select: {
        id: true,
        fileType: true,
        metadata: true,
      },
    });

    let usedBytes = 0;
    for (const file of files) {
      const meta = (file.metadata as Record<string, any>) || {};
      if (typeof meta.sizeBytes === "number" && meta.sizeBytes > 0) {
        usedBytes += meta.sizeBytes;
      } else {
        // Fallback estimate for older files without recorded size:
        // ~120KB for image, ~300KB for doc/pdf, ~500KB for others
        if (file.fileType === "image") usedBytes += 120 * 1024;
        else if (file.fileType === "document") usedBytes += 300 * 1024;
        else usedBytes += 250 * 1024;
      }
    }

    const usedPercent = Math.min(100, Math.round((usedBytes / totalBytes) * 1000) / 10);
    const remainingBytes = Math.max(0, totalBytes - usedBytes);

    return NextResponse.json({
      success: true,
      plan: isPro ? "pro" : "free",
      usedBytes,
      totalBytes,
      usedPercent,
      fileCount: files.length,
      remainingBytes,
      maxUploadBytes,
      quotaFormatted: {
        used: formatBytes(usedBytes),
        total: formatBytes(totalBytes),
        remaining: formatBytes(remainingBytes),
      },
    });
  } catch (error) {
    console.error("[DRIVE_STORAGE_GET]", error);
    return NextResponse.json({ error: "Failed to calculate storage" }, { status: 500 });
  }
}
