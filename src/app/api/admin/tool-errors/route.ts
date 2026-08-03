import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";

export async function GET(request: Request) {
  try {
    const { error, status } = await verifyAdmin();
    if (error) return NextResponse.json({ error }, { status });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const toolIdFilter = searchParams.get("toolId") || "all";
    const statusFilter = searchParams.get("status") || "all";

    const where: any = {};

    if (toolIdFilter !== "all") {
      where.toolId = toolIdFilter;
    }

    if (statusFilter !== "all") {
      where.status = statusFilter;
    }

    if (search) {
      where.OR = [
        { toolName: { contains: search, mode: "insensitive" } },
        { toolId: { contains: search, mode: "insensitive" } },
        { errorMessage: { contains: search, mode: "insensitive" } },
        { userEmail: { contains: search, mode: "insensitive" } },
        { userId: { contains: search, mode: "insensitive" } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.toolErrorLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.toolErrorLog.count({ where }),
    ]);

    // Unique tool list for filtering dropdown
    const uniqueTools = await prisma.toolErrorLog.findMany({
      select: { toolId: true, toolName: true },
      distinct: ["toolId"],
    });

    return NextResponse.json({
      success: true,
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      uniqueTools,
    });
  } catch (error) {
    console.error("[AdminToolErrors_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { error, status: authStatus } = await verifyAdmin();
    if (error) return NextResponse.json({ error }, { status: authStatus });

    const body = await request.json();
    const { id, status } = body;

    if (!id || !["unresolved", "investigating", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status or missing id" }, { status: 400 });
    }

    const updated = await prisma.toolErrorLog.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, log: updated });
  } catch (error) {
    console.error("[AdminToolErrors_PATCH]", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error, status: authStatus } = await verifyAdmin();
    if (error) return NextResponse.json({ error }, { status: authStatus });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      await prisma.toolErrorLog.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Log entry deleted" });
    }

    // If no ID passed, clear all resolved or all logs
    const action = searchParams.get("action");
    if (action === "clear_resolved") {
      await prisma.toolErrorLog.deleteMany({ where: { status: "resolved" } });
      return NextResponse.json({ success: true, message: "Cleared all resolved error logs" });
    }

    if (action === "clear_all") {
      await prisma.toolErrorLog.deleteMany({});
      return NextResponse.json({ success: true, message: "Cleared all tool error logs" });
    }

    return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
  } catch (error) {
    console.error("[AdminToolErrors_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete log" }, { status: 500 });
  }
}
