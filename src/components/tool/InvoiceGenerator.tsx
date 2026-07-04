"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Calculator,
  CheckCircle2,
  Crown,
  Download,
  FileText,
  ImagePlus,
  Loader2,
  Palette,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
}

interface InvoiceData {
  invoiceNumber: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  poNumber: string;
  clientName: string;
  clientEmail: string;
  clientTaxId: string;
  clientAddress: string;
  senderName: string;
  senderEmail: string;
  senderTaxId: string;
  senderAddress: string;
  items: InvoiceItem[];
  taxRate: number;
  discountType: "percent" | "fixed";
  discountValue: number;
  shippingFee: number;
  currency: string;
  notes: string;
  paymentInstructions: string;
  themeColor: string;
  template: "modern" | "minimal" | "executive";
  logoDataUrl: string | null;
}

interface AIInvoiceResult {
  invoiceNumber?: string;
  status?: InvoiceData["status"];
  issueDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  poNumber?: string;
  clientName?: string;
  clientEmail?: string;
  clientTaxId?: string;
  clientAddress?: string;
  senderName?: string;
  senderEmail?: string;
  senderTaxId?: string;
  senderAddress?: string;
  items?: Array<Partial<InvoiceItem>>;
  taxRate?: number;
  discountType?: InvoiceData["discountType"];
  discountValue?: number;
  shippingFee?: number;
  currency?: string;
  notes?: string;
  paymentInstructions?: string;
}

interface InvoiceGeneratorProps {
  tool: { name?: string } | null;
  category: { name?: string } | null;
}

const STORAGE_KEY = "lumora_invoice_draft_v2";
const A4_SIZE: [number, number] = [595.28, 841.89];

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "\u20ac" },
  { code: "GBP", symbol: "\u00a3" },
  { code: "INR", symbol: "\u20b9" },
  { code: "JPY", symbol: "\u00a5" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "C$" },
];

const THEME_COLORS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Slate", hex: "#475569" },
];

const TEMPLATE_OPTIONS = [
  { id: "modern", label: "Modern", description: "Bold header with clean SaaS styling" },
  { id: "minimal", label: "Minimal", description: "Airy monochrome layout with accent line" },
  { id: "executive", label: "Executive", description: "Premium side rail and formal structure" },
] as const;

const STATUS_STYLES: Record<InvoiceData["status"], string> = {
  Draft: "bg-zinc-500/10 text-zinc-300 border-zinc-400/20",
  Sent: "bg-cyan-400/10 text-cyan-200 border-cyan-300/20",
  Paid: "bg-emerald-400/10 text-emerald-200 border-emerald-300/20",
  Overdue: "bg-rose-400/10 text-rose-200 border-rose-300/20",
};

function createDefaultInvoice(invoiceNumber?: string): InvoiceData {
  const now = new Date();
  const due = new Date();
  due.setDate(now.getDate() + 14);

  return {
    invoiceNumber: invoiceNumber ?? `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "Draft",
    issueDate: now.toISOString().split("T")[0],
    dueDate: due.toISOString().split("T")[0],
    paymentTerms: "Net 14",
    poNumber: "",
    clientName: "",
    clientEmail: "",
    clientTaxId: "",
    clientAddress: "",
    senderName: "",
    senderEmail: "",
    senderTaxId: "",
    senderAddress: "",
    items: [
      { id: "1", description: "Web Development Services", quantity: 1, unit: "project", price: 500 },
    ],
    taxRate: 0,
    discountType: "percent",
    discountValue: 0,
    shippingFee: 0,
    currency: "USD",
    notes: "Thank you for your business.",
    paymentInstructions: "Please pay within the agreed payment term. Include the invoice number in the payment reference.",
    themeColor: "#6366f1",
    template: "modern",
    logoDataUrl: null,
  };
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0.39, g: 0.4, b: 0.95 };
}

function getCurrency(currency: string) {
  return CURRENCIES.find((item) => item.code === currency) || CURRENCIES[0];
}

function formatMoney(value: number, currency: string, useCode = false) {
  const amount = Number.isFinite(value) ? value : 0;
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const selected = getCurrency(currency);
  return useCode ? `${selected.code} ${formatted}` : `${selected.symbol}${formatted}`;
}

function sanitizePdfText(value: string) {
  return value
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const clean = sanitizePdfText(text || "");
  const words = clean.split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, size) <= maxWidth) {
      line = testLine;
      return;
    }

    if (line) lines.push(line);
    line = word;
  });

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawWrappedText(params: {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  size: number;
  font: PDFFont;
  color: RGB;
  lineHeight?: number;
}) {
  const lineHeight = params.lineHeight ?? params.size + 4;
  const lines = wrapText(params.text, params.font, params.size, params.maxWidth);
  lines.forEach((line, index) => {
    params.page.drawText(line, {
      x: params.x,
      y: params.y - index * lineHeight,
      size: params.size,
      font: params.font,
      color: params.color,
    });
  });
  return params.y - lines.length * lineHeight;
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1];
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

export function InvoiceGeneratorClient({ tool, category }: InvoiceGeneratorProps) {
  const { isPro, user } = usePro();
  const [data, setData] = useState<InvoiceData>(() => createDefaultInvoice("INV-0000"));
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [aiBrief, setAiBrief] = useState("");
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "done">("idle");
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        setData(saved ? JSON.parse(saved) as InvoiceData : createDefaultInvoice());
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const subtotal = useMemo(
    () => data.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [data.items],
  );

  const discountAmount = useMemo(() => {
    const raw = data.discountType === "percent" ? (subtotal * data.discountValue) / 100 : data.discountValue;
    return Math.min(Math.max(raw, 0), subtotal);
  }, [data.discountType, data.discountValue, subtotal]);

  const taxableBase = useMemo(() => Math.max(0, subtotal - discountAmount), [discountAmount, subtotal]);
  const taxAmount = useMemo(() => (taxableBase * data.taxRate) / 100, [data.taxRate, taxableBase]);
  const total = useMemo(() => taxableBase + taxAmount + data.shippingFee, [data.shippingFee, taxAmount, taxableBase]);
  const currency = getCurrency(data.currency);

  const completion = useMemo(() => {
    const fields = [
      data.invoiceNumber,
      data.issueDate,
      data.dueDate,
      data.senderName,
      data.senderAddress,
      data.clientName,
      data.clientAddress,
      data.items.some((item) => item.description && item.price > 0) ? "items" : "",
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [data]);

  const missingFields = useMemo(() => {
    const warnings = [];
    if (!data.senderName) warnings.push("Sender name");
    if (!data.clientName) warnings.push("Client name");
    if (!data.dueDate) warnings.push("Due date");
    if (!data.items.some((item) => item.description && item.price > 0)) warnings.push("Line item");
    return warnings;
  }, [data]);

  const updateData = <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: crypto.randomUUID(), description: "", quantity: 1, unit: "item", price: 0 },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? prev.items : prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateItem = <K extends keyof InvoiceItem>(id: string, field: K, value: InvoiceItem[K]) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const fillSample = () => {
    setData((prev) => ({
      ...prev,
      senderName: "Lumora Studio",
      senderEmail: "billing@lumora.ai",
      senderTaxId: "TAX-47291",
      senderAddress: "221 Studio Avenue\nSan Francisco, CA 94103",
      clientName: "Northstar Creative LLC",
      clientEmail: "finance@northstar.example",
      clientTaxId: "VAT-90218",
      clientAddress: "88 Harbor Road\nAustin, TX 78701",
      paymentTerms: "Net 14",
      poNumber: "PO-2026-114",
      taxRate: 8.25,
      discountType: "percent",
      discountValue: 5,
      items: [
        { id: crypto.randomUUID(), description: "Brand identity system and creative direction", quantity: 1, unit: "project", price: 2200 },
        { id: crypto.randomUUID(), description: "Landing page design and responsive implementation", quantity: 1, unit: "project", price: 1800 },
        { id: crypto.randomUUID(), description: "Monthly AI workflow consulting retainer", quantity: 10, unit: "hour", price: 120 },
      ],
    }));
  };

  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setDraftNotice("Draft saved on this device.");
    window.setTimeout(() => setDraftNotice(null), 2500);
  };

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(createDefaultInvoice());
    setDraftNotice("Draft cleared.");
    window.setTimeout(() => setDraftNotice(null), 2500);
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => updateData("logoDataUrl", String(reader.result));
    reader.readAsDataURL(file);
  };

  const applyLumoraAI = async () => {
    if (!isPro || !aiBrief.trim()) return;
    setAiStatus("thinking");
    setAiError(null);

    try {
      const response = await fetch("/api/tools/invoice-generator/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: aiBrief.trim() }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Lumora AI could not build this invoice.");
      }

      const invoice = (payload.invoice || {}) as AIInvoiceResult;
      const invoiceNumber = invoice.invoiceNumber || `INV-${Math.floor(10000 + Math.random() * 90000)}`;
      const allowedStatus = ["Draft", "Sent", "Paid", "Overdue"].includes(invoice.status || "")
        ? invoice.status
        : "Draft";
      const cleanItems = (invoice.items || [])
        .map((item) => ({
          id: crypto.randomUUID(),
          description: String(item.description || "Professional services").slice(0, 120),
          quantity: Math.max(0.01, Number(item.quantity) || 1),
          unit: String(item.unit || "service").slice(0, 24),
          price: Math.max(0, Number(item.price) || 0),
        }))
        .filter((item) => item.price > 0)
        .slice(0, 8);
      const selectedCurrency = CURRENCIES.some((currency) => currency.code === invoice.currency)
        ? invoice.currency
        : undefined;

      setData((prev) => ({
        ...prev,
        invoiceNumber,
        status: allowedStatus as InvoiceData["status"],
        issueDate: invoice.issueDate || prev.issueDate,
        dueDate: invoice.dueDate || prev.dueDate,
        paymentTerms: invoice.paymentTerms || prev.paymentTerms,
        poNumber: invoice.poNumber || prev.poNumber,
        clientName: invoice.clientName || prev.clientName,
        clientEmail: invoice.clientEmail || prev.clientEmail,
        clientTaxId: invoice.clientTaxId || prev.clientTaxId,
        clientAddress: invoice.clientAddress || prev.clientAddress,
        senderName: invoice.senderName || prev.senderName,
        senderEmail: invoice.senderEmail || prev.senderEmail,
        senderTaxId: invoice.senderTaxId || prev.senderTaxId,
        senderAddress: invoice.senderAddress || prev.senderAddress,
        items: cleanItems.length ? cleanItems : prev.items,
        taxRate: Math.max(0, Math.min(100, Number(invoice.taxRate) || 0)),
        discountType: invoice.discountType === "fixed" ? "fixed" : "percent",
        discountValue: Math.max(0, Number(invoice.discountValue) || 0),
        shippingFee: Math.max(0, Number(invoice.shippingFee) || 0),
        currency: selectedCurrency || prev.currency,
        template: "executive",
        themeColor: "#06b6d4",
        notes: invoice.notes || "Thank you for trusting us with this work. This invoice has been organized from the project brief for clear approval and fast payment.",
        paymentInstructions: invoice.paymentInstructions || `Please include invoice ${invoiceNumber} in the payment reference. Contact us if any billing detail needs adjustment.`,
      }));
      setAiStatus("done");
      window.setTimeout(() => setAiStatus("idle"), 2500);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Lumora AI could not build this invoice.");
      setAiStatus("idle");
    }
  };

  const saveToHistory = async () => {
    setSaveStatus("saving");
    try {
      const response = await fetch("/api/files/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: "invoice-generator",
          originalName: `Invoice ${data.invoiceNumber}`,
          fileType: "pdf",
          status: "completed",
          metadata: { ...data, total, subtotal, discountAmount, taxAmount },
          resultUrl: null,
        }),
      });

      setSaveStatus(response.ok ? "saved" : "idle");
      window.setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Invoice history save failed:", error);
      setSaveStatus("idle");
    }
  };

  const drawPdfHeader = async (
    pdfDoc: PDFDocument,
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont },
    accent: RGB,
    pageNumber: number,
  ) => {
    const { width, height } = page.getSize();
    const textColor = rgb(0.08, 0.08, 0.1);
    const mutedColor = rgb(0.42, 0.45, 0.5);

    if (data.template === "modern") {
      page.drawRectangle({ x: 0, y: height - 118, width, height: 118, color: accent });
      page.drawText("INVOICE", { x: 42, y: height - 68, size: 33, font: fonts.bold, color: rgb(1, 1, 1) });
      page.drawText(`# ${sanitizePdfText(data.invoiceNumber)}`, { x: width - 185, y: height - 54, size: 13, font: fonts.bold, color: rgb(1, 1, 1) });
      page.drawText(`Issue: ${data.issueDate}`, { x: width - 185, y: height - 76, size: 9, font: fonts.regular, color: rgb(1, 1, 1) });
      page.drawText(`Due: ${data.dueDate}`, { x: width - 185, y: height - 92, size: 9, font: fonts.regular, color: rgb(1, 1, 1) });
    } else if (data.template === "executive") {
      page.drawRectangle({ x: 0, y: 0, width: 16, height, color: accent });
      page.drawText("INVOICE", { x: 44, y: height - 72, size: 34, font: fonts.bold, color: textColor });
      page.drawLine({ start: { x: 44, y: height - 94 }, end: { x: width - 42, y: height - 94 }, thickness: 1.4, color: accent });
      page.drawText(`# ${sanitizePdfText(data.invoiceNumber)}`, { x: width - 188, y: height - 60, size: 13, font: fonts.bold, color: textColor });
      page.drawText(`Due ${data.dueDate}`, { x: width - 188, y: height - 78, size: 9, font: fonts.regular, color: mutedColor });
    } else {
      page.drawText("INVOICE", { x: 42, y: height - 64, size: 31, font: fonts.bold, color: textColor });
      page.drawText(`# ${sanitizePdfText(data.invoiceNumber)}`, { x: width - 182, y: height - 58, size: 12, font: fonts.bold, color: textColor });
      page.drawLine({ start: { x: 42, y: height - 88 }, end: { x: width - 42, y: height - 88 }, thickness: 1, color: accent });
    }

    if (data.logoDataUrl) {
      try {
        const bytes = dataUrlToBytes(data.logoDataUrl);
        const image = data.logoDataUrl.includes("image/png")
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes);
        page.drawImage(image, { x: 42, y: height - 150, width: 52, height: 52 });
      } catch (error) {
        console.warn("Logo embed failed:", error);
      }
    }

    page.drawText(`Page ${pageNumber}`, { x: width - 82, y: 26, size: 8, font: fonts.regular, color: mutedColor });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const theme = hexToRgb(data.themeColor);
      const accent = rgb(theme.r, theme.g, theme.b);
      const textColor = rgb(0.1, 0.1, 0.12);
      const mutedColor = rgb(0.42, 0.45, 0.5);
      const lightColor = rgb(0.94, 0.95, 0.97);
      let pageNumber = 1;
      let page = pdfDoc.addPage(A4_SIZE);
      await drawPdfHeader(pdfDoc, page, { regular, bold }, accent, pageNumber);
      let { width, height } = page.getSize();

      const newPage = async () => {
        pageNumber += 1;
        page = pdfDoc.addPage(A4_SIZE);
        await drawPdfHeader(pdfDoc, page, { regular, bold }, accent, pageNumber);
        width = page.getSize().width;
        height = page.getSize().height;
        return height - 138;
      };

      const topOffset = data.logoDataUrl ? 178 : 148;
      let y = height - topOffset;
      const senderX = 42;
      const clientX = width / 2 + 4;

      page.drawText("FROM", { x: senderX, y, size: 9, font: bold, color: accent });
      page.drawText("BILL TO", { x: clientX, y, size: 9, font: bold, color: accent });
      y -= 20;

      const senderLines = [
        data.senderName || "Your Company",
        data.senderEmail || "email@example.com",
        data.senderTaxId ? `Tax ID: ${data.senderTaxId}` : "",
        data.senderAddress || "Your address",
      ].filter(Boolean);
      const clientLines = [
        data.clientName || "Client Name",
        data.clientEmail || "client@example.com",
        data.clientTaxId ? `Tax ID: ${data.clientTaxId}` : "",
        data.clientAddress || "Client address",
      ].filter(Boolean);

      let blockY = y;
      senderLines.forEach((line, index) => {
        blockY = drawWrappedText({
          page,
          text: line,
          x: senderX,
          y: y - index * 16,
          maxWidth: 225,
          size: index === 0 ? 11 : 9,
          font: index === 0 ? bold : regular,
          color: index === 0 ? textColor : mutedColor,
          lineHeight: 12,
        });
      });

      let clientBlockY = y;
      clientLines.forEach((line, index) => {
        clientBlockY = drawWrappedText({
          page,
          text: line,
          x: clientX,
          y: y - index * 16,
          maxWidth: 220,
          size: index === 0 ? 11 : 9,
          font: index === 0 ? bold : regular,
          color: index === 0 ? textColor : mutedColor,
          lineHeight: 12,
        });
      });

      y = Math.min(blockY, clientBlockY) - 34;

      const metaRows = [
        ["Status", data.status],
        ["Terms", data.paymentTerms],
        ["PO", data.poNumber || "-"],
      ];
      page.drawRectangle({ x: 42, y: y - 34, width: width - 84, height: 38, color: lightColor });
      metaRows.forEach(([label, value], index) => {
        const x = 62 + index * 160;
        page.drawText(label.toUpperCase(), { x, y: y - 9, size: 7, font: bold, color: mutedColor });
        page.drawText(sanitizePdfText(value), { x, y: y - 24, size: 10, font: bold, color: textColor });
      });
      y -= 78;

      const drawTableHeader = () => {
        page.drawRectangle({ x: 42, y: y - 8, width: width - 84, height: 28, color: data.template === "minimal" ? lightColor : accent });
        const headerColor = data.template === "minimal" ? textColor : rgb(1, 1, 1);
        page.drawText("Description", { x: 54, y: y + 2, size: 9, font: bold, color: headerColor });
        page.drawText("Qty", { x: 332, y: y + 2, size: 9, font: bold, color: headerColor });
        page.drawText("Unit", { x: 380, y: y + 2, size: 9, font: bold, color: headerColor });
        page.drawText("Price", { x: 438, y: y + 2, size: 9, font: bold, color: headerColor });
        page.drawText("Total", { x: 512, y: y + 2, size: 9, font: bold, color: headerColor });
        y -= 34;
      };

      drawTableHeader();

      for (const item of data.items) {
        const descLines = wrapText(item.description || "Service", regular, 9, 250);
        const rowHeight = Math.max(28, descLines.length * 12 + 10);
        if (y - rowHeight < 150) {
          y = await newPage();
          drawTableHeader();
        }

        descLines.forEach((line, lineIndex) => {
          page.drawText(line, { x: 54, y: y - lineIndex * 12, size: 9, font: regular, color: textColor });
        });
        page.drawText(String(item.quantity), { x: 334, y, size: 9, font: regular, color: textColor });
        page.drawText(sanitizePdfText(item.unit || "item"), { x: 380, y, size: 9, font: regular, color: mutedColor });
        page.drawText(formatMoney(item.price, data.currency, true), { x: 428, y, size: 9, font: regular, color: textColor });
        page.drawText(formatMoney(item.quantity * item.price, data.currency, true), { x: 500, y, size: 9, font: bold, color: textColor });
        y -= rowHeight;
        page.drawLine({ start: { x: 42, y: y + 12 }, end: { x: width - 42, y: y + 12 }, thickness: 0.45, color: rgb(0.88, 0.89, 0.91) });
      }

      if (y < 265) y = await newPage();

      const totalsX = width - 224;
      const totalRows = [
        ["Subtotal", subtotal],
        [`Discount${data.discountType === "percent" ? ` (${data.discountValue}%)` : ""}`, -discountAmount],
        [`Tax (${data.taxRate}%)`, taxAmount],
        ["Fees / shipping", data.shippingFee],
      ].filter(([, value]) => Math.abs(Number(value)) > 0 || String(value) === String(subtotal));

      totalRows.forEach(([label, value], index) => {
        const rowY = y - index * 19;
        page.drawText(String(label), { x: totalsX, y: rowY, size: 9, font: regular, color: mutedColor });
        page.drawText(formatMoney(Number(value), data.currency, true), { x: totalsX + 108, y: rowY, size: 9, font: bold, color: textColor });
      });

      y -= totalRows.length * 19 + 16;
      page.drawRectangle({ x: totalsX - 12, y: y - 12, width: 192, height: 36, color: accent });
      page.drawText("TOTAL", { x: totalsX, y: y, size: 12, font: bold, color: rgb(1, 1, 1) });
      page.drawText(formatMoney(total, data.currency, true), { x: totalsX + 88, y, size: 12, font: bold, color: rgb(1, 1, 1) });

      const notesY = y - 54;
      if (notesY < 112) y = await newPage();
      else y = notesY;

      page.drawText("NOTES", { x: 42, y, size: 9, font: bold, color: accent });
      y = drawWrappedText({ page, text: data.notes, x: 42, y: y - 17, maxWidth: 245, size: 9, font: regular, color: mutedColor, lineHeight: 12 });

      page.drawText("PAYMENT", { x: 322, y: y + 17, size: 9, font: bold, color: accent });
      drawWrappedText({ page, text: data.paymentInstructions, x: 322, y, maxWidth: 220, size: 9, font: regular, color: mutedColor, lineHeight: 12 });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${data.invoiceNumber || "lumora"}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      if (user) await saveToHistory();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.08),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] [background-size:52px_52px] opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-28 space-y-8">
        <header className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-indigo-300/20 bg-indigo-400/10 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
                <ReceiptText className="h-8 w-8 text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">
                  {category?.name || "Productivity"} / Professional billing
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
                  {tool?.name || "Invoice Generator"}
                </h1>
              </div>
            </motion.div>
            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-zinc-400 font-medium">
              Build polished invoices with tax, discounts, payment terms, client details, local drafts, live preview, and reliable multi-page PDF export.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-3">
            <button onClick={fillSample} className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black uppercase text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2">
              <Wand2 size={15} />
              Sample
            </button>
            <button onClick={saveDraft} className="min-h-12 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 text-xs font-black uppercase text-cyan-100 transition-all flex items-center justify-center gap-2">
              <Save size={15} />
              Save Draft
            </button>
            <button onClick={clearDraft} className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black uppercase text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2">
              <RefreshCw size={15} />
              New
            </button>
          </div>
        </header>

        {(draftNotice || saveStatus === "saved") && (
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-4 text-sm font-bold text-emerald-200 flex items-center gap-3">
            <CheckCircle2 size={18} />
            {draftNotice || "Invoice saved to history."}
          </div>
        )}

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-5 space-y-6">
            <Card title="Lumora AI" icon={Sparkles}>
              <div className="space-y-4">
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black/25 text-cyan-200">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">Brief to advanced invoice</p>
                      <p className="mt-1 text-xs font-medium leading-relaxed text-cyan-100/70">
                        Pro-only: describe the client, work, amounts, due date, tax, and discount. Lumora AI fills the invoice cleanly.
                      </p>
                    </div>
                  </div>
                </div>
                <textarea
                  value={aiBrief}
                  onChange={(event) => setAiBrief(event.target.value)}
                  disabled={!isPro}
                  placeholder="Example: Create an invoice for Northstar Creative for brand identity $2200, landing page $1800, consulting 10 hours at $120, tax 8.25%, discount 5%, due in 14 days..."
                  className={cn(textareaClass, "min-h-32", !isPro && "opacity-60")}
                />
                {isPro ? (
                  <button
                    onClick={applyLumoraAI}
                    disabled={!aiBrief.trim() || aiStatus === "thinking"}
                    className="relative flex min-h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-300 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_60px_rgba(6,182,212,0.2)] transition-all hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 bg-white/20 translate-x-[-120%] skew-x-12 transition-transform duration-1000 hover:translate-x-[120%]" />
                    {aiStatus === "thinking" ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
                    {aiStatus === "thinking" ? "Lumora AI Building..." : aiStatus === "done" ? "Invoice Filled" : "Generate With Lumora AI"}
                  </button>
                ) : (
                  <Link
                    href="/pro"
                    className="relative flex min-h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-amber-300/20 bg-amber-300/10 text-xs font-black uppercase tracking-[0.18em] text-amber-100 transition-all hover:bg-amber-300/15 active:scale-95"
                  >
                    <Crown size={17} />
                    Upgrade for Lumora AI
                  </Link>
                )}
                {aiError && (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs font-bold leading-relaxed text-rose-100">
                    {aiError}
                  </div>
                )}
              </div>
            </Card>

            <Card title="Invoice Setup" icon={Settings}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Invoice Number">
                  <input value={data.invoiceNumber} onChange={(event) => updateData("invoiceNumber", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Status">
                  <select value={data.status} onChange={(event) => updateData("status", event.target.value as InvoiceData["status"])} className={inputClass}>
                    {(["Draft", "Sent", "Paid", "Overdue"] as const).map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </Field>
                <Field label="Issue Date">
                  <input type="date" value={data.issueDate} onChange={(event) => updateData("issueDate", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Due Date">
                  <input type="date" value={data.dueDate} onChange={(event) => updateData("dueDate", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Payment Terms">
                  <input value={data.paymentTerms} onChange={(event) => updateData("paymentTerms", event.target.value)} placeholder="Net 14" className={inputClass} />
                </Field>
                <Field label="PO Number">
                  <input value={data.poNumber} onChange={(event) => updateData("poNumber", event.target.value)} placeholder="Optional" className={inputClass} />
                </Field>
              </div>
            </Card>

            <Card title="Business Details" icon={Building2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <SectionLabel>Sender</SectionLabel>
                  <input value={data.senderName} onChange={(event) => updateData("senderName", event.target.value)} placeholder="Your company" className={inputClass} />
                  <input value={data.senderEmail} onChange={(event) => updateData("senderEmail", event.target.value)} placeholder="billing@example.com" className={inputClass} />
                  <input value={data.senderTaxId} onChange={(event) => updateData("senderTaxId", event.target.value)} placeholder="Tax / GST / VAT ID" className={inputClass} />
                  <textarea value={data.senderAddress} onChange={(event) => updateData("senderAddress", event.target.value)} placeholder="Your address" className={textareaClass} />
                </div>
                <div className="space-y-3">
                  <SectionLabel>Client</SectionLabel>
                  <input value={data.clientName} onChange={(event) => updateData("clientName", event.target.value)} placeholder="Client company" className={inputClass} />
                  <input value={data.clientEmail} onChange={(event) => updateData("clientEmail", event.target.value)} placeholder="client@example.com" className={inputClass} />
                  <input value={data.clientTaxId} onChange={(event) => updateData("clientTaxId", event.target.value)} placeholder="Client tax ID" className={inputClass} />
                  <textarea value={data.clientAddress} onChange={(event) => updateData("clientAddress", event.target.value)} placeholder="Client address" className={textareaClass} />
                </div>
              </div>
            </Card>

            <Card title="Line Items" icon={Calculator}>
              <div className="space-y-4">
                {data.items.map((item, index) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-zinc-500">Item {index + 1}</p>
                      <button onClick={() => removeItem(item.id)} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} placeholder="Description" className={inputClass} />
                    <div className="grid grid-cols-3 gap-3">
                      <input type="number" min="0" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", Number(event.target.value) || 0)} placeholder="Qty" className={inputClass} />
                      <input value={item.unit} onChange={(event) => updateItem(item.id, "unit", event.target.value)} placeholder="Unit" className={inputClass} />
                      <input type="number" min="0" value={item.price} onChange={(event) => updateItem(item.id, "price", Number(event.target.value) || 0)} placeholder="Price" className={inputClass} />
                    </div>
                  </div>
                ))}
                <button onClick={addItem} className="w-full min-h-12 rounded-2xl border border-dashed border-indigo-300/25 bg-indigo-300/10 text-indigo-100 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-300/15 transition-all">
                  <Plus size={16} />
                  Add Line Item
                </button>
              </div>
            </Card>

            <Card title="Totals & Payment" icon={ReceiptText}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Currency">
                  <select value={data.currency} onChange={(event) => updateData("currency", event.target.value)} className={inputClass}>
                    {CURRENCIES.map((item) => <option key={item.code} value={item.code}>{item.code} ({item.symbol})</option>)}
                  </select>
                </Field>
                <Field label="Tax Rate (%)">
                  <input type="number" min="0" value={data.taxRate} onChange={(event) => updateData("taxRate", Number(event.target.value) || 0)} className={inputClass} />
                </Field>
                <Field label="Discount Type">
                  <select value={data.discountType} onChange={(event) => updateData("discountType", event.target.value as InvoiceData["discountType"])} className={inputClass}>
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </Field>
                <Field label="Discount">
                  <input type="number" min="0" value={data.discountValue} onChange={(event) => updateData("discountValue", Number(event.target.value) || 0)} className={inputClass} />
                </Field>
                <Field label="Fees / Shipping">
                  <input type="number" min="0" value={data.shippingFee} onChange={(event) => updateData("shippingFee", Number(event.target.value) || 0)} className={inputClass} />
                </Field>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <p className="text-[10px] font-black uppercase text-emerald-200/70">Grand Total</p>
                  <p className="mt-1 text-2xl font-black text-white">{formatMoney(total, data.currency)}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <textarea value={data.paymentInstructions} onChange={(event) => updateData("paymentInstructions", event.target.value)} placeholder="Payment instructions" className={textareaClass} />
                <textarea value={data.notes} onChange={(event) => updateData("notes", event.target.value)} placeholder="Notes" className={textareaClass} />
              </div>
            </Card>

            <Card title="Branding" icon={Palette}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TEMPLATE_OPTIONS.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => updateData("template", template.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all active:scale-95",
                        data.template === template.id ? "border-indigo-300/40 bg-indigo-300/15" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                      )}
                    >
                      <p className="text-sm font-black text-white">{template.label}</p>
                      <p className="mt-1 text-[10px] font-medium leading-relaxed text-zinc-500">{template.description}</p>
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => updateData("themeColor", color.hex)}
                      className={cn("h-11 w-11 rounded-full border-2 transition-all", data.themeColor === color.hex ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100")}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-white">Brand Logo</p>
                      <p className="text-xs text-zinc-500 font-medium">Logo upload, templates, colors, and clean PDF exports are free for everyone.</p>
                    </div>
                    <label className="min-h-11 rounded-2xl bg-white text-black px-4 text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-zinc-200 transition-all">
                      <ImagePlus size={15} />
                      Upload Logo
                      <input type="file" accept="image/png,image/jpeg" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                  {data.logoDataUrl && (
                    <div className="mt-4 flex items-center gap-4">
                      <img src={data.logoDataUrl} alt="Invoice logo" className="h-14 w-14 rounded-2xl object-cover bg-white" />
                      <button onClick={() => updateData("logoDataUrl", null)} className="text-xs font-black uppercase text-zinc-500 hover:text-white">Remove logo</button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="xl:col-span-7 xl:sticky xl:top-24 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase text-zinc-400 flex items-center gap-2">
                  <BadgeCheck size={14} className="text-emerald-300" />
                  {completion}% ready
                </div>
                <div className={cn("rounded-full border px-4 py-2 text-[10px] font-black uppercase", STATUS_STYLES[data.status])}>
                  {data.status}
                </div>
                {isPro && (
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase text-cyan-100 flex items-center gap-2">
                    <Sparkles size={13} />
                    Lumora AI Ready
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => window.print()} className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black uppercase text-zinc-300 hover:text-white flex items-center gap-2">
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="group relative min-h-14 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 px-6 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_55px_rgba(99,102,241,0.28),0_0_35px_rgba(6,182,212,0.12)_inset] transition-all hover:scale-[1.02] hover:shadow-[0_24px_70px_rgba(6,182,212,0.24)] active:scale-95 disabled:opacity-60 flex items-center gap-3"
                >
                  <span className="absolute inset-0 bg-white/20 translate-x-[-130%] skew-x-12 transition-transform duration-1000 group-hover:translate-x-[130%]" />
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 border border-white/20">
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  </span>
                  <span className="relative">Generate Premium PDF</span>
                </button>
              </div>
            </div>

            {missingFields.length > 0 && (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm font-medium text-amber-100 flex gap-3">
                <AlertCircle size={18} className="shrink-0" />
                Missing: {missingFields.join(", ")}
              </div>
            )}

            <InvoicePreview data={data} subtotal={subtotal} discountAmount={discountAmount} taxAmount={taxAmount} total={total} currencySymbol={currency.symbol} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatPill label="Subtotal" value={formatMoney(subtotal, data.currency)} />
              <StatPill label="Discount" value={`-${formatMoney(discountAmount, data.currency)}`} />
              <StatPill label="Total" value={formatMoney(total, data.currency)} highlight />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const inputClass = "w-full min-h-12 rounded-2xl border border-white/10 bg-black/35 px-4 text-sm font-bold text-white placeholder:text-zinc-700 outline-none transition-all focus:border-indigo-300/50 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50";
const textareaClass = "w-full min-h-24 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold text-white placeholder:text-zinc-700 outline-none transition-all focus:border-indigo-300/50 focus:ring-4 focus:ring-indigo-500/10 resize-none";

function Card({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-2xl p-5 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-300/20 bg-indigo-300/10">
          <Icon size={18} className="text-indigo-200" />
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 block">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{label}</span>
      {children}
    </label>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{children}</p>;
}

function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4", highlight ? "border-emerald-300/20 bg-emerald-300/10" : "border-white/10 bg-white/[0.035]")}>
      <p className="text-[10px] font-black uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function InvoicePreview({
  data,
  subtotal,
  discountAmount,
  taxAmount,
  total,
  currencySymbol,
}: {
  data: InvoiceData;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  currencySymbol: string;
}) {
  const previewItems = data.items.slice(0, 6);
  const templateClass =
    data.template === "executive"
      ? "border-l-[14px]"
      : data.template === "minimal"
        ? "border-t-[6px]"
        : "";

  return (
    <div className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-3 shadow-[0_35px_100px_rgba(0,0,0,0.45)]">
      <div className={cn("relative mx-auto aspect-[1/1.41] w-full max-w-[760px] overflow-hidden rounded-[1.5rem] bg-white text-black shadow-2xl", templateClass)} style={{ borderColor: data.themeColor }}>
        {data.template === "modern" && <div className="h-24 w-full" style={{ backgroundColor: data.themeColor }} />}
        <div className={cn("absolute inset-0 p-6 sm:p-8", data.template === "modern" && "pt-8 text-white")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {data.logoDataUrl && (
                <img src={data.logoDataUrl} alt="Logo preview" className="h-14 w-14 rounded-2xl bg-white object-cover shadow-md" />
              )}
              <div>
                <h3 className={cn("text-3xl sm:text-4xl font-black tracking-tight", data.template !== "modern" && "text-zinc-950")} style={data.template !== "modern" ? { color: data.themeColor } : undefined}>
                  INVOICE
                </h3>
                <p className={cn("text-xs font-black", data.template === "modern" ? "text-white/75" : "text-zinc-400")}># {data.invoiceNumber}</p>
              </div>
            </div>
            <div className={cn("text-right", data.template === "modern" ? "text-white" : "text-zinc-950")}>
              <p className="text-[9px] font-black uppercase opacity-60">Amount Due</p>
              <p className="text-2xl sm:text-3xl font-black">{currencySymbol}{total.toFixed(2)}</p>
              <p className="mt-1 text-[10px] font-bold opacity-60">Due {data.dueDate || "TBD"}</p>
            </div>
          </div>
        </div>

        <div className={cn("px-6 sm:px-8", data.template === "modern" ? "pt-10" : "pt-24")}>
          <div className="grid grid-cols-2 gap-8 border-b border-zinc-100 pb-7">
            <PreviewParty title="From" name={data.senderName || "Your Company"} email={data.senderEmail} taxId={data.senderTaxId} address={data.senderAddress || "Your address"} color={data.themeColor} />
            <PreviewParty title="Bill To" name={data.clientName || "Client Name"} email={data.clientEmail} taxId={data.clientTaxId} address={data.clientAddress || "Client address"} color={data.themeColor} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <MiniMeta label="Status" value={data.status} />
            <MiniMeta label="Terms" value={data.paymentTerms || "Net 14"} />
            <MiniMeta label="PO" value={data.poNumber || "-"} />
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-12 gap-3 border-b-2 border-zinc-100 pb-3 text-[9px] font-black uppercase text-zinc-400">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            <div className="divide-y divide-zinc-100">
              {previewItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 py-4 text-xs">
                  <div className="col-span-6 font-bold text-zinc-950 line-clamp-2">{item.description || "Project service"}</div>
                  <div className="col-span-2 text-center text-zinc-500">{item.quantity}</div>
                  <div className="col-span-2 text-right text-zinc-500">{currencySymbol}{item.price.toFixed(2)}</div>
                  <div className="col-span-2 text-right font-black text-zinc-950">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-72 space-y-3 text-xs">
              <SummaryRow label="Subtotal" value={`${currencySymbol}${subtotal.toFixed(2)}`} />
              {discountAmount > 0 && <SummaryRow label="Discount" value={`-${currencySymbol}${discountAmount.toFixed(2)}`} />}
              {taxAmount > 0 && <SummaryRow label={`Tax (${data.taxRate}%)`} value={`${currencySymbol}${taxAmount.toFixed(2)}`} />}
              {data.shippingFee > 0 && <SummaryRow label="Fees" value={`${currencySymbol}${data.shippingFee.toFixed(2)}`} />}
              <div className="flex items-center justify-between rounded-2xl px-4 py-3 text-white" style={{ backgroundColor: data.themeColor }}>
                <span className="text-[10px] font-black uppercase tracking-widest">Total</span>
                <span className="text-xl font-black">{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8 text-[10px] text-zinc-500">
            <div>
              <p className="font-black uppercase" style={{ color: data.themeColor }}>Notes</p>
              <p className="mt-2 line-clamp-3">{data.notes}</p>
            </div>
            <div>
              <p className="font-black uppercase" style={{ color: data.themeColor }}>Payment</p>
              <p className="mt-2 line-clamp-3">{data.paymentInstructions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewParty({ title, name, email, taxId, address, color }: { title: string; name: string; email: string; taxId: string; address: string; color: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{title}</p>
      <p className="text-sm font-black text-zinc-950">{name}</p>
      {email && <p className="text-[10px] font-bold text-zinc-500">{email}</p>}
      {taxId && <p className="text-[10px] font-bold text-zinc-500">Tax ID: {taxId}</p>}
      <p className="whitespace-pre-line text-[10px] font-medium leading-relaxed text-zinc-500">{address}</p>
    </div>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-3">
      <p className="text-[8px] font-black uppercase text-zinc-400">{label}</p>
      <p className="mt-1 text-xs font-black text-zinc-900 truncate">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-zinc-500">{label}</span>
      <span className="font-black text-zinc-950">{value}</span>
    </div>
  );
}
