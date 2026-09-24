export interface QrBlueprint {
  id: string;
  name: string;
  category: string;
  tagline: string;
  url: string;
  prompt: string;
  scannability: number;
  previewUrl: string; // High-resolution SVG data URI with beautiful artistic styling
  accentColor: string;
}

// Function to generate high-aesthetic artistic QR code SVGs with authentic alignment patterns
function createArtisticQrSvg({
  primaryColor,
  secondaryColor,
  bgColor,
  glowColor,
  accentDeco,
}: {
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  glowColor: string;
  accentDeco: string;
}) {
  const encPri = encodeURIComponent(primaryColor);
  const encSec = encodeURIComponent(secondaryColor);
  const encBg = encodeURIComponent(bgColor);
  const encGlow = encodeURIComponent(glowColor);

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%"><defs><radialGradient id="bgGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${encGlow}" stop-opacity="0.3"/><stop offset="100%" stop-color="${encBg}" stop-opacity="1"/></radialGradient><linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encPri}"/><stop offset="50%" stop-color="${encSec}"/><stop offset="100%" stop-color="${encPri}"/></linearGradient><filter id="bloom" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="800" height="800" fill="${encBg}"/><circle cx="400" cy="400" r="380" fill="url(%23bgGlow)"/>${accentDeco}<!-- Top-Left Target Eye --><rect x="90" y="90" width="160" height="160" rx="36" fill="none" stroke="url(%23qrGrad)" stroke-width="18" filter="url(%23bloom)"/><rect x="135" y="135" width="70" height="70" rx="18" fill="url(%23qrGrad)"/><!-- Top-Right Target Eye --><rect x="550" y="90" width="160" height="160" rx="36" fill="none" stroke="url(%23qrGrad)" stroke-width="18" filter="url(%23bloom)"/><rect x="595" y="135" width="70" height="70" rx="18" fill="url(%23qrGrad)"/><!-- Bottom-Left Target Eye --><rect x="90" y="550" width="160" height="160" rx="36" fill="none" stroke="url(%23qrGrad)" stroke-width="18" filter="url(%23bloom)"/><rect x="135" y="595" width="70" height="70" rx="18" fill="url(%23qrGrad)"/><!-- Core Matrix Data Cluster --><g fill="url(%23qrGrad)"><rect x="300" y="110" width="30" height="30" rx="8"/><rect x="350" y="110" width="70" height="30" rx="8"/><rect x="440" y="110" width="30" height="30" rx="8"/><rect x="300" y="160" width="70" height="30" rx="8"/><rect x="390" y="160" width="30" height="30" rx="8"/><rect x="440" y="160" width="70" height="30" rx="8"/><rect x="110" y="300" width="30" height="70" rx="8"/><rect x="160" y="300" width="30" height="30" rx="8"/><rect x="210" y="300" width="30" height="70" rx="8"/><rect x="110" y="390" width="70" height="30" rx="8"/><rect x="200" y="390" width="40" height="30" rx="8"/><rect x="110" y="440" width="30" height="30" rx="8"/><rect x="160" y="440" width="80" height="30" rx="8"/><rect x="290" y="290" width="40" height="40" rx="10"/><rect x="350" y="290" width="40" height="40" rx="10"/><rect x="410" y="290" width="40" height="40" rx="10"/><rect x="470" y="290" width="40" height="40" rx="10"/><rect x="290" y="350" width="40" height="40" rx="10"/><rect x="350" y="350" width="100" height="100" rx="24" fill="${encGlow}" stroke="url(%23qrGrad)" stroke-width="6"/><rect x="470" y="350" width="40" height="40" rx="10"/><rect x="290" y="410" width="40" height="40" rx="10"/><rect x="470" y="410" width="40" height="40" rx="10"/><rect x="290" y="470" width="40" height="40" rx="10"/><rect x="350" y="470" width="40" height="40" rx="10"/><rect x="410" y="470" width="40" height="40" rx="10"/><rect x="470" y="470" width="40" height="40" rx="10"/><rect x="550" y="300" width="30" height="70" rx="8"/><rect x="600" y="300" width="70" height="30" rx="8"/><rect x="550" y="390" width="70" height="30" rx="8"/><rect x="640" y="390" width="30" height="70" rx="8"/><rect x="550" y="440" width="40" height="30" rx="8"/><rect x="610" y="440" width="60" height="30" rx="8"/><rect x="300" y="550" width="70" height="30" rx="8"/><rect x="390" y="550" width="30" height="30" rx="8"/><rect x="440" y="550" width="70" height="30" rx="8"/><rect x="300" y="600" width="30" height="30" rx="8"/><rect x="350" y="600" width="70" height="30" rx="8"/><rect x="440" y="600" width="30" height="70" rx="8"/><rect x="300" y="650" width="70" height="30" rx="8"/><rect x="390" y="650" width="30" height="30" rx="8"/><rect x="550" y="550" width="40" height="40" rx="10"/><rect x="610" y="550" width="40" height="40" rx="10"/><rect x="670" y="550" width="40" height="40" rx="10"/><rect x="550" y="610" width="40" height="40" rx="10"/><rect x="610" y="610" width="40" height="40" rx="10"/><rect x="670" y="610" width="40" height="40" rx="10"/><rect x="550" y="670" width="40" height="40" rx="10"/><rect x="610" y="670" width="40" height="40" rx="10"/><rect x="670" y="670" width="40" height="40" rx="10"/></g></svg>`;
}

export const QR_BLUEPRINTS: QrBlueprint[] = [
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon Grid",
    category: "Futuristic • Cyber",
    tagline: "Electric cyan & hot magenta holographic city grid",
    url: "https://exismic.com",
    prompt: "A futuristic cyberpunk cityscape at night, glowing holographic neon signs, electric cyan circuit paths, wet reflective asphalt, ultra-detailed 8k render, octane render.",
    scannability: 1.25,
    accentColor: "#06b6d4",
    previewUrl: createArtisticQrSvg({
      primaryColor: "#06b6d4",
      secondaryColor: "#ec4899",
      bgColor: "#070714",
      glowColor: "#06b6d4",
      accentDeco: `<!-- Cyber Circuit Traces --><g stroke="%2306b6d4" stroke-width="2" opacity="0.3" fill="none"><path d="M0 200 L200 200 L250 250"/><path d="M600 250 L650 200 L800 200"/><path d="M250 550 L200 600 L0 600"/><path d="M800 600 L650 600 L600 550"/><circle cx="250" cy="250" r="5" fill="%2306b6d4"/><circle cx="600" cy="250" r="5" fill="%23ec4899"/><circle cx="250" cy="550" r="5" fill="%23ec4899"/><circle cx="600" cy="550" r="5" fill="%2306b6d4"/></g>`,
    }),
  },
  {
    id: "obsidian-gold",
    name: "Obsidian Gold Luxury",
    category: "Luxury • Minimalist",
    tagline: "Polished black marble with 24k gold foil inlays",
    url: "https://exismic.com",
    prompt: "Luxury geometric obsidian marble mosaic with polished 24k gold leaf inlays, royal art deco pattern, warm specular reflections, elegant studio lighting, 8k render.",
    scannability: 1.2,
    accentColor: "#f59e0b",
    previewUrl: createArtisticQrSvg({
      primaryColor: "#f59e0b",
      secondaryColor: "#fbbf24",
      bgColor: "#09090e",
      glowColor: "#f59e0b",
      accentDeco: `<!-- Art Deco Golden Geometric Accents --><g stroke="%23f59e0b" stroke-width="1.5" opacity="0.25" fill="none"><polygon points="400,60 740,400 400,740 60,400"/><polygon points="400,120 680,400 400,680 120,400"/><circle cx="400" cy="400" r="320"/></g>`,
    }),
  },
  {
    id: "steampunk-brass",
    name: "Steampunk Clockwork",
    category: "Vintage • Industrial",
    tagline: "Intricate golden brass gears & copper steam conduits",
    url: "https://exismic.com",
    prompt: "Intricate steampunk clockwork mechanism with golden brass gears, copper steam pipes, antique pocket watch aesthetic, metallic reflections, dramatic volumetric lighting.",
    scannability: 1.15,
    accentColor: "#d97706",
    previewUrl: createArtisticQrSvg({
      primaryColor: "#d97706",
      secondaryColor: "#f59e0b",
      bgColor: "#0c0a08",
      glowColor: "#d97706",
      accentDeco: `<!-- Clockwork Gear Silhouettes --><g stroke="%23d97706" stroke-width="3" opacity="0.2" fill="none"><circle cx="400" cy="400" r="280" stroke-dasharray="15,10"/><circle cx="400" cy="400" r="340" stroke-dasharray="8,8"/><line x1="400" y1="50" x2="400" y2="750"/><line x1="50" y1="400" x2="750" y2="400"/></g>`,
    }),
  },
  {
    id: "emerald-sanctuary",
    name: "Emerald Forest Shrine",
    category: "Nature • Organic",
    tagline: "Ancient mossy botanical flora with bioluminescent glow",
    url: "https://exismic.com",
    prompt: "Ancient lush mossy forest shrine with blooming emerald flora, gentle sunbeams through dense canopy, ethereal fantasy landscape, studio ghibli aesthetic, highly detailed.",
    scannability: 1.2,
    accentColor: "#10b981",
    previewUrl: createArtisticQrSvg({
      primaryColor: "#10b981",
      secondaryColor: "#34d399",
      bgColor: "#06120d",
      glowColor: "#10b981",
      accentDeco: `<!-- Organic Botanical Rings --><g stroke="%2310b981" stroke-width="2" opacity="0.25" fill="none"><circle cx="400" cy="400" r="260" stroke-dasharray="25,15"/><circle cx="400" cy="400" r="310" stroke-dasharray="35,10"/><path d="M150 150 Q400 50 650 150"/><path d="M150 650 Q400 750 650 650"/></g>`,
    }),
  },
];
