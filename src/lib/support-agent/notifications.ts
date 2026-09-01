interface LeadAlertPayload {
  agentName: string;
  leadName?: string | null;
  leadEmail?: string | null;
  leadPhone?: string | null;
  message?: string;
  webhookUrl?: string | null;
}

export async function dispatchSupportAgentAlert(payload: LeadAlertPayload) {
  const { agentName, leadName, leadEmail, leadPhone, message, webhookUrl } = payload;
  
  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    return;
  }

  try {
    const isDiscord = webhookUrl.includes("discord.com/api/webhooks");
    const isSlack = webhookUrl.includes("hooks.slack.com");

    if (isDiscord) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `🎯 New Lead Captured on ${agentName}`,
              color: 0x8b5cf6, // purple
              fields: [
                { name: "Name", value: leadName || "Anonymous", inline: true },
                { name: "Email", value: leadEmail || "Not provided", inline: true },
                { name: "Phone", value: leadPhone || "Not provided", inline: true },
                { name: "Message", value: message ? message.slice(0, 1000) : "No message" },
              ],
              timestamp: new Date().toISOString(),
              footer: { text: "Exismic Support Agent" },
            },
          ],
        }),
      });
    } else if (isSlack) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🎯 *New Lead Captured on ${agentName}*\n*Name:* ${leadName || "Anonymous"}\n*Email:* ${leadEmail || "Not provided"}\n*Phone:* ${leadPhone || "Not provided"}\n*Message:* ${message || "None"}`,
        }),
      });
    } else {
      // Generic JSON webhook
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "lead_captured",
          agentName,
          lead: {
            name: leadName,
            email: leadEmail,
            phone: leadPhone,
            message,
          },
          timestamp: new Date().toISOString(),
        }),
      });
    }
  } catch (err) {
    console.error("[SUPPORT_AGENT_WEBHOOK_ERROR]", err);
  }
}
