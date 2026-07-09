import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasActiveProAccess } from "@/lib/user-access";
import { createClient } from "@/utils/supabase/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

type InvoiceAIItem = {
  description?: string;
  quantity?: number;
  unit?: string;
  price?: number;
};

type InvoiceAIResult = {
  invoiceNumber?: string;
  status?: "Draft" | "Sent" | "Paid" | "Overdue";
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
  items?: InvoiceAIItem[];
  taxRate?: number;
  discountType?: "percent" | "fixed";
  discountValue?: number;
  shippingFee?: number;
  currency?: string;
  notes?: string;
  paymentInstructions?: string;
};

const CURRENCIES = new Set(["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"]);
const STATUSES = new Set(["Draft", "Sent", "Paid", "Overdue"]);

function sanitizeText(value: unknown, fallback = "", limit = 160) {
  if (typeof value !== "string") return fallback;
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, limit) || fallback;
}

function sanitizeMultiline(value: unknown, fallback = "", limit = 420) {
  if (typeof value !== "string") return fallback;
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ").trim().slice(0, limit) || fallback;
}

function numberInRange(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function isoDateOr(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString().split("T")[0];
}

function extractJson(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Groq returned an invalid invoice response.");
    }
    return JSON.parse(content.slice(start, end + 1));
  }
}

function sanitizeInvoice(raw: InvoiceAIResult): InvoiceAIResult {
  const now = new Date();
  const fallbackDue = new Date(now);
  fallbackDue.setDate(now.getDate() + 14);
  const issueDate = isoDateOr(raw.issueDate, now.toISOString().split("T")[0]);
  const dueDate = isoDateOr(raw.dueDate, fallbackDue.toISOString().split("T")[0]);
  const items = (Array.isArray(raw.items) ? raw.items : [])
    .map((item) => ({
      description: sanitizeText(item.description, "Professional services", 120),
      quantity: numberInRange(item.quantity, 1, 0.01, 9999),
      unit: sanitizeText(item.unit, "service", 24),
      price: numberInRange(item.price, 0, 0, 9999999),
    }))
    .filter((item) => item.description && item.price > 0)
    .slice(0, 8);

  return {
    invoiceNumber: sanitizeText(raw.invoiceNumber, `INV-${Math.floor(10000 + Math.random() * 90000)}`, 32),
    status: STATUSES.has(raw.status || "") ? raw.status : "Draft",
    issueDate,
    dueDate,
    paymentTerms: sanitizeText(raw.paymentTerms, "Net 14", 40),
    poNumber: sanitizeText(raw.poNumber, "", 40),
    clientName: sanitizeText(raw.clientName, "Client Company", 80),
    clientEmail: sanitizeText(raw.clientEmail, "", 100),
    clientTaxId: sanitizeText(raw.clientTaxId, "", 60),
    clientAddress: sanitizeMultiline(raw.clientAddress, "", 260),
    senderName: sanitizeText(raw.senderName, "Your Company", 80),
    senderEmail: sanitizeText(raw.senderEmail, "", 100),
    senderTaxId: sanitizeText(raw.senderTaxId, "", 60),
    senderAddress: sanitizeMultiline(raw.senderAddress, "", 260),
    items: items.length ? items : [{ description: "Professional services", quantity: 1, unit: "service", price: 500 }],
    taxRate: numberInRange(raw.taxRate, 0, 0, 100),
    discountType: raw.discountType === "fixed" ? "fixed" : "percent",
    discountValue: numberInRange(raw.discountValue, 0, 0, 999999),
    shippingFee: numberInRange(raw.shippingFee, 0, 0, 999999),
    currency: CURRENCIES.has(raw.currency || "") ? raw.currency : "USD",
    notes: sanitizeMultiline(raw.notes, "Thank you for your business.", 360),
    paymentInstructions: sanitizeMultiline(
      raw.paymentInstructions,
      "Please include the invoice number in the payment reference.",
      360,
    ),
  };
}

async function callGroq(brief: string) {
  const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  const keys = rawKeys.split(",").map((key) => key.trim()).filter(Boolean);
  if (!keys.length) throw new Error("The AI processing service is currently unavailable. Please try again later.");

  const today = new Date().toISOString().split("T")[0];
  const systemPrompt = `You are Exismic Ai, an expert billing assistant inside an invoice generator.
Convert the user's rough invoice brief into polished invoice JSON.

Rules:
- Return ONLY valid JSON. No markdown.
- Never paste the whole user brief into a company, client, address, or item field.
- Extract sender/business name from phrases like "my name is", "name is", "sender name is", "company name is", "from".
- Extract client name from phrases like "client name is", "customer is", "bill to".
- If the brief contains both "name is ..." and "client name is ...", the first name is senderName and the client name is clientName.
- If only one total amount is provided, create one line item named "Professional services" with that price.
- If multiple service amounts are provided, create separate line items.
- Infer currency from symbols/words: dollars/USD => USD, rupees/INR/rupee symbol => INR, euros/EUR/euro symbol => EUR, pounds/GBP/pound symbol => GBP.
- Dates must be YYYY-MM-DD. Today is ${today}.

JSON shape:
{
  "invoiceNumber": "INV-12345",
  "status": "Draft",
  "issueDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "paymentTerms": "Net 14",
  "poNumber": "",
  "senderName": "",
  "senderEmail": "",
  "senderTaxId": "",
  "senderAddress": "",
  "clientName": "",
  "clientEmail": "",
  "clientTaxId": "",
  "clientAddress": "",
  "items": [{ "description": "Professional services", "quantity": 1, "unit": "service", "price": 200 }],
  "taxRate": 0,
  "discountType": "percent",
  "discountValue": 0,
  "shippingFee": 0,
  "currency": "USD",
  "notes": "",
  "paymentInstructions": ""
}

Example:
User brief: "name is raxstdioz llc and total price is 200 dollars and tax is 1 percent and the client name is syed rayan"
JSON: {"invoiceNumber":"INV-12345","status":"Draft","issueDate":"${today}","dueDate":"${today}","paymentTerms":"Due on receipt","poNumber":"","senderName":"raxstdioz llc","senderEmail":"","senderTaxId":"","senderAddress":"","clientName":"syed rayan","clientEmail":"","clientTaxId":"","clientAddress":"","items":[{"description":"Professional services","quantity":1,"unit":"service","price":200}],"taxRate":1,"discountType":"percent","discountValue":0,"shippingFee":0,"currency":"USD","notes":"Thank you for your business.","paymentInstructions":"Please include the invoice number in the payment reference."}`;

  const payload = {
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: brief },
    ],
    temperature: 0.2,
    max_tokens: 1800,
    response_format: { type: "json_object" },
  };

  let lastError: unknown = null;
  for (const key of keys) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`Groq request failed with ${response.status}: ${errorText.slice(0, 160)}`);
        if (response.status === 401 || response.status === 429 || response.status >= 500) continue;
        throw lastError;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new Error("Groq returned an empty invoice response.");
      return sanitizeInvoice(extractJson(content));
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All AI processing services failed. Please try again later.");
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Please sign in to use Exismic Ai." }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true, planExpiresAt: true },
    });

    if (!dbUser || !hasActiveProAccess(dbUser)) {
      return NextResponse.json({ error: "Exismic Ai invoice generation is a Pro feature." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const brief = sanitizeMultiline(body.brief, "", 3000);

    if (brief.length < 8) {
      return NextResponse.json({ error: "Tell Exismic Ai a little more about the invoice." }, { status: 400 });
    }

    const invoice = await callGroq(brief);
    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("[Invoice AI] Generation failed:", error);
    const rawMessage = error instanceof Error ? error.message : "Exismic Ai invoice generation failed.";
    const message = rawMessage.includes("The AI processing service is currently unavailable")
      ? rawMessage
      : "Exismic Ai is temporarily unavailable. Please try again in a moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
