import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getOptionalApiUser, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import { Client } from "@gradio/client";
import axios from "axios";

/**
 * Text-to-3D Model Generator API Route
 * Action 1: generate-image (Text to 2D Concept Art)
 * Action 2: generate-3d (Concept Art to textured GLB/OBJ 3D Mesh)
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getOptionalApiUser();
    const limit = checkRateLimit(`text-to-3d:${authUser?.id || "guest"}:${getRequestIp(req)}`, authUser ? 30 : 10, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || "";

    // Action 1: Text to 2D Concept Art
    if (action === "generate-image") {
      const { prompt } = body;
      if (!prompt || typeof prompt !== "string") {
        return NextResponse.json({ error: "Please enter a model description." }, { status: 400 });
      }

      console.log(`[Text-to-3D] Generating 2D Concept Art for: "${prompt}"`);

      // 1. Connect to ap123/SDXL-Lightning space via Gradio Client
      const connectOptions = hfToken ? { token: hfToken as `hf_${string}` } : {};
      const app = await Client.connect("ap123/SDXL-Lightning", connectOptions);

      console.log("[Text-to-3D] Querying SDXL-Lightning Space...");
      const result: any = await app.predict("/generate_image", [
        prompt,
        "4-Step" // Inference steps: 1-Step, 2-Step, 4-Step, 8-Step
      ]);

      const conceptImageUrl = result?.data?.[0]?.url;
      if (!conceptImageUrl) {
        throw new Error("Failed to generate concept art from SDXL-Lightning.");
      }

      // 2. Fetch the generated image and convert it to base64
      console.log("[Text-to-3D] Fetching generated concept image...");
      const imageRes = await axios.get(conceptImageUrl, { responseType: "arraybuffer" });
      const base64Image = Buffer.from(imageRes.data).toString("base64");
      const dataUrl = `data:image/png;base64,${base64Image}`;

      return NextResponse.json({ image: dataUrl });
    }

    // Action 2: Concept Art to GLB/OBJ 3D Mesh
    if (action === "generate-3d") {
      const { imageUrl, removeBg = true, foregroundRatio = 0.85, resolution = 256 } = body;
      if (!imageUrl || typeof imageUrl !== "string") {
        return NextResponse.json({ error: "Missing concept art image url/data." }, { status: 400 });
      }

      console.log(`[Text-to-3D] Reconstructing 3D mesh via InstantMesh (BG Removal: ${removeBg})`);

      // 1. Convert base64 imageUrl to Node Blob on the server to prevent fetch limitations
      const base64Data = imageUrl.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const blob = new Blob([buffer], { type: "image/png" });

      const connectOptions = hfToken ? { token: hfToken as `hf_${string}` } : {};

      // 2. Connect to TencentARC/InstantMesh space
      const app = await Client.connect("TencentARC/InstantMesh", connectOptions);

      const rootUrl = app.config?.root || "";

      // 3. Upload the Blob file to the Gradio space hosting server first
      console.log("[Text-to-3D] Uploading Blob to Gradio server...");
      const uploadRes = await app.upload_files(rootUrl, [blob]);
      if (!uploadRes.files || uploadRes.files.length === 0) {
        throw new Error("Failed to upload concept art to 3D server.");
      }

      const uploadedFilePath = uploadRes.files[0];
      const filePayload = {
        path: uploadedFilePath,
        url: `${rootUrl}/file=${uploadedFilePath}`,
        orig_name: "concept.png",
        meta: { _type: "gradio.FileData" }
      };

      // Step 3.1: Preprocess (Isolate background)
      console.log("[Text-to-3D] Step 1: Preprocessing...");
      const preprocessRes: any = await app.predict("/preprocess", [
        filePayload,
        !!removeBg
      ]);
      const preprocessedImage = preprocessRes?.data?.[0];
      if (!preprocessedImage) {
        throw new Error("Failed to isolate the object background.");
      }

      // Step 3.2: Generate Multiview Images (inputs: [6, 11, 10])
      console.log("[Text-to-3D] Step 2: Generating Multiview Images (generate_mvs)...");
      const mvsRes: any = await app.predict("/generate_mvs", [
        preprocessedImage,
        50, // Sample Steps (Slider 30-75)
        42  // Seed Value (Number)
      ]);
      const mvsData = mvsRes?.data?.[0];
      if (!mvsData) {
        throw new Error("Failed to generate multiview shapes.");
      }

      // Step 3.3: Make 3D Model (inputs: [32])
      console.log("[Text-to-3D] Step 3: Reconstructing 3D mesh (make3d)...");
      const make3dRes: any = await app.predict("/make3d", [
        mvsData
      ]);

      const resultList = make3dRes?.data;
      if (!resultList || resultList.length < 2) {
        throw new Error("3D model generator did not return valid mesh links.");
      }

      const objMesh = resultList[0];
      const glbMesh = resultList[1];

      return NextResponse.json({
        objUrl: objMesh.url,
        glbUrl: glbMesh.url
      });
    }

    return NextResponse.json({ error: "Invalid action request." }, { status: 400 });

  } catch (error: any) {
    console.error("[Text-to-3D Route Error]:", error);
    
    let message = error?.message || "Failed to generate 3D model asset. GPU workers might be overloaded.";
    if (message.includes("ZeroGPU quota")) {
      message = "You have exceeded the free anonymous GPU quota for today. To fix this, please configure a free Hugging Face token ('HF_TOKEN') in your environment settings.";
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
