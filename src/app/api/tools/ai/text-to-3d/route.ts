import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getOptionalApiUser, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import { Client } from "@gradio/client";

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

      // Call Hugging Face Serverless Inference API for fast Stable Diffusion XL generation
      const modelUrl = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (hfToken) {
        headers["Authorization"] = `Bearer ${hfToken}`;
      }

      const response = await fetch(modelUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          inputs: prompt,
          parameters: {
            negative_prompt: "blurry, low quality, dark background, complex scene, shadows, text, signature",
            num_inference_steps: 30,
            guidance_scale: 7.5
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("[Text-to-3D SDXL Error]:", errText);
        throw new Error("Hugging Face image model is currently busy. Please try again in a few seconds.");
      }

      const buffer = await response.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:image/png;base64,${base64Image}`;

      return NextResponse.json({ image: dataUrl });
    }

    // Action 2: Concept Art to GLB/OBJ 3D Mesh
    if (action === "generate-3d") {
      const { imageUrl, removeBg = true, foregroundRatio = 0.85, resolution = 256 } = body;
      if (!imageUrl || typeof imageUrl !== "string") {
        return NextResponse.json({ error: "Missing concept art image url/data." }, { status: 400 });
      }

      console.log(`[Text-to-3D] Reconstructing 3D mesh (BG Removal: ${removeBg}, Marching Cubes: ${resolution})`);

      const connectOptions = hfToken ? { token: hfToken as `hf_${string}` } : {};

      // 1. Connect to stabilityai/TripoSR space
      const app = await Client.connect("stabilityai/TripoSR", connectOptions);

      // 2. Call `/preprocess` to crop and strip backgrounds
      console.log("[Text-to-3D] Running TripoSR Preprocess...");
      const preprocessed: any = await app.predict("/preprocess", [
        imageUrl,
        removeBg,
        parseFloat(foregroundRatio) || 0.85
      ]);

      const preprocessedImage = preprocessed?.data?.[0];
      if (!preprocessedImage) {
        throw new Error("Failed to preprocess the concept art image.");
      }

      // 3. Call `/generate` to create 3D assets
      console.log("[Text-to-3D] Executing 3D Mesh Generation...");
      const result: any = await app.predict("/generate", [
        preprocessedImage,
        parseInt(resolution) || 256
      ]);

      const resultList = result?.data;
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
