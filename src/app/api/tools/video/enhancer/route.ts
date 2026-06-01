import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File;
    const level = formData.get("level") as string;
    const features = formData.get("features") as string;

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    let priority = false;

    if (sbUser) {
      const dbUser = await prisma.user.findUnique({
        where: { id: sbUser.id },
        select: { plan: true, subscriptionStatus: true },
      });
      priority = dbUser?.plan === "pro" || dbUser?.subscriptionStatus === "active";
    }

    const queue = priority ? "priority" : "normal";
    const MODAL_URL = priority
      ? process.env.MODAL_VIDEO_ENHANCER_PRIORITY_URL || process.env.MODAL_VIDEO_PRIORITY_URL || process.env.MODAL_VIDEO_ENHANCER_URL || "https://syedrayangames--lumora-video-tools-enhance-video.modal.run"
      : process.env.MODAL_VIDEO_ENHANCER_NORMAL_URL || process.env.MODAL_VIDEO_ENHANCER_URL || "https://syedrayangames--lumora-video-tools-enhance-video.modal.run";

    console.log(`[VideoEnhancer] Processing: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`[VideoEnhancer] Queue: ${queue}`);
    console.log(`[VideoEnhancer] Modal URL: ${MODAL_URL}`);

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const response = await fetch(MODAL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_name: file.name,
        file_data_base64: base64Data,
        level: level,
        features: features,
        priority,
        queue,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[VideoEnhancer] Modal processing failed:", errorText);
      
      let errorMessage = "Cloud processing failed";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch (e) {}
      
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const result = await response.json();
    if (!result.success) {
      console.error("[VideoEnhancer] Modal returned success=false:", result.error);
      return NextResponse.json({ error: result.error || "Enhancement failed" }, { status: 500 });
    }

    const resultBuffer = Buffer.from(result.file_data_base64.split(",")[1], "base64");

    return new Response(resultBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${result.file_name}"`,
        "Content-Length": resultBuffer.length.toString(),
        "X-Lumora-Priority": priority ? "true" : "false",
        "X-Lumora-Queue": queue,
      },
    });

  } catch (error: any) {
    console.error("[VideoEnhancer] API Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" }, 
      { status: 500 }
    );
  }
}
