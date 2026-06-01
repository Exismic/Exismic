import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

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

    /*
    if (user.credits < options.creditCost) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }
    */
    
    const isPro = user.plan === "pro" || user.subscriptionStatus === "active";
    const queue = isPro ? "priority" : "normal";
    const processingLabel = isPro ? "Processing with Priority..." : "Processing...";

    // We'll use the prisma user object for the rest of the logic
    const session = { user }; // Mock session for compatibility

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

    // 4. Create Job in DB
    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
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
      prisma.user.update({
        where: { id: session.user.id },
        data: { dailyCredits: { decrement: options.creditCost } }
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
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
