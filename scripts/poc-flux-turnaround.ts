import fs from "fs";
import path from "path";
import sharp from "sharp";

const PROMPTS = [
  "Aesthetic oversized purple hoodie boy with silver curtain bangs and high-top sneakers",
  "Cozy cottagecore frog girl with pastel green overalls and blonde braided bangs",
  "Cyberpunk ninja assassin with glowing cyan visor and matte black techwear",
  "Heroic medieval knight in polished plate armor with crimson cape",
  "Demon warrior with obsidian horns, glowing crimson eyes and dark flame samurai armor",
];

async function generateTurnaroundConcept(prompt: string, index: number, outputDir: string) {
  const structuredPrompt = `Pixel art Minecraft character turnaround sheet, orthographic front view on left, orthographic back view on right, solid pure white background, flat voxel lighting, 16-bit aesthetic, crisp blocky proportions: ${prompt}`;
  const seed = 1000 + index;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(structuredPrompt)}?width=1024&height=512&seed=${seed}&model=flux&nologo=true`;

  console.log(`[Concept ${index + 1}/${PROMPTS.length}] Requesting: "${prompt.slice(0, 40)}..."`);
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "image/png,image/jpeg,image/webp",
      },
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const elapsed = Date.now() - startTime;
    console.log(`  -> Downloaded in ${elapsed}ms (${buffer.length} bytes)`);

    const filename = `concept_${index + 1}.png`;
    const outPath = path.join(outputDir, filename);
    await sharp(buffer).toFile(outPath);

    // Analyze image structure
    const metadata = await sharp(buffer).metadata();
    console.log(`  -> Saved to ${filename} (${metadata.width}x${metadata.height})`);

    // Slicing feasibility check: check if left half (front) and right half (back) contain valid character silhouettes on white bg
    const { data, info } = await sharp(buffer)
      .resize(128, 64, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .raw()
      .toBuffer({ resolveWithObject: true });

    let leftNonWhite = 0;
    let rightNonWhite = 0;
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 128; x++) {
        const off = (y * 128 + x) * info.channels;
        const r = data[off];
        const g = data[off + 1];
        const b = data[off + 2];
        const isWhite = r > 240 && g > 240 && b > 240;
        if (!isWhite) {
          if (x < 64) leftNonWhite++;
          else rightNonWhite++;
        }
      }
    }

    console.log(`  -> Left Half (Front) Silhouette Pixels: ${leftNonWhite}, Right Half (Back) Silhouette Pixels: ${rightNonWhite}`);
    return { success: true, filename, elapsed, leftNonWhite, rightNonWhite };
  } catch (err: any) {
    console.error(`  -> Failed:`, err.message);
    return { success: false, error: err.message };
  }
}

async function run() {
  const outputDir = path.join(process.cwd(), "test-flux-concepts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("=== Testing Free Generative Proof-of-Concept for Turnaround Alignment ===\n");
  const results = [];
  for (let i = 0; i < PROMPTS.length; i++) {
    const res = await generateTurnaroundConcept(PROMPTS[i], i, outputDir);
    results.push(res);
  }

  console.log("\n=== Summary of Proof-of-Concept Results ===");
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
