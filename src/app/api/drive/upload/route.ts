import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { getOrCreateUser } from "@/lib/user-access";
import { uploadProcessedFile } from "@/lib/server/storage";
import { inferResultFileType } from "@/lib/results";
import sharp from "sharp";
import {
  FREE_STORAGE_BYTES,
  PRO_STORAGE_BYTES,
  FREE_MAX_UPLOAD_BYTES,
  PRO_MAX_UPLOAD_BYTES,
  formatBytes,
} from "../storage/route";

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to upload to Cloud Drive." }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    const isPro = dbUser.plan === "pro" || dbUser.subscriptionStatus === "active";
    const totalStorageBytes = isPro ? PRO_STORAGE_BYTES : FREE_STORAGE_BYTES;
    const maxSingleFileBytes = isPro ? PRO_MAX_UPLOAD_BYTES : FREE_MAX_UPLOAD_BYTES;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > maxSingleFileBytes) {
      return NextResponse.json(
        {
          error: `File exceeds the ${formatBytes(maxSingleFileBytes)} single upload limit for ${isPro ? "Pro" : "Free"} accounts.`,
        },
        { status: 400 }
      );
    }

    // Check user's current storage usage
    const userFiles = await prisma.userFile.findMany({
      where: { userId: dbUser.id },
      select: { metadata: true, fileType: true },
    });

    let currentUsedBytes = 0;
    for (const f of userFiles) {
      const meta = (f.metadata as Record<string, any>) || {};
      if (typeof meta.sizeBytes === "number" && meta.sizeBytes > 0) {
        currentUsedBytes += meta.sizeBytes;
      } else {
        if (f.fileType === "image") currentUsedBytes += 120 * 1024;
        else if (f.fileType === "document") currentUsedBytes += 300 * 1024;
        else currentUsedBytes += 250 * 1024;
      }
    }

    if (currentUsedBytes + file.size > totalStorageBytes) {
      return NextResponse.json(
        {
          error: `Cloud Drive storage limit reached (${formatBytes(totalStorageBytes)}). Upgrade to Pro or free up space to continue uploading.`,
        },
        { status: 400 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    let uploadBuffer: Buffer = rawBuffer;
    let mimeType = file.type || "application/octet-stream";
    let finalFileName = file.name;
    let imageWidth: number | undefined;
    let imageHeight: number | undefined;

    // Smart compression for images (WebP optimization saves up to 80% space)
    if (file.type.startsWith("image/") && !file.type.includes("gif") && !file.type.includes("svg")) {
      try {
        const imageMetadata = await sharp(rawBuffer).metadata();
        imageWidth = imageMetadata.width;
        imageHeight = imageMetadata.height;

        // Auto-compress to WebP for massive storage savings
        uploadBuffer = await sharp(rawBuffer, { failOn: "none" })
          .rotate()
          .webp({ quality: 88, effort: 4 })
          .toBuffer();

        mimeType = "image/webp";
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        finalFileName = `${baseName}.webp`;
      } catch (sharpError) {
        console.warn("[Cloud Drive] Image optimization skipped, using raw buffer:", sharpError);
        uploadBuffer = rawBuffer;
      }
    }

    const storageFileName = `drive_${dbUser.id}_${Date.now()}_${finalFileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const publicUrl = await uploadProcessedFile(uploadBuffer, storageFileName, mimeType);

    const detectedFileType = inferResultFileType({
      mimeType,
      resultUrl: publicUrl,
      toolType: "cloud-drive",
    });

    const newFile = await prisma.userFile.create({
      data: {
        userId: dbUser.id,
        toolType: "cloud-drive",
        originalName: file.name,
        resultUrl: publicUrl,
        fileType: detectedFileType,
        status: "completed",
        metadata: {
          sizeBytes: uploadBuffer.length,
          originalSizeBytes: file.size,
          mimeType,
          width: imageWidth,
          height: imageHeight,
          uploadedToDrive: true,
          category: "upload",
        },
      },
    });

    return NextResponse.json({
      success: true,
      file: newFile,
      savedBytes: Math.max(0, file.size - uploadBuffer.length),
    });
  } catch (error) {
    console.error("[DRIVE_UPLOAD_POST]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file to Cloud Drive" },
      { status: 500 }
    );
  }
}
