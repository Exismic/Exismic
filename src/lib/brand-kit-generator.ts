import JSZip from "jszip";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface BrandKitOptions {
  brandName: string;
  slogan?: string;
  imageUrl: string;
  stylePreset?: string;
  paletteName?: string;
  primaryColorHex?: string;
  secondaryColorHex?: string;
  backgroundColorHex?: string;
}

/**
 * Utility: Converts a Hex color (e.g. #f59e0b) into normalized RGB 0..1 values for pdf-lib.
 */
function hexToPdfRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) {
    return { r: 0.96, g: 0.62, b: 0.04 }; // Fallback to Solaris Amber (#f59e0b)
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return {
    r: isNaN(r) ? 0.96 : r,
    g: isNaN(g) ? 0.62 : g,
    b: isNaN(b) ? 0.04 : b,
  };
}

/**
 * Wraps a 32x32 PNG byte array into a valid Windows/Browser ICO binary format.
 */
function createIcoFromPng(pngBytes: Uint8Array): Uint8Array {
  const ico = new Uint8Array(22 + pngBytes.length);
  const view = new DataView(ico.buffer);
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type 1 = Icon
  view.setUint16(4, 1, true); // 1 Image inside
  view.setUint8(6, 32);       // Width 32px
  view.setUint8(7, 32);       // Height 32px
  view.setUint8(8, 0);        // 0 = 256 or more colors
  view.setUint8(9, 0);        // Reserved
  view.setUint16(10, 1, true); // Color planes
  view.setUint16(12, 32, true); // 32 Bits per pixel (RGBA)
  view.setUint32(14, pngBytes.length, true); // Image data size in bytes
  view.setUint32(18, 22, true); // Offset where image data begins
  ico.set(pngBytes, 22);
  return ico;
}

/**
 * Loads an image from URL/dataURI into an HTMLImageElement.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
    img.src = url;
  });
}

/**
 * Renders an image to an offscreen canvas at the target size, with optional internal padding.
 */
async function renderCanvasToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  paddingRatio = 0,
  bgFill?: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize canvas context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (bgFill) {
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;
  const imgAspect = naturalW / naturalH;

  const padX = width * paddingRatio;
  const padY = height * paddingRatio;
  const availW = width - padX * 2;
  const availH = height - padY * 2;
  const boxAspect = availW / availH;

  let drawW = availW;
  let drawH = availH;
  if (imgAspect > boxAspect) {
    drawH = availW / imgAspect;
  } else {
    drawW = availH * imgAspect;
  }

  const offsetX = padX + (availW - drawW) / 2;
  const offsetY = padY + (availH - drawH) / 2;

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas conversion to Blob failed"));
    }, "image/png");
  });
}

/**
 * Generates an executive Brand Guidelines PDF document.
 */
async function generateBrandGuidelinesPdf(
  options: BrandKitOptions,
  logoBlob: Blob
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  // Standard A4: 595.28 x 841.89 pt
  const page = pdfDoc.addPage([595.28, 841.89]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const primaryRgb = hexToPdfRgb(options.primaryColorHex || "#f59e0b");
  const secondaryRgb = hexToPdfRgb(options.secondaryColorHex || "#06b6d4");

  // 1. Top Luxury Header Banner
  page.drawRectangle({
    x: 0,
    y: 740,
    width: 595.28,
    height: 101.89,
    color: rgb(0.05, 0.05, 0.08),
  });

  // Laser hairline divider beneath banner
  page.drawRectangle({
    x: 0,
    y: 738,
    width: 595.28,
    height: 2,
    color: rgb(primaryRgb.r, primaryRgb.g, primaryRgb.b),
  });

  // Header Title & Tagline
  const brandTitle = (options.brandName || "Brand").toUpperCase();
  page.drawText(brandTitle, {
    x: 40,
    y: 790,
    size: 26,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("OFFICIAL STARTUP BRAND GUIDELINES & SPECIFICATIONS", {
    x: 40,
    y: 765,
    size: 10,
    font: fontBold,
    color: rgb(primaryRgb.r, primaryRgb.g, primaryRgb.b),
  });

  // 2. Logo Emblem Stage
  page.drawRectangle({
    x: 40,
    y: 530,
    width: 515.28,
    height: 180,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: rgb(0.85, 0.85, 0.88),
    borderWidth: 1,
  });

  // Embed logo image into PDF
  const logoBytes = new Uint8Array(await logoBlob.arrayBuffer());
  const embeddedLogo = await pdfDoc.embedPng(logoBytes);
  const logoDims = embeddedLogo.scaleToFit(140, 140);
  page.drawImage(embeddedLogo, {
    x: 40 + (200 - logoDims.width) / 2,
    y: 530 + (180 - logoDims.height) / 2,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Logo stage information block
  page.drawText("PRIMARY BRANDMARK", {
    x: 230,
    y: 665,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  });

  const sloganText = options.slogan ? `Tagline: "${options.slogan}"` : "Tagline: Official Startup Brand";
  page.drawText(sloganText, {
    x: 230,
    y: 645,
    size: 10,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.4),
  });

  page.drawText("Style Identity: " + (options.stylePreset || "Contemporary Sleek"), {
    x: 230,
    y: 625,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.45),
  });

  page.drawText("Clear Space Rule: Minimum 24px padding on all sides.", {
    x: 230,
    y: 605,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.45),
  });

  page.drawText("Resolution: Master assets rendered at 2048px Ultra-HD.", {
    x: 230,
    y: 585,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.45),
  });

  // 3. Official Color Palette Section
  page.drawText("OFFICIAL BRAND COLOR PALETTE", {
    x: 40,
    y: 490,
    size: 14,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.12),
  });

  page.drawText("Use these exact hex codes for websites, applications, slide decks, and print merchandise.", {
    x: 40,
    y: 472,
    size: 9,
    font: fontRegular,
    color: rgb(0.45, 0.45, 0.5),
  });

  // Color Swatches (4 clean cards)
  const swatches = [
    {
      title: "Primary Color",
      hex: options.primaryColorHex || "#f59e0b",
      rgb: primaryRgb,
      usage: "Key actions, logos & brand accents",
    },
    {
      title: "Secondary Accent",
      hex: options.secondaryColorHex || "#06b6d4",
      rgb: secondaryRgb,
      usage: "Highlights, links & badges",
    },
    {
      title: "Obsidian Dark",
      hex: "#0c0d12",
      rgb: { r: 0.05, g: 0.05, b: 0.07 },
      usage: "Dark backgrounds & deep contrast",
    },
    {
      title: "Pure Light",
      hex: "#ffffff",
      rgb: { r: 1, g: 1, b: 1 },
      usage: "Clean backgrounds & light typography",
    },
  ];

  swatches.forEach((sw, idx) => {
    const startX = 40 + idx * 133;
    const startY = 370;

    // Color Swatch Box
    page.drawRectangle({
      x: startX,
      y: startY,
      width: 120,
      height: 70,
      color: rgb(sw.rgb.r, sw.rgb.g, sw.rgb.b),
      borderColor: rgb(0.85, 0.85, 0.88),
      borderWidth: 1,
    });

    // Swatch Label & Hex
    page.drawText(sw.title, {
      x: startX,
      y: startY - 16,
      size: 9,
      font: fontBold,
      color: rgb(0.12, 0.12, 0.16),
    });

    page.drawText(sw.hex.toUpperCase(), {
      x: startX,
      y: startY - 30,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.25),
    });

    page.drawText(sw.usage, {
      x: startX,
      y: startY - 44,
      size: 7,
      font: fontRegular,
      color: rgb(0.45, 0.45, 0.5),
    });
  });

  // 4. Typography Guidelines
  page.drawText("TYPOGRAPHY GUIDELINES", {
    x: 40,
    y: 275,
    size: 14,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.12),
  });

  // Typography Card
  page.drawRectangle({
    x: 40,
    y: 165,
    width: 515.28,
    height: 90,
    color: rgb(0.98, 0.98, 0.99),
    borderColor: rgb(0.88, 0.88, 0.9),
    borderWidth: 1,
  });

  page.drawText("Primary Sans-Serif: Inter, Outfit, or Apple System UI", {
    x: 55,
    y: 232,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  });

  page.drawText("Headlines: Font weight 800 or 900 (Black / Extra Bold) with tight tracking (-0.02em).", {
    x: 55,
    y: 212,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.35),
  });

  page.drawText("Body Text: Font weight 400 or 500 (Regular / Medium) with generous line height (1.6x).", {
    x: 55,
    y: 194,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.35),
  });

  page.drawText("Code & Monospace: JetBrains Mono or SF Mono for technical metrics & numerical counters.", {
    x: 55,
    y: 176,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.35),
  });

  // 5. Included Assets Manifest
  page.drawText("INCLUDED BRAND ASSET PACKAGE", {
    x: 40,
    y: 135,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  });

  page.drawText("• Scalable Vector SVG with editable paths", {
    x: 40,
    y: 115,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.4),
  });

  page.drawText("• Transparent PNGs at 512px, 1024px, and 2048px Ultra-HD", {
    x: 40,
    y: 100,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.4),
  });

  page.drawText("• Complete Favicon Suite: favicon.ico, apple-touch-icon, 32x32, 16x16", {
    x: 40,
    y: 85,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.4),
  });

  page.drawText("• Social Media Profile Avatars: Twitter / X, YouTube, LinkedIn, Instagram", {
    x: 40,
    y: 70,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.4),
  });

  // Footer note
  page.drawText("Generated with Exismic Studio • Commercial Brand Kit License Included", {
    x: 40,
    y: 35,
    size: 8,
    font: fontRegular,
    color: rgb(0.6, 0.6, 0.65),
  });

  return pdfDoc.save();
}

/**
 * Compiles and returns a complete Startup Brand Kit (.ZIP) archive.
 */
export async function generateStartupBrandKitZip(options: BrandKitOptions): Promise<Blob> {
  const zip = new JSZip();
  const safeName = (options.brandName || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Load master image
  const masterImg = await loadImage(options.imageUrl);

  // 1. Transparent PNGs at 3 resolutions
  const [png512Blob, png1024Blob, png2048Blob] = await Promise.all([
    renderCanvasToBlob(masterImg, 512, 512, 0.05),
    renderCanvasToBlob(masterImg, 1024, 1024, 0.05),
    renderCanvasToBlob(masterImg, 2048, 2048, 0.05),
  ]);

  const pngFolder = zip.folder("transparent-png");
  if (pngFolder) {
    pngFolder.file(`${safeName}-logo-512px.png`, png512Blob);
    pngFolder.file(`${safeName}-logo-1024px.png`, png1024Blob);
    pngFolder.file(`${safeName}-logo-2048px-ultrahd.png`, png2048Blob);
  }

  // 2. Favicon Suite
  const [fav16Blob, fav32Blob, fav180Blob] = await Promise.all([
    renderCanvasToBlob(masterImg, 16, 16, 0.02),
    renderCanvasToBlob(masterImg, 32, 32, 0.02),
    renderCanvasToBlob(masterImg, 180, 180, 0.08, options.backgroundColorHex || "#0c0d12"),
  ]);

  const fav32Bytes = new Uint8Array(await fav32Blob.arrayBuffer());
  const icoBytes = createIcoFromPng(fav32Bytes);

  const favFolder = zip.folder("favicons");
  if (favFolder) {
    favFolder.file("favicon.ico", icoBytes);
    favFolder.file("favicon-16x16.png", fav16Blob);
    favFolder.file("favicon-32x32.png", fav32Blob);
    favFolder.file("apple-touch-icon.png", fav180Blob);
  }

  // 3. Social Media Profile Avatars
  const [twAvatar, ytAvatar, liAvatar, igAvatar] = await Promise.all([
    renderCanvasToBlob(masterImg, 400, 400, 0.12, options.backgroundColorHex || "#0c0d12"),
    renderCanvasToBlob(masterImg, 800, 800, 0.14, options.backgroundColorHex || "#0c0d12"),
    renderCanvasToBlob(masterImg, 400, 400, 0.12, options.backgroundColorHex || "#0c0d12"),
    renderCanvasToBlob(masterImg, 320, 320, 0.12, options.backgroundColorHex || "#0c0d12"),
  ]);

  const socialFolder = zip.folder("social-profile-avatars");
  if (socialFolder) {
    socialFolder.file("twitter-x-avatar-400x400.png", twAvatar);
    socialFolder.file("youtube-profile-800x800.png", ytAvatar);
    socialFolder.file("linkedin-profile-400x400.png", liAvatar);
    socialFolder.file("instagram-avatar-320x320.png", igAvatar);
  }

  // 4. Scalable Vector SVG
  const safeTitle = options.brandName || "Brand";
  const safeSlogan = options.slogan || "";
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <style>
      .brand-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-weight: 800; font-size: 44px; fill: #ffffff; text-anchor: middle; letter-spacing: 6px; }
      .brand-slogan { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-weight: 600; font-size: 16px; fill: ${options.primaryColorHex || "#f59e0b"}; text-anchor: middle; letter-spacing: 4px; }
    </style>
  </defs>
  <rect width="1024" height="1024" fill="${options.backgroundColorHex || "none"}" />
  <image href="${options.imageUrl}" x="112" y="112" width="800" height="800" preserveAspectRatio="xMidYMid meet" />
  ${safeTitle ? `<text x="512" y="930" class="brand-title">${safeTitle.toUpperCase()}</text>` : ""}
  ${safeSlogan ? `<text x="512" y="965" class="brand-slogan">${safeSlogan.toUpperCase()}</text>` : ""}
</svg>`;

  const vectorFolder = zip.folder("vector-svg");
  if (vectorFolder) {
    vectorFolder.file(`${safeName}-vector-logo.svg`, svgContent);
  }

  // 5. Official Brand Guidelines PDF
  const pdfBytes = await generateBrandGuidelinesPdf(options, png512Blob);
  const guidelinesFolder = zip.folder("brand-guidelines");
  if (guidelinesFolder) {
    guidelinesFolder.file(`${safeName}-Brand-Guidelines.pdf`, pdfBytes);
    guidelinesFolder.file(
      "brand-colors.json",
      JSON.stringify(
        {
          brandName: options.brandName,
          tagline: options.slogan || "",
          palette: {
            primary: options.primaryColorHex || "#f59e0b",
            secondary: options.secondaryColorHex || "#06b6d4",
            background: options.backgroundColorHex || "#0c0d12",
            foreground: "#ffffff",
          },
          typography: {
            headings: "Inter, Outfit, or Apple System UI (Font weight: 800/900)",
            body: "Inter or system-ui (Font weight: 400/500)",
          },
        },
        null,
        2
      )
    );
  }

  // 6. Plain English Readme
  const readme = `===========================================================
${(options.brandName || "Brand").toUpperCase()} — STARTUP BRAND ASSET KIT
===========================================================
Thank you for creating your brand assets with Exismic Studio!

WHAT IS INSIDE THIS BRAND KIT:
1. /transparent-png
   - Crisp, transparent PNG logos at 512px, 1024px, and 2048px Ultra-HD.
   - Ideal for light and dark backgrounds, app designs, and websites.

2. /favicons
   - favicon.ico (Standard multi-browser website icon)
   - favicon-32x32.png and favicon-16x16.png
   - apple-touch-icon.png (180x180 for iOS home screen bookmarks)

3. /social-profile-avatars
   - Pre-formatted avatars ready to upload directly to Twitter / X, YouTube, LinkedIn, and Instagram.

4. /vector-svg
   - Scalable vector SVG file for web developers and high-res print.

5. /brand-guidelines
   - Official Brand Guidelines PDF with color codes and font recommendations.
   - brand-colors.json for web developers.

All assets are licensed for commercial and personal use with zero royalties.
Created with Exismic Studio (https://exismic.xyz)
`;

  zip.file("README.txt", readme);

  return zip.generateAsync({ type: "blob" });
}
