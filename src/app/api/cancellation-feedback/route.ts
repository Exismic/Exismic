import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reasonId, reasonLabel, feedback, userEmail } = body;

    const webhookUrl = process.env.DISCORD_SUPPORT_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn("DISCORD_SUPPORT_WEBHOOK_URL is not configured for cancellation feedback.");
      return NextResponse.json({ success: true, warning: "Webhook missing" });
    }

    const embed = {
      title: "📢 New Cancellation Feedback & Suggestion",
      color: 16738908, // Coral/Amber
      fields: [
        {
          name: "User Email",
          value: userEmail || "Anonymous / Unspecified",
          inline: true,
        },
        {
          name: "Cancellation Reason",
          value: reasonLabel || reasonId || "Not specified",
          inline: true,
        },
        {
          name: "User Feedback / Suggestion",
          value: feedback && feedback.trim() ? feedback.trim() : "*No additional text provided*",
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Exismic Cancellation Feedback System",
      },
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Discord Webhook Error (Cancellation Feedback):", errText);
      return NextResponse.json({ error: "Failed to post to Discord webhook" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in cancellation feedback route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
