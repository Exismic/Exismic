import { NextRequest } from "next/server";
import { withToolHandler } from "@/lib/tools-handler";
import axios from "axios";
import { writeFile } from "fs/promises";
import path from "path";
import { getEngineRoute } from "@/config/engine";

// Practical local storage for results (Phase 2)
const STORAGE_PATH = path.join(process.cwd(), "public", "results");

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(req: NextRequest) {
  return withToolHandler(req, {
    toolId: "bg-remove",
    allowedTypes: ["image/png", "image/jpeg", "image/webp"],
    maxSize: 10 * 1024 * 1024, // 10MB
    creditCost: 1
  }, async (buffer, jobId, _formData, context) => {
    // 1. Try Modal.com image engine (production serverless)
    const modalImageUrl = context.priority
      ? process.env.MODAL_IMAGE_PRIORITY_URL || process.env.MODAL_IMAGE_URL
      : process.env.MODAL_IMAGE_NORMAL_URL || process.env.MODAL_IMAGE_URL;
    const modalImageApiKey = context.priority
      ? process.env.MODAL_IMAGE_PRIORITY_API_KEY || process.env.MODAL_IMAGE_API_KEY
      : process.env.MODAL_IMAGE_NORMAL_API_KEY || process.env.MODAL_IMAGE_API_KEY;
    if (modalImageUrl && modalImageApiKey) {
      try {
        console.log(`[BG Remove] Attempting Modal image engine via ${context.queue} queue...`);
        const modalForm = new FormData();
        const blob = new Blob([new Uint8Array(buffer)]);
        modalForm.append("file", blob, "input.png");
        modalForm.append("priority", String(context.priority));
        modalForm.append("queue", context.queue);

        const modalResponse = await axios.post(`${modalImageUrl.replace(/\/$/, "")}/remove-bg`, modalForm, {
          headers: { "X-Api-Key": modalImageApiKey },
          responseType: "arraybuffer",
          timeout: context.priority ? 25000 : 45000
        });

        const fileName = `result_modal_${context.queue}_${jobId}.png`;
        const fullPath = path.join(STORAGE_PATH, fileName);
        await writeFile(fullPath, Buffer.from(modalResponse.data));
        return {
          resultUrl: `/results/${fileName}`,
          metadata: {
            provider: "modal-bg-remover",
            priority: context.priority,
            queue: context.queue,
          },
        };
      } catch (modalError: unknown) {
        console.error("Modal BG Removal Failed:", getErrorMessage(modalError));
      }
    }
    
    // 1. Try remove.bg (Highest Quality & Lightning Fast)
    const removeBgKey = process.env.REMOVE_BG_API_KEY;
    if (removeBgKey) {
      try {
        console.log("Attempting background removal via remove.bg...");
        const removeBgForm = new FormData();
        const blob = new Blob([new Uint8Array(buffer)]);
        removeBgForm.append("image_file", blob, "input.png");
        removeBgForm.append("size", "auto");

        const removeBgResponse = await axios.post("https://api.remove.bg/v1.0/removebg", removeBgForm, {
          headers: { "X-Api-Key": removeBgKey },
          responseType: "arraybuffer",
          timeout: 15000
        });

        const fileName = `result_removebg_${jobId}.png`;
        const fullPath = path.join(STORAGE_PATH, fileName);
        await writeFile(fullPath, Buffer.from(removeBgResponse.data));
        return { resultUrl: `/results/${fileName}` };
      } catch (removeBgError: unknown) {
        console.error("remove.bg Removal Failed:", getErrorMessage(removeBgError));
      }
    }

    // 2. Try Fal.ai (Premium & Very Fast)
    const falKey = process.env.FAL_KEY;
    if (falKey) {
      try {
        console.log("Attempting background removal via Fal.ai...");
        // Convert buffer to base64 for Fal.ai
        const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;
        const falResponse = await fetch("https://fal.run/fal-ai/bria/background-removal", {
          method: "POST",
          headers: {
            "Authorization": `Key ${falKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ image_url: base64Image })
        });

        const data = await falResponse.json();
        if (data.image && data.image.url) {
           return { resultUrl: data.image.url };
        }
      } catch (falError: unknown) {
        console.error("Fal.ai BG Removal Failed:", getErrorMessage(falError));
      }
    }

    // 3. Try Local Python FastAPI Service (If available)
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(buffer)]);
      formData.append("file", blob, "input.png");

      const response = await axios.post(getEngineRoute("/image/remove-bg"), formData, {
        responseType: 'arraybuffer',
        timeout: 5000 // Short timeout for local service
      });

      const fileName = `result_${jobId}.png`;
      const fullPath = path.join(STORAGE_PATH, fileName);
      await writeFile(fullPath, Buffer.from(response.data));
      return { resultUrl: `/results/${fileName}` };
    } catch {
      console.log("Local BG removal failed, trying cloud APIs...");
    }

    // 4. Try Hugging Face (Free, but slow cold starts)
    const hfToken = process.env.HUGGINGFACE_TOKEN;
    if (hfToken) {
      try {
        console.log("Attempting background removal via Hugging Face...");
        const hfUrl = "https://api-inference.huggingface.co/models/briaai/RMBG-1.4";
        const hfResponse = await axios.post(hfUrl, buffer, {
          headers: { Authorization: `Bearer ${hfToken}` },
          responseType: 'arraybuffer',
          timeout: 30000
        });

        const fileName = `result_hf_${jobId}.png`;
        const fullPath = path.join(STORAGE_PATH, fileName);
        await writeFile(fullPath, Buffer.from(hfResponse.data));
        return { resultUrl: `/results/${fileName}` };
      } catch (hfError: unknown) {
        console.error("Hugging Face BG Removal Failed:", getErrorMessage(hfError));
      }
    }

    throw new Error("No background removal service is currently available.");
  });
}
