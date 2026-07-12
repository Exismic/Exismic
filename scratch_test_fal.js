const dotenv = require("dotenv");
const path = require("path");

// Load .env.local
dotenv.config({ path: path.join(__dirname, ".env.local") });

const falKey = process.env.FAL_KEY;
if (!falKey) {
  console.error("FAL_KEY is not set in .env.local!");
  process.exit(1);
}

async function runTest() {
  console.log("Testing Fal.ai CodeFormer API...");
  try {
    const response = await fetch("https://fal.run/fal-ai/codeformer", {
      method: "POST",
      headers: {
        "Authorization": `Key ${falKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // A public sample low-res face image from Unsplash
        image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256",
        fidelity: 0.7,
        face_upscale: 2,
        only_center_face: false,
        aligned: false
      })
    });

    console.log("HTTP Status:", response.status);
    const json = await response.json();
    console.log("Response Body:", JSON.stringify(json, null, 2));
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

runTest();
