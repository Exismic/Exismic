import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import {
  inferResultFileType,
  normalizeHistoryToolType,
  type ResultStatus,
} from "@/lib/results";

const VALID_STATUSES = new Set<ResultStatus>(["completed", "failed", "processing"]);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal Error";
}

export async function GET(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedLimit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 20;

    if (searchParams.get("summary") === "1") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [toolsUsedToday, totalFiles, profile] = await Promise.all([
        prisma.userFile.count({
          where: { userId: user.id, createdAt: { gte: startOfToday } },
        }),
        prisma.userFile.count({ where: { userId: user.id } }),
        prisma.user.findUnique({
          where: { id: user.id },
          select: { aiGenerationsUsed: true },
        }),
      ]);

      return NextResponse.json({
        toolsUsedToday,
        totalFiles,
        totalGenerations: profile?.aiGenerationsUsed ?? totalFiles,
      });
    }

    const history = await prisma.userFile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("[HISTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const {
      toolType,
      originalName,
      originalUrl,
      resultUrl,
      fileType,
      status,
      metadata,
    } = body as {
      toolType?: string;
      originalName?: string;
      originalUrl?: string;
      resultUrl?: string;
      fileType?: string;
      status?: ResultStatus;
      metadata?: Record<string, unknown>;
    };

    if (!originalName || !toolType) {
      return new NextResponse(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const normalizedToolType = normalizeHistoryToolType(toolType);
    const normalizedStatus = status && VALID_STATUSES.has(status) ? status : "completed";
    const normalizedFileType = fileType || inferResultFileType({
      toolType: normalizedToolType,
      resultUrl,
    });

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email ?? undefined,
        name: typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : undefined,
      },
      create: {
        id: user.id,
        email: user.email ?? null,
        name: typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : null,
      },
    });

    const historyItem = await prisma.userFile.create({
      data: {
        userId: user.id,
        toolType: normalizedToolType,
        originalName,
        originalUrl,
        resultUrl,
        fileType: normalizedFileType,
        status: normalizedStatus,
        metadata: (metadata || {}) as Prisma.InputJsonObject,
      },
    });

    return NextResponse.json(historyItem);
  } catch (error: unknown) {
    console.error("[HISTORY_POST]", error);
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error) }), { status: 500 });
  }
}
