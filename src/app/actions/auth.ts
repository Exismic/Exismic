"use server";

import { createClient } from "@/utils/supabase/server";
import { sendAuthOTP, sendResetPasswordEmail, sendMagicLinkEmail, sendPasswordChangedEmail } from "@/lib/emails";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/utils/supabase/admin";
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from "crypto";
import { getServerSiteUrl } from "@/lib/site-url";
import { sendWelcomeEmailOnce } from "@/lib/welcome-email";

type AuthRateLimitType = "otp_verification" | "magic_link" | "password_reset";

const AUTH_EMAIL_RATE_LIMIT_MS = 2 * 60 * 60 * 1000;
const AUTH_EMAIL_RATE_LIMIT_MESSAGE = "Please wait 2 hours before requesting another code";
const PASSWORD_RESET_TOKEN_PREFIX = "pwd_reset:";
const OAUTH_LINK_TOKEN_PREFIX = "oauth_link:";
const OAUTH_PROVIDER_APPROVAL_PREFIX = "oauth_provider_approved:";

export type OAuthLinkProvider = "google" | "github" | "discord";

function isOAuthLinkProvider(value: string): value is OAuthLinkProvider {
  return value === "google" || value === "github" || value === "discord";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePasswordStrength(password: string) {
  const checks = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (password.length < 10 || checks < 3) {
    return "Use at least 10 characters with a mix of uppercase, lowercase, numbers, or symbols.";
  }

  return null;
}

function getSiteUrl() {
  return getServerSiteUrl();
}

export async function checkRateLimit(email: string, type: AuthRateLimitType) {
  const emailLower = email.trim().toLowerCase();
  const now = Date.now();

  try {
    const data = await prisma.authRateLimit.findFirst({
      where: {
        email: emailLower,
        type,
      },
      select: {
        lastRequestedAt: true,
      },
    });

    if (!data?.lastRequestedAt) {
      return { allowed: true, error: null };
    }

    const lastRequestedAt = data.lastRequestedAt.getTime();
    if (Number.isFinite(lastRequestedAt) && now - lastRequestedAt < AUTH_EMAIL_RATE_LIMIT_MS) {
      return { allowed: false, error: AUTH_EMAIL_RATE_LIMIT_MESSAGE };
    }

    return { allowed: true, error: null };
  } catch (error) {
    console.error("[Auth] Rate limit lookup failed; allowing request so auth email is not blocked:", error);
    return { allowed: true, error: null };
  }
}

async function recordRateLimit(email: string, type: AuthRateLimitType) {
  const emailLower = email.trim().toLowerCase();
  const now = new Date();

  try {
    await prisma.authRateLimit.upsert({
      where: {
        email_type: {
          email: emailLower,
          type,
        },
      },
      update: {
        lastRequestedAt: now,
      },
      create: {
        email: emailLower,
        type,
        lastRequestedAt: now,
      },
    });
  } catch (error) {
    console.error("[Auth] Rate limit update failed; email was still sent:", error);
    return false;
  }

  return true;
}

function generateOtp() {
  return randomInt(100000, 1000000).toString();
}

async function findSupabaseAuthUserByEmail(email: string) {
  const supabaseAdmin = createAdminClient();
  const emailLower = email.trim().toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw error;
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === emailLower);
    if (match) return match;
    if (data.users.length < 1000) break;
  }

  return null;
}

async function getAuthUserIdForEmail(email: string) {
  const emailLower = email.trim().toLowerCase();
  const dbUser = await prisma.user.findUnique({ where: { email: emailLower } });

  if (dbUser) {
    try {
      const supabaseAdmin = createAdminClient();
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(dbUser.id);
      if (!error && data.user?.email?.toLowerCase() === emailLower) {
        return data.user.id;
      }
    } catch (error) {
      console.error("[Auth] Failed to verify Prisma auth user id:", error);
    }
  }

  const authUser = await findSupabaseAuthUserByEmail(emailLower);
  return authUser?.id || null;
}

function isValidOAuthLinkNonce(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function findOAuthLinkRequest(nonce: string) {
  if (!isValidOAuthLinkNonce(nonce)) return null;

  const request = await prisma.verificationToken.findFirst({
    where: {
      token: { startsWith: `${OAUTH_LINK_TOKEN_PREFIX}${nonce}:` },
      expires: { gt: new Date() },
    },
  });

  if (!request) return null;
  const provider = request.token.split(":").at(-1) || "";
  if (!isOAuthLinkProvider(provider)) return null;

  return { ...request, provider };
}

export async function createOAuthLinkRequestAction(
  rawEmail: string,
  provider: OAuthLinkProvider,
) {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email) || !isOAuthLinkProvider(provider)) {
    throw new Error("Invalid OAuth account-link request.");
  }

  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      token: { startsWith: OAUTH_LINK_TOKEN_PREFIX },
    },
  });

  const nonce = uuidv4();
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: `${OAUTH_LINK_TOKEN_PREFIX}${nonce}:${provider}`,
      expires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return { nonce };
}

export async function getOAuthLinkRequestAction(nonce: string) {
  const request = await findOAuthLinkRequest(nonce);
  if (!request) {
    return { error: "This connection request expired. Start the social login again." };
  }

  return {
    success: true,
    email: request.identifier,
    provider: request.provider,
  };
}

export async function isOAuthProviderApproved(
  rawEmail: string,
  provider: OAuthLinkProvider,
) {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email) || !isOAuthLinkProvider(provider)) return false;

  const approval = await prisma.authRateLimit.findUnique({
    where: {
      email_type: {
        email,
        type: `${OAUTH_PROVIDER_APPROVAL_PREFIX}${provider}`,
      },
    },
    select: { id: true },
  });
  return Boolean(approval);
}

export async function recordOAuthProviderApproval(
  rawEmail: string,
  provider: OAuthLinkProvider,
) {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email) || !isOAuthLinkProvider(provider)) {
    throw new Error("Invalid OAuth provider approval.");
  }

  const type = `${OAUTH_PROVIDER_APPROVAL_PREFIX}${provider}`;
  await prisma.authRateLimit.upsert({
    where: { email_type: { email, type } },
    update: { lastRequestedAt: new Date() },
    create: { email, type, lastRequestedAt: new Date() },
  });
}

export async function consumeOAuthLinkRequestAction(nonce: string) {
  const request = await findOAuthLinkRequest(nonce);
  if (!request) {
    return { error: "This connection request expired. Start the social login again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user?.email || user.email.toLowerCase() !== request.identifier) {
    return { error: "Sign in to the existing account before connecting this login method." };
  }

  const appUser = await prisma.user.findUnique({
    where: { email: request.identifier },
    select: { id: true },
  });
  if (!appUser || appUser.id !== user.id) {
    return { error: "This login method cannot be connected to that account." };
  }

  const approvedProviders = Array.isArray(user.user_metadata?.approved_oauth_providers)
    ? user.user_metadata.approved_oauth_providers.filter(
        (value: unknown): value is string => typeof value === "string",
      )
    : [];
  const supabaseAdmin = createAdminClient();
  const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      approved_oauth_providers: Array.from(
        new Set([...approvedProviders, request.provider]),
      ),
    },
  });
  if (metadataError) {
    console.error("[Auth] Could not approve OAuth account link:", metadataError.message);
    return { error: "Could not prepare this login method. Please try again." };
  }

  await recordOAuthProviderApproval(request.identifier, request.provider);

  await prisma.verificationToken.delete({
    where: { token: request.token },
  });

  return { success: true, provider: request.provider };
}

export async function cancelOAuthLinkRequestAction(nonce: string) {
  if (!isValidOAuthLinkNonce(nonce)) return { success: true };

  await prisma.verificationToken.deleteMany({
    where: { token: { startsWith: `${OAUTH_LINK_TOKEN_PREFIX}${nonce}:` } },
  });
  return { success: true };
}

export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const rawReturnUrl = String(formData.get("returnUrl") || "/dashboard");
  const returnUrl = rawReturnUrl.startsWith("/") ? rawReturnUrl : "/dashboard";

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  const trustedDevice = await prisma.trustedLoginDevice.findUnique({
    where: { loginEmail: email },
    select: {
      status: true,
      revokedAt: true,
      expiresAt: true,
    },
  });

  if (
    !trustedDevice ||
    trustedDevice.status !== "active" ||
    trustedDevice.revokedAt ||
    trustedDevice.expiresAt <= new Date()
  ) {
    return {
      error:
        "Trusted login is not registered for this email. Sign in normally, then set it up in Account Settings > Security.",
    };
  }

  const limit = await checkRateLimit(email, "magic_link");
  if (!limit.allowed) {
    return { error: limit.error || AUTH_EMAIL_RATE_LIMIT_MESSAGE };
  }

  try {
    const redirectTo = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(returnUrl)}`;
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo,
      },
    });

    if (error || !data?.properties?.action_link) {
      console.error("[Auth] Magic link generation failed:", error?.message || "No action link returned");
      return {
        success: true,
        message: "If an account exists for this email, a secure magic link has been sent.",
      };
    }

    const sent = await sendMagicLinkEmail(email, data.properties.action_link);
    if (!sent) {
      return { error: "Could not send the magic link right now. Please try again." };
    }
    await recordRateLimit(email, "magic_link");

    return {
      success: true,
      message: "Trusted login link sent. Check your inbox and use it within 15 minutes.",
    };
  } catch (error) {
    console.error("[Auth] Magic link request failed:", error);
    return { error: "Could not send the magic link right now. Please try again." };
  }
}

export async function resendOtpAction(email: string) {
  const emailLower = email.trim().toLowerCase();
  if (!isValidEmail(emailLower)) {
    return { error: "Enter a valid email address." };
  }

  const limit = await checkRateLimit(emailLower, "otp_verification");
  if (!limit.allowed) {
    return { error: limit.error || AUTH_EMAIL_RATE_LIMIT_MESSAGE };
  }
  
  // 1. Generate new OTP
  const otp = generateOtp();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  // 2. Update Database
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: emailLower,
      token: {
        not: {
          startsWith: PASSWORD_RESET_TOKEN_PREFIX,
        },
      },
    }
  });

  await prisma.verificationToken.create({
    data: {
      identifier: emailLower,
      token: otp,
      expires
    }
  });

  // 3. Send via Resend
  const sent = await sendAuthOTP(emailLower, otp);
  if (!sent) {
    return { error: "Could not send the verification code right now. Please try again." };
  }
  await recordRateLimit(emailLower, "otp_verification");

  return { success: true };
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return { error: passwordError };
  }

  const limit = await checkRateLimit(email, "otp_verification");
  if (!limit.allowed) {
    return { error: limit.error || AUTH_EMAIL_RATE_LIMIT_MESSAGE };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const existingAuthUser = await findSupabaseAuthUserByEmail(email);
    const existingDbUser = await prisma.user.findUnique({ where: { email } });

    if (existingAuthUser?.email_confirmed_at) {
      return { error: "This email is already registered. Please sign in instead." };
    }

    if (existingDbUser && !existingAuthUser) {
      return { error: "This email is already registered. Please sign in instead." };
    }

    if (existingAuthUser) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingAuthUser.id,
        { password },
      );
      if (updateError) throw updateError;
    } else {
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { signup_method: "credentials" },
      });
      if (createError) throw createError;
    }
  } catch (error) {
    console.error("[Auth] Could not prepare credential signup:", error);
    return { error: "Could not create this account right now. Please try again." };
  }

  // 2. Generate OTP and store in Database (Session-independent)
  const otp = generateOtp();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      token: {
        not: {
          startsWith: PASSWORD_RESET_TOKEN_PREFIX,
        },
      },
    }
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: otp,
      expires
    }
  });

  // 3. Send via Resend
  const sent = await sendAuthOTP(email, otp);
  if (!sent) {
    return { error: "Could not send the verification code right now. Please try again." };
  }
  await recordRateLimit(email, "otp_verification");

  return { success: true, email, step: "verify" };
}

export async function verifyOtpAction(email: string, otp: string, password: string) {
  const emailLower = email.trim().toLowerCase();
  const otpClean = otp.trim();

  if (!isValidEmail(emailLower) || !/^\d{6}$/.test(otpClean)) {
    return { error: "Enter the complete 6-digit verification code." };
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) return { error: passwordError };
  
  // 1. Check the database for the token
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: emailLower,
      token: otpClean,
      NOT: {
        token: {
          startsWith: PASSWORD_RESET_TOKEN_PREFIX,
        },
      },
    }
  });

  if (!verificationToken) {
    return { error: "Invalid verification code. Please check your email again." };
  }

  if (verificationToken.expires < new Date()) {
    return { error: "Code has expired. Please sign up again." };
  }

  // Confirm the auth identity only after the custom OTP has been validated.
  try {
    const supabaseAdmin = createAdminClient();
    const authUserId = await getAuthUserIdForEmail(emailLower);

    if (authUserId) {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        email_confirm: true,
        password,
        user_metadata: { verified_via_custom_otp: true },
      });

      if (confirmError) {
        console.error(`[Auth] Failed to confirm user ${authUserId}:`, confirmError.message);
        return { error: "Could not verify this account. Please request a new code and try again." };
      }
    } else {
      return { error: "Could not find this account. Please sign up again." };
    }
  } catch (adminError) {
    console.error('[Auth] Supabase Admin operation failed. Make sure SUPABASE_SERVICE_ROLE_KEY is set.', adminError);
    return { error: "Could not verify this account right now. Please try again." };
  }

  // Initialize the application account only after verification succeeds.
  try {
    const authUserId = await getAuthUserIdForEmail(emailLower);
    
    if (authUserId) {
      await prisma.user.upsert({
        where: { email: emailLower },
        update: {},
        create: {
          id: authUserId,
          email: emailLower,
          dailyCredits: 50,
          bonusCredits: 0,
          lifetimeCredits: 0,
          plan: 'free'
        }
      });
    }

    await prisma.verificationToken.deleteMany({
      where: {
        identifier: emailLower,
        token: otpClean,
      },
    });

    const welcomeResult = await sendWelcomeEmailOnce(emailLower);
    if (welcomeResult === "failed") {
      console.error("[Auth] Welcome email failed:", emailLower);
    }
  } catch (err) {
    console.error('[Auth] Failed to initialize user credits:', err);
    return { error: "Your email was verified, but account setup could not finish. Please try signing in." };
  }
  
  return { success: true };
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address.", field: "email" as const };
  }

  if (!password) {
    return { error: "Enter your password.", field: "password" as const };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(`[Auth] Sign in failed for ${email}:`, error.message);
    
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return {
        error: "Email or password is incorrect. Check both fields and try again.",
        field: "credentials" as const,
      };
    }
    
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Email not verified. Please check your inbox or try signing up again to get a new code." };
    }
    
    return { error: "We couldn't sign you in right now. Please try again shortly." };
  }

  return { success: true };
}

export async function forgotPasswordAction(email: string) {
  const emailLower = email.toLowerCase().trim();
  if (!isValidEmail(emailLower)) {
    return { error: "Enter a valid email address." };
  }
  
  const limit = await checkRateLimit(emailLower, "password_reset");
  if (!limit.allowed) {
    return { error: limit.error || AUTH_EMAIL_RATE_LIMIT_MESSAGE };
  }

  const authUserId = await getAuthUserIdForEmail(emailLower);
  if (!authUserId) {
    await recordRateLimit(emailLower, "password_reset");
    return { success: true };
  }

  // 2. Generate Reset Token
  const token = `${PASSWORD_RESET_TOKEN_PREFIX}${uuidv4()}`;
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.verificationToken.deleteMany({
    where: {
      identifier: emailLower,
      token: {
        startsWith: PASSWORD_RESET_TOKEN_PREFIX,
      },
    },
  });
  await prisma.verificationToken.create({
    data: { identifier: emailLower, token, expires }
  });

  // 3. Send Email
  const sent = await sendResetPasswordEmail(emailLower, token);
  if (!sent) {
    return { error: "Could not send the password reset email right now. Please try again." };
  }
  await recordRateLimit(emailLower, "password_reset");

  return { success: true };
}

export async function validateResetPasswordTokenAction(email: string, token: string) {
  const emailLower = email.toLowerCase().trim();

  if (!isValidEmail(emailLower) || !token.startsWith(PASSWORD_RESET_TOKEN_PREFIX)) {
    return { valid: false, error: "This password reset link is invalid or has already been used." };
  }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: emailLower,
      token,
      expires: {
        gt: new Date(),
      },
    },
    select: {
      token: true,
    },
  });

  if (!verificationToken) {
    return { valid: false, error: "This password reset link is invalid, expired, or already used." };
  }

  return { valid: true };
}

export async function updatePasswordAction(email: string, token: string, password: string) {
  const emailLower = email.toLowerCase().trim();

  if (!isValidEmail(emailLower) || !token.startsWith(PASSWORD_RESET_TOKEN_PREFIX)) {
    return { error: "Reset link has expired or is invalid. Please request a new one." };
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return { error: passwordError };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const authUserId = await getAuthUserIdForEmail(emailLower);

    if (!authUserId) return { error: "User not found." };

    const consumedToken = await prisma.verificationToken.deleteMany({
      where: {
        identifier: emailLower,
        token,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (consumedToken.count !== 1) {
      return { error: "Reset link has expired or is invalid. Please request a new one." };
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      password: password,
      email_confirm: true
    });

    if (error) {
      console.error("[Auth] Password update failed after token consumption:", error.message);
      return { error: "Password reset failed. Please request a new reset link." };
    }

    const alertSent = await sendPasswordChangedEmail(emailLower);
    if (!alertSent) {
      console.error("[Auth] Password changed email failed:", emailLower);
    }

    return { success: true };
  } catch (err) {
    console.error('[Auth] Password update failed:', err);
    return { error: "Failed to update password. Please try again." };
  }
}
