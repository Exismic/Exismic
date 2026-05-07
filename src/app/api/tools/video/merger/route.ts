import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 5 minutes

export async function POST(req: NextRequest) {
  try {
    // Reverting to FormData for better memory efficiency with large video files
    // The 'Unterminated string' issue was caused by JSON size limits
    const formData = await req.formData();
    const clips = formData.getAll("clips") as File[];
    
    if (!clips || clips.length < 2) {
      return NextResponse.json({ error: "At least two videos are required to merge" }, { status: 400 });
    }

    const MODAL_URL = process.env.MODAL_VIDEO_MERGER_URL || "https://syedrayangames--lumora-video-tools-merge-videos.modal.run";

    // Convert to base64 for Modal
    const fileNames: string[] = [];
    const fileDataList: string[] = [];

    for (const clip of clips) {
      fileNames.push(clip.name);
      const buffer = Buffer.from(await clip.arrayBuffer());
      fileDataList.push(buffer.toString("base64"));
    }

    const response = await fetch(MODAL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_names: fileNames,
        file_data_list: fileDataList,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText || "Merge failed" }, { status: 500 });
    }

    const result = await response.json();
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Merge failed" }, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("[VideoMerger] API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Merge failed. The project might be too large for the current server configuration." 
    }, { status: 500 });
  }
}
