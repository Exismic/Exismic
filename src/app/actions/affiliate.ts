"use server";

import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { getAdminEmails } from "@/lib/admin";
import { getServerSiteUrl } from "@/lib/site-url";

const EMAIL_DOMAIN = process.env.EMAIL_SENDER_DOMAIN?.trim() || "exismic.xyz";
const SENDER_PARTNERS = `Exismic Partners <partners@${EMAIL_DOMAIN}>`;

export async function submitAffiliateApplication(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const channel = (formData.get("channel") as string)?.trim();
    const audienceSize = (formData.get("audienceSize") as string)?.trim() || "1k - 10k";
    const message = (formData.get("message") as string)?.trim() || "";

    if (!name || !email || !channel) {
      return { error: "Please provide your full name, email, and channel link." };
    }

    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return { error: "Please enter a valid email address." };
    }

    // 1. Create a SupportTicket in DB for tracking in Admin Center
    const ticket = await prisma.supportTicket.create({
      data: {
        name,
        email,
        subject: "Creator & Affiliate Partnership",
        message: `[AFFILIATE APPLICATION]\nName: ${name}\nEmail: ${email}\nChannel / Platform: ${channel}\nAudience Size: ${audienceSize}\nPitch & Notes: ${message || "None provided"}`,
        status: "open",
      },
    });

    const siteUrl = getServerSiteUrl();
    const adminCenterLink = `${siteUrl}/admin?tab=tickets&search=${encodeURIComponent(email)}`;

    // 2. Dispatch Immediate Notification Email to Admin (syedrayan.dev@gmail.com)
    const adminRecipients = getAdminEmails();
    if (process.env.RESEND_API_KEY && adminRecipients.length > 0) {
      try {
        const adminEmailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #ffffff; background-color: #090a10; border-radius: 18px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
              <span style="display: inline-block; padding: 4px 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 999px; color: #fbbf24; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                🤝 New Affiliate Application
              </span>
            </div>

            <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.5px;">
              New Creator Partner Request Received
            </h1>
            <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 24px 0; line-height: 1.6;">
              A creator has applied for the Exismic Partner Program. You can review their audience, inspect their channel, and accept or refuse their request below.
            </p>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #71717a; width: 140px; font-weight: 600;">Applicant Name:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 700;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Email Address:</td>
                  <td style="padding: 6px 0; color: #22d3ee; font-weight: 700;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Channel / Website:</td>
                  <td style="padding: 6px 0;">
                    <a href="${channel.startsWith('http') ? channel : `https://${channel}`}" target="_blank" style="color: #fbbf24; text-decoration: underline; font-weight: 700;">
                      ${channel}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Audience Bracket:</td>
                  <td style="padding: 6px 0; color: #34d399; font-weight: 800;">${audienceSize}</td>
                </tr>
                ${
                  message
                    ? `<tr>
                        <td style="padding: 10px 0 6px 0; color: #71717a; font-weight: 600; vertical-align: top;">Notes & Pitch:</td>
                        <td style="padding: 10px 0 6px 0; color: #e4e4e7; line-height: 1.6; font-style: italic;">&ldquo;${message}&rdquo;</td>
                      </tr>`
                    : ""
                }
              </table>
            </div>

            <div style="margin-bottom: 28px;">
              <a href="${adminCenterLink}" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(90deg, #f59e0b, #fbbf24); color: #000000; text-align: center; padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">
                Review in Admin Center (Accept / Refuse) →
              </a>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; font-size: 11px; color: #52525b; line-height: 1.5;">
              Ticket ID: <code>${ticket.id}</code> · Submitted via Exismic Affiliate Portal · Direct Reply: <a href="mailto:${email}?subject=Your Exismic Creator Partner Application" style="color: #a1a1aa; text-decoration: underline;">Email Applicant</a>
            </div>
          </div>
        `;

        for (const adminEmail of adminRecipients) {
          try {
            await resend.emails.send({
              from: SENDER_PARTNERS,
              to: adminEmail,
              subject: `🤝 New Affiliate Application: ${name} (${audienceSize})`,
              html: adminEmailHtml,
            });
          } catch (err) {
            // Auto fallback if domain is unverified
            await resend.emails.send({
              from: "Exismic Partners <onboarding@resend.dev>",
              to: adminEmail,
              subject: `🤝 New Affiliate Application: ${name} (${audienceSize})`,
              html: adminEmailHtml,
            });
          }
        }
      } catch (adminMailError) {
        console.error("Failed to send admin notification email:", adminMailError);
      }
    }

    // 3. Dispatch Auto-Reply Email to Applicant
    if (process.env.RESEND_API_KEY) {
      try {
        const applicantEmailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #ffffff; background-color: #090a10; border-radius: 18px; border: 1px solid rgba(255,255,255,0.1);">
            <h2 style="color: #fbbf24; font-size: 20px; font-weight: 900; margin: 0 0 12px 0;">
              We Received Your Partner Application!
            </h2>
            <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
              Hi <strong>${name}</strong>, thank you for applying to the Exismic Creator & Partner Program!
            </p>
            <p style="color: #a1a1aa; font-size: 13px; line-height: 1.6; margin: 0 0 20px 0;">
              Our partnerships team reviews every channel manually to ensure a great fit. We have received your application for <strong>${channel}</strong> (${audienceSize}) and will follow up with your approved custom tracking link and affiliate perks within 24 hours.
            </p>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 12px; color: #a1a1aa;">
              <strong>Application Reference:</strong> <code>${ticket.id}</code><br/>
              <strong>Registered Email:</strong> ${email}
            </div>
            <a href="${siteUrl}/tools" style="display: inline-block; background: #ffffff; color: #000000; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 800; text-decoration: none;">
              Explore Exismic Studio Tools →
            </a>
          </div>
        `;

        try {
          await resend.emails.send({
            from: SENDER_PARTNERS,
            to: email,
            subject: "We received your Exismic Creator Partner application",
            html: applicantEmailHtml,
          });
        } catch {
          await resend.emails.send({
            from: "Exismic Partners <onboarding@resend.dev>",
            to: email,
            subject: "We received your Exismic Creator Partner application",
            html: applicantEmailHtml,
          });
        }
      } catch (applicantMailError) {
        console.error("Failed to send applicant auto-reply:", applicantMailError);
      }
    }

    // 4. Send to Discord Support Webhook if configured
    const webhookUrl = process.env.DISCORD_SUPPORT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const embed = {
          title: `🤝 New Affiliate Application: ${name}`,
          color: 16103691, // Amber Gold
          fields: [
            { name: "Applicant", value: `${name} (${email})`, inline: false },
            { name: "Channel / URL", value: channel, inline: true },
            { name: "Audience Size", value: audienceSize, inline: true },
            { name: "Notes", value: message || "None provided", inline: false },
            { name: "Ticket ID", value: ticket.id, inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "Exismic Affiliate Engine" },
        };
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embeds: [embed] }),
        });
      } catch (webhookErr) {
        console.error("Failed to post affiliate to Discord webhook:", webhookErr);
      }
    }

    return { success: true, ticketId: ticket.id };
  } catch (err: any) {
    console.error("Failed to submit affiliate application:", err);
    return { error: err.message || "Failed to submit application. Please email partners@exismic.xyz directly." };
  }
}
