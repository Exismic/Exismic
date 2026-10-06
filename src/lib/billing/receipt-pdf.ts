import fs from "node:fs";
import path from "node:path";
import {
  PDFDocument,
  PDFPage,
  StandardFonts,
  rgb,
  moveTo,
  lineTo,
  appendBezierCurve,
  closePath,
  fillAndStroke,
  fill,
  stroke,
  setLineWidth,
  setStrokingRgbColor,
  setFillingRgbColor,
} from "pdf-lib";
import type { BillingReceipt } from "./receipt-data";

function printable(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return printable(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(amountMinor: number, currency: string) {
  const num = amountMinor / 100;
  if (currency === "INR") {
    return `INR ${num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  if (currency === "USD") {
    return `$${num.toFixed(2)}`;
  }
  return `${currency} ${num.toFixed(2)}`;
}

function drawRoundedCard(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  options?: {
    fillColor?: { red: number; green: number; blue: number };
    borderColor?: { red: number; green: number; blue: number };
    borderWidth?: number;
  }
) {
  const k = 0.5522847498 * r;
  const ops = [];

  if (options?.fillColor) {
    ops.push(setFillingRgbColor(options.fillColor.red, options.fillColor.green, options.fillColor.blue));
  }
  if (options?.borderColor) {
    ops.push(setStrokingRgbColor(options.borderColor.red, options.borderColor.green, options.borderColor.blue));
  }
  if (options?.borderWidth) {
    ops.push(setLineWidth(options.borderWidth));
  }

  ops.push(
    moveTo(x + r, y),
    lineTo(x + w - r, y),
    appendBezierCurve(x + w - r + k, y, x + w, y + r - k, x + w, y + r),
    lineTo(x + w, y + h - r),
    appendBezierCurve(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h),
    lineTo(x + r, y + h),
    appendBezierCurve(x + r - k, y + h, x, y + h - r + k, x, y + h - r),
    lineTo(x, y + r),
    appendBezierCurve(x, y + r - k, x + r - k, y, x + r, y),
    closePath()
  );

  if (options?.fillColor && options?.borderColor) {
    ops.push(fillAndStroke());
  } else if (options?.fillColor) {
    ops.push(fill());
  } else if (options?.borderColor) {
    ops.push(stroke());
  }

  page.pushOperators(...ops);
}

export async function createReceiptPdf(receipt: BillingReceipt) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Exismic payment receipt ${receipt.reference}`);
  pdf.setAuthor("Exismic Studio");

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  let page = pdf.addPage([pageWidth, pageHeight]);

  // ========================================================
  // SIGNATURE OBSIDIAN PALETTE (Dark Executive Glass Theme)
  // ========================================================
  const bgObsidian = rgb(0.027, 0.043, 0.086);     // #070b16 - deep space background
  const bgCard = rgb(0.06, 0.082, 0.155);          // #0f1527 - executive glass card
  const bgCardSubtle = rgb(0.08, 0.105, 0.19);     // #141b30 - secondary card tint
  const bgHeaderStrip = rgb(0.09, 0.115, 0.21);    // #171d36 - header strip tint
  const cardBorder = rgb(0.18, 0.22, 0.35);        // #2e3859 - frosted glass border
  const accentBorder = rgb(0.35, 0.24, 0.6);       // #593d99 - laser purple glow rim

  // Text Colors
  const textWhite = rgb(1, 1, 1);                  // #ffffff - high-contrast primary
  const textSilver = rgb(0.88, 0.9, 0.95);         // #e0e6f2 - bright secondary
  const textMuted = rgb(0.58, 0.62, 0.74);          // #949ebd - lavender-muted label
  const textPurple = rgb(0.75, 0.65, 0.95);        // #bfa6f2 - brand violet accent

  // Accents
  const laserPurple = rgb(0.66, 0.33, 0.97);       // #a855f7 - laser horizon
  const cyanGlow = rgb(0.13, 0.83, 0.93);          // #22d3ee - cyan brand dot & glow
  const emeraldGlow = rgb(0.2, 0.95, 0.65);        // #34d399 - paid neon pill
  const emeraldBg = rgb(0.03, 0.16, 0.12);         // #07281e - paid badge pill fill
  const emeraldBorder = rgb(0.06, 0.72, 0.5);      // #10b981 - paid badge border

  // 1. Full Obsidian Page Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: bgObsidian,
  });

  // 2. Signature Laser Horizon Accent at very top
  page.drawLine({
    start: { x: 0, y: pageHeight - 2 },
    end: { x: pageWidth, y: pageHeight - 2 },
    thickness: 3,
    color: laserPurple,
  });

  // 3. Ambient Laser Halo Rim beneath top edge
  page.drawLine({
    start: { x: 0, y: pageHeight - 4 },
    end: { x: pageWidth, y: pageHeight - 4 },
    thickness: 1,
    color: cyanGlow,
  });

  // ========================================================
  // HEADER SECTION (y: 730 to 788)
  // ========================================================
  const leftX = 44;
  const rightX = 551;
  const contentWidth = rightX - leftX; // 507 points

  // Try embedding logo
  try {
    const logoCandidates = [
      path.join(process.cwd(), "public", "exismic-app-icon-transparent.png"),
      path.join(process.cwd(), "public", "logo.png"),
    ];
    for (const logoPath of logoCandidates) {
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        const logoImg = await pdf.embedPng(logoBytes);
        page.drawImage(logoImg, { x: leftX, y: 736, width: 44, height: 44 });
        break;
      }
    }
  } catch {
    drawRoundedCard(page, leftX, 736, 44, 44, 10, {
      fillColor: bgCardSubtle,
      borderColor: cardBorder,
      borderWidth: 1,
    });
    page.drawText("E", { x: leftX + 14, y: 748, size: 20, font: bold, color: cyanGlow });
  }

  // Brand Name & Subtitle
  page.drawText("Exismic", { x: leftX + 54, y: 756, size: 24, font: bold, color: textWhite });
  const exismicWidth = bold.widthOfTextAtSize("Exismic", 24);
  page.drawText(".", { x: leftX + 54 + exismicWidth + 0.5, y: 756, size: 24, font: bold, color: cyanGlow });
  page.drawText("AI CREATIVE STUDIO", { x: leftX + 54, y: 741, size: 9, font: bold, color: textPurple });

  // Header Right: "INVOICE" Title and Reference Number
  const invoiceText = "INVOICE";
  const invoiceWidth = bold.widthOfTextAtSize(invoiceText, 28);
  page.drawText(invoiceText, { x: rightX - invoiceWidth, y: 754, size: 28, font: bold, color: textWhite });

  const refText = printable(receipt.reference);
  const refWidth = bold.widthOfTextAtSize(refText, 10);
  page.drawText(refText, { x: rightX - refWidth, y: 739, size: 10, font: bold, color: textPurple });

  // Laser Divider below Header
  page.drawLine({
    start: { x: leftX, y: 718 },
    end: { x: rightX, y: 718 },
    thickness: 1,
    color: cardBorder,
  });

  // ========================================================
  // 2-COLUMN GRID: 6 EXECUTIVE OBSIDIAN GLASS CARDS
  // ========================================================
  const cardW = 244;
  const cardH = 56;
  const col1X = leftX;
  const col2X = leftX + cardW + 19; // 307

  // ROW 1 (y: 646)
  // Card 1: Invoice Type
  drawRoundedCard(page, col1X, 646, cardW, cardH, 12, {
    fillColor: bgCard,
    borderColor: cardBorder,
    borderWidth: 1,
  });
  page.drawText("PLAN / ITEM", { x: col1X + 16, y: 681, size: 8, font: bold, color: textMuted });
  const isProInvoice = receipt.recurring || receipt.item.toLowerCase().includes("pro");
  page.drawText(isProInvoice ? "Exismic Pro Plan" : "Credit Pack", {
    x: col1X + 16,
    y: 661,
    size: 13,
    font: bold,
    color: textWhite,
  });

  // Card 2: Status (PAID Badge Pill)
  drawRoundedCard(page, col2X, 646, cardW, cardH, 12, {
    fillColor: bgCard,
    borderColor: cardBorder,
    borderWidth: 1,
  });
  page.drawText("STATUS", { x: col2X + 16, y: 681, size: 8, font: bold, color: textMuted });

  // Radiant Emerald Pill inside Card 2
  drawRoundedCard(page, col2X + 16, 656, 82, 22, 6, {
    fillColor: emeraldBg,
    borderColor: emeraldBorder,
    borderWidth: 1,
  });
  page.drawCircle({ x: col2X + 28, y: 667, size: 3.5, color: emeraldGlow });
  page.drawText("PAID", { x: col2X + 37, y: 663, size: 10, font: bold, color: emeraldGlow });

  // ROW 2 (y: 576)
  // Card 3: Billing Date
  drawRoundedCard(page, col1X, 576, cardW, cardH, 12, {
    fillColor: bgCard,
    borderColor: cardBorder,
    borderWidth: 1,
  });
  page.drawText("DATE", { x: col1X + 16, y: 611, size: 8, font: bold, color: textMuted });
  page.drawText(formatDate(receipt.paidAt), {
    x: col1X + 16,
    y: 591,
    size: 13,
    font: bold,
    color: textWhite,
  });

  // Card 4: Amount Paid
  drawRoundedCard(page, col2X, 576, cardW, cardH, 12, {
    fillColor: bgCard,
    borderColor: cardBorder,
    borderWidth: 1,
  });
  page.drawText("AMOUNT PAID", { x: col2X + 16, y: 611, size: 8, font: bold, color: textMuted });
  page.drawText(formatMoney(receipt.amountMinor, receipt.currency), {
    x: col2X + 16,
    y: 591,
    size: 14,
    font: bold,
    color: textWhite,
  });

  // ROW 3 (y: 506)
  // Card 5: Payment Method
  drawRoundedCard(page, col1X, 506, cardW, cardH, 12, {
    fillColor: bgCard,
    borderColor: cardBorder,
    borderWidth: 1,
  });
  page.drawText("PAYMENT METHOD", { x: col1X + 16, y: 541, size: 8, font: bold, color: textMuted });
  const methodLabel =
    receipt.provider === "razorpay"
      ? "Razorpay (UPI / Card)"
      : receipt.provider === "paypal"
      ? "PayPal"
      : printable(receipt.provider);
  page.drawText(methodLabel, { x: col1X + 16, y: 521, size: 12, font: bold, color: textWhite });

  // Card 6: Next Billing / Access Until
  drawRoundedCard(page, col2X, 506, cardW, cardH, 12, {
    fillColor: bgCard,
    borderColor: cardBorder,
    borderWidth: 1,
  });
  const hasAccessDate = receipt.periodEnd && !receipt.isGift;
  page.drawText(hasAccessDate ? "ACCESS VALID UNTIL" : "PURCHASE TYPE", {
    x: col2X + 16,
    y: 541,
    size: 8,
    font: bold,
    color: textMuted,
  });
  page.drawText(hasAccessDate ? formatDate(receipt.periodEnd) : "One-time purchase", {
    x: col2X + 16,
    y: 521,
    size: 12,
    font: bold,
    color: textWhite,
  });

  // ========================================================
  // PURCHASE DETAILS SHOWCASE CARD (y: 404, h: 86)
  // ========================================================
  drawRoundedCard(page, leftX, 404, contentWidth, 86, 14, {
    fillColor: bgCard,
    borderColor: accentBorder,
    borderWidth: 1.2,
  });

  // Top header banner background inside card
  drawRoundedCard(page, leftX + 1, 461, contentWidth - 2, 28, 12, {
    fillColor: bgHeaderStrip,
  });
  page.drawLine({
    start: { x: leftX, y: 461 },
    end: { x: rightX, y: 461 },
    thickness: 1,
    color: cardBorder,
  });
  page.drawText("ORDER SUMMARY", {
    x: leftX + 16,
    y: 472,
    size: 8,
    font: bold,
    color: textPurple,
  });

  // Purchase Details Content
  page.drawText(printable(receipt.item), {
    x: leftX + 16,
    y: 439,
    size: 14,
    font: bold,
    color: textWhite,
  });
  page.drawText(`Order ID: ${printable(receipt.reference)} | All taxes included`, {
    x: leftX + 16,
    y: 423,
    size: 9.5,
    font: font,
    color: textMuted,
  });

  const priceStr = formatMoney(receipt.amountMinor, receipt.currency);
  const priceWidth = bold.widthOfTextAtSize(priceStr, 18);
  page.drawText(priceStr, {
    x: rightX - priceWidth - 16,
    y: 432,
    size: 18,
    font: bold,
    color: emeraldGlow,
  });

  // ========================================================
  // SUPPORT TRACKING & DETAILS TABLE (y: 242, h: 136)
  // ========================================================
  page.drawText("PAYMENT & ACCOUNT DETAILS", {
    x: leftX,
    y: 382,
    size: 8.5,
    font: bold,
    color: textPurple,
  });

  const trackingRows: Array<[string, string]> = [
    ["ORDER REFERENCE", receipt.reference],
    ["BILLED TO", receipt.buyerEmail || receipt.buyerName || "Exismic customer"],
    ["PAID VIA", receipt.provider === "razorpay" ? "Razorpay (UPI, Cards & NetBanking)" : "PayPal"],
    ["PAYMENT ID", receipt.providerPaymentId],
    ["TRANSACTION ID", receipt.providerOrderId || receipt.orderId || "N/A"],
  ];

  // Overflow test check
  const isExtraLong =
    trackingRows.some(([, val]) => val.length > 70) ||
    (receipt.buyerName && receipt.buyerName.length > 70);

  if (!isExtraLong) {
    const tableH = 135;
    const tableY = 236;
    drawRoundedCard(page, leftX, tableY, contentWidth, tableH, 12, {
      fillColor: bgCard,
      borderColor: cardBorder,
      borderWidth: 1,
    });

    // Left Column Background strip (x: leftX to leftX + 185)
    page.drawRectangle({
      x: leftX + 1,
      y: tableY + 1,
      width: 185,
      height: tableH - 2,
      color: bgHeaderStrip,
    });

    // Vertical Divider
    page.drawLine({
      start: { x: leftX + 185, y: tableY },
      end: { x: leftX + 185, y: tableY + tableH },
      thickness: 1,
      color: cardBorder,
    });

    // Horizontal Row Dividers (5 rows -> 4 divider lines)
    const rowH = tableH / 5; // 27 points each
    for (let i = 1; i < 5; i++) {
      page.drawLine({
        start: { x: leftX, y: tableY + tableH - i * rowH },
        end: { x: rightX, y: tableY + tableH - i * rowH },
        thickness: 1,
        color: cardBorder,
      });
    }

    // Render Rows
    trackingRows.forEach(([lbl, val], idx) => {
      const rowY = tableY + tableH - (idx + 1) * rowH + 9;
      page.drawText(lbl, { x: leftX + 14, y: rowY, size: 7.5, font: bold, color: textMuted });
      page.drawText(printable(val).slice(0, 52), {
        x: leftX + 199,
        y: rowY,
        size: 9,
        font: bold,
        color: textSilver,
      });
    });
  } else {
    // Multi-page pagination support for overflow payloads
    let currentY = 370;
    const allRows: Array<[string, string]> = [
      ...trackingRows,
      ...(receipt.buyerName && receipt.buyerName.length > 70
        ? [["CUSTOMER NAME", receipt.buyerName] as [string, string]]
        : []),
    ];
    for (const [lbl, val] of allRows) {
      if (currentY < 120) {
        page = pdf.addPage([pageWidth, pageHeight]);
        page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: bgObsidian });
        currentY = 780;
      }
      page.drawText(lbl, { x: leftX, y: currentY, size: 8.5, font: bold, color: textPurple });
      currentY -= 14;
      const cleanVal = printable(val);
      const chunks = cleanVal.match(/.{1,50}/g) || [cleanVal];
      for (const ch of chunks) {
        if (currentY < 80) {
          page = pdf.addPage([pageWidth, pageHeight]);
          page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: bgObsidian });
          currentY = 780;
        }
        page.drawText(ch, { x: leftX, y: currentY, size: 9, font: bold, color: textSilver });
        currentY -= 14;
      }
      currentY -= 10;
    }
  }

  // ========================================================
  // CONFIRMATION & ASSURANCE BANNER (y: 154, h: 56)
  // ========================================================
  drawRoundedCard(page, leftX, 154, contentWidth, 56, 12, {
    fillColor: bgCard,
    borderColor: cardBorder,
    borderWidth: 1,
  });

  // Left side: Verification mark
  page.drawCircle({ x: leftX + 22, y: 191, size: 3.5, color: emeraldGlow });
  page.drawText("Payment Confirmed", {
    x: leftX + 32,
    y: 188,
    size: 10,
    font: bold,
    color: emeraldGlow,
  });
  page.drawText("Thank you for your purchase. Keep this official receipt for your records.", {
    x: leftX + 16,
    y: 172,
    size: 8.5,
    font: font,
    color: textMuted,
  });

  // Right side: Support Link
  const supportText = "billing@exismic.xyz";
  const supportWidth = bold.widthOfTextAtSize(supportText, 9.5);
  page.drawText(supportText, {
    x: rightX - supportWidth - 16,
    y: 180,
    size: 9.5,
    font: bold,
    color: cyanGlow,
  });
  page.drawText("Questions?", {
    x: rightX - supportWidth - 16,
    y: 194,
    size: 8,
    font: bold,
    color: textMuted,
  });

  // ========================================================
  // FOOTER (y: 72 to 118)
  // ========================================================
  page.drawLine({
    start: { x: leftX, y: 124 },
    end: { x: rightX, y: 124 },
    thickness: 1,
    color: cardBorder,
  });

  page.drawText("Exismic", { x: leftX, y: 104, size: 10.5, font: bold, color: textWhite });
  page.drawText("Official Purchase Receipt | All rights reserved.", {
    x: leftX,
    y: 89,
    size: 8.5,
    font: font,
    color: textMuted,
  });

  const footerRight1 = "Thank you for creating with Exismic.";
  const footerRight1Width = font.widthOfTextAtSize(footerRight1, 8.5);
  page.drawText(footerRight1, {
    x: rightX - footerRight1Width,
    y: 104,
    size: 8.5,
    font: font,
    color: textMuted,
  });

  const footerRight2 = "exismic.xyz";
  const footerRight2Width = bold.widthOfTextAtSize(footerRight2, 8.5);
  page.drawText(footerRight2, {
    x: rightX - footerRight2Width,
    y: 89,
    size: 8.5,
    font: bold,
    color: cyanGlow,
  });

  return Buffer.from(await pdf.save());
}
