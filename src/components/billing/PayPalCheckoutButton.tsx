"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalCheckoutButton({ planId, marketOverride, clientId }: { planId: string; marketOverride: "IN" | "GLOBAL"; clientId?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scriptReady || !window.paypal || !containerRef.current || renderedRef.current) return;
    renderedRef.current = true;

    window.paypal.Buttons({
      style: { layout: "vertical", color: "blue", shape: "pill", label: "paypal" },
      createOrder: async () => {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/billing/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, marketOverride }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success || !data.paypalOrderId) {
          throw new Error(data?.error || "Could not create PayPal order.");
        }
        return data.paypalOrderId;
      },
      onApprove: async (data: { orderID: string }) => {
        const response = await fetch("/api/billing/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paypalOrderId: data.orderID }),
        });
        const payload = await response.json().catch(() => null);
        setLoading(false);
        if (!response.ok || !payload?.success) {
          setError(payload?.error || "PayPal capture failed.");
          return;
        }
        window.location.href = "/billing/success";
      },
      onCancel: () => {
        setLoading(false);
        window.location.href = "/billing/cancel";
      },
      onError: (err: unknown) => {
        console.error("[Billing] PayPal error", err);
        setError("PayPal checkout failed. Please try again.");
        setLoading(false);
      },
    }).render(containerRef.current);
  }, [scriptReady, planId, marketOverride]);

  const resolvedClientId = clientId || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return (
    <div className="mt-5">
      {resolvedClientId && (
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(resolvedClientId)}&currency=USD&intent=capture`}
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
        />
      )}
      <div ref={containerRef} />
      {loading && <p className="mt-3 flex items-center gap-2 text-xs font-bold text-cyan-200"><Loader2 size={14} className="animate-spin" /> Preparing PayPal checkout...</p>}
      {error && <p className="mt-3 text-xs font-bold text-red-300">{error}</p>}
      {!resolvedClientId && <p className="mt-3 text-xs font-bold text-red-300">PayPal client ID is not configured.</p>}
    </div>
  );
}
