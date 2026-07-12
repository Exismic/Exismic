"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  Check,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Receipt,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type InvoiceType = "pro" | "credits";

interface InvoiceData {
  id: string;
  transactionReference?: string;
  providerPaymentId?: string | null;
  providerOrderId?: string | null;
  date: string;
  createdAt?: string;
  amount: string;
  amountMinor?: number;
  currency?: string;
  plan: string;
  method: string;
  status: string;
  type?: InvoiceType;
  kind?: string;
  nextBillingDate?: string | null;
  subscriptionStatus?: string | null;
}

interface InvoicePayload {
  pro: InvoiceData[];
  credits: InvoiceData[];
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: InvoiceData | null;
}

type Html2PdfFactory = () => {
  set(options: unknown): {
    from(element: HTMLElement): {
      save(): Promise<void>;
    };
  };
};

const tabs: Array<{ id: InvoiceType; label: string; caption: string }> = [
  { id: "pro", label: "Pro", caption: "Membership invoices" },
  { id: "credits", label: "Credits", caption: "Credit purchases" },
];

function invoiceTitle(type: InvoiceType) {
  return type === "pro" ? "Pro membership invoice" : "Credits invoice";
}

function emptyCopy(type: InvoiceType) {
  return type === "pro"
    ? "Your Pro membership invoice will appear here after a verified Pro payment."
    : "Your credit purchase invoice will appear here after a verified credit payment.";
}

export function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  const [invoices, setInvoices] = useState<InvoicePayload>({ pro: [], credits: [] });
  const [activeTab, setActiveTab] = useState<InvoiceType>(invoice?.type || "pro");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(invoice?.id || null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (invoice) {
      const type = invoice.type || "pro";
      setInvoices({ pro: type === "pro" ? [invoice] : [], credits: type === "credits" ? [invoice] : [] });
      setActiveTab(type);
      setSelectedInvoiceId(invoice.id);
      return;
    }

    let cancelled = false;

    async function loadInvoices() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/user/invoice/latest", { cache: "no-store" });
        const payload = await response.json().catch(() => null);
        if (cancelled) return;

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || "Could not load invoice details.");
        }

        const nextInvoices: InvoicePayload = {
          pro: Array.isArray(payload.invoices?.pro)
            ? payload.invoices.pro
            : payload.latest?.pro ? [payload.latest.pro] : [],
          credits: Array.isArray(payload.invoices?.credits)
            ? payload.invoices.credits
            : payload.latest?.credits ? [payload.latest.credits] : [],
        };
        setInvoices(nextInvoices);
        const nextTab: InvoiceType = nextInvoices.pro.length ? "pro" : "credits";
        setActiveTab(nextTab);
        setSelectedInvoiceId(nextInvoices[nextTab][0]?.id || null);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load invoice details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInvoices();

    return () => {
      cancelled = true;
    };
  }, [invoice, isOpen]);

  const activeInvoices = invoices[activeTab];
  const activeInvoice = activeInvoices.find((item) => item.id === selectedInvoiceId) || activeInvoices[0] || null;
  const canDownload = Boolean(activeInvoice && !loading && !error);

  const providerRows = useMemo(() => {
    if (!activeInvoice) return [];
    return [
      activeInvoice.providerPaymentId ? ["Provider payment ID", activeInvoice.providerPaymentId] : null,
      activeInvoice.providerOrderId ? ["Provider order/subscription ID", activeInvoice.providerOrderId] : null,
    ].filter(Boolean) as Array<[string, string]>;
  }, [activeInvoice]);

  async function downloadPdf() {
    if (!activeInvoice || !pdfRef.current) return;

    setDownloading(true);
    try {
      const html2pdfImport = await import("html2pdf.js") as unknown as { default?: Html2PdfFactory } & Html2PdfFactory;
      const html2pdf = html2pdfImport.default || html2pdfImport;
      await html2pdf()
        .set({
          margin: 0,
          filename: `${activeInvoice.transactionReference || activeInvoice.id}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, backgroundColor: "#ffffff", useCORS: true },
          jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(pdfRef.current)
        .save();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            role="dialog"
            aria-modal="true"
            aria-label="Invoice details"
            className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#060608] shadow-[0_50px_120px_rgba(0,0,0,0.9)] sm:rounded-[2.5rem]"
          >
            <div className="sticky top-0 z-10 border-b border-white/10 bg-[#060608]/95 p-4 backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
                    <Receipt size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-cyan-100/60">Billing center</p>
                    <h3 className="mt-1 text-xl font-black italic uppercase tracking-tight text-white sm:text-2xl">Invoices</h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close invoice"
                  className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-500 transition-all hover:bg-white/8 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/30 p-1">
                {tabs.map((tab) => {
                  const hasInvoice = invoices[tab.id].length > 0;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSelectedInvoiceId(invoices[tab.id][0]?.id || null);
                      }}
                      className={cn(
                        "relative min-h-14 rounded-xl px-3 text-left transition-all",
                        activeTab === tab.id
                          ? "bg-white text-black shadow-[0_14px_35px_rgba(255,255,255,0.12)]"
                          : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                      )}
                    >
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                        {tab.label}
                        <span className={cn("h-1.5 w-1.5 rounded-full", hasInvoice ? "bg-emerald-400" : "bg-zinc-700")} />
                      </span>
                      <span className="mt-1 block truncate text-[9px] font-bold uppercase tracking-[0.08em] opacity-60">{tab.caption}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6 p-4 sm:p-8">
              {!loading && !error && activeInvoices.length > 1 && (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-3">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">Payment history</p>
                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-100/60">{activeInvoices.length} invoices</span>
                  </div>
                  <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                    {activeInvoices.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedInvoiceId(item.id)}
                        className={cn(
                          "flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left transition-all",
                          activeInvoice?.id === item.id
                            ? "border-cyan-300/25 bg-cyan-300/[0.07] text-white"
                            : "border-white/[0.07] bg-black/20 text-zinc-500 hover:border-white/15 hover:text-white",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[10px] font-black uppercase tracking-[0.14em]">{item.transactionReference || item.id}</span>
                          <span className="mt-1 block text-[10px] font-medium text-zinc-500">{item.date}</span>
                        </span>
                        <span className="shrink-0 text-sm font-black italic">{item.amount}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.025] text-center">
                  <Loader2 size={30} className="animate-spin text-cyan-200" />
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-white">Loading invoices</p>
                  <p className="mt-2 text-xs font-medium text-zinc-500">Fetching your verified Pro and credit payments.</p>
                </div>
              )}

              {!loading && error && (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-[2rem] border border-red-400/15 bg-red-400/[0.04] p-6 text-center">
                  <AlertCircle size={30} className="text-red-300" />
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-white">Invoice unavailable</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-zinc-500">{error}</p>
                </div>
              )}

              {!loading && !error && !activeInvoice && (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 text-center">
                  <Receipt size={30} className="text-zinc-500" />
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-white">No {activeTab} invoice yet</p>
                  <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-zinc-500">{emptyCopy(activeTab)}</p>
                </div>
              )}

              {!loading && !error && activeInvoice && (
                <>
                  <div className="relative overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),rgba(255,255,255,0.025)] p-5 sm:p-6">
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300">
                          <Check size={22} strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-white">Payment successful</p>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">{invoiceTitle(activeTab)}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-3xl font-black italic tracking-tight text-white">{activeInvoice.amount}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Amount paid</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-100/65">Exismic transaction ID</p>
                    <p className="mt-2 break-all text-lg font-black tracking-tight text-white">{activeInvoice.transactionReference || activeInvoice.id}</p>
                    <p className="mt-2 text-xs font-medium leading-5 text-zinc-500">Use this ID when contacting support about this purchase.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InvoiceInfo icon={Calendar} label="Billing date" value={activeInvoice.date} />
                    <InvoiceInfo icon={CreditCard} label="Payment method" value={activeInvoice.method} />
                    <InvoiceInfo icon={FileText} label="Description" value={activeInvoice.plan} wide />
                    {activeInvoice.nextBillingDate && (
                      <InvoiceInfo icon={Calendar} label="Next billing / access until" value={activeInvoice.nextBillingDate} wide />
                    )}
                    {providerRows.map(([label, value]) => (
                      <InvoiceInfo key={label} icon={ShieldCheck} label={label} value={value} wide compact />
                    ))}
                  </div>

                  <div className="space-y-4 pt-2">
                    <button
                      onClick={() => void downloadPdf()}
                      disabled={!canDownload || downloading}
                      className="group relative block h-14 w-full overflow-hidden rounded-full p-[2px] text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-[0_0_20px_-10px_rgba(139,92,246,0.3)] transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_0_50px_-10px_rgba(139,92,246,0.7)] active:scale-95 disabled:cursor-wait disabled:opacity-50 sm:h-16"
                    >
                      <span className="absolute inset-0 bg-[linear-gradient(110deg,#06b6d4,#8b5cf6,#ec4899,#06b6d4)] bg-[length:300%_auto] animate-gradient-x opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                      <span className="absolute inset-0 blur-xl bg-[linear-gradient(110deg,#06b6d4,#8b5cf6,#ec4899,#06b6d4)] bg-[length:300%_auto] animate-gradient-x opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
                      <span className="relative flex h-full w-full items-center justify-center gap-3 rounded-full bg-[#060608]/90 px-8 backdrop-blur-md transition-colors duration-500 group-hover:bg-black/30">
                        {downloading ? (
                          <Loader2 size={18} className="animate-spin text-fuchsia-400" />
                        ) : (
                          <Download size={18} className="text-cyan-400 transition-colors group-hover:text-white" />
                        )}
                        <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent transition-all group-hover:from-white group-hover:to-white">
                          {downloading ? "Preparing invoice" : "Download clean PDF"}
                        </span>
                      </span>
                    </button>
                    <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-700">
                      <ShieldCheck size={12} />
                      Secure transaction - Exismic Studios
                    </div>
                  </div>

                  <InvoicePdfDocument invoice={activeInvoice} type={activeTab} providerRows={providerRows} ref={pdfRef} />
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InvoiceInfo({ icon: Icon, label, value, wide = false, compact = false }: { icon: typeof Calendar; label: string; value: string; wide?: boolean; compact?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/[0.025] p-4", wide && "sm:col-span-2")}>
      <div className="flex items-center gap-2 text-zinc-600">
        <Icon size={14} />
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className={cn("mt-2 font-bold italic tracking-tight text-white", compact ? "break-all text-xs leading-5" : "text-sm")}>{value}</p>
    </div>
  );
}

const InvoicePdfDocument = React.forwardRef<HTMLDivElement, { invoice: InvoiceData; type: InvoiceType; providerRows: Array<[string, string]> }>(
  function InvoicePdfDocument({ invoice, type, providerRows }, ref) {
    return (
      <div className="pointer-events-none fixed -left-[10000px] top-0 w-[794px] bg-white text-[#111827]" aria-hidden="true">
        <div ref={ref} style={{ width: 794, minHeight: 1123, background: "#ffffff", color: "#111827", padding: 56, fontFamily: "Arial, sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #e5e7eb", paddingBottom: 28 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img 
                  src="/exismic-app-icon-transparent.png" 
                  alt="Exismic" 
                  style={{ width: 46, height: 46, objectFit: "contain" }} 
                />
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.015em", color: "#111827", display: "flex", alignItems: "center" }}>
                    Exismic<span style={{ color: "#22d3ee", fontWeight: 800, marginLeft: 1 }}>.</span>
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#6b7280", fontWeight: 900, marginTop: 2 }}>
                    AI Studio
                  </div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>Invoice</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280", fontWeight: 700 }}>{invoice.transactionReference || invoice.id}</div>
            </div>
          </div>

          <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <PdfBox label="Invoice type" value={invoiceTitle(type)} />
            <PdfBox label="Status" value={invoice.status} accent="#059669" />
            <PdfBox label="Billing date" value={invoice.date} />
            <PdfBox label="Amount paid" value={invoice.amount} />
            <PdfBox label="Payment method" value={invoice.method} />
            {invoice.nextBillingDate ? <PdfBox label="Next billing / access until" value={invoice.nextBillingDate} /> : <PdfBox label="Purchase type" value="One-time purchase" />}
          </div>

          <div style={{ marginTop: 28, border: "1px solid #e5e7eb", borderRadius: 18, overflow: "hidden" }}>
            <div style={{ background: "#f9fafb", padding: "14px 18px", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#6b7280", fontWeight: 900 }}>Purchase details</div>
            <div style={{ padding: 18, display: "flex", justifyContent: "space-between", gap: 24 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>{invoice.plan}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>Transaction reference: {invoice.transactionReference || invoice.id}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, whiteSpace: "nowrap" }}>{invoice.amount}</div>
            </div>
          </div>

          <div style={{ marginTop: 26 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#6b7280", fontWeight: 900, marginBottom: 10 }}>Support tracking</div>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
              <PdfRow label="Exismic transaction ID" value={invoice.transactionReference || invoice.id} />
              {providerRows.map(([label, value]) => <PdfRow key={label} label={label} value={value} />)}
            </div>
          </div>

          <div style={{ marginTop: 56, paddingTop: 18, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 11, lineHeight: 1.6 }}>
            <div>
              <div style={{ fontWeight: 900, color: "#111827" }}>Exismic Studios</div>
              <div>Secure digital purchase receipt</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>Generated for account billing records.</div>
              <div>Use the Exismic transaction ID for support.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

function PdfBox({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6b7280", fontWeight: 900 }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 15, fontWeight: 900, color: accent || "#111827" }}>{value}</div>
    </div>
  );
}

function PdfRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", borderBottom: "1px solid #e5e7eb", minHeight: 46 }}>
      <div style={{ padding: 14, background: "#f9fafb", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#6b7280", fontWeight: 900 }}>{label}</div>
      <div style={{ padding: 14, fontSize: 12, fontWeight: 700, wordBreak: "break-all" }}>{value}</div>
    </div>
  );
}
