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
    <button type="button" disabled={busy} onClick={download} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/30 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/10 disabled:opacity-60 ${className}`}>
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {busy ? "Preparing receipt…" : "Download receipt (PDF)"}
    </button>
    {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
  </div>;
}
