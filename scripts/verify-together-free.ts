import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import fs from "fs";

// Load .env.local first, then .env
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

async function verifyTogetherFree() {
  const togetherKey = process.env.TOGETHER_API_KEY;
  console.log("Together API Key present?", Boolean(togetherKey));
  if (togetherKey) {
    console.log("Key length:", togetherKey.length, "Prefix:", togetherKey.slice(0, 7) + "...");
  } else {
    console.log("No TOGETHER_API_KEY found in environment files.");
    return;
  }

  // 1. Check account / models / subscription endpoint if available
  try {
    console.log("\n--- Checking Together.ai Account Status ---");
    // Standard Together.ai endpoint to test auth
    const authTest = await axios.get("https://api.together.xyz/v1/models", {
      headers: {
        Authorization: `Bearer ${togetherKey}`,
      },
      timeout: 10000,
    });
    console.log("Auth valid! Total models accessible:", authTest.data?.length || "unknown");
    const hasFluxFree = authTest.data?.some?.((m: any) => m.id?.includes("FLUX.1-schnell-Free"));
    console.log("Model 'black-forest-labs/FLUX.1-schnell-Free' in model list?", hasFluxFree);
  } catch (err: any) {
    console.error("Together.ai Auth/Model check error:", err?.response?.status, err?.response?.data || err.message);
  }

  // 2. Test FLUX.1-schnell-Free generation with 1 single call
  console.log("\n--- Testing Single Call on 'black-forest-labs/FLUX.1-schnell-Free' ---");
  try {
    const startTime = Date.now();
    const testResponse = await axios.post(
      "https://api.together.xyz/v1/images/generations",
      {
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: "Pixel art Minecraft character turnaround sheet, orthographic front view, solid white background",
        width: 1024,
        height: 512,
        steps: 4,
        n: 1,
        response_format: "b64_json",
      },
      {
        headers: {
          Authorization: `Bearer ${togetherKey}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const elapsed = Date.now() - startTime;
    console.log(`Success! Response time: ${elapsed}ms`);
    const b64 = testResponse.data?.data?.[0]?.b64_json;
    console.log("Received base64 image length:", b64?.length || 0);

    // Check rate limit headers
    console.log("\n--- Rate Limit Headers ---");
    const headers = testResponse.headers;
    console.log("x-ratelimit-limit:", headers["x-ratelimit-limit"] || headers["ratelimit-limit"]);
    console.log("x-ratelimit-remaining:", headers["x-ratelimit-remaining"] || headers["ratelimit-remaining"]);
    console.log("x-ratelimit-reset:", headers["x-ratelimit-reset"] || headers["ratelimit-reset"]);
  } catch (err: any) {
    console.error("FLUX.1-schnell-Free call error:", err?.response?.status, err?.response?.data || err.message);
  }
}

verifyTogetherFree().catch(console.error);
