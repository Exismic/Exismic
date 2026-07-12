"use client";

type RazorpayConstructor = new (options: Record<string, unknown>) => {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
    __exismicRazorpayPromise?: Promise<RazorpayConstructor>;
  }
}

export function createCheckoutSignal(timeoutMs = 25000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => window.clearTimeout(timeout),
  };
}

export function loadRazorpayCheckout(timeoutMs = 15000): Promise<RazorpayConstructor> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout can only run in the browser."));
  }

  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (window.__exismicRazorpayPromise) return window.__exismicRazorpayPromise;

  const checkoutPromise = new Promise<RazorpayConstructor>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');

    const timer = window.setTimeout(() => {
      reject(new Error("Razorpay checkout took too long to load. Please refresh and try again."));
    }, timeoutMs);

    const finish = () => {
      window.clearTimeout(timer);
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error("Razorpay checkout could not load. Please try again."));
    };

    const fail = () => {
      window.clearTimeout(timer);
      reject(new Error("Razorpay checkout could not load. Please check your connection and try again."));
    };

    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", fail, { once: true });
      if (window.Razorpay) finish();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = finish;
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch((error) => {
    window.__exismicRazorpayPromise = undefined;
    throw error;
  });

  window.__exismicRazorpayPromise = checkoutPromise;
  return checkoutPromise;
}
