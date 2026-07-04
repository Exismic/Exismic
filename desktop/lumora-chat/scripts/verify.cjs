const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const required = [
  "main.cjs",
  "preload.cjs",
  "offline.html",
  "assets/icon.svg",
  "assets/icon.png",
];

const missing = required.filter(file => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Missing desktop files:\n${missing.map(file => `- ${file}`).join("\n")}`);
  process.exit(1);
}

for (const file of ["main.cjs", "preload.cjs", "scripts/launch.cjs"]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  new Function(source);
}

console.log("Lumora Chat desktop package is structurally valid.");
