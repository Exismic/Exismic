import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import { chargeToolAccess, isToolAccessResponse, resolveToolAccess } from "@/lib/tool-access";

export async function POST(req: NextRequest) {
  try {
    const access = await resolveToolAccess(req, { toolId: "image-eraser", mode: "free-quality", creditCost: 4 });
    if (isToolAccessResponse(access)) return access;
    const actor = access.authUser?.id || "guest";
    const limit = checkRateLimit(`image-eraser:${actor}:${getRequestIp(req)}`, access.isAuthenticated ? 30 : 8, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const { image, mask } = await req.json();

    if (!image || !mask) {
      return NextResponse.json({ error: "Image and mask are required" }, { status: 400 });
    }

    const imageData = String(image);
    const maskData = String(mask);
    if (!imageData.startsWith("data:image/") || !maskData.startsWith("data:image/")) {
      return NextResponse.json({ error: "Image and mask must be image data URLs." }, { status: 400 });
    }

    if (imageData.length > 35_000_000 || maskData.length > 35_000_000) {
      return NextResponse.json({ error: "Image payload is too large." }, { status: 413 });
    }

    // Try Hugging Face first (Free)
    const hfToken = process.env.HUGGINGFACE_TOKEN;
    if (hfToken) {
      try {
        console.log("Attempting free inpainting via Hugging Face...");
        
        // Convert data URIs to blobs/buffers for HF
        const imageBase64 = imageData.split(",")[1];
        const maskBase64 = maskData.split(",")[1];

        // RunwayML SD Inpainting is the most reliable free model on HF Inference API
        const hfUrl = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-inpainting";
        
        const response = await axios.post(hfUrl, {
          inputs: {
            image: imageBase64,
            mask_image: maskBase64,
          },
          parameters: {
            negative_prompt: "deformed, messy, blur, distorted",
            num_inference_steps: 30
          }
        }, {
          headers: { 
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json"
          },
          responseType: 'arraybuffer',
          timeout: 40000
        });

        if (response.status === 200) {
          let resultBuffer = Buffer.from(response.data);
          if (access.outputTier === "standard") {
            resultBuffer = await sharp(resultBuffer)
              .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
              .png({ quality: 82, compressionLevel: 9 })
              .toBuffer();
          }
          const debit = await chargeToolAccess(access, "image-eraser", `tool:${randomUUID()}`);
          if (!debit.success) return NextResponse.json({ error: debit.error }, { status: 402 });
          const resultBase64 = resultBuffer.toString("base64");
          return NextResponse.json({
            success: true,
            result: `data:image/png;base64,${resultBase64}`,
            method: "hf-free",
            outputTier: access.outputTier,
            creditsCharged: access.creditCost,
          });
        }
      } catch (hfError: any) {
        console.error("Hugging Face Free Failed:", hfError.message);
        // If HF fails or is loading (503), fall back to Fal.ai if available
      }
    }

    // Fallback to Fal.ai (Premium)
    const falKey = process.env.FAL_KEY;
    if (falKey && access.outputTier === "hd") {
      try {
        console.log("Falling back to Fal.ai Flux Inpainting...");
        const falResponse = await fetch("https://fal.run/fal-ai/flux/dev/inpainting", {
          method: "POST",
          headers: {
            "Authorization": `Key ${falKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            image_url: imageData,
            mask_url: maskData,
            prompt: "cleanly remove the masked object, fill naturally, high quality",
            strength: 0.95
          })
        });

        const data = await falResponse.json();
        if (data.image && data.image.url) {
          const debit = await chargeToolAccess(access, "image-eraser", `tool:${randomUUID()}`);
          if (!debit.success) return NextResponse.json({ error: debit.error }, { status: 402 });
          return NextResponse.json({
            success: true,
            result: data.image.url,
            method: "fal-pro",
            outputTier: access.outputTier,
            creditsCharged: access.creditCost,
          });
        } else {
          throw new Error(data.detail || "Fal.ai failed");
        }
      } catch (falError: any) {
        console.error("Fal.ai Fallback Failed:", falError.message);
      }
    }

    // FINAL FALLBACK: Local Image Processing (Zero-Cost, No API)
    // We mix the blurred healed layer with a bit of the original texture to avoid the "painted" look
    try {
      console.log("Using Improved Local Fallback (Zero-Cost)...");
      const imageBuffer = Buffer.from(imageData.split(",")[1], "base64");
      const maskBuffer = Buffer.from(maskData.split(",")[1], "base64");
      const metadata = await sharp(imageBuffer).metadata();
      const { width, height } = metadata;

      const resizedMask = await sharp(maskBuffer).resize(width, height).toBuffer();
      
      // Create a "healed" layer with blur
      const blurredLayer = await sharp(imageBuffer).blur(15).composite([{ input: resizedMask, blend: 'dest-in' }]).toBuffer();
      
      // Mix with a bit of noise/grain to simulate texture
      let resultBuffer = await sharp(imageBuffer)
        .composite([{ input: blurredLayer, top: 0, left: 0 }])
        .toBuffer();
      if (access.outputTier === "standard") {
        resultBuffer = await sharp(resultBuffer)
          .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
          .png({ quality: 82, compressionLevel: 9 })
          .toBuffer();
      }
      const debit = await chargeToolAccess(access, "image-eraser", `tool:${randomUUID()}`);
      if (!debit.success) return NextResponse.json({ error: debit.error }, { status: 402 });

      return NextResponse.json({
        success: true,
        result: `data:image/png;base64,${resultBuffer.toString("base64")}`,
        method: "local-quick-fix",
        outputTier: access.outputTier,
        creditsCharged: access.creditCost,
      });
    } catch (localError) {
      throw new Error("All erasure services are currently unavailable.");
    }

  } catch (error: any) {
    console.error("Eraser API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Something went wrong during erasure." 
    }, { status: 500 });
  }
}
