"use server";

import crypto from 'crypto';
import { getSupportAutoReplyHtml } from '@/emails/SupportAutoReply';
import { resend } from '@/lib/resend';
import { prisma } from '@/lib/prisma';
import { uploadProcessedFile } from '@/lib/server/storage';

const EMAIL_DOMAIN = process.env.EMAIL_SENDER_DOMAIN?.trim() || 'exismic.xyz';
const SUPPORT_SENDER = `Exismic Support <support@${EMAIL_DOMAIN}>`;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export async function getActiveSupportTicket(email: string) {
  try {
    if (!email) return null;
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        status: { not: 'resolved' }
      },
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true
      }
    });
    return ticket;
  } catch (err) {
    console.error("Failed to query active ticket:", err);
    return null;
  }
}

export async function submitContactRequest(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const image = formData.get("image") as File | null;

    if (!name || !email || !subject || !message) {
      return { error: "All required fields must be filled out." };
    }

    // Check for existing unresolved ticket
    const activeTicket = await prisma.supportTicket.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        status: { not: 'resolved' }
      }
    });

    if (activeTicket) {
      return { error: "You already have an active unresolved support ticket. Please wait until our team resolves your current ticket before submitting another." };
    }

    if (subject === "Ban Appeal") {
      const targetUser = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { status: true }
      });
      if (!targetUser || targetUser.status !== "suspended") {
        return { error: "This email address is not currently suspended or does not exist." };
      }
    }

    const webhookUrl = process.env.DISCORD_SUPPORT_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('DISCORD_SUPPORT_WEBHOOK_URL is not configured.');
      return { error: 'Support is temporarily unavailable. Please try again shortly.' };
    }
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return { error: 'Enter a valid email address.' };
    }
    if (name.length > 100 || subject.length > 160 || message.length > 10_000) {
      return { error: 'One or more fields are too long.' };
    }
    if (image && image.size > 0 && (image.size > MAX_ATTACHMENT_BYTES || !image.type.startsWith('image/'))) {
      return { error: 'Attachments must be images smaller than 5 MB.' };
    }

    // 1. Upload attachment to Supabase Storage if present
    let attachmentUrl: string | null = null;
    if (image && image.size > 0) {
      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const cleanFileName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `support-tickets/ticket-${Date.now()}-${cleanFileName}`;
        attachmentUrl = await uploadProcessedFile(buffer, fileName, image.type);
      } catch (uploadError) {
        console.error("Failed to upload ticket attachment:", uploadError);
      }
    }

    // 2. Write ticket record to Database
    const ticket = await prisma.supportTicket.create({
      data: {
        name,
        email,
        subject,
        message,
        attachmentUrl,
      }
    });

    const payload = new FormData();
    
    // Determine color based on subject
    let color = 5814783; // Default Blue
    if (subject === "Bug Report") color = 16730698; // Red
    if (subject === "Billing Inquiry") color = 16766720; // Yellow
    if (subject === "Feature Request") color = 5763719; // Green

    const embed = {
      title: `📬 New Support Request: ${subject}`,
      color: color,
      fields: [
        { name: "Ticket ID", value: ticket.id, inline: false },
        { name: "Name", value: name, inline: true },
        { name: "Email", value: email, inline: true },
        { name: "Message", value: message, inline: false },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "Exismic Support Terminal" }
    };

    if (attachmentUrl) {
      embed.fields.push({ name: "Attachment", value: `[View Attachment](${attachmentUrl})`, inline: false });
      if (image) {
        payload.append("file[0]", image);
        (embed as any).image = { url: `attachment://${image.name}` };
      }
    }

    payload.append("payload_json", JSON.stringify({ embeds: [embed] }));

    const response = await fetch(webhookUrl, {
      method: "POST",
      body: payload,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Discord Webhook Error:", err);
      return { error: "Failed to send request. Our systems might be overloaded." };
    }

    // Try to send the auto-reply email via Resend
    try {
      if (process.env.RESEND_API_KEY) {
        const idempotencyKey = crypto
          .createHash('sha256')
          .update(`${email.toLowerCase()}\n${subject}\n${message}`)
          .digest('hex');
        const emailResult = await resend.emails.send({
          from: SUPPORT_SENDER,
          to: email,
          replyTo: `support@${EMAIL_DOMAIN}`,
          subject: `We received your request: ${subject}`,
          html: getSupportAutoReplyHtml(name, subject),
        }, { idempotencyKey: `support-reply/${idempotencyKey}` });
        if (emailResult.error) console.error('Support auto-reply was rejected:', emailResult.error);
      } else {
        console.warn("No RESEND_API_KEY found, skipping auto-reply email.");
      }
    } catch (emailError) {
      console.error("Failed to send auto-reply email:", emailError);
      // We don't return an error to the user here because their request was still successfully submitted to Discord
    }

    return { success: true };
  } catch (error: any) {
    console.error("Contact Form Action Error:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}
