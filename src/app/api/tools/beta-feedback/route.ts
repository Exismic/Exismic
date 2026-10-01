import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { getAdminEmails } from "@/lib/admin";
import { createClient } from "@/utils/supabase/server";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { toolId = "minecraft-skin", toolName = "AI Minecraft Skin Maker", feedback } = body;

    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return NextResponse.json({ success: true, message: "No feedback text provided" });
    }

    const trimmedFeedback = feedback.trim().slice(0, 3000);

    // Retrieve active authenticated session if present
    let submitterEmail = "Anonymous Visitor";
    try {
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        submitterEmail = session.user.email;
      }
    } catch {
      // Continue with Anonymous Visitor
    }

    // 1. Dispatch Email to Admin(s)
    const adminRecipients = getAdminEmails();
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && adminRecipients.length > 0) {
      try {
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #ffffff; background-color: #090a10; border-radius: 18px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <span style="display: inline-block; padding: 4px 10px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 999px; color: #06b6d4; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                ⛏️ Minecraft Skin Studio • Beta Feedback
              </span>
            </div>

            <h1 style="color: #ffffff; font-size: 20px; font-weight: 900; margin: 0 0 12px 0; letter-spacing: -0.5px;">
              New User Suggestion Received
            </h1>

            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
                User Feedback / Feature Suggestion:
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #f1f5f9; white-space: pre-wrap;">${escapeHtml(trimmedFeedback)}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #94a3b8;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Tool:</td>
                <td style="padding: 6px 0; color: #e2e8f0; text-align: right;">${escapeHtml(toolName)} (${escapeHtml(toolId)})</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">User:</td>
                <td style="padding: 6px 0; color: #e2e8f0; text-align: right;">${escapeHtml(submitterEmail)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Submitted At:</td>
                <td style="padding: 6px 0; color: #e2e8f0; text-align: right;">${new Date().toISOString()}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: #64748b; text-align: center;">
              Exismic Beta Feedback Delivery System
            </div>
          </div>
        `;

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BetaFeedback] Error handling feedback:", error);
    return NextResponse.json({ success: false, error: "Failed to record feedback" }, { status: 500 });
  }
}
