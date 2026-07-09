"use server";

import { createClient } from "@/utils/supabase/server";
import { sendAuthOTP, sendWelcomeEmail, sendResetPasswordEmail, sendMagicLinkEmail, sendPasswordChangedEmail } from "@/lib/emails";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/utils/supabase/admin";
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from "crypto";
import { getServerSiteUrl } from "@/lib/site-url";

type AuthRateLimitType = "otp_verification" | "magic_link" | "password_reset";

const AUTH_EMAIL_RATE_LIMIT_MS = 2 * 60 * 60 * 1000;
const AUTH_EMAIL_RATE_LIMIT_MESSAGE = "Please wait 2 hours before requesting another code";
const PASSWORD_RESET_TOKEN_PREFIX = "pwd_reset:";

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
  const password = formData.get("password") as string;
  const supabase = await createClient();

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return { error: passwordError };
  }

  const existingDbUser = await prisma.user.findUnique({ where: { email } });
  if (existingDbUser) {
    return { error: "This email is already registered. Please sign in instead." };
  }

  const limit = await checkRateLimit(email, "otp_verification");
  if (!limit.allowed) {
    return { error: limit.error || AUTH_EMAIL_RATE_LIMIT_MESSAGE };
  }

  // 2. Proceed with Supabase Sign Up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return { error: "This email is already registered. Try signing in instead." };
    }
    return { error: error.message };
  }

  if (data.user?.id) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: data.user.id,
        email,
        dailyCredits: 50,
        bonusCredits: 0,
        lifetimeCredits: 0,
        plan: 'free',
        creditsLastReset: new Date(),
        aiMessagesToday: 0,
        aiMessagesReset: new Date(),
      }
    });
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

export async function verifyOtpAction(email: string, otp: string) {
  const emailLower = email.trim().toLowerCase();
  const otpClean = otp.trim();
  
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

  // 2. Verification successful - Cleanup
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: emailLower,
      token: otpClean,
    }
  });

  // 3. Confirm the user in Supabase Auth (Crucial for allowing login)
  try {
    const supabaseAdmin = createAdminClient();
    const authUserId = await getAuthUserIdForEmail(emailLower);

    if (authUserId) {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        email_confirm: true,
        user_metadata: { verified_via_custom_otp: true },
        email_confirmed_at: new Date().toISOString()
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

  // 4. Initialize user in Database with credits
  try {
    const supabaseAdmin = createAdminClient();
    const authUserId = await getAuthUserIdForEmail(emailLower);
    
    if (authUserId) {
      // Upsert in Prisma
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

      // Upsert in Supabase User table
      await supabaseAdmin.from('User').upsert({
        id: authUserId,
        email: emailLower,
        daily_credits: 50,
        bonus_credits: 0,
        plan: 'free'
      }, { onConflict: 'email' });
    }

    // 5. Send Welcome Email (Async)
    const sent = await sendWelcomeEmail(emailLower);
    if (!sent) console.error('Welcome email failed:', emailLower);
  } catch (err) {
    console.error('[Auth] Failed to initialize user credits:', err);
  }
  
  return { success: true };
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = formData.get("password") as string;
  const supabase = await createClient();

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(`[Auth] Sign in failed for ${email}:`, error.message);
    
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { error: "Incorrect password. If you originally signed up with Google/GitHub, please use those instead." };
    }
    
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Email not verified. Please check your inbox or try signing up again to get a new code." };
    }
    
    return { error: error.message };
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
