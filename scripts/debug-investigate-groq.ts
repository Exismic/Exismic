import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { prisma } from "../src/lib/prisma";
import { DEFAULT_GROQ_TEXT_MODEL } from "../src/lib/ai-models";

async function main() {
  const latest = await prisma.userFile.findFirst({
    where: { toolType: "minecraft-skin-maker" },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    console.log("No user file found");
    return;
  }

  const prompt = latest.originalUrl;
  console.log("=== LATEST USER PROMPT ===");
  console.log(prompt);
  console.log("\n=== STORED METADATA DESIGN ===");
  console.log(JSON.stringify(latest.metadata, null, 2));

  // Now test Groq API directly with this exact prompt
  const apiKey = process.env.GROQ_API_KEY;
  console.log("\n=== TESTING GROQ WITH LATEST PROMPT ===");
  console.log("API Key present:", Boolean(apiKey), apiKey?.slice(0, 10));

  const instruction = [
    `Create a coherent Minecraft skin design specification for: "${prompt}".`,
    `Visual treatment: balanced.`,
    "Treat the written prompt as primary. Use the reference for useful color, silhouette, and material cues.",
    "Explicit prompt instructions override conflicting reference details, but unspecified reference traits must remain intact.",
    "Never replace a hoodie, jacket, robe, mask, visor, gloves, or emblem with a tie or unrelated generic clothing.",
    "Design the complete character.",
    "Return only JSON with this exact structure:",
    JSON.stringify({
      name: "short character name",
      description: "one sentence visual summary",
      hairStyle: "short | long | spiky | hood | helmet | bald",
      garmentType: "hoodie | jacket | sweater | shirt | coat | armor | tunic | robe",
      hoodState: "none | down | up",
      fit: "oversized | fitted | loose",
      bangsStyle: "curtain | fringe | side-swept | straight | parted | none",
      outfit: "casual | armor | royal | cyber | fantasy | formal | sport",
      expression: "neutral | friendly | serious",
      eyeShape: "normal | angry | soft",
      eyeStyle: "anime | classic | glowing | minimal | visor",
      mouthStyle: "smile | neutral | smirk | open | none",
      facialHair: "none | stubble | short-beard | goatee",
      faceStyle: "open | mask | visor",
      sleeves: "short | long | armored",
      gloves: true,
      footwear: "shoes | boots | armored",
      footwearStyle: "sneakers | high-tops | boots | combat-boots | armored | shoes",
      drawstrings: "none | thin | tied",
      pattern: "clean | striped | paneled | armored | mystic | lightning | circuit",
      emblem: "zero to three visible letters, blank when absent",
      traits: ["four to eight short visual traits actually observed or requested"],
      headphones: false,
      cables: false,
      horns: false,
      crown: false,
      halo: false,
      glasses: false,
      palette: {
        skin: "#RRGGBB",
        skinShade: "#RRGGBB",
        hair: "#RRGGBB",
        hairHighlight: "#RRGGBB",
        eyes: "#RRGGBB",
        top: "#RRGGBB",
        topAccent: "#RRGGBB",
        pants: "#RRGGBB",
        shoes: "#RRGGBB",
        detail: "#RRGGBB",
      },
    }),
  ].join("\n");

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_GROQ_TEXT_MODEL,
        temperature: 0.48,
        max_tokens: 1250,
        messages: [
          {
            role: "system",
            content:
              "You are Exismic's Minecraft skin reconstruction director. Convert traits into exact structured fields. You must return ONLY a raw JSON object with no explanation, no markdown formatting.",
          },
          { role: "user", content: instruction },
        ],
      }),
    });

    console.log("Groq raw status:", res.status);
    const body = await res.json();
    console.log("\n=== RAW GROQ RESPONSE ===");
    console.log(body?.choices?.[0]?.message?.content);
  } catch (err) {
    console.error("Groq call failed:", err);
  }
}

main().catch(console.error);
