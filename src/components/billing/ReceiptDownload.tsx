"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export function ReceiptDownload({ url, className = "" }: { url: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok || !response.headers.get("content-type")?.includes("application/pdf")) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Your receipt is not available yet. Try again in purchase history.");
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = response.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] || "Exismic-Receipt.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Receipt download failed. Please try again.");
    } finally { setBusy(false); }
  }
  return <div>
    <button
      type="button"
      disabled={busy}
      onClick={download}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/15 px-5 py-2.5 text-sm font-semibold text-purple-200 hover:bg-purple-500/25 hover:border-purple-400/50 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] disabled:opacity-60 cursor-pointer ${className}`}
    >
      {busy ? <Loader2 size={16} className="animate-spin text-purple-300" /> : <Download size={16} className="text-purple-300" />}
      <span>{busy ? "Preparing receipt…" : "Download receipt (PDF)"}</span>
    </button>
    {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
  </div>;
}
