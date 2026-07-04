const { spawn } = require("node:child_process");
const electronPath = require("electron");

const target = process.argv[2];
if (!target) {
  console.error("Usage: node scripts/launch.cjs <lumora-chat-url>");
  process.exit(1);
}

const child = spawn(electronPath, ["."], {
  cwd: require("node:path").resolve(__dirname, ".."),
  env: {
    ...process.env,
    LUMORA_WEB_URL: target,
  },
  stdio: "inherit",
});

child.on("exit", code => {
  process.exitCode = code ?? 0;
});
