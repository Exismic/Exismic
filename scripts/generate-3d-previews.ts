import http from "http";
import fs from "fs";
import path from "path";

const PORT = 4892;
const ARTIFACT_DIR = "C:\\Users\\rayan\\.gemini\\antigravity-ide\\brain\\93179371-0d61-4d70-bf5a-4d720974da78\\renderer-expansion";
const LOCAL_DIR = path.join(process.cwd(), "renderer-expansion-output");

const BUNDLE_PATH = path.join(process.cwd(), "node_modules", "skinview3d", "bundles", "skinview3d.bundle.js");

const SKINS_TO_RENDER = [
  {
    id: "case_01_streetwear_exact_baseline",
    name: "Streetwear Exact Prompt (Baseline Blueprint)",
    pngFile: "case_01_streetwear_exact_baseline_raw64.png",
    model: "default",
    views: ["front_three_quarter"],
  },
  {
    id: "case_01_streetwear_exact_expanded",
    name: "Streetwear Exact Prompt (Expanded Blueprint)",
    pngFile: "case_01_streetwear_exact_expanded_raw64.png",
    model: "default",
    views: ["front_three_quarter", "back_three_quarter"],
  },
  {
    id: "case_02_gothic_knight_expanded",
    name: "Gothic Dark Knight (Expanded)",
    pngFile: "case_02_gothic_knight_expanded_raw64.png",
    model: "default",
    views: ["front_three_quarter"],
  },
  {
    id: "case_03_cottagecore_girl_expanded",
    name: "Cozy Cottagecore Girl (Expanded)",
    pngFile: "case_03_cottagecore_girl_expanded_raw64.png",
    model: "slim",
    views: ["front_three_quarter"],
  },
  {
    id: "case_04_cyberpunk_ninja_expanded",
    name: "Cyberpunk Shinobi Ninja (Expanded)",
    pngFile: "case_04_cyberpunk_ninja_expanded_raw64.png",
    model: "slim",
    views: ["front_three_quarter"],
  },
  {
    id: "case_05_layered_streetwear_expanded",
    name: "Tokyo Layered Streetwear Skater (Expanded)",
    pngFile: "case_05_layered_streetwear_expanded_raw64.png",
    model: "default",
    views: ["front_three_quarter"],
  },
  {
    id: "case_06_purple_hoodie_curtain_bangs_expanded",
    name: "Purple Hoodie / Silver Curtain Bangs (Expanded)",
    pngFile: "case_06_purple_hoodie_curtain_bangs_expanded_raw64.png",
    model: "default",
    views: ["front_three_quarter"],
  },
  {
    id: "case_07_reference_guided_expanded",
    name: "Reference-Guided Desert Nomad (Expanded)",
    pngFile: "case_07_reference_guided_expanded_raw64.png",
    model: "default",
    views: ["front_three_quarter"],
  },
];

// Read all skin PNGs as base64 data URLs
const skinDataList = SKINS_TO_RENDER.map((item) => {
  const filePath = path.join(LOCAL_DIR, item.pngFile);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing PNG file: ${filePath}`);
  }
  const base64 = fs.readFileSync(filePath).toString("base64");
  return {
    ...item,
    dataUrl: `data:image/png;base64,${base64}`,
  };
});

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Minecraft 3D Skin Renderer</title>
  <style>
    body {
      background: #09090b;
      color: #fafafa;
      font-family: sans-serif;
      padding: 20px;
      text-align: center;
    }
    #viewer_container {
      display: inline-block;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      overflow: hidden;
      background: #18181b;
      margin-bottom: 20px;
    }
    #status {
      font-size: 18px;
      font-weight: bold;
      color: #38bdf8;
    }
  </style>
  <script src="/skinview3d.bundle.js"></script>
</head>
<body>
  <h1>Exismic 3D Skinview Studio Renderer</h1>
  <div id="viewer_container">
    <canvas id="skin_canvas"></canvas>
  </div>
  <div id="status">Initializing 3D renderer...</div>

  <script>
    const skins = ${JSON.stringify(skinDataList)};
    const canvas = document.getElementById("skin_canvas");
    const statusDiv = document.getElementById("status");

    async function postScreenshot(id, view, dataUrl) {
      await fetch("/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, view, dataUrl })
      });
    }

    async function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function run() {
      const viewer = new skinview3d.SkinViewer({
        canvas: canvas,
        width: 600,
        height: 750,
        model: "default"
      });

      viewer.background = 0x121214;
      viewer.zoom = 0.95;
      viewer.playerObject.skin.setOuterLayerVisible(true);
      viewer.globalLight.intensity = 2.4;
      viewer.cameraLight.intensity = 0.8;

      for (let i = 0; i < skins.length; i++) {
        const item = skins[i];
        statusDiv.innerText = \`Rendering [\${i+1}/\${skins.length}]: \${item.name}...\`;

        viewer.model = item.model;
        await viewer.loadSkin(item.dataUrl);
        viewer.playerObject.skin.setOuterLayerVisible(true);

        for (const view of item.views) {
          if (view === "front_three_quarter") {
            // Crisp front 3/4 angle showcasing chest, open lapels, right sleeve, and outer leg cargo pocket
            viewer.playerObject.rotation.x = 0.05;
            viewer.playerObject.rotation.y = 0.45; // Turn slightly to viewer's right to reveal left side/front
          } else if (view === "back_three_quarter") {
            // Back 3/4 view showcasing hood resting, hair layers, back pleats, and side pouch
            viewer.playerObject.rotation.x = 0.05;
            viewer.playerObject.rotation.y = 3.6;
          }

          viewer.render();
          await sleep(150);
          viewer.render();

          const screenshot = canvas.toDataURL("image/png");
          await postScreenshot(item.id, view, screenshot);
        }
      }

      statusDiv.innerText = "ALL 3D PREVIEWS GENERATED SUCCESSFULLY";
      statusDiv.style.color = "#4ade80";

      await fetch("/done", { method: "POST" });
    }

    window.addEventListener("load", () => {
      run().catch(err => {
        statusDiv.innerText = "ERROR: " + err.message;
        statusDiv.style.color = "#f87171";
      });
    });
  </script>
</body>
</html>
`;

let server: http.Server;

server = http.createServer(async (req, res) => {
  if (req.url === "/skinview3d.bundle.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(fs.readFileSync(BUNDLE_PATH));
    return;
  }

  if (req.url === "/" || req.url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(htmlContent);
    return;
  }

  if (req.url === "/save" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const { id, view, dataUrl } = JSON.parse(body);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const filename = `${id}_3d_${view}.png`;
      fs.writeFileSync(path.join(ARTIFACT_DIR, filename), buffer);
      fs.writeFileSync(path.join(LOCAL_DIR, filename), buffer);
      console.log(`  -> Saved 3D Screenshot: ${filename} (${buffer.length} bytes)`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  if (req.url === "/done" && req.method === "POST") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "complete" }));
    console.log("\n=================================================================");
    console.log("  ALL 3D PREVIEW SCREENSHOTS SUCCESSFULLY CAPTURED & SAVED!      ");
    console.log("=================================================================\n");
    setTimeout(() => {
      process.exit(0);
    }, 1000);
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`3D Preview Server running on http://localhost:${PORT}`);
});
