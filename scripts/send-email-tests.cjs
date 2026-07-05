const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const repoRoot = path.resolve(__dirname, "..");

function loadEnvFile(fileName, override = false) {
  const filePath = path.join(repoRoot, fileName);
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local", true);

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      skipLibCheck: true,
    },
    fileName: filename,
  }).outputText;

  module._compile(output, filename);
};

async function main() {
  const to = process.argv[2] || process.env.EMAIL_TEST_TO || "kgold3796@gmail.com";
  const {
    sendAuthOTP,
    sendCreditsPurchasedEmail,
    sendMagicLinkEmail,
    sendPasswordChangedEmail,
    sendPaymentFailedEmail,
    sendProWelcomeEmail,
    sendResetPasswordEmail,
    sendWelcomeEmail,
  } = require(path.join(repoRoot, "src", "lib", "emails.ts"));

  const samples = [
    ["welcome", () => sendWelcomeEmail(to)],
    [
      "pro_welcome",
      () =>
        sendProWelcomeEmail(to, {
          invoiceId: "INV-LUMORA-TEST",
          amount: "Rs 499",
          date: "August 3, 2026",
        }),
    ],
    [
      "credits_purchased",
      () =>
        sendCreditsPurchasedEmail(to, {
          credits: 1000,
          amount: "Rs 499",
          invoiceId: "CR-LUMORA-TEST",
        }),
    ],
    ["payment_failed", () => sendPaymentFailedEmail(to)],
    ["auth_otp", () => sendAuthOTP(to, "482913")],
    [
      "magic_link",
      () =>
        sendMagicLinkEmail(
          to,
          "https://lumoraai.online/auth/callback?token_hash=test-token&type=magiclink&next=%2Fdashboard",
        ),
    ],
    [
      "password_reset",
      () => sendResetPasswordEmail(to, "pwd_reset:test-password-reset-token"),
    ],
    ["password_changed", () => sendPasswordChangedEmail(to)],
  ];

  console.log(`Sending ${samples.length} Lumora test emails to ${to}...`);

  for (const [name, send] of samples) {
    const ok = await send();
    console.log(`${ok ? "OK" : "FAILED"} ${name}`);
    if (!ok) process.exitCode = 1;
    await new Promise((resolve) => setTimeout(resolve, 450));
  }

  if (process.exitCode) {
    throw new Error("One or more test emails failed.");
  }

  console.log("All Lumora test emails were accepted by Resend.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

