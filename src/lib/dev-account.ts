export const DEV_ACCOUNT_EMAIL = "support@exismic.xyz";
export const DEV_ACCOUNT_PASSWORD = "@YASEERRAYANrx1";
export const DEV_INFINITE_BALANCE = 99999999;

/**
 * Checks whether an email matches the localhost developer testing account.
 */
export function isDevAccountEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === DEV_ACCOUNT_EMAIL;
}

/**
 * Strict security guard ensuring the developer account can ONLY be accessed
 * on a local machine (localhost / 127.0.0.1) and NEVER on production or Vercel.
 */
export function isLocalhostDevRequest(headersList?: Headers | null): boolean {
  // 1. Strictly block any production deployment environment (e.g. Vercel)
  if (process.env.NODE_ENV !== "development" || process.env.VERCEL === "1" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    return false;
  }

  // 2. Validate host header if present
  if (headersList) {
    const host = headersList.get("host")?.toLowerCase() || "";
    const isLocalhost =
      /^(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?$/.test(host);

    if (!isLocalhost) {
      return false;
    }
  }

  return Boolean(headersList);
}

/**
 * Ensures the developer testing account exists with confirmed email,
 * password, active Pro status, and infinite credits/sparks.
 */
export async function ensureDevAccountProvisioned(targetUserId?: string): Promise<string> {
  const { createAdminClient } = await import("@/utils/supabase/admin");
  const { prisma } = await import("@/lib/prisma");

  const supabaseAdmin = createAdminClient();

  // Find or update in Supabase Auth
  let authUserId = targetUserId;

  if (!authUserId) {
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
    const existing = listData?.users.find(
      (u) => u.email?.toLowerCase() === DEV_ACCOUNT_EMAIL
    );

    if (existing) {
      authUserId = existing.id;
      // Guarantee password and email confirmation
      await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        password: DEV_ACCOUNT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: "Exismic Developer",
          name: "Exismic Developer",
        },
      });
    } else {
      const { data: createData, error } = await supabaseAdmin.auth.admin.createUser({
        email: DEV_ACCOUNT_EMAIL,
        password: DEV_ACCOUNT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: "Exismic Developer",
          name: "Exismic Developer",
        },
      });
      if (error) {
        throw new Error(`Could not create developer user: ${error.message}`);
      }
      authUserId = createData.user.id;
    }
  }

  // Upsert user in database with infinite credits, sparks, and lifetime Pro status
  await prisma.user.upsert({
    where: { email: DEV_ACCOUNT_EMAIL },
    update: {
      id: authUserId,
      name: "Exismic Developer",
      plan: "pro",
      subscriptionStatus: "active",
      role: "developer",
      dailyCredits: DEV_INFINITE_BALANCE,
      bonusCredits: DEV_INFINITE_BALANCE,
      lifetimeCredits: DEV_INFINITE_BALANCE,
      sparks: DEV_INFINITE_BALANCE,
      lifetimeSparks: DEV_INFINITE_BALANCE,
      status: "active",
      emailVerified: new Date(),
      planExpiresAt: null,
      aiGenerationsLimit: DEV_INFINITE_BALANCE,
    },
    create: {
      id: authUserId,
      email: DEV_ACCOUNT_EMAIL,
      name: "Exismic Developer",
      plan: "pro",
      subscriptionStatus: "active",
      role: "developer",
      dailyCredits: DEV_INFINITE_BALANCE,
      bonusCredits: DEV_INFINITE_BALANCE,
      lifetimeCredits: DEV_INFINITE_BALANCE,
      sparks: DEV_INFINITE_BALANCE,
      lifetimeSparks: DEV_INFINITE_BALANCE,
      status: "active",
      emailVerified: new Date(),
      planExpiresAt: null,
      aiGenerationsLimit: DEV_INFINITE_BALANCE,
    },
  });

  return authUserId;
}
