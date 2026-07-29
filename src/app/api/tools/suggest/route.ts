import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resend } from "@/lib/resend";

const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 Hours in milliseconds

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { toolName, categoryId, description, userEmail } = body;

    if (!toolName || !toolName.trim()) {
      return NextResponse.json({ error: "Please enter a tool idea or name." }, { status: 400 });
    }

    // Supabase auth check
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const finalEmail = (session?.user?.email || userEmail || "").trim();

    // Check server cookie for 12-hour cooldown
    const cookies = req.headers.get("cookie") || "";
    const match = cookies.match(/exismic_suggest_cooldown=(\d+)/);
    if (match) {
      const lastTime = parseInt(match[1], 10);
      const elapsed = Date.now() - lastTime;
      if (elapsed < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - elapsed;
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        return NextResponse.json(
          { error: `Cooldown active. You can submit another tool request in ~${remainingHours} hours.` },
          { status: 429 }
        );
      }
    }

    const categoryLabel = (categoryId || "GENERAL").toUpperCase();

    // 1. Post Embed to Discord Webhook
    const webhookUrl =
      process.env.DISCORD_SUPPORT_WEBHOOK_URL ||
      process.env.DISCORD_WEBHOOK_URL ||
      process.env.DISCORD_FEEDBACK_WEBHOOK_URL;

    if (webhookUrl) {
      const embed = {
        title: "🚀 New Community Tool Suggestion",
        color: 10841855, // Electric Cyan/Violet
        fields: [
          {
            name: "Suggested Tool Name",
            value: toolName.trim(),
            inline: true,
          },
          {
            name: "Category / Suite",
            value: categoryLabel,
            inline: true,
          },
          {
            name: "User Email",
            value: finalEmail || "Anonymous / Unauthenticated",
            inline: true,
          },
          {
            name: "Use Case / Description",
            value: description && description.trim() ? description.trim() : "*No additional details provided*",
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "Exismic Tool Request Hub • 12H Rate Limited",
        },
      };

      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embeds: [embed] }),
        });
      } catch (err) {
        console.warn("[Tool Suggestion] Discord webhook dispatch failed:", err);
      }
    }

    // 2. Send Thank-You Confirmation Email if user email is present & Resend API Key exists
    if (finalEmail && process.env.RESEND_API_KEY) {
      const senderDomain = process.env.EMAIL_SENDER_DOMAIN?.trim() || "exismic.xyz";
      const fromAddress = `"Exismic Studio" <welcome@${senderDomain}>`;

      const htmlBody = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050509; color: #e4e4e7; margin: 0; padding: 30px; }
              .container { max-width: 560px; margin: 0 auto; background: #0c0d14; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
              .badge { display: inline-block; padding: 4px 12px; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); border-radius: 99px; color: #c084fc; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
              h1 { font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 12px 0; text-transform: uppercase; font-style: italic; }
              p { font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 20px 0; }
              .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; margin: 20px 0; }
              .card-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; margin-bottom: 6px; }
              .card-val { font-size: 16px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
              .card-desc { font-size: 13px; color: #71717a; line-height: 1.5; margin: 0; }
              .footer { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 28px; font-size: 11px; color: #52525b; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="badge">✨ Tool Request Received</div>
              <h1>Thanks for your suggestion!</h1>
              <p>Hey there,</p>
              <p>Thank you for submitting your tool idea to <strong>Exismic AI Studio</strong>. Community requests directly shape our weekly tool drops and feature pipeline!</p>
              
              <div class="card">
                <div class="card-title">Your Suggested Tool</div>
                <div class="card-val">${escapeHtml(toolName.trim())}</div>
                ${description ? `<p class="card-desc">"${escapeHtml(description.trim())}"</p>` : ''}
              </div>

              <p>Our dev team evaluates new requests daily. If your tool idea is selected for development, you'll be among the first to get early VIP preview access!</p>
              
              <div class="footer">
                &copy; 2026 Exismic AI Studio • Building practical tools for everyday work
              </div>
            </div>
          </body>
        </html>
      `;

      try {
        await resend.emails.send({
          from: fromAddress,
          to: [finalEmail],
          subject: `✨ We received your tool suggestion: "${toolName.trim()}"`,
          html: htmlBody,
        });
      } catch (err) {
        console.warn("[Tool Suggestion] Resend email failed:", err);
      }
    }

    // Set 12-hour cookie response
    const response = NextResponse.json({
      success: true,
      message: "Suggestion submitted successfully!",
      nextAllowedTime: Date.now() + COOLDOWN_MS,
    });

    response.cookies.set("exismic_suggest_cooldown", Date.now().toString(), {
      maxAge: 12 * 60 * 60, // 12 hours in seconds
      path: "/",
      httpOnly: false, // Accessible to clientJS
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Error submitting tool suggestion:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
