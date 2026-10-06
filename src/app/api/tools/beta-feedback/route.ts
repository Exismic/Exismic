import { publicJson } from "@/lib/public-json";
import { betaFeedbackEmail } from "@/emails/notifications";
import { resend } from "@/lib/resend";
import { getAdminEmails } from "@/lib/admin";
import { createClient } from "@/utils/supabase/server";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { toolId = "minecraft-skin", toolName = "AI Minecraft Skin Maker", feedback } = body;

    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return publicJson({ success: true, message: "No feedback text provided" });
    }

    const trimmedFeedback = feedback.trim().slice(0, 3000);

    // Retrieve active authenticated session if present
    let submitterEmail = "Anonymous Visitor";
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        submitterEmail = user.email;
      }
    } catch {
      // Continue with Anonymous Visitor
    }

    // 1. Dispatch Email to Admin(s)
    const adminRecipients = getAdminEmails();
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && adminRecipients.length > 0) {
      try {
        const emailHtml = betaFeedbackEmail({ toolName, toolId, email: submitterEmail, feedback: trimmedFeedback, submittedAt: new Date().toISOString() });

        const fromDomain = process.env.EMAIL_SENDER_DOMAIN?.trim() || "exismic.xyz";
        const emailSend = (await resend.emails.send({
          from: `Exismic Feedback <feedback@${fromDomain}>`,
          to: adminRecipients,
          subject: `[Beta Suggestion] ${toolName}: ${trimmedFeedback.slice(0, 50)}${trimmedFeedback.length > 50 ? "..." : ""}`,
          html: emailHtml,
        })) as any;

        // Automatic fallback to onboarding@resend.dev if custom domain is not yet verified in Resend dashboard
        if (emailSend?.error) {
          const errMessage = typeof emailSend.error === "string" ? emailSend.error : emailSend.error?.message || "";
          if (errMessage.includes("not verified") || errMessage.includes("domain") || errMessage.includes("validation")) {
            console.warn("[BetaFeedback] Retrying with onboarding@resend.dev fallback...");
            await resend.emails.send({
              from: "Exismic Feedback <onboarding@resend.dev>",
              to: adminRecipients,
              subject: `[Beta Suggestion] ${toolName}: ${trimmedFeedback.slice(0, 50)}${trimmedFeedback.length > 50 ? "..." : ""}`,
              html: emailHtml,
            });
          }
        }
      } catch (emailErr) {
        console.warn("[BetaFeedback] Admin email delivery notice:", emailErr);
      }
    } else {
      console.info(`[BetaFeedback] Admin emails (${adminRecipients.join(", ")}): Feedback logged for ${toolId}:`, trimmedFeedback);
    }

    // 2. Real-Time Discord Webhook Notification (if configured)
    const webhookUrl =
      process.env.DISCORD_SUPPORT_WEBHOOK_URL ||
      process.env.DISCORD_FEEDBACK_WEBHOOK_URL ||
      process.env.DISCORD_WEBHOOK_URL;

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                title: `🛠️ New Beta Feedback: ${toolName}`,
                description: trimmedFeedback,
                color: 405780, // Cyan (#06b6d4)
                fields: [
                  { name: "Tool", value: `${toolName} (${toolId})`, inline: true },
                  { name: "User", value: submitterEmail, inline: true },
                  { name: "Timestamp", value: new Date().toISOString(), inline: false },
                ],
                footer: { text: "Exismic Beta Feedback System" },
              },
            ],
          }),
        });
      } catch (webhookErr) {
        console.warn("[BetaFeedback] Discord webhook delivery failed:", webhookErr);
      }
    }

    return publicJson({ success: true });
  } catch (error) {
    console.error("[BetaFeedback] Error handling feedback:", error);
    return publicJson({ success: false, error: "Failed to record feedback" }, { status: 500 });
  }
}
