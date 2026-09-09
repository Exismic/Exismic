import fs from "fs";
import path from "path";
import sharp from "sharp";

async function inspectCase1() {
  const file = path.join(process.cwd(), "renderer-expansion-output", "case_01_streetwear_exact_expanded_raw64.png");
  const { data } = await sharp(file).raw().toBuffer({ resolveWithObject: true });

  function getPixel(x: number, y: number) {
    const idx = (y * 64 + x) * 4;
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
      a: data[idx + 3],
      hex: "#" + [data[idx], data[idx + 1], data[idx + 2]].map(v => v.toString(16).padStart(2, "0")).join("")
    };
  }

  console.log("=== FRONT TORSO BASE PIXELS (y: 20..27, x: 20..27) ===");
  for (let y = 20; y <= 27; y++) {
    let rowStr = `y=${y}: `;
    for (let x = 20; x <= 27; x++) {
      const p = getPixel(x, y);
      rowStr += `[${x},${y}:${p.hex},a=${p.a}] `;
    }
    console.log(rowStr);
  }

  console.log("\n=== FRONT TORSO OVERLAY PIXELS (y: 36..43, x: 20..27) ===");
  for (let y = 36; y <= 43; y++) {
    let rowStr = `y=${y}: `;
    for (let x = 20; x <= 27; x++) {
      const p = getPixel(x, y);
      rowStr += `[${x},${y}:${p.hex},a=${p.a}] `;
    }
    console.log(rowStr);
  }

  console.log("\n=== RIGHT LEG OVERLAY LATERAL PIXELS (y: 36..45, x: 0..3) ===");
  for (let y = 36; y <= 45; y++) {
    let rowStr = `y=${y}: `;
    for (let x = 0; x <= 3; x++) {
      const p = getPixel(x, y);
      rowStr += `[${x},${y}:${p.hex},a=${p.a}] `;
    }
    console.log(rowStr);
  }

  console.log("\n=== HEAD OVERLAY FRONT PIXELS (y: 8..15, x: 40..47) ===");
  for (let y = 8; y <= 15; y++) {
    let rowStr = `y=${y}: `;
    for (let x = 40; x <= 47; x++) {
      const p = getPixel(x, y);
      rowStr += `[${x},${y}:${p.hex},a=${p.a}] `;
    }
    console.log(rowStr);
  }
}

inspectCase1();
