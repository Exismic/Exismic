import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { inferResultFileType, normalizeHistoryToolType } from "@/lib/results";
import { deductCredits, getCreditTotal, getUserCredits } from "@/lib/credits";

export interface ToolOptions {
  toolId: string;
  allowedTypes: string[];
  maxSize: number; // in bytes
  creditCost: number;
  optionalFile?: boolean;
}

export interface ToolProcessorContext {
  user: {
    id: string;
    plan?: string | null;
    subscriptionStatus?: string | null;
  };
  isPro: boolean;
  priority: boolean;
  queue: "priority" | "normal";
  processingLabel: string;
}

export async function withToolHandler(
  req: NextRequest, 
  options: ToolOptions,
  processor: (file: Buffer, jobId: string, formData: FormData, context: ToolProcessorContext) => Promise<{ resultUrl: string, metadata?: Record<string, unknown> }>
) {
  let activeJobId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (!sbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in Prisma DB
    let user = await prisma.user.findUnique({
      where: { id: sbUser.id }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                id: sbUser.id,
                email: sbUser.email!,
                name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0],
                dailyCredits: 50
            }
        });
    }

    const isPro = user.plan === "pro" || user.subscriptionStatus === "active";
    const queue = isPro ? "priority" : "normal";
    const processingLabel = isPro ? "Processing with Priority..." : "Processing...";

    // 2. Parse Multipart Data
    const formData = await req.formData();
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

    if (options.creditCost > 0) {
      const credits = await getUserCredits(user.id);
      const availableCredits = credits ? getCreditTotal(credits) : 0;

      if (!credits || availableCredits < options.creditCost) {
        return NextResponse.json(
          {
            error: "Insufficient credits",
            available: availableCredits,
            required: options.creditCost,
          },
          { status: 402 }
        );
      }
    }

    // 4. Create Job in DB
    const job = await prisma.job.create({
      data: {
        userId: user.id,
        toolType: options.toolId,
        status: "PROCESSING",
        progress: 10,
        metadata: {
          priority: isPro,
          queue,
          processingLabel,
        } satisfies Prisma.InputJsonObject,
      }
    });
    activeJobId = job.id;

    // 5. Process File (Buffer conversion if file exists)
    let buffer = Buffer.alloc(0);
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Call actual AI/Tool logic
    const result = await processor(buffer, job.id, formData, {
      user: {
        id: user.id,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
      },
      isPro,
      priority: isPro,
      queue,
      processingLabel,
    });

    // 6. Update Job & Deduct Credits
    const normalizedToolType = normalizeHistoryToolType(options.toolId);
    const fileType = inferResultFileType({
      mimeType: file?.type,
      toolType: normalizedToolType,
      resultUrl: result.resultUrl,
    });
    const historyMetadata = {
      ...(result.metadata ?? {}),
      jobId: job.id,
      priority: isPro,
      queue,
      processingLabel,
    } satisfies Prisma.InputJsonObject;

    const debitResult = options.creditCost > 0
      ? await deductCredits(user.id, options.creditCost, options.toolId)
      : { success: true };

    if (!debitResult.success) {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          progress: 100,
          error: debitResult.error || "Insufficient credits",
        },
      });

      return NextResponse.json(
        { error: debitResult.error || "Insufficient credits" },
        { status: 402 }
      );
    }

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
