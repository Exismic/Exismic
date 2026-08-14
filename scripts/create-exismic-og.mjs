import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  // Read the Exismic app icon
  const iconPath = path.join(rootDir, 'public', 'exismic-app-icon.png');
  let iconBase64 = '';
  if (fs.existsSync(iconPath)) {
    const iconBuf = fs.readFileSync(iconPath);
    iconBase64 = `data:image/png;base64,${iconBuf.toString('base64')}`;
  }

  const svgCard = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#05070D" />
        <stop offset="50%" stop-color="#030303" />
        <stop offset="100%" stop-color="#080812" />
      </linearGradient>

      <radialGradient id="glowCyan" cx="20%" cy="30%" r="50%">
        <stop offset="0%" stop-color="rgba(0, 240, 255, 0.18)" />
        <stop offset="100%" stop-color="rgba(0, 240, 255, 0)" />
      </radialGradient>

      <radialGradient id="glowPurple" cx="80%" cy="70%" r="60%">
        <stop offset="0%" stop-color="rgba(168, 85, 247, 0.22)" />
        <stop offset="100%" stop-color="rgba(168, 85, 247, 0)" />
      </radialGradient>

      <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="60%" stop-color="#f3e8ff" />
        <stop offset="100%" stop-color="#c084fc" />
      </linearGradient>

      <linearGradient id="badgeBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(168, 85, 247, 0.5)" />
        <stop offset="100%" stop-color="rgba(0, 240, 255, 0.3)" />
      </linearGradient>

      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(18, 22, 34, 0.85)" />
        <stop offset="100%" stop-color="rgba(10, 12, 20, 0.95)" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <rect width="${width}" height="${height}" fill="url(#glowCyan)" />
    <rect width="${width}" height="${height}" fill="url(#glowPurple)" />

    <!-- Subtle grid lines -->
    <g opacity="0.04" stroke="#ffffff" stroke-width="1">
      <line x1="0" y1="105" x2="1200" y2="105" />
      <line x1="0" y1="210" x2="1200" y2="210" />
      <line x1="0" y1="315" x2="1200" y2="315" />
      <line x1="0" y1="420" x2="1200" y2="420" />
      <line x1="0" y1="525" x2="1200" y2="525" />
      <line x1="200" y1="0" x2="200" y2="630" />
      <line x1="400" y1="0" x2="400" y2="630" />
      <line x1="600" y1="0" x2="600" y2="630" />
      <line x1="800" y1="0" x2="800" y2="630" />
      <line x1="1000" y1="0" x2="1000" y2="630" />
    </g>

    <!-- Main Glass Container Frame -->
    <rect x="40" y="40" width="1120" height="550" rx="32" fill="url(#cardGrad)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" filter="drop-shadow(0 20px 40px rgba(0,0,0,0.6))" />

    <!-- Top Bar -->
    <g transform="translate(80, 85)">
      ${iconBase64 ? `<image href="${iconBase64}" x="0" y="0" width="60" height="60" />` : `
        <rect x="0" y="0" width="60" height="60" rx="16" fill="#8B5CF6" />
      `}
      <text x="75" y="43" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#ffffff" letter-spacing="-0.03em">
        Exismic<tspan fill="#a855f7">.</tspan>
      </text>
      <text x="250" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#c084fc" letter-spacing="0.18em">
        AI STUDIO
      </text>
    </g>

    <!-- Live Status Pill -->
    <g transform="translate(930, 95)">
      <rect x="0" y="0" width="190" height="40" rx="20" fill="rgba(34, 197, 94, 0.12)" stroke="rgba(34, 197, 94, 0.3)" stroke-width="1" />
      <circle cx="20" cy="20" r="5" fill="#22c55e" />
      <text x="36" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#4ade80">
        50+ TOOLS LIVE
      </text>
    </g>

    <!-- Main Headline & Pitch -->
    <g transform="translate(80, 230)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="url(#textGrad)" letter-spacing="-0.03em">
        Next-Gen All-in-One AI Studio
      </text>
      <text x="0" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="23" font-weight="400" fill="#94a3b8" letter-spacing="-0.01em">
        Process media, generate assets, edit video &amp; deploy AI agents seamlessly.
      </text>
    </g>

    <!-- Feature Tool Pills Grid -->
    <g transform="translate(80, 360)">
      <!-- Pill 1 -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="220" height="48" rx="14" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(168, 85, 247, 0.35)" stroke-width="1" />
        <text x="20" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#e2e8f0">
          ✨ Background Remover
        </text>
      </g>

      <!-- Pill 2 -->
      <g transform="translate(235, 0)">
        <rect x="0" y="0" width="210" height="48" rx="14" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(0, 240, 255, 0.35)" stroke-width="1" />
        <text x="20" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#e2e8f0">
          🎨 4K Image Generator
        </text>
      </g>

      <!-- Pill 3 -->
      <g transform="translate(460, 0)">
        <rect x="0" y="0" width="195" height="48" rx="14" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(234, 179, 8, 0.35)" stroke-width="1" />
        <text x="20" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#e2e8f0">
          🎙️ Vocal Separator
        </text>
      </g>

      <!-- Pill 4 -->
      <g transform="translate(670, 0)">
        <rect x="0" y="0" width="200" height="48" rx="14" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(236, 72, 153, 0.35)" stroke-width="1" />
        <text x="20" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#e2e8f0">
          🤖 AI Support Agent
        </text>
      </g>

      <!-- Pill 5 -->
      <g transform="translate(885, 0)">
        <rect x="0" y="0" width="155" height="48" rx="14" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(59, 130, 246, 0.35)" stroke-width="1" />
        <text x="20" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#e2e8f0">
          ⚡ Code Studio
        </text>
      </g>
    </g>

    <!-- Bottom Footer Bar -->
    <g transform="translate(80, 520)">
      <line x1="0" y1="0" x2="1040" y2="0" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
      <text x="0" y="35" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748b">
        exismic.xyz • Next.js 16 • React 19 • Enterprise AI Suite
      </text>
      <text x="1040" y="35" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#a855f7">
        Instant Free Access →
      </text>
    </g>
  </svg>
  `;

  const outputPath = path.join(rootDir, 'public', 'og-image.png');
  await sharp(Buffer.from(svgCard))
    .png({ quality: 95 })
    .toFile(outputPath);

  console.log(`Generated official Exismic OG image at: ${outputPath}`);
}

generateOgImage().catch(console.error);
