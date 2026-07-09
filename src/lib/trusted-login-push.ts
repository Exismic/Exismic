import webPush from "web-push";

type StoredPushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type LoginApprovalPush = {
  challengeId: string;
  approvalToken: string;
  email: string;
  requestIp: string;
  requestDevice: string;
  requestedAt: string;
};

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:security@exismicai.online";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured.");
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
}

export async function sendLoginApprovalPush(
  subscription: StoredPushSubscription,
  payload: LoginApprovalPush,
) {
  configureWebPush();

  await webPush.sendNotification(
    subscription,
    JSON.stringify({
      type: "trusted-login",
      title: "Exismic login request",
      body: `${payload.requestDevice} is requesting access to ${payload.email}.`,
      ...payload,
    }),
    {
      TTL: 300,
      urgency: "high",
      topic: `login-${payload.challengeId.slice(-20)}`,
    },
  );
}
