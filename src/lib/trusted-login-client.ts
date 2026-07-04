"use client";

const DEVICE_TOKEN_KEY = "lumora:trusted-login-device";
const PUSH_WORKER_PATH = "/lumora-push-sw.js";

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    mobile?: boolean;
    platform?: string;
  };
};

export type TrustedLoginDeviceDetails = {
  isPhone: boolean;
  deviceName: string;
  platform: string;
  browserName: string;
  osVersion: string;
  deviceModel: string;
  notificationPermission: "default" | "granted" | "denied" | "unsupported";
};

export type TrustedLoginPushSubscription = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export function supportsBackgroundPush() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    typeof Notification !== "undefined"
  );
}

export function isIosStandaloneApp() {
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  return (
    !/iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.matchMedia("(display-mode: standalone)").matches ||
    standaloneNavigator.standalone === true
  );
}

export async function registerTrustedLoginPush() {
  if (!supportsBackgroundPush()) {
    throw new Error("Background notifications are not supported on this phone.");
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("Lumora push notifications are not configured.");
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Allow notifications so Lumora can send login approvals to this phone.");
  }

  const registration = await navigator.serviceWorker.register(PUSH_WORKER_PATH, {
    scope: "/",
  });
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const serialized = subscription.toJSON();
  if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys?.auth) {
    throw new Error("The phone did not return a valid push subscription.");
  }

  return {
    endpoint: serialized.endpoint,
    expirationTime: subscription.expirationTime,
    keys: {
      p256dh: serialized.keys.p256dh,
      auth: serialized.keys.auth,
    },
  } satisfies TrustedLoginPushSubscription;
}

export function getOrCreateTrustedDeviceToken() {
  const existing = window.localStorage.getItem(DEVICE_TOKEN_KEY);
  if (existing && existing.length >= 32) return existing;

  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  const token = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  window.localStorage.setItem(DEVICE_TOKEN_KEY, token);
  return token;
}

export function detectTrustedLoginDevice(): TrustedLoginDeviceDetails {
  const nav = navigator as NavigatorWithUserAgentData;
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent);
  const isPhone =
    Boolean(nav.userAgentData?.mobile) ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

  const androidVersion = userAgent.match(/Android\s([\d.]+)/i)?.[1];
  const iosVersion = userAgent.match(/OS\s([\d_]+)/i)?.[1]?.replace(/_/g, ".");
  const androidModel = userAgent.match(
    /Android[^;]*;\s*([^;)]+?)(?:\s+Build\/[^;)]+)?[;)]/i
  )?.[1];

  const platform = isAndroid
    ? "Android"
    : isAppleMobile
      ? "iOS"
      : nav.userAgentData?.platform || "Browser";

  const browserName = /EdgA?|EdgiOS/i.test(userAgent)
    ? "Microsoft Edge"
    : /CriOS|Chrome/i.test(userAgent)
      ? "Google Chrome"
      : /FxiOS|Firefox/i.test(userAgent)
        ? "Mozilla Firefox"
        : /Safari/i.test(userAgent)
          ? "Safari"
          : "Web browser";

  const deviceModel = isAppleMobile
    ? /iPad/i.test(userAgent)
      ? "iPad"
      : "iPhone"
    : androidModel?.trim() || (isAndroid ? "Android phone" : "This device");

  const osVersion = androidVersion
    ? `Android ${androidVersion}`
    : iosVersion
      ? `iOS ${iosVersion}`
      : platform;

  return {
    isPhone,
    deviceName: `${deviceModel} - ${browserName}`,
    platform,
    browserName,
    osVersion,
    deviceModel,
    notificationPermission:
      typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  };
}
