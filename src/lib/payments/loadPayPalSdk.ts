"use client";

export type PayPalHostedFieldsInstance = {
  submit: (options?: Record<string, unknown>) => Promise<{
    orderId: string;
    liabilityShifted?: boolean;
    liabilityShiftPossible?: boolean;
  }>;
  getState: () => Record<string, unknown>;
  teardown: () => Promise<void>;
};

export type PayPalButtonsInstance = {
  render: (container: string | HTMLElement) => Promise<void>;
  close?: () => void;
};

export type PayPalSdk = {
  HostedFields?: {
    isEligible: () => boolean;
    render: (options: Record<string, unknown>) => Promise<PayPalHostedFieldsInstance>;
  };
  Buttons?: (options: Record<string, unknown>) => PayPalButtonsInstance;
  FUNDING?: {
    PAYPAL: string;
    CARD: string;
    PAYLATER: string;
    CREDIT: string;
    [key: string]: string;
  };
};

declare global {
  interface Window {
    paypal?: PayPalSdk;
    __exismicPayPalPromise?: Promise<PayPalSdk>;
  }
}

export function loadPayPalSdk({
  clientId,
  clientToken,
  currency = "USD",
  timeoutMs = 15000,
}: {
  clientId: string;
  clientToken?: string | null;
  currency?: string;
  timeoutMs?: number;
}): Promise<PayPalSdk> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PayPal SDK can only be loaded in a browser environment."));
  }

  if (window.paypal) {
    return Promise.resolve(window.paypal);
  }

  if (window.__exismicPayPalPromise) {
    return window.__exismicPayPalPromise;
  }

  const promise = new Promise<PayPalSdk>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src*="paypal.com/sdk/js"]');

    const timer = window.setTimeout(() => {
      reject(new Error("PayPal SDK took too long to load. Please refresh and try again."));
    }, timeoutMs);

    const finish = () => {
      window.clearTimeout(timer);
      if (window.paypal) resolve(window.paypal);
      else reject(new Error("PayPal SDK was loaded but window.paypal is missing."));
    };

    const fail = () => {
      window.clearTimeout(timer);
      reject(new Error("Failed to load PayPal SDK. Please check your connection."));
    };

    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", fail, { once: true });
      if (window.paypal) finish();
      return;
    }

    const script = document.createElement("script");
    const scriptUrl = new URL("https://www.paypal.com/sdk/js");
    scriptUrl.searchParams.set("client-id", clientId);
    scriptUrl.searchParams.set("components", "hosted-fields,buttons");
    scriptUrl.searchParams.set("currency", currency);
    scriptUrl.searchParams.set("intent", "capture");

    script.src = scriptUrl.toString();
    script.async = true;
    if (clientToken) {
      script.setAttribute("data-client-token", clientToken);
    }

    script.onload = finish;
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch((err) => {
    window.__exismicPayPalPromise = undefined;
    throw err;
  });

  window.__exismicPayPalPromise = promise;
  return promise;
}
