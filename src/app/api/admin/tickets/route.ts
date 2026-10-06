import { supportResponseEmail } from "@/emails/notifications";
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
    let headerTitle = "Exismic Help Center";

    if (action === "accept") {
      newStatus = "accepted";
      emailSubject = `🎉 Congratulations! Your Exismic Creator Partnership is Approved`;
      emailBadge = "Partnership Approved";
      headerTitle = "Exismic Partner Program";
    } else if (action === "refuse") {
      newStatus = "refused";
      emailSubject = `Update regarding your Exismic Creator Partner Application`;
      emailBadge = "Application Status";
      headerTitle = "Exismic Partner Program";
    }

    // Send email response using Resend
    if (process.env.RESEND_API_KEY) {
      const emailHtml = supportResponseEmail({ name: ticket.name, replyText, message: ticket.message, createdAt: ticket.createdAt, badge: emailBadge, title: headerTitle, action });

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
