import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";
import { resend } from "@/lib/resend";

const EMAIL_DOMAIN = process.env.EMAIL_SENDER_DOMAIN?.trim() || 'exismic.xyz';
const SUPPORT_SENDER = `Exismic Support <support@${EMAIL_DOMAIN}>`;

export async function GET(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const subject = searchParams.get("subject") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status !== "all") {
      where.status = status;
    }

    if (subject !== "all") {
      where.subject = subject;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[ADMIN_TICKETS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { ticketId, status } = body;

    if (!ticketId || !status) {
      return NextResponse.json({ error: "ticketId and status are required" }, { status: 400 });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("[ADMIN_TICKETS_PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { ticketId, replyText, action = "reply" } = body;

    if (!ticketId || !replyText?.trim()) {
      return NextResponse.json({ error: "ticketId and replyText are required" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isAffiliate = ticket.subject.toLowerCase().includes("affiliate") || ticket.subject.toLowerCase().includes("partner");
    let newStatus = "replied";
    let emailSubject = `Re: ${ticket.subject} (Ticket Ref: ${ticket.id})`;
    let emailBadge = "Support Response";
    let badgeColor = "#8B5CF6";
    let headerTitle = "Exismic Help Center";

    if (action === "accept") {
      newStatus = "accepted";
      emailSubject = `🎉 Congratulations! Your Exismic Creator Partnership is Approved`;
      emailBadge = "Partnership Approved";
      badgeColor = "#10b981";
      headerTitle = "Exismic Partner Program";
    } else if (action === "refuse") {
      newStatus = "refused";
      emailSubject = `Update regarding your Exismic Creator Partner Application`;
      emailBadge = "Application Status";
      badgeColor = "#f43f5e";
      headerTitle = "Exismic Partner Program";
    }

    // Send email response using Resend
    if (process.env.RESEND_API_KEY) {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #ffffff; background-color: #090a10; border-radius: 18px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="margin-bottom: 16px;">
            <span style="display: inline-block; padding: 4px 12px; background: rgba(255,255,255,0.06); border: 1px solid ${badgeColor}60; border-radius: 999px; color: ${badgeColor}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
              ${emailBadge}
            </span>
          </div>

          <h2 style="color: #ffffff; font-size: 20px; font-weight: 900; margin: 0 0 12px 0;">
            ${headerTitle}
          </h2>

          <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
            Hi <strong>${ticket.name}</strong>,
          </p>

          <div style="background: rgba(255,255,255,0.03); border-left: 4px solid ${badgeColor}; padding: 18px; margin: 20px 0; border-radius: 8px; color: #f4f4f5; font-size: 14px; line-height: 1.7;">
            ${replyText.replace(/\n/g, "<br />")}
          </div>

          <p style="color: #a1a1aa; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
            ${
              action === "accept"
                ? "You can generate your custom tracking link inside your dashboard or reply directly to this email to coordinate custom vanity promo codes."
                : "If you have any questions, feel free to reply directly to this email."
            }
          </p>

          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0;" />
          
          <div style="color: #71717a; font-size: 11px; line-height: 1.5;">
            Original Reference (${new Date(ticket.createdAt).toLocaleDateString()}):<br />
            <em style="color: #a1a1aa;">${ticket.message.replace(/\n/g, "<br />")}</em>
          </div>
        </div>
      `;

      try {
        await resend.emails.send({
          from: isAffiliate ? `Exismic Partners <partners@${EMAIL_DOMAIN}>` : SUPPORT_SENDER,
          to: ticket.email,
          replyTo: isAffiliate ? `partners@${EMAIL_DOMAIN}` : `support@${EMAIL_DOMAIN}`,
          subject: emailSubject,
          html: emailHtml,
        });
      } catch (sendErr) {
        // Fallback for unverified domain
        await resend.emails.send({
          from: "Exismic <onboarding@resend.dev>",
          to: ticket.email,
          replyTo: isAffiliate ? `partners@${EMAIL_DOMAIN}` : `support@${EMAIL_DOMAIN}`,
          subject: emailSubject,
          html: emailHtml,
        });
      }
    } else {
      console.warn("No RESEND_API_KEY set, skipped support email send.");
    }

    // Update ticket status
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("[ADMIN_TICKETS_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
