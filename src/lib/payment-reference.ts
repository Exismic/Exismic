import { randomBytes } from "crypto";

export function getPaymentInvoiceType(kind: string): "credits" | "pro" {
  return kind.toLowerCase().includes("credit") ? "credits" : "pro";
}

export function generateTransactionReference(kind: string, date = new Date()) {
  const type = getPaymentInvoiceType(kind) === "credits" ? "CR" : "PRO";
  const year = String(date.getUTCFullYear()).slice(-2);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const entropy = randomBytes(4).toString("hex").toUpperCase();

  return `EXM-${type}-${year}${month}-${entropy}`;
}

export function fallbackTransactionReference(kind: string, seed: string, date = new Date()) {
  const type = getPaymentInvoiceType(kind) === "credits" ? "CR" : "PRO";
  const year = String(date.getUTCFullYear()).slice(-2);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const normalizedSeed = seed.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase().padStart(8, "0");

  return `EXM-${type}-${year}${month}-${normalizedSeed}`;
}
