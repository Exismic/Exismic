import { NextRequest, NextResponse } from "next/server";
// Forced Launch Update - Production Fix
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { deductCredits, getCreditTotal } from "@/lib/credits";
import { getDailyCreditLimit, getToolCreditCost } from "@/lib/credit-policy";

const STORAGE_PATH = path.join(process.cwd(), "public", "generations");

function enhancePrompt(rawPrompt: string): { prompt: string; enhancedUsed: string } {
  let p = rawPrompt.trim();
  let lowercase = p.toLowerCase();
  
  // 1. Better Environment Understanding: For prompts containing "Minecraft Nether"
  if (lowercase.includes("minecraft nether") || (lowercase.includes("minecraft") && lowercase.includes("nether"))) {
    const isRealistic = lowercase.includes("realistic") || lowercase.includes("real life") || lowercase.includes("photo") || lowercase.includes("cinematic") || lowercase.includes("hyper");
    
    if (isRealistic || !lowercase.includes("block") || lowercase.includes("ferrari") || lowercase.includes("car") || lowercase.includes("buggati") || lowercase.includes("bugatti")) {
      p = `${p}, set in a highly detailed, cinematic hyper-realistic Minecraft Nether dimension featuring dramatic deep cavern space, massive glowing lava oceans with flowing volcanic cascades, towering structures of dark netherrack stone, crimson forests with giant glowing fungi trees, basalt deltas with volumetric ash particles, blue flame soul fires on soul sand, highly dramatic octane render style, photorealistic 8k detailing, cinematic atmosphere, dynamic overhead lighting.`;
    } else {
      p = `${p}, in the Nether dimension, crimson forest, netherrack cave architecture, flowing orange lava, soul sand valleys, dark red hellish atmosphere, glowing obsidian nether portals, iconic voxel-block aesthetic.`;
    }
  }

  // 2. Standard Photorealistic / Hyper-realistic Enhancer
  const nonRealisticStyles = ["anime", "cartoon", "illustration", "drawing", "painting", "vector", "sketch", "pixel art", "watercolor", "flat art", "2d", "minecraft block", "blocky"];
  const containsNonRealistic = nonRealisticStyles.some(s => lowercase.includes(s));
  
  if (!containsNonRealistic) {
    const enhancers = [
      "hyper-realistic", 
      "photorealistic 8k", 
      "ultra detailed textures", 
      "cinematic dramatic lighting", 
      "sharp focus", 
      "octane render"
    ];
    const missingEnhancers = enhancers.filter(e => !lowercase.includes(e.split(" ")[0]));
    if (missingEnhancers.length > 0) {
      p = `${p}, ${missingEnhancers.join(", ")}`;
    }
  }

  return {
    prompt: p,
    enhancedUsed: p
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (!sbUser || !sbUser.email) {
      return NextResponse.json({ error: "Please sign in to generate images" }, { status: 401 });
    }

    // 1. Get or create user in Prisma
    let user = await prisma.user.findUnique({
        where: { id: sbUser.id }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
            id: sbUser.id,
            email: sbUser.email!,
            name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0],
            plan: "free",
            dailyCredits: 50,
            aiGenerationsLimit: 5,
            nextResetDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        }
      })
    }

    // 2. Daily Reset Logic (IST Aligned)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(now.getTime() + istOffset);
    const nextResetDateIST = user.nextResetDate ? new Date(user.nextResetDate.getTime() + istOffset) : null;

    if (nextResetDateIST && nowIST > nextResetDateIST) {
      const isPro = user.plan === "pro";
      // Get next 00:00 IST
      const nextReset = new Date(nowIST);
      nextReset.setUTCHours(24, 0, 0, 0);
      const nextResetUTC = new Date(nextReset.getTime() - istOffset);

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          dailyCredits: getDailyCreditLimit(isPro ? "pro" : "free"),
          aiGenerationsUsed: 0,
          nextResetDate: nextResetUTC
        }
      });
    }

    const { prompt: rawPrompt, width = 1024, height = 1024, steps = 4, guidance = 3.5, n = 1 } = await req.json();

    if (!rawPrompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    const { prompt, enhancedUsed } = enhancePrompt(rawPrompt);

    // 3. Sync Credits from Prisma (Source of Truth)
    const totalCreditsAvailable = getCreditTotal(user);
    const userPlan = user.plan || "free";

    const costPerGen = getToolCreditCost("ai-img-gen", 18);
    const totalCost = costPerGen * n;

    if (totalCreditsAvailable < totalCost) {
      const upgradeMsg = userPlan === "free" 
        ? `You've reached your free daily limit. Pro users get ${getDailyCreditLimit("pro")} daily credits and priority generation. Upgrade when you need more creative capacity.`
        : "You've reached your Pro daily limit. Please wait for the daily reset or contact support for higher limits.";
      
      return NextResponse.json({ 
        error: upgradeMsg,
        needsUpgrade: userPlan === "free"
      }, { status: 403 });
    }

    let imageBuffer: Buffer | null = null;
    let method = "unknown";

    // 4. GENERATION STRATEGY: Super Fast Together.ai FLUX.1 Schnell
    const togetherKey = process.env.TOGETHER_API_KEY;
    const falKey = process.env.FAL_KEY;
    const isPro = userPlan === "pro";
    const priority = isPro || user.subscriptionStatus === "active";
    const queue = priority ? "priority" : "normal";
    const processingLabel = priority ? "Processing with Priority..." : "Processing...";
    const noWatermark = priority;
    const commercialLicense = priority;

    // --- STEP A: Try Together.ai (Ultra Fast Flux Schnell) ---
    if (togetherKey) {
      try {
        console.log(`[Image Gen] Attempting Together.ai Flux Schnell via ${queue} queue...`);
        const togetherResponse = await axios.post("https://api.together.xyz/v1/images/generations", {
          model: "black-forest-labs/FLUX.1-schnell-Free",
          prompt: prompt,
          width: width,
          height: height,
          steps: priority ? Math.min(Number(steps) || 6, 6) : 4,
          n: 1,
          response_format: "b64_json"
        }, {
          headers: {
            "Authorization": `Bearer ${togetherKey}`,
            "Content-Type": "application/json"
          },
          timeout: 12000
        });

        if (togetherResponse.data?.data?.[0]?.b64_json) {
          console.log("Together.ai Success!");
          imageBuffer = Buffer.from(togetherResponse.data.data[0].b64_json, "base64");
          method = "together-flux-schnell";
        }
      } catch (togetherError: any) {
        console.error("Together.ai Exception:", togetherError.message);
        
        // Retry with standard paid/premium model name if Free one is not available
        try {
          console.log("Retrying with paid Together.ai Flux Schnell...");
          const togetherResponse2 = await axios.post("https://api.together.xyz/v1/images/generations", {
            model: "black-forest-labs/FLUX.1-schnell",
            prompt: prompt,
            width: width,
            height: height,
            steps: priority ? Math.min(Number(steps) || 6, 6) : 4,
            n: 1,
            response_format: "b64_json"
          }, {
            headers: {
              "Authorization": `Bearer ${togetherKey}`,
              "Content-Type": "application/json"
            },
            timeout: 12000
          });

          if (togetherResponse2.data?.data?.[0]?.b64_json) {
            console.log("Together.ai Paid Success!");
            imageBuffer = Buffer.from(togetherResponse2.data.data[0].b64_json, "base64");
            method = "together-flux-schnell";
          }
        } catch (togetherError2: any) {
          console.error("Together.ai Paid Exception:", togetherError2.message);
        }
      }
    }

    // --- STEP B: Try Fal.ai (Premium) for PRO users or as high-priority ---
    if (!imageBuffer && falKey && (priority || Math.random() > 0.8)) {
      try {
        console.log("Attempting Premium Generation via Fal.ai...");
        const falResponse = await fetch("https://fal.run/fal-ai/flux/schnell", {
          method: "POST",
          headers: {
            "Authorization": `Key ${falKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: prompt,
            image_size: { width, height },
            num_inference_steps: priority ? Math.min(Number(steps) || 6, 6) : 4,
            sync_mode: true
          })
        });

        if (!falResponse.ok) {
          const errorData = await falResponse.text();
          console.error(`Fal.ai API Error (${falResponse.status}):`, errorData);
        } else {
          const data = await falResponse.json();
          if (data.images && data.images[0]?.url) {
            console.log("Fal.ai Success! Downloading image...");
            const imgResp = await axios.get(data.images[0].url, { 
              responseType: 'arraybuffer',
              timeout: 15000 
            });
            imageBuffer = Buffer.from(imgResp.data);
            method = "fal-pro-schnell";
          } else {
            console.warn("Fal.ai returned success but no image URL:", data);
          }
        }
      } catch (falError: any) {
        console.error("Fal.ai Exception:", falError.message);
      }
    }

    // --- STEP B: Try Pollinations AI (Free) if not already generated ---
    if (!imageBuffer) {
      try {
        console.log("Using Pollinations Flux Schnell (Free)...");
        const seed = Math.floor(Math.random() * 2147483647);
        const cloudUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=${noWatermark ? "true" : "false"}`;
        
        const response = await fetch(cloudUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
          },
          signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText || "Payment Required or Rate Limited"}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes('text/html')) {
          throw new Error("Pollinations returned an error page.");
        }

        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        method = "flux-schnell-pollinations";
        console.log("Pollinations Flux Schnell generation succeeded!");
      } catch (pollError: any) {
        console.warn("Pollinations Flux Failed or timed out, trying fast Pollinations Turbo...", pollError.message);
        try {
          const seed = Math.floor(Math.random() * 2147483647);
          const turboUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=turbo&nologo=${noWatermark ? "true" : "false"}`;
          
          const response = await fetch(turboUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
            },
            signal: AbortSignal.timeout(12000)
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText || "Error"}`);
          }

          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes('text/html')) {
            throw new Error("Pollinations Turbo returned an error page.");
          }

          const arrayBuffer = await response.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
          method = "turbo-pollinations";
          console.log("Pollinations Turbo generation succeeded!");
        } catch (turboError: any) {
          console.error("Pollinations Turbo also failed:", turboError.message);
        }
      }
    }

    // --- STEP C: Try Hugging Face (Free Fallback) ---
    if (!imageBuffer) {
      try {
        console.log("Falling back to Hugging Face...");
        const hfToken = process.env.HUGGINGFACE_TOKEN;
        if (hfToken) {
          const hfUrl = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";
          const response = await fetch(hfUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${hfToken}`,
              "Content-Type": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: { width, height }
            }),
            signal: AbortSignal.timeout(25000)
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
          method = "flux-schnell-hf-fallback";
          console.log("Hugging Face generation succeeded!");
        }
      } catch (hfError: any) {
        console.error("Hugging Face Failed:", hfError.message);
      }
    }

    // --- FINAL CHECK ---
    if (!imageBuffer) {
      throw new Error("All generation services are currently busy. This usually happens during high traffic. Please try a different prompt or wait a minute.");
    }

    // 5. Save Locally to Public Folder
    await mkdir(STORAGE_PATH, { recursive: true });
    const localFileName = `flux_${uuidv4()}.png`;
    const localFilePath = path.join(STORAGE_PATH, localFileName);
    await writeFile(localFilePath, imageBuffer);

    // 6. DB Record & Credit Deduction
    const resultUrl = `/generations/${localFileName}`;
    
    await prisma.userFile.create({
      data: {
        userId: sbUser.id,
        toolType: 'ai-img-gen',
        originalName: prompt.substring(0, 50),
        originalUrl: prompt,
        resultUrl,
        fileType: 'image',
        status: 'completed',
        metadata: { 
          width, height, steps, guidance, 
          model: 'flux-schnell',
          generationMethod: method,
          priority,
          queue,
          processingLabel,
          noWatermark,
          commercialLicense,
          timestamp: new Date().toISOString()
        }
      },
    });

    const debitResult = await deductCredits(sbUser.id, totalCost, "ai-img-gen");
    if (!debitResult.success) {
      console.error("[Image Gen] Credit deduction failed after generation:", debitResult.error);
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl: resultUrl,
      method,
      priority,
      queue,
      processingLabel,
      noWatermark,
      commercialLicense,
      creditsRemaining: debitResult.success && debitResult.data
        ? getCreditTotal(debitResult.data)
        : Math.max(0, totalCreditsAvailable - totalCost),
      enhancedPrompt: enhancedUsed
    });

  } catch (error: any) {
    console.error("Critical Generation Error:", error.message);
    return NextResponse.json({ 
      error: error.message || "Generation failed. Please try again." 
    }, { status: 500 });
  }
}
