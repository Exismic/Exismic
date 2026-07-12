import { NextRequest } from "next/server";
import { withToolHandler } from "@/lib/tools-handler";
import sharp from "sharp";
import { writeFile } from "fs/promises";
import path from "path";

const STORAGE_PATH = path.join(process.cwd(), "public", "results");

export async function POST(req: NextRequest) {
  // Extract action from URL or search params if needed, 
  // but for simplicity in this generic processor:
  const url = new URL(req.url);
  const toolId = url.pathname.split('/').pop() || "compressor";

  return withToolHandler(req, {
    toolId: `img-${toolId}`,
    allowedTypes: ["image/png", "image/jpeg", "image/webp", "image/avif"],
    maxSize: 20 * 1024 * 1024, // 20MB
    creditCost: 2,
    accessMode: "free-quality",
  }, async (buffer, jobId, formData, context) => {
    
    let pipeline = sharp(buffer);
    let extension = "png";

    // Dynamic processing based on Tool ID
    switch (toolId) {
      case "compressor":
        pipeline = pipeline
          .resize({ width: context.outputTier === "standard" ? 1600 : undefined, withoutEnlargement: true })
          .jpeg({ quality: context.outputTier === "standard" ? 68 : 92, progressive: true });
        extension = "jpg";
        break;
      case "resizer":
        // Default resize to 1080p if no params
        pipeline = pipeline.resize(
          context.outputTier === "standard" ? 1600 : 3840,
          context.outputTier === "standard" ? 1600 : 3840,
          { fit: 'inside', withoutEnlargement: true },
        );
        break;
      case "converter":
        pipeline = pipeline
          .resize({ width: context.outputTier === "standard" ? 1600 : undefined, withoutEnlargement: true })
          .webp({ quality: context.outputTier === "standard" ? 76 : 94 });
        extension = "webp";
        break;
      default:
        pipeline = pipeline.png();
    }

    const outputBuffer = await pipeline.toBuffer();
    const fileName = `result_${jobId}.${extension}`;
    const fullPath = path.join(STORAGE_PATH, fileName);
    
    await writeFile(fullPath, outputBuffer);

    return {
      resultUrl: `/results/${fileName}`
    };
  });
}
