"use server";

import { affiliateAdminEmail, affiliateApplicantEmail } from "@/emails/notifications";
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
        const adminEmailHtml = affiliateAdminEmail({ name, email, channel, audienceSize, message, ticketId: ticket.id, adminCenterLink });

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
        const applicantEmailHtml = affiliateApplicantEmail({ name, channel, audienceSize, ticketId: ticket.id, email });

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
    return { error: "Could not submit your application right now. Please try again." };
  }
}
