import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getOptionalApiUser, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import { Client } from "@gradio/client";

/**
 * Artistic AI QR Code Generator API Route
 * Queries Hugging Face space for free Stable Diffusion + ControlNet processing
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getOptionalApiUser();
    const limit = checkRateLimit(`qr-generator:${authUser?.id || "guest"}:${getRequestIp(req)}`, authUser ? 30 : 10, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const body = await req.json().catch(() => ({}));
    const { 
      url, 
      prompt, 
      negativePrompt = "ugly, disfigured, low quality, blurry, nsfw", 
      guidanceScale = 7.5,
      conditioningScale = 1.15,
      strength = 0.9,
      seed,
      sampler = "DPM++ Karras SDE"
    } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Please enter a valid link or text to encode." }, { status: 400 });
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Please enter a visual prompt style." }, { status: 400 });
    }

    const numericSeed = seed && !isNaN(parseInt(seed))
      ? parseInt(seed, 10)
      : Math.floor(Math.random() * 1000000000);

    // Retrieve free Hugging Face token if configured in .env
    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || "";
    const connectOptions = hfToken ? { token: hfToken as `hf_${string}` } : {};

    // 1. Connect to Hugging Face Gradio Space
    const app = await Client.connect("huggingface-projects/QR-code-AI-art-generator", connectOptions);

    // 2. Submit prediction parameters
    const prediction: any = await app.predict("/inference", {
      qr_code_content: url,
      prompt: prompt,
      negative_prompt: negativePrompt,
      guidance_scale: parseFloat(guidanceScale),
      controlnet_conditioning_scale: parseFloat(conditioningScale),
      strength: parseFloat(strength),
      seed: numericSeed,
      init_image: null,
      qrcode_image: null,
      use_qr_code_as_init_image: true,
      sampler: sampler
    });

    const resultList = prediction?.data;
    if (!resultList || resultList.length === 0 || !resultList[0]?.url) {
      throw new Error("Gradio Space did not return a valid result image.");
    }

    const tempImageUrl = resultList[0].url;

    // 3. Download the temporary file and convert to base64 to avoid expiration/CORS
    const imageRes = await fetch(tempImageUrl);
    if (!imageRes.ok) {
      throw new Error(`Failed to download generated QR image from mirror (Status ${imageRes.status})`);
    }

    const buffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({
      image: dataUrl,
      seed: numericSeed
    });

  } catch (error: any) {
    console.error("[QR Generator Route Error]:", error);
    return NextResponse.json({ 
      error: error?.message || "Failed to generate AI QR code. The queue might be full, please try again." 
    }, { status: 500 });
  }
}
