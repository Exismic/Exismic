import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { inferResultFileType, normalizeHistoryToolType } from "@/lib/results";
import {
  chargeToolAccess,
  isToolAccessResponse,
  resolveToolAccess,
  type ToolAccessMode,
} from "@/lib/tool-access";
import type { OutputTier } from "@/lib/tool-quality-policy";

export interface ToolOptions {
  toolId: string;
  allowedTypes: string[];
  maxSize: number; // in bytes
  creditCost: number;
  optionalFile?: boolean;
  accessMode?: ToolAccessMode;
}

export interface ToolProcessorContext {
  user: {
    id: string;
    plan?: string | null;
    subscriptionStatus?: string | null;
  } | null;
  isPro: boolean;
  priority: boolean;
  queue: "priority" | "normal";
  processingLabel: string;
  outputTier: OutputTier;
}

export async function withToolHandler(
  req: NextRequest, 
  options: ToolOptions,
  processor: (file: Buffer, jobId: string, formData: FormData, context: ToolProcessorContext) => Promise<{ resultUrl: string, metadata?: Record<string, unknown> }>
) {
  let activeJobId: string | null = null;
  try {
    const formData = await req.formData();
    const access = await resolveToolAccess(req, {
      toolId: options.toolId,
      mode: options.accessMode || "authenticated",
      creditCost: options.creditCost,
      formData,
    });
    if (isToolAccessResponse(access)) return access;

    const user = access.appUser;
    const isPro = access.isPro;
    const queue = isPro ? "priority" : "normal";
    const processingLabel = isPro ? "Processing with Priority..." : "Processing...";
    const file = formData.get("file") as File;

    if (!file && !options.optionalFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. Validate File (if present)
    if (file) {
      if (!options.allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type. Allowed: ${options.allowedTypes.join(", ")}` }, { status: 400 });
      }

      if (file.size > options.maxSize) {
        return NextResponse.json({ error: `File too large. Max: ${options.maxSize / 1024 / 1024}MB` }, { status: 400 });
      }
    }

    const job = user
      ? await prisma.job.create({
          data: {
            userId: user.id,
            toolType: options.toolId,
            status: "PROCESSING",
            progress: 10,
            metadata: {
              priority: isPro,
              queue,
              processingLabel,
              outputTier: access.outputTier,
            } satisfies Prisma.InputJsonObject,
          },
        })
      : null;
    const jobId = job?.id || `guest-${randomUUID()}`;
    activeJobId = job?.id || null;

    // 5. Process File (Buffer conversion if file exists)
    let buffer = Buffer.alloc(0);
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Call actual AI/Tool logic
    const result = await processor(buffer, jobId, formData, {
      user: user ? {
        id: user.id,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
      } : null,
      isPro,
      priority: isPro,
      queue,
      processingLabel,
      outputTier: access.outputTier,
    });

    const debitResult = await chargeToolAccess(access, options.toolId, `tool:${jobId}`);
    if (!debitResult.success) {
      if (job) {
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "FAILED", progress: 100, error: debitResult.error || "Insufficient credits" },
        });
      }
      return NextResponse.json({ error: debitResult.error || "Insufficient credits" }, { status: 402 });
    }

    if (!user || !job) {
      return NextResponse.json({
        success: true,
        jobId,
        result: result.resultUrl,
        priority: false,
        queue: "normal",
        processingLabel,
        outputTier: access.outputTier,
        creditsCharged: 0,
      });
    }

    // 6. Update Job & Deduct Credits
    const normalizedToolType = normalizeHistoryToolType(options.toolId);
    const fileType = inferResultFileType({
      mimeType: file?.type,
      toolType: normalizedToolType,
      resultUrl: result.resultUrl,
    });
    const historyMetadata = {
      ...(result.metadata ?? {}),
      jobId,
      priority: isPro,
      queue,
      processingLabel,
    } satisfies Prisma.InputJsonObject;

    await prisma.$transaction([
      prisma.job.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          progress: 100,
          resultUrl: result.resultUrl,
          metadata: {
            ...(result.metadata ?? {}),
            priority: isPro,
            queue,
            processingLabel,
          } as Prisma.InputJsonObject,
        }
      }),
      prisma.userFile.create({
        data: {
          userId: user.id,
          toolType: normalizedToolType,
          originalName: file?.name || `${normalizedToolType} result`,
          resultUrl: result.resultUrl,
          fileType,
          status: "completed",
          metadata: historyMetadata,
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      jobId: job.id, 
      result: result.resultUrl,
      priority: isPro,
      queue,
      processingLabel,
      outputTier: access.outputTier,
      creditsCharged: access.creditCost,
    });

  } catch (error: unknown) {
    console.error(`Tool Processing Error [${options.toolId}]:`, error);
    if (activeJobId) {
      await prisma.job.update({
        where: { id: activeJobId },
        data: {
          status: "FAILED",
          progress: 100,
          error: error instanceof Error ? error.message : "Internal Server Error",
        },
      }).catch(() => undefined);
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
