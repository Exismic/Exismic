const fs = require("node:fs");
const path = require("node:path");
const axios = require("axios");

function readGroqKey() {
  const contents = [".env.local", ".env"]
    .filter(file => fs.existsSync(path.resolve(file)))
    .map(file => fs.readFileSync(path.resolve(file), "utf8"))
    .join("\n");
  const match = contents.match(/^GROQ_API_KEYS?=(.*)$/m);
  if (!match) throw new Error("No Groq API key is configured.");
  return match[1].trim().replace(/^["']|["']$/g, "").split(",")[0].trim();
}

async function main() {
  const key = readGroqKey();
  const imagePath = path.resolve("desktop", "lumora-chat", "assets", "icon.png");
  const image = fs.readFileSync(imagePath).toString("base64");
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe the central letter and the main colors in this app icon. Answer in one sentence.",
          },
          {
            type: "image_url",
            image_url: { url: `data:image/png;base64,${image}` },
          },
        ],
      }],
      max_completion_tokens: 100,
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      timeout: 30_000,
    },
  );

  const answer = response.data?.choices?.[0]?.message?.content;
  if (!answer) throw new Error("Vision model returned no answer.");
  console.log(`VISION_OK: ${answer}`);
}

main().catch(error => {
  console.error(
    "VISION_FAILED:",
    error.response?.status || "",
    error.response?.data?.error?.message || error.message,
  );
  process.exitCode = 1;
});
