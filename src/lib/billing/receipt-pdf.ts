import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { BillingReceipt } from "./receipt-data";

// Use printable Latin text with standard PDF fonts; customer names in other scripts remain in email/history.
function printable(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "?");
}

export async function createReceiptPdf(receipt: BillingReceipt) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Exismic payment receipt ${receipt.reference}`);
  pdf.setAuthor("Exismic");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595.28, 841.89]);
  const ink = rgb(0.08, 0.12, 0.2);
  const muted = rgb(0.32, 0.38, 0.46);
  let y = 785;
  function ensureSpace(height: number) {
    if (y - height >= 48) return;
    page = pdf.addPage([595.28, 841.89]);
    y = 785;
  }
  function text(value: string, size = 11, strong = false, color = ink) {
    const selected = strong ? bold : font;
    const words = printable(value).match(/.{1,70}(?:\s|$)|\S{1,70}/g) || [""];
    for (const raw of words) {
      let line = raw.trim();
      // Long references/email addresses wrap without extending into the page margin.
      while (selected.widthOfTextAtSize(line, size) > 480) {
        const part = line.slice(0, Math.max(1, Math.floor(line.length * 480 / selected.widthOfTextAtSize(line, size))));
        ensureSpace(size + 6);
        page.drawText(part, { x: 48, y, size, font: selected, color });
        y -= size + 6;
        line = line.slice(part.length);
      }
      ensureSpace(size + 6);
      page.drawText(line, { x: 48, y, size, font: selected, color });
      y -= size + 6;
    }
  }
  function section(label: string) {
    ensureSpace(65);
    y -= 12;
    page.drawLine({ start: { x: 48, y: y + 5 }, end: { x: 547, y: y + 5 }, thickness: 0.7, color: rgb(0.84, 0.88, 0.92) });
    y -= 12;
    text(label.toUpperCase(), 10, true, muted);
  }
  const money = (amount: number) => `${receipt.currency} ${(amount / 100).toFixed(2)}`;
  text("EXISMIC", 25, true);
  text("PAYMENT RECEIPT  |  PAID", 12, true, rgb(0.02, 0.46, 0.35));
  text("www.exismic.xyz  |  billing@exismic.xyz", 10, false, muted);
  section("Receipt details");
  text(`Receipt number: ${receipt.reference}`);
  text(`Payment date (UTC): ${new Date(receipt.paidAt).toISOString().replace("T", " ").slice(0, 19)}`);
  text(`Customer: ${receipt.buyerName}`);
  text(`Account email: ${receipt.buyerEmail}`);
  section("Your purchase");
  text(receipt.item, 13, true);
  text(receipt.description, 10);
  if (receipt.periodEnd && !receipt.isGift) text(`Access paid through: ${new Date(receipt.periodEnd).toISOString().slice(0, 10)}`, 10);
  if (receipt.originalAmountMinor !== null && receipt.discountMinor) {
    text(`Price before discount: ${money(receipt.originalAmountMinor)}`);
    text(`Discount: -${money(receipt.discountMinor)}`);
  }
  y -= 8;
  text(`TOTAL PAID: ${money(receipt.amountMinor)}`, 18, true);
  text("This is the recorded payment total. Tax is not separately itemized.", 9, false, muted);
  section("Payment references");
  text(`Payment method: ${receipt.provider === "razorpay" ? "Razorpay" : receipt.provider === "paypal" ? "PayPal" : receipt.provider}`, 10);
  text(`Provider payment reference: ${receipt.providerPaymentId}`, 9);
  if (receipt.providerOrderId) text(`Provider order / subscription: ${receipt.providerOrderId}`, 9);
  if (receipt.orderId) text(`Exismic order: ${receipt.orderId}`, 9);
  section("Help and terms");
  text("For billing help, email billing@exismic.xyz with your receipt number.", 10);
  text("Refunds and payment corrections: www.exismic.xyz/refund-policy", 10);
  text("This confirms payment received; it is not a tax invoice.", 9, false, muted);
  return Buffer.from(await pdf.save());
}
