const RESEND_KEY_PREFIX = "re_";

export type EmailDiagnosticStatus = "ok" | "warning" | "error";

export type EmailDiagnosticEvent = {
  channel: string;
  recipient: string;
  success: boolean;
  timestamp: string;
  error?: string;
};

const recentEmailEvents: EmailDiagnosticEvent[] = [];

function redactEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "unknown";
  return `${name.slice(0, 2)}***@${domain}`;
}

export function recordEmailEvent(event: Omit<EmailDiagnosticEvent, "timestamp" | "recipient"> & { recipient: string }) {
  recentEmailEvents.unshift({
    ...event,
    recipient: redactEmail(event.recipient),
    timestamp: new Date().toISOString(),
  });

  if (recentEmailEvents.length > 30) {
    recentEmailEvents.pop();
  }
}

export function getRecentEmailEvents() {
  return [...recentEmailEvents];
}

export function getEmailDiagnostics() {
  const resendKey = process.env.RESEND_API_KEY || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const senderDomain = "lumoraai.online";

  const checks = [
    {
      key: "resendApiKey",
      label: "Resend API Key",
      status: resendKey ? "ok" : "error",
      detail: resendKey
        ? `Configured (${resendKey.startsWith(RESEND_KEY_PREFIX) ? "valid-looking prefix" : "non-standard prefix"})`
        : "Missing RESEND_API_KEY. Transactional emails will fail.",
    },
    {
      key: "siteUrl",
      label: "Site URL",
      status: siteUrl ? "ok" : "warning",
      detail: siteUrl || "NEXT_PUBLIC_SITE_URL missing. Emails will fall back to lumoraai.online.",
    },
    {
      key: "senderDomain",
      label: "Sender Domain",
      status: senderDomain.includes(".") ? "ok" : "warning",
      detail: senderDomain,
    },
  ] satisfies Array<{
    key: string;
    label: string;
    status: EmailDiagnosticStatus;
    detail: string;
  }>;

  return {
    status: checks.some((check) => check.status === "error")
      ? "error"
      : checks.some((check) => check.status === "warning")
        ? "warning"
        : "ok",
    senders: {
      payment: `"Lumora" <payments@${senderDomain}>`,
      noreply: `"Lumora" <noreply@${senderDomain}>`,
      welcome: `"Lumora" <welcome@${senderDomain}>`,
    },
    checks,
    recentEvents: getRecentEmailEvents(),
  };
}
