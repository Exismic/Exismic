import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { createClient } from "@/utils/supabase/server";

const TARGET_EMAIL = "syedyaseeralirayan@gmail.com";
const COOLDOWN_MS = 5 * 60 * 60 * 1000; // 5 Hours cooldown

// In-memory rate limiting map for IP / User IDs
const cooldownCache = new Map<string, number>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const cookies = req.headers.get("cookie") || "";
    const cookieMatch = cookies.match(/exismic_mc_feedback_time=(\d+)/);

    const now = Date.now();

    // 1. Check Cookie Cooldown
    if (cookieMatch) {
      const lastTime = parseInt(cookieMatch[1], 10);
      const elapsed = now - lastTime;
      if (elapsed < COOLDOWN_MS) {
        const remainingHours = Math.ceil((COOLDOWN_MS - elapsed) / (1000 * 60 * 60));
        return NextResponse.json(
          { 
            success: false, 
            error: `You've already submitted feedback recently! Thank you for helping us improve. Please check back in ~${remainingHours} hour(s).` 
          },
          { status: 429 }
        );
      }
    }

    // 2. Check In-Memory IP Cooldown
    const lastIpTime = cooldownCache.get(ip);
    if (lastIpTime && now - lastIpTime < COOLDOWN_MS) {
      const remainingHours = Math.ceil((COOLDOWN_MS - (now - lastIpTime)) / (1000 * 60 * 60));
      return NextResponse.json(
        { 
          success: false, 
          error: `You've already submitted feedback recently! Please check back in ~${remainingHours} hour(s).` 
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      rating,
      feedback,
      requestedFeatures,
      skinPrompt,
    } = body;

    // Optional auth check to get user info if available
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const senderEmail = email || user?.email || "Anonymous Gamer";
    const senderName = name || user?.user_metadata?.full_name || user?.user_metadata?.name || "Minecraft Creator";
    const starRating = "★".repeat(Math.max(1, Math.min(5, Number(rating) || 5))) + "☆".repeat(Math.max(0, 5 - (Number(rating) || 5)));

    const emailSubject = `🎮 [Minecraft Beta Feedback] ${rating || 5}★ from ${senderName}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #050508; color: #f3f4f6; margin: 0; padding: 20px; }
            .card { background-color: #0d1117; border: 1px solid #30363d; border-radius: 16px; padding: 28px; max-width: 580px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .header { border-bottom: 1px solid #21262d; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: 800; color: #10b981; margin: 0 0 4px 0; }
            .subtitle { font-size: 12px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.1em; }
            .rating { font-size: 24px; color: #f59e0b; margin: 12px 0; letter-spacing: 2px; }
            .section { margin-bottom: 18px; }
            .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8b949e; margin-bottom: 4px; }
            .value { font-size: 14px; color: #f0f6fc; line-height: 1.5; background: #161b22; padding: 12px; border: 1px solid #21262d; border-radius: 8px; }
            .highlight { color: #a78bfa; font-weight: 600; }
            .footer { font-size: 11px; color: #484f58; text-align: center; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="subtitle">Exismic AI Studio · Beta Feedback</div>
              <h2 class="title">🎮 New Minecraft Skin Feedback</h2>
            </div>

            <div class="section">
              <div class="label">Rating</div>
              <div class="rating">${starRating} (${rating || 5}/5 Stars)</div>
            </div>

            <div class="section">
              <div class="label">Sender Details</div>
              <div class="value">
                <strong>Name:</strong> ${senderName}<br/>
                <strong>Email:</strong> <a href="mailto:${senderEmail}" style="color: #58a6ff;">${senderEmail}</a><br/>
                <strong>User ID:</strong> ${user?.id || "Guest User"}<br/>
                <strong>IP:</strong> ${ip}
              </div>
            </div>

            ${skinPrompt ? `
              <div class="section">
                <div class="label">Skin Prompt Used</div>
                <div class="value" style="font-style: italic; color: #38bdf8;">"${skinPrompt}"</div>
              </div>
            ` : ""}

            ${requestedFeatures && requestedFeatures.length > 0 ? `
              <div class="section">
                <div class="label">Requested Features & Improvements</div>
                <div class="value highlight">${Array.isArray(requestedFeatures) ? requestedFeatures.join(", ") : requestedFeatures}</div>
              </div>
            ` : ""}

            <div class="section">
              <div class="label">User Feedback & Notes</div>
              <div class="value">${feedback ? feedback.replace(/\n/g, "<br/>") : "No extra written feedback provided."}</div>
            </div>

            <div class="footer">
              Sent automatically from Exismic AI Minecraft Skin Studio
            </div>
          </div>
        </body>
      </html>
    `;

    // Dispatch email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const senderDomain = process.env.EMAIL_SENDER_DOMAIN?.trim() || "exismic.xyz";
        await resend.emails.send({
          from: `"Exismic Minecraft Beta" <feedback@${senderDomain}>`,
          to: TARGET_EMAIL,
          subject: emailSubject,
          html: emailHtml,
        });
      } catch (domainErr: any) {
        console.warn("[Minecraft Feedback] Retrying with onboarding@resend.dev fallback:", domainErr?.message);
        await resend.emails.send({
          from: "Exismic <onboarding@resend.dev>",
          to: TARGET_EMAIL,
          subject: emailSubject,
          html: emailHtml,
        });
      }
    } else {
      console.log("[Minecraft Feedback Logged (No RESEND_API_KEY)]:", { TARGET_EMAIL, emailSubject });
    }

    // Update cooldown cache
    cooldownCache.set(ip, now);

    const response = NextResponse.json({ success: true, message: "Feedback submitted successfully." });

    // Set 5-hour cooldown cookie
    response.cookies.set("exismic_mc_feedback_time", now.toString(), {
      maxAge: 5 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("[Minecraft Feedback Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit feedback." },
      { status: 500 }
    );
  }
}
