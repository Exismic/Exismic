import { prisma } from "@/lib/prisma";
import { getAdminAccessMode } from "@/lib/admin";
import { getEmailDiagnostics } from "@/lib/email-diagnostics";
import { getToolHealthDiagnostics } from "@/lib/tool-health";

type DiagnosticStatus = "ok" | "warning" | "error";

function envCheck(key: string, label: string, required = true) {
  const configured = Boolean(process.env[key]);
  return {
    key,
    label,
    status: configured ? "ok" : required ? "error" : "warning",
    configured,
    detail: configured ? "Configured" : required ? "Missing" : "Optional / not configured",
  } satisfies {
    key: string;
    label: string;
    status: DiagnosticStatus;
    configured: boolean;
    detail: string;
  };
}

function summarizeStatus(statuses: DiagnosticStatus[]): DiagnosticStatus {
  if (statuses.includes("error")) return "error";
  if (statuses.includes("warning")) return "warning";
  return "ok";
}

export async function getSystemDiagnostics() {
  const email = getEmailDiagnostics();
  const tools = getToolHealthDiagnostics();

  const env = [
    envCheck("DATABASE_URL", "Database URL"),
    envCheck("NEXT_PUBLIC_SUPABASE_URL", "Supabase URL"),
    envCheck("NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase anon key"),
    envCheck("SUPABASE_SERVICE_ROLE_KEY", "Supabase service role key"),
    envCheck("RESEND_API_KEY", "Resend API key"),
    envCheck("RAZORPAY_KEY_ID", "Razorpay key ID"),
    envCheck("RAZORPAY_KEY_SECRET", "Razorpay key secret"),
    envCheck("NEXT_PUBLIC_RAZORPAY_KEY_ID", "Razorpay public key"),
    envCheck("GROQ_API_KEY", "Groq API key", false),
    envCheck("GROQ_API_KEYS", "Groq API key pool", false),
    envCheck("REMOVE_BG_API_KEY", "Remove.bg fallback key", false),
    envCheck("HUGGINGFACE_TOKEN", "Hugging Face token", false),
    envCheck("FAL_KEY", "Fal image key", false),
    envCheck("TOGETHER_API_KEY", "Together image key", false),
    envCheck("ELEVENLABS_API_KEY", "ElevenLabs voice key", false),
    envCheck("MODAL_IMAGE_URL", "Modal image processor", false),
    envCheck("MODAL_IMAGE_PRIORITY_URL", "Modal priority image processor", false),
    envCheck("MODAL_IMAGE_API_KEY", "Modal image API key", false),
    envCheck("MODAL_PHOTO_RESTORER_URL", "Modal photo restorer", false),
    envCheck("MODAL_WATERMARK_REMOVER_URL", "Modal watermark remover", false),
    envCheck("MODAL_VIDEO_URL", "Modal video tools", false),
  ];

  let database = {
    status: "error" as DiagnosticStatus,
    totalUsers: 0,
    freeUsers: 0,
    proUsers: 0,
    cancelledSubscriptions: 0,
    recentUsers: [] as Array<{
      email: string | null;
      plan: string;
      subscriptionStatus: string;
      createdAt: string;
    }>,
    error: "Not checked",
  };

  try {
    const [totalUsers, freeUsers, proUsers, cancelledSubscriptions, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: { not: "pro" } } }),
      prisma.user.count({ where: { plan: "pro" } }),
      prisma.user.count({ where: { subscriptionStatus: "cancelled" } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          email: true,
          plan: true,
          subscriptionStatus: true,
          createdAt: true,
        },
      }),
    ]);

    database = {
      status: "ok",
      totalUsers,
      freeUsers,
      proUsers,
      cancelledSubscriptions,
      recentUsers: recentUsers.map((user) => ({
        email: user.email,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt.toISOString(),
      })),
      error: "",
    };
  } catch (error) {
    database = {
      ...database,
      error: error instanceof Error ? error.message : "Database diagnostics failed",
    };
  }

  const payments = {
    status: summarizeStatus([
      process.env.RAZORPAY_KEY_ID ? "ok" : "error",
      process.env.RAZORPAY_KEY_SECRET ? "ok" : "error",
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? "ok" : "error",
    ]),
    razorpayServerConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    razorpayPublicConfigured: Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
  };

  const status = summarizeStatus([
    email.status as DiagnosticStatus,
    tools.status as DiagnosticStatus,
    database.status,
    payments.status,
    ...env.map((item) => item.status),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    status,
    adminAccessMode: getAdminAccessMode(),
    env,
    email,
    tools,
    payments,
    database,
  };
}
