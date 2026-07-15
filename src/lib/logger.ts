import { prisma } from "@/lib/prisma";

export async function logError(source: string, error: any) {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : null;

    console.error(`[SYSTEM_ERROR][${source}]`, message, stack || "");

    await prisma.systemLog.create({
      data: {
        level: "error",
        source,
        message,
        stack,
      },
    });
  } catch (logErr) {
    console.error("Critical failure writing system log:", logErr);
  }
}

export async function logWarning(source: string, message: string) {
  try {
    console.warn(`[SYSTEM_WARNING][${source}]`, message);

    await prisma.systemLog.create({
      data: {
        level: "warning",
        source,
        message,
      },
    });
  } catch (logErr) {
    console.error("Critical failure writing system log:", logErr);
  }
}

export async function logInfo(source: string, message: string) {
  try {
    console.log(`[SYSTEM_INFO][${source}]`, message);

    await prisma.systemLog.create({
      data: {
        level: "info",
        source,
        message,
      },
    });
  } catch (logErr) {
    console.error("Critical failure writing system log:", logErr);
  }
}
