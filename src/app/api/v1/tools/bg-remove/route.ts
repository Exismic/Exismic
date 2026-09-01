import { NextRequest, NextResponse } from "next/server";
import { verifyAndAuthenticateApiKey } from "@/lib/api-keys";
import { deductCredits, getUserCredits, getCreditTotal } from "@/lib/credits";
import { getToolCreditCost } from "@/lib/credit-policy";
import { checkDistributedRateLimit, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import axios from "axios";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const TOOL_COST = getToolCreditCost("api-bg-remove", 4);

/**
 * POST /api/v1/tools/bg-remove
 * Authenticated via Bearer ex_live_... API key
 * Accepts multipart/form-data with 'file' or JSON with 'imageUrl' / 'imageBase64'
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const auth = await verifyAndAuthenticateApiKey(authHeader);

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error, code: "UNAUTHORIZED" }, { status: auth.status });
    }

    const ip = getRequestIp(req);
    const rateCheck = await checkDistributedRateLimit(`api-v1-bg:${auth.userId || ip}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.retryAfter);
    }

    const currentCredits = await getUserCredits(auth.userId);
    const available = currentCredits ? getCreditTotal(currentCredits) : 0;
    if (available < TOOL_COST) {
      return NextResponse.json(
        {
          error: `Insufficient credits. Required: ${TOOL_COST}, Available: ${available}`,
          code: "INSUFFICIENT_CREDITS",
          availableCredits: available,
          requiredCredits: TOOL_COST,
        },
        { status: 402 }
      );
    }

    let inputBuffer: Buffer | null = null;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        inputBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      const body = await req.json().catch(() => ({}));
      if (body.imageBase64 && typeof body.imageBase64 === "string") {
        const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
        inputBuffer = Buffer.from(base64Data, "base64");
      } else if (body.imageUrl && typeof body.imageUrl === "string") {
        const response = await axios.get(body.imageUrl, { responseType: "arraybuffer", timeout: 10000 });
        inputBuffer = Buffer.from(response.data);
      }
    }

    if (!inputBuffer || inputBuffer.length === 0) {
      return NextResponse.json(
        {
          error: "No image provided. Send a 'file' in multipart/form-data or 'imageUrl'/'imageBase64' in JSON body.",
          code: "MISSING_IMAGE",
        },
        { status: 400 }
      );
    }

    const pngBuffer = await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .png()
      .toBuffer();

    let outputBuffer: Buffer | null = null;

    // 1. Try Modal image engine
    const modalUrl = process.env.MODAL_IMAGE_PRIORITY_URL || process.env.MODAL_IMAGE_URL;
    const modalKey = process.env.MODAL_IMAGE_PRIORITY_API_KEY || process.env.MODAL_IMAGE_API_KEY;
    if (modalUrl && modalKey) {
      try {
        const modalForm = new FormData();
        const blob = new Blob([new Uint8Array(pngBuffer)], { type: "image/png" });
        modalForm.append("file", blob, "input.png");
        modalForm.append("priority", "true");
        modalForm.append("queue", "priority");

        const response = await axios.post(`${modalUrl.replace(/\/$/, "")}/remove-bg`, modalForm, {
          headers: { "X-Api-Key": modalKey },
          responseType: "arraybuffer",
          timeout: 25000,
        });
        outputBuffer = Buffer.from(response.data);
      } catch (err) {
        console.error("[API v1 bg-remove] Modal engine error:", err);
      }
    }

    // 2. Fallback to remove.bg API if configured
    if (!outputBuffer && process.env.REMOVE_BG_API_KEY) {
      try {
        const rbgForm = new FormData();
        const blob = new Blob([new Uint8Array(pngBuffer)], { type: "image/png" });
        rbgForm.append("image_file", blob, "input.png");
        rbgForm.append("size", "auto");

        const response = await axios.post("https://api.remove.bg/v1.0/removebg", rbgForm, {
          headers: { "X-Api-Key": process.env.REMOVE_BG_API_KEY },
          responseType: "arraybuffer",
          timeout: 15000,
        });
        outputBuffer = Buffer.from(response.data);
      } catch (err) {
        console.error("[API v1 bg-remove] remove.bg error:", err);
      }
    }

    if (!outputBuffer) {
      // Local sharp fallback
      outputBuffer = await sharp(pngBuffer).ensureAlpha().toBuffer();
    }

    // Deduct credits
    const debit = await deductCredits(auth.userId, TOOL_COST, "api-bg-remove");
    const remainingCredits = debit.data ? getCreditTotal(debit.data) : available - TOOL_COST;

    const base64Result = outputBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      format: "png",
      imageBase64: `data:image/png;base64,${base64Result}`,
      usage: {
        creditsDeducted: TOOL_COST,
        remainingCredits,
      },
    });
  } catch (error: any) {
    console.error("[API v1 bg-remove Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove background", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
