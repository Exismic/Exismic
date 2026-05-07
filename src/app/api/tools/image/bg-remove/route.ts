import { NextRequest } from "next/server";
import { withToolHandler } from "@/lib/tools-handler";
import axios from "axios";
import { writeFile } from "fs/promises";
import path from "path";

// Practical local storage for results (Phase 2)
const STORAGE_PATH = path.join(process.cwd(), "public", "results");

export async function POST(req: NextRequest) {
  return withToolHandler(req, {
    toolId: "bg-remove",
    allowedTypes: ["image/png", "image/jpeg", "image/webp"],
    maxSize: 10 * 1024 * 1024, // 10MB
    creditCost: 1
  }, async (buffer, jobId) => {
    
    // 1. Call Python FastAPI Service
    const formData = new FormData();
    const blob = new Blob([buffer]);
    formData.append("file", blob, "input.png");

    const response = await axios.post("http://localhost:8000/image/remove-bg", formData, {
      responseType: 'arraybuffer'
    });

    // 2. Save Result Locally (Mocking Cloudinary for Phase 2)
    const fileName = `result_${jobId}.png`;
    const fullPath = path.join(STORAGE_PATH, fileName);
    
    await writeFile(fullPath, Buffer.from(response.data));

    // 3. Return relative URL for frontend
    return {
      resultUrl: `/results/${fileName}`
    };
  });
}
