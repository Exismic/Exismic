self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  if (payload.type !== "trusted-login") return;

  event.waitUntil(
    self.registration.showNotification(payload.title || "Lumora login request", {
      body: payload.body || "A device is asking to sign in to your Lumora account.",
      icon: "/favicon.png",
      badge: "/favicon.png",
      tag: `lumora-login-${payload.challengeId}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [180, 80, 180],
      actions: [
        { action: "approve", title: "Yes, it's me" },
        { action: "deny", title: "No, block it" },
      ],
      data: payload,
    }),
  );
});

async function respondToLogin(payload, decision) {
  const response = await fetch("/api/auth/trusted-login/respond", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      challengeId: payload.challengeId,
      approvalToken: payload.approvalToken,
      decision,
    }),
  });

  if (!response.ok) {
    throw new Error("The login request could not be updated.");
  }
}

self.addEventListener("notificationclick", (event) => {
  const payload = event.notification.data || {};
  event.notification.close();

  if (event.action === "approve" || event.action === "deny") {
    event.waitUntil(
      respondToLogin(payload, event.action === "approve" ? "approved" : "denied")
        .then(() =>
          self.registration.showNotification(
            event.action === "approve" ? "Login approved" : "Login blocked",
            {
              body:
                event.action === "approve"
                  ? "The requesting browser is signing in now."
                  : "The requesting browser was denied access.",
              icon: "/favicon.png",
              badge: "/favicon.png",
              tag: `lumora-login-result-${payload.challengeId}`,
            },
          ),
        )
        .catch(() =>
          self.registration.showNotification("Lumora security", {
            body: "That request expired. Start a new login request if it was you.",
            icon: "/favicon.png",
            badge: "/favicon.png",
          }),
        ),
    );
    return;
  }

  const fragment = new URLSearchParams({
    challenge: payload.challengeId || "",
    token: payload.approvalToken || "",
    email: payload.email || "",
    device: payload.requestDevice || "",
    ip: payload.requestIp || "",
    time: payload.requestedAt || "",
  });

  event.waitUntil(
    self.clients.openWindow(`/auth/trusted-login/approve#${fragment.toString()}`),
  );
});
