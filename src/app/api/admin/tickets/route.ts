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
    const { ticketId, replyText } = body;

    if (!ticketId || !replyText?.trim()) {
      return NextResponse.json({ error: "ticketId and replyText are required" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Send email response using Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: SUPPORT_SENDER,
        to: ticket.email,
        replyTo: `support@${EMAIL_DOMAIN}`,
        subject: `Re: ${ticket.subject} (Ticket Ref: ${ticket.id})`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #8B5CF6;">Exismic Help Center</h2>
          <p>Hi <strong>${ticket.name}</strong>,</p>
          <p>A support specialist has responded to your request:</p>
          <div style="background-color: #f3f4f6; border-left: 4px solid #8B5CF6; padding: 15px; margin: 20px 0; font-style: italic; border-radius: 4px;">
            ${replyText.replace(/\n/g, "<br />")}
          </div>
          <p>If you have any further details to add, feel free to reply directly to this email.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #6b7280; font-size: 12px; line-height: 1.5;">
            Your Original Message (${new Date(ticket.createdAt).toLocaleDateString()}):<br />
            <em>${ticket.message.replace(/\n/g, "<br />")}</em>
          </p>
        </div>`,
      });
    } else {
      console.warn("No RESEND_API_KEY set, skipped support email send.");
    }

    // Update ticket status to replied
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "replied" },
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
