import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface DemoPdfSpec {
  name: string;
  file: File;
  pageCount: number;
}

/**
 * Creates 3 distinct, professional PDF documents in-browser using pdf-lib ($0 compute)
 * for instant demo testing and 1-click evaluation of PDF tools without needing local files.
 */
export async function generateDemoPdfs(): Promise<File[]> {
  const [doc1Bytes, doc2Bytes, doc3Bytes] = await Promise.all([
    generateFinancialReport(),
    generateProjectRoadmap(),
    generateClientInvoice(),
  ]);

  const file1 = new File([doc1Bytes as unknown as BlobPart], "Q3_Financial_Summary.pdf", {
    type: "application/pdf",
  });
  const file2 = new File([doc2Bytes as unknown as BlobPart], "Project_Milestones_Roadmap.pdf", {
    type: "application/pdf",
  });
  const file3 = new File([doc3Bytes as unknown as BlobPart], "Client_Invoice_INV-8492.pdf", {
    type: "application/pdf",
  });

  return [file1, file2, file3];
}

async function generateFinancialReport(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Page 1: Executive Overview
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Header band
  page1.drawRectangle({
    x: 0,
    y: height - 90,
    width,
    height: 90,
    color: rgb(0.85, 0.12, 0.2), // Crimson red accent
  });

  page1.drawText("EXISMIC CORP — FINANCIAL PERFORMANCE", {
    x: 48,
    y: height - 48,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText("Q3 Executive Balance & Audited Earnings Overview", {
    x: 48,
    y: height - 68,
    size: 10,
    font: fontRegular,
    color: rgb(1, 0.9, 0.92),
  });

  // KPI Metric Cards
  let cardX = 48;
  const metrics = [
    { label: "TOTAL REVENUE", val: "$4,280,000", change: "+18.4% YoY" },
    { label: "NET INCOME", val: "$1,640,000", change: "+24.2% YoY" },
    { label: "GROSS MARGIN", val: "76.4%", change: "+3.1% YoY" },
  ];

  metrics.forEach((m) => {
    page1.drawRectangle({
      x: cardX,
      y: height - 190,
      width: 155,
      height: 70,
      color: rgb(0.96, 0.96, 0.98),
      borderColor: rgb(0.85, 0.85, 0.9),
      borderWidth: 1,
    });

    page1.drawText(m.label, {
      x: cardX + 14,
      y: height - 145,
      size: 8,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.45),
    });

    page1.drawText(m.val, {
      x: cardX + 14,
      y: height - 168,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.12),
    });

    page1.drawText(m.change, {
      x: cardX + 14,
      y: height - 182,
      size: 8,
      font: fontRegular,
      color: rgb(0.1, 0.6, 0.3),
    });

    cardX += 172;
  });

  // Section Body
  page1.drawText("1. Executive Summary & Operations Review", {
    x: 48,
    y: height - 230,
    size: 12,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.2),
  });

  const lines = [
    "During the third fiscal quarter, operating profitability expanded across all commercial products.",
    "Gross bookings outpaced forecasted estimates by 14.8%, driven by enhanced user retention and",
    "the deployment of next-generation digital workflow tools. Cash reserves remain exceptionally",
    "healthy at $12.4M with zero outstanding short-term debt instruments.",
  ];

  let textY = height - 252;
  lines.forEach((l) => {
    page1.drawText(l, {
      x: 48,
      y: textY,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.3),
    });
    textY -= 16;
  });

  // Footer
  page1.drawText("Page 1 of 2  •  Confidential Corporate Record", {
    x: 48,
    y: 36,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.55),
  });

  // Page 2: Regional Revenue Breakdown
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawRectangle({
    x: 0,
    y: height - 70,
    width,
    height: 70,
    color: rgb(0.12, 0.12, 0.16),
  });

  page2.drawText("EXISMIC CORP — REGIONAL BREAKDOWN & SIGN-OFF", {
    x: 48,
    y: height - 42,
    size: 13,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page2.drawText("2. Regional Market Contributions", {
    x: 48,
    y: height - 110,
    size: 12,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.2),
  });

  const regions = [
    { name: "North America (Enterprise)", rev: "$2,140,000", pct: "50.0%" },
    { name: "Europe & United Kingdom", rev: "$1,280,000", pct: "29.9%" },
    { name: "Asia Pacific & Japan", rev: "$640,000", pct: "15.0%" },
    { name: "Latin America & Emerging", rev: "$220,000", pct: "5.1%" },
  ];

  let rowY = height - 140;
  regions.forEach((r) => {
    page2.drawRectangle({
      x: 48,
      y: rowY - 6,
      width: width - 96,
      height: 28,
      color: rgb(0.97, 0.97, 0.98),
      borderColor: rgb(0.9, 0.9, 0.92),
      borderWidth: 0.5,
    });

    page2.drawText(r.name, {
      x: 60,
      y: rowY + 6,
      size: 9,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.25),
    });

    page2.drawText(r.rev, {
      x: 360,
      y: rowY + 6,
      size: 9,
      font: fontRegular,
      color: rgb(0.15, 0.15, 0.2),
    });

    page2.drawText(r.pct, {
      x: 480,
      y: rowY + 6,
      size: 9,
      font: fontBold,
      color: rgb(0.85, 0.12, 0.2),
    });

    rowY -= 36;
  });

  page2.drawText("Authorized Sign-off: Chief Financial Officer & Senior Controller", {
    x: 48,
    y: height - 340,
    size: 9,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.25),
  });

  page2.drawRectangle({
    x: 48,
    y: height - 410,
    width: 220,
    height: 50,
    color: rgb(0.98, 0.98, 0.99),
    borderColor: rgb(0.8, 0.8, 0.85),
    borderWidth: 1,
  });

  page2.drawText("Electronically Verified & Stamped", {
    x: 60,
    y: height - 385,
    size: 8,
    font: fontBold,
    color: rgb(0.2, 0.55, 0.3),
  });

  page2.drawText("Page 2 of 2  •  Confidential Corporate Record", {
    x: 48,
    y: 36,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.55),
  });

  return pdfDoc.save();
}

async function generateProjectRoadmap(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Top Banner
  page.drawRectangle({
    x: 0,
    y: height - 85,
    width,
    height: 85,
    color: rgb(0.1, 0.12, 0.18),
  });

  page.drawText("SYSTEMS ARCHITECTURE & PRODUCT ROADMAP", {
    x: 48,
    y: height - 44,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("2026 Strategic Deliverables & Cloud Milestone Schedule", {
    x: 48,
    y: height - 64,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.8, 0.85, 0.95),
  });

  const milestones = [
    {
      quarter: "Q1 2026",
      title: "Real-Time Audio & Vector Acceleration",
      desc: "Deploy in-browser 60FPS DSP engines and WebAudio analyzers with zero compute cost.",
      status: "COMPLETED",
    },
    {
      quarter: "Q2 2026",
      title: "Zero-Trust Document Vault & Streaming Pipeline",
      desc: "Implement client-scoped memory processing for confidential PDF and image workflows.",
      status: "IN PRODUCTION",
    },
    {
      quarter: "Q3 2026",
      title: "Cross-Tool Reactive Piping & Handoffs",
      desc: "Connect audio, image, and document tools with seamless 1-click artifact transfer.",
      status: "ACTIVE LAUNCH",
    },
    {
      quarter: "Q4 2026",
      title: "Enterprise Multi-User Cloud Synchronization",
      desc: "Enable team workspaces, shared presets, and unified billing governance.",
      status: "SCHEDULED",
    },
  ];

  let cardY = height - 130;
  milestones.forEach((m) => {
    page.drawRectangle({
      x: 48,
      y: cardY - 55,
      width: width - 96,
      height: 70,
      color: rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.88, 0.9, 0.94),
      borderWidth: 1,
    });

    page.drawText(m.quarter, {
      x: 64,
      y: cardY - 4,
      size: 9,
      font: fontBold,
      color: rgb(0.85, 0.12, 0.2),
    });

    page.drawText(m.status, {
      x: 440,
      y: cardY - 4,
      size: 8,
      font: fontBold,
      color: rgb(0.2, 0.5, 0.3),
    });

    page.drawText(m.title, {
      x: 64,
      y: cardY - 22,
      size: 11,
      font: fontBold,
      color: rgb(0.12, 0.14, 0.18),
    });

    page.drawText(m.desc, {
      x: 64,
      y: cardY - 42,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.35, 0.38, 0.44),
    });

    cardY -= 88;
  });

  page.drawText("Document: ROADMAP-2026-V3  •  Engineered by Product Operations", {
    x: 48,
    y: 36,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.55),
  });

  return pdfDoc.save();
}

async function generateClientInvoice(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Header
  page.drawText("TAX INVOICE & RECEIPT", {
    x: 48,
    y: height - 56,
    size: 18,
    font: fontBold,
    color: rgb(0.85, 0.12, 0.2),
  });

  page.drawText("Invoice #: INV-2026-8492  •  Date: September 29, 2026", {
    x: 48,
    y: height - 76,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.45),
  });

  // Client Details Box
  page.drawRectangle({
    x: 48,
    y: height - 170,
    width: width - 96,
    height: 75,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: rgb(0.9, 0.9, 0.92),
    borderWidth: 1,
  });

  page.drawText("ISSUED BY:", {
    x: 64,
    y: height - 114,
    size: 8,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.55),
  });
  page.drawText("Exismic Studio Technologies Ltd.", {
    x: 64,
    y: height - 130,
    size: 10,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.2),
  });
  page.drawText("Suite 400, Global Gateway Tech Center", {
    x: 64,
    y: height - 146,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.4),
  });

  page.drawText("BILLED TO:", {
    x: 320,
    y: height - 114,
    size: 8,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.55),
  });
  page.drawText("Acme Enterprise Systems Inc.", {
    x: 320,
    y: height - 130,
    size: 10,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.2),
  });
  page.drawText("Attn: Accounts Payable & Operations", {
    x: 320,
    y: height - 146,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.4),
  });

  // Line items
  const items = [
    { desc: "High-Performance PDF Vector Engine Integration", qty: "1", rate: "$4,200.00", total: "$4,200.00" },
    { desc: "Client-Side Zero-Latency Memory Processing Layer", qty: "1", rate: "$3,150.00", total: "$3,150.00" },
    { desc: "Obsidian Cyber UI & Accessibility Hardening", qty: "1", rate: "$2,500.00", total: "$2,500.00" },
  ];

  let itemY = height - 230;
  page.drawText("DESCRIPTION", { x: 48, y: itemY, size: 8, font: fontBold, color: rgb(0.4, 0.4, 0.45) });
  page.drawText("QTY", { x: 360, y: itemY, size: 8, font: fontBold, color: rgb(0.4, 0.4, 0.45) });
  page.drawText("RATE", { x: 420, y: itemY, size: 8, font: fontBold, color: rgb(0.4, 0.4, 0.45) });
  page.drawText("TOTAL", { x: 490, y: itemY, size: 8, font: fontBold, color: rgb(0.4, 0.4, 0.45) });

  itemY -= 12;
  page.drawLine({
    start: { x: 48, y: itemY },
    end: { x: width - 48, y: itemY },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.9),
  });

  itemY -= 20;
  items.forEach((it) => {
    page.drawText(it.desc, { x: 48, y: itemY, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.25) });
    page.drawText(it.qty, { x: 365, y: itemY, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.25) });
    page.drawText(it.rate, { x: 420, y: itemY, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.25) });
    page.drawText(it.total, { x: 490, y: itemY, size: 8.5, font: fontBold, color: rgb(0.1, 0.1, 0.15) });
    itemY -= 24;
  });

  itemY -= 10;
  page.drawLine({
    start: { x: 340, y: itemY },
    end: { x: width - 48, y: itemY },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.9),
  });

  itemY -= 24;
  page.drawText("TOTAL PAID IN FULL:", { x: 340, y: itemY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.15) });
  page.drawText("$9,850.00", { x: 480, y: itemY, size: 12, font: fontBold, color: rgb(0.85, 0.12, 0.2) });

  page.drawText("Status: Paid via Corporate Direct Wire  •  Receipt Verified", {
    x: 48,
    y: 36,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.55),
  });

  return pdfDoc.save();
}
