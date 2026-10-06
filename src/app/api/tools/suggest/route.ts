import { publicJson } from "@/lib/public-json";
import { toolSuggestionEmail } from "@/emails/notifications";
import { createClient } from "@/utils/supabase/server";
import { resend } from "@/lib/resend";

const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 Hours in milliseconds

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { toolName, categoryId, description, userEmail } = body;

    if (!toolName || !toolName.trim()) {
      return publicJson({ error: "Please enter a tool idea or name." }, { status: 400 });
    }

    // Supabase auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const finalEmail = (user?.email || userEmail || "").trim();

    // Check server cookie for 12-hour cooldown
    const cookies = req.headers.get("cookie") || "";
    const match = cookies.match(/exismic_suggest_cooldown=(\d+)/);
    if (match) {
      const lastTime = parseInt(match[1], 10);
      const elapsed = Date.now() - lastTime;
      if (elapsed < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - elapsed;
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        return publicJson(
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

      const htmlBody = toolSuggestionEmail(toolName.trim(), description?.trim() || "");

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
    const response = publicJson({
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
    return publicJson(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
