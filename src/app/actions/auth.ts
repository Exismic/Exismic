"use server";

import { createClient } from "@/utils/supabase/server";
import { sendAuthOTP, sendWelcomeEmail, sendResetPasswordEmail, sendMagicLinkEmail } from "@/lib/emails";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/utils/supabase/admin";
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from "crypto";

type AuthRateLimitType = "otp_verification" | "magic_link" | "password_reset";

const AUTH_EMAIL_RATE_LIMIT_MS = 2 * 60 * 60 * 1000;
const AUTH_EMAIL_RATE_LIMIT_MESSAGE = "Please wait 2 hours before requesting another code";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function checkRateLimit(email: string, type: AuthRateLimitType) {
  const emailLower = email.trim().toLowerCase();
  const now = Date.now();
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("auth_rate_limits")
    .select("last_requested_at")
    .eq("email", emailLower)
    .eq("type", type)
    .maybeSingle();

  if (error) {
    console.error("[Auth] Rate limit lookup failed:", error.message);
    return { allowed: false, error: "Could not validate request limits. Please try again later." };
  }

  if (data?.last_requested_at) {
    const lastRequestedAt = new Date(data.last_requested_at).getTime();
    if (Number.isFinite(lastRequestedAt) && now - lastRequestedAt < AUTH_EMAIL_RATE_LIMIT_MS) {
      return { allowed: false, error: AUTH_EMAIL_RATE_LIMIT_MESSAGE };
    }
  }

  return { allowed: true, error: null };
}

async function recordRateLimit(email: string, type: AuthRateLimitType) {
  const emailLower = email.trim().toLowerCase();
  const now = new Date().toISOString();
  const supabaseAdmin = createAdminClient();

  const { error: upsertError } = await supabaseAdmin
    .from("auth_rate_limits")
    .upsert({
      email: emailLower,
      type,
      last_requested_at: now,
      updated_at: now,
    }, { onConflict: "email,type" });

  if (upsertError) {
    console.error("[Auth] Rate limit update failed:", upsertError.message);
    return false;
  }

  return true;
}

function generateOtp() {
  return randomInt(100000, 1000000).toString();
}

export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const rawReturnUrl = String(formData.get("returnUrl") || "/dashboard");
  const returnUrl = rawReturnUrl.startsWith("/") ? rawReturnUrl : "/dashboard";

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
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
      message: "Magic link sent. Check your inbox and use it within 15 minutes.",
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
    where: { identifier: emailLower }
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
    where: { identifier: email }
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
      token: otpClean
    }
  });

  if (!verificationToken) {
    return { error: "Invalid verification code. Please check your email again." };
  }

  if (verificationToken.expires < new Date()) {
    return { error: "Code has expired. Please sign up again." };
  }

  // 2. Verification successful - Cleanup
  await prisma.verificationToken.delete({
    where: { token: otpClean }
  });

  // 3. Confirm the user in Supabase Auth (Crucial for allowing login)
  try {
    const supabaseAdmin = createAdminClient();
    const dbUser = await prisma.user.findUnique({ where: { email: emailLower } });

    if (dbUser) {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(dbUser.id, {
        email_confirm: true,
        user_metadata: { verified_via_custom_otp: true },
        email_confirmed_at: new Date().toISOString()
      });

      if (confirmError) {
        console.error(`[Auth] Failed to confirm user ${dbUser.id}:`, confirmError.message);
      }
    }
  } catch (adminError) {
    console.error('[Auth] Supabase Admin operation failed. Make sure SUPABASE_SERVICE_ROLE_KEY is set.', adminError);
  }

  // 4. Initialize user in Database with credits
  try {
    const supabaseAdmin = createAdminClient();
    
    const authUser = await prisma.user.findUnique({ where: { email: emailLower } });
    
    if (authUser) {
      // Upsert in Prisma
      await prisma.user.upsert({
        where: { email: emailLower },
        update: {},
        create: {
          id: authUser.id,
          email: emailLower,
          dailyCredits: 50,
          plan: 'free'
        }
      });

      // Upsert in Supabase User table
      await supabaseAdmin.from('User').upsert({
        id: authUser.id,
        email: emailLower,
        daily_credits: 50,
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
  const email = (formData.get("email") as string).toLowerCase();
  const password = formData.get("password") as string;
  const supabase = await createClient();

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

  const dbUser = await prisma.user.findUnique({ where: { email: emailLower } });
  if (!dbUser) {
    return { success: true };
  }

  // 2. Generate Reset Token
  const token = uuidv4();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.verificationToken.deleteMany({ where: { identifier: emailLower } });
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

export async function updatePasswordAction(email: string, token: string, password: string) {
  const emailLower = email.toLowerCase().trim();
  
  // 1. Verify Token
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { identifier: emailLower, token }
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { error: "Reset link has expired or is invalid. Please request a new one." };
  }

  // 2. Update Password in Supabase (Admin)
  try {
    const supabaseAdmin = createAdminClient();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });

    if (!user) return { error: "User not found." };

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: password,
      email_confirm: true // Just in case
    });

    if (error) return { error: error.message };

    // 3. Cleanup Token
    await prisma.verificationToken.delete({ where: { token } });

    return { success: true };
  } catch (err) {
    console.error('[Auth] Password update failed:', err);
    return { error: "Failed to update password. Please try again." };
  }
}
