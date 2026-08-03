import { prisma } from "@/lib/prisma";

export type LogToolErrorParams = {
  toolId: string;
  toolName: string;
  userId?: string | null;
  userEmail?: string | null;
  errorMessage: string;
  errorStack?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function logToolError({
  toolId,
  toolName,
  userId,
  userEmail,
  errorMessage,
  errorStack,
  metadata,
}: LogToolErrorParams) {
  try {
    const log = await prisma.toolErrorLog.create({
      data: {
        toolId,
        toolName,
        userId: userId || null,
        userEmail: userEmail || null,
        errorMessage: (errorMessage || "Unknown tool error").slice(0, 4000),
        errorStack: errorStack ? errorStack.slice(0, 8000) : null,
        metadata: metadata ? (metadata as any) : undefined,
        status: "unresolved",
      },
    });
    return log;
  } catch (err) {
    console.error("[logToolError] Failed to persist tool error log:", err);
    return null;
  }
}
