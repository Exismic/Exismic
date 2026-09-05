import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { getOrCreateUser } from "@/lib/user-access";
import { deleteStorageFile } from "@/lib/server/storage";

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    const body = await req.json();
    const { ids } = body as { ids?: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No file IDs provided" }, { status: 400 });
    }

    // Fetch user files to verify ownership & get resultUrls
    const filesToDelete = await prisma.userFile.findMany({
      where: {
        id: { in: ids },
        userId: dbUser.id,
      },
      select: { id: true, resultUrl: true },
    });

    if (filesToDelete.length === 0) {
      return NextResponse.json({ success: true, deletedCount: 0 });
    }

    // Asynchronously delete from Supabase storage to reclaim space
    Promise.allSettled(
      filesToDelete.map((f) => (f.resultUrl ? deleteStorageFile(f.resultUrl) : Promise.resolve(false)))
    ).catch((err) => console.warn("[Batch Delete] Storage cleanup background error:", err));

    // Delete database records
    const deleteResult = await prisma.userFile.deleteMany({
      where: {
        id: { in: filesToDelete.map((f) => f.id) },
        userId: dbUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("[DRIVE_BATCH_DELETE]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete files" },
      { status: 500 }
    );
  }
}
