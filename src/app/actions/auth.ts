"use server";
import { issueDeletionRecoveryProof, clearDeletionRecoveryProof } from "@/lib/auth/deletion-recovery";

import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { Prisma } from "@prisma/client";
import { runSerializable } from "@/lib/serializable";
import { ensureVerifiedCredentialAccount } from "@/lib/auth/account-setup";
import { finishResetCleanup, hasPendingResetCleanup, resetCleanupIdentifier } from "@/lib/auth/reset-cleanup";
import { claimSignupVerification, releaseSignupVerification, finishSignupVerification, type SignupLease } from "@/lib/auth/security";
import { createClient } from "@/utils/supabase/server";
import {
  sendAuthOTP,
  sendResetPasswordEmail,
  sendMagicLinkEmail,
  sendPasswordChangedEmail,
  sendDeviceVerificationOtpEmail,
  sendLoginSecurityAlertEmail,
} from "@/lib/emails";
import {
  checkIsDeviceTrusted,
  createDeviceVerificationOtp,
  verifyDeviceOtpCode,
  registerTrustedDevice,
  extractClientIp,
  parseUserAgent,
  DEVICE_TOKEN_COOKIE_NAME,
} from "@/lib/device-security";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/utils/supabase/admin";
import { consumeAuthLimit, createOtpChallenge, getOtpChallenge, signupPasswordBinding, generateResetToken, resetTokenHash, SIGNUP_CHALLENGE_COOKIE, DEVICE_CHALLENGE_COOKIE, RESET_TTL_MS } from '@/lib/auth/security';
import { recordOAuthProviderApproval } from '@/lib/auth/oauth-link';
import { issueSessionProof, clearSessionProof } from "@/lib/auth/session-proof";
import { randomBytes, randomInt } from "node:crypto";
import { safeAuthReturnPath } from '@/lib/auth/redirect';
import { getServerSiteUrl } from "@/lib/site-url";
import { queueWelcomeEmail, sendWelcomeEmailOnce } from "@/lib/welcome-email";
import {
  isDevAccountEmail,
  isLocalhostDevRequest,
  ensureDevAccountProvisioned,
  DEV_ACCOUNT_PASSWORD,
} from "@/lib/dev-account";

type AuthRateLimitType = "otp_verification" | "magic_link" | "password_reset";


const AUTH_EMAIL_RATE_LIMIT_MESSAGE = "Please wait a minute before requesting another email.";
const PASSWORD_RESET_TOKEN_PREFIX = "pwd_reset:";
const OAUTH_LINK_TOKEN_PREFIX = "oauth_link:";

export type OAuthLinkProvider = "google" | "github" | "discord";

function isOAuthLinkProvider(value: string): value is OAuthLinkProvider {
  return value === "google" || value === "github" || value === "discord";
}

function isValidEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePasswordStrength(password: string) {
  const checks = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (password.length > 128) return "Use a password with no more than 128 characters.";
  if (password.length < 10 || checks < 3) {
    return "Use at least 10 characters with a mix of uppercase, lowercase, numbers, or symbols.";
  }

  return null;
}

function getSiteUrl() {
  return getServerSiteUrl();
}

async function authRequestLimit(email: string, purpose: string, maximum = 8, windowMs = 15 * 60 * 1000) {
  const requestHeaders = await headers();
  const ip = extractClientIp(requestHeaders);
  const byIp = await consumeAuthLimit(`ip:${purpose}:${ip}`, 30, windowMs);
  const byEmail = byIp && await consumeAuthLimit(`email:${purpose}:${email}`, maximum, windowMs);
  return byEmail;
}

async function setChallengeCookie(name: string, value: string) {
  (await cookies()).set(name, value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 600 });
}

async function checkRateLimit(email: string, type: AuthRateLimitType) {
  const allowedType = ['otp_verification', 'magic_link', 'password_reset'].includes(type);
  if (!allowedType || !await authRequestLimit(email, `send:${type}`, 5, 60 * 60 * 1000)) return { allowed: false, error: 'Too many requests. Please try again later.' };
  const allowed = await consumeAuthLimit(`cooldown:${type}:${email}`, 1, 60 * 1000);
  return { allowed, error: allowed ? null : AUTH_EMAIL_RATE_LIMIT_MESSAGE };
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

async function findSupabaseAuthUserByEmail(email: string) {
  const supabaseAdmin = createAdminClient();
  const emailLower = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: emailLower }, select: { id: true } });
  if (existing) {
    const found = await supabaseAdmin.auth.admin.getUserById(existing.id);
    if (!found.error && found.data.user?.email?.toLowerCase() === emailLower) return found.data.user;
  }
  for (let page = 1; ; page += 1) {
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

export async function getOAuthLinkRequestAction(nonce: string) {
  try {

  const request = await findOAuthLinkRequest(nonce);
  if (!request) {
    return { error: "This connection request expired. Start the social login again." };
  }

  return {
    success: true,
    email: request.identifier,
    provider: request.provider,
  };

  } catch (error) {
    console.error('[Auth] getOAuthLinkRequestAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  }
}

export async function consumeOAuthLinkRequestAction(nonce: string) {
  try {

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

  const claimed = await prisma.verificationToken.deleteMany({ where: { identifier: request.identifier, token: request.token, expires: { gt: new Date() } } });
  if (claimed.count !== 1) return { error: 'This connection request expired. Start the social login again.' };
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



  return { success: true, provider: request.provider };

  } catch (error) {
    console.error('[Auth] consumeOAuthLinkRequestAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  }
}

export async function cancelOAuthLinkRequestAction(nonce: string) {
  try {

  if (!isValidOAuthLinkNonce(nonce)) return { success: true };

  await prisma.verificationToken.deleteMany({
    where: { token: { startsWith: `${OAUTH_LINK_TOKEN_PREFIX}${nonce}:` } },
  });
  return { success: true };

  } catch (error) {
    console.error('[Auth] cancelOAuthLinkRequestAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  }
}

export async function sendMagicLinkAction(formData: FormData) {
  try {

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const rawReturnUrl = String(formData.get("returnUrl") || "/dashboard");
  const returnUrl = safeAuthReturnPath(rawReturnUrl);

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  const trustedDevice = await prisma.trustedLoginDevice.findFirst({
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

  } catch (error) {
    console.error('[Auth] sendMagicLinkAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  }
}

export async function resendOtpAction(email: string, password: string) {
  try {

  const emailLower = email.trim().toLowerCase();
  if (!isValidEmail(emailLower)) return { error: 'Enter a valid email address.' };
  const passwordError = validatePasswordStrength(password);
  if (passwordError) return { error: passwordError };
  const id = (await cookies()).get(SIGNUP_CHALLENGE_COOKIE)?.value || '';
  const challenge = await getOtpChallenge('signup', emailLower, id);
  if (!challenge) return { error: 'This verification request expired. Please start signup again.' };
  const account = await findSupabaseAuthUserByEmail(emailLower);
  if (!account || account.email_confirmed_at || account.id !== challenge.data.userId) return { error: 'Please sign in or start signup again.' };
  const limit = await checkRateLimit(emailLower, 'otp_verification');
  if (!limit.allowed) return { error: limit.error || AUTH_EMAIL_RATE_LIMIT_MESSAGE };
  const created = await createOtpChallenge('signup', emailLower, account.id, signupPasswordBinding(emailLower, password));
  await setChallengeCookie(SIGNUP_CHALLENGE_COOKIE, created.id);
  if (!await sendAuthOTP(emailLower, created.otp)) return { error: 'Could not send the verification code right now. Please try again.' };
  await recordRateLimit(emailLower, 'otp_verification');
  return { success: true };

  } catch (error) {
    console.error('[Auth] resendOtpAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  }
}

export async function signUpAction(formData: FormData) {
  try {
  if (formData.get("ageConsent") !== "on") return { error: "Please confirm that you are at least 13 years old." };

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email }
  });
  if (dbUser?.status === "suspended") {
    return { error: "This account has been suspended due to violations of Exismic terms of service." };
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

  const authUserId = await getAuthUserIdForEmail(email);
  if (!authUserId) return { error: 'Could not create this account right now. Please try again.' };
  const created = await createOtpChallenge('signup', email, authUserId, signupPasswordBinding(email, password));
  await setChallengeCookie(SIGNUP_CHALLENGE_COOKIE, created.id);
  if (!await sendAuthOTP(email, created.otp)) return { error: 'Could not send the verification code right now. Please try again.' };
  await recordRateLimit(email, 'otp_verification');

  return { success: true, email, step: "verify" };

  } catch (error) {
    console.error('[Auth] signUpAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  }
}

export async function verifyOtpAction(email: string, otp: string, password: string) {
  let signupLease: SignupLease | undefined;
  try {

  const emailLower = email.trim().toLowerCase();
  const otpClean = otp.trim();

  if (!isValidEmail(emailLower) || !/^\d{6}$/.test(otpClean)) {
    return { error: "Enter the complete 6-digit verification code." };
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) return { error: passwordError };

  if (!await authRequestLimit(emailLower, 'verify-signup', 10)) return { error: 'Too many attempts. Please request a new code later.' };
  const challengeId = (await cookies()).get(SIGNUP_CHALLENGE_COOKIE)?.value || '';
  const account = await findSupabaseAuthUserByEmail(emailLower);
  if (!account) return { error: 'This code is invalid or has expired. Please start signup again.' };
  const claim = await claimSignupVerification(emailLower, challengeId, otpClean, signupPasswordBinding(emailLower, password), account.id, account.app_metadata?.exismic_auth_version || 'initial', Boolean(account.email_confirmed_at));
  if (claim === 'busy') return { error: 'Verification is already finishing. Please wait a moment and try again.' };
  if (!claim) return { error: 'This code is invalid or has expired. Please request a new code.' };
  signupLease = claim;

  // Confirm the auth identity only after the custom OTP has been validated.
  try {
    const supabaseAdmin = createAdminClient();
    const authUserId = signupLease.data.userId;

    if (authUserId && authUserId === signupLease.data.userId && !account.email_confirmed_at) {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        email_confirm: true,
        password,
        user_metadata: { verified_via_custom_otp: true },
      });

      if (confirmError) {
        console.error(`[Auth] Failed to confirm user ${authUserId}:`, confirmError.message);
        return { error: "Could not finish verification right now. Please try this code again shortly." };
      }
    } else if (!account.email_confirmed_at || authUserId !== signupLease.data.userId) {
      return { error: "Could not find this account. Please sign up again." };
    }
  } catch (adminError) {
    console.error('[Auth] Supabase Admin operation failed. Make sure SUPABASE_SERVICE_ROLE_KEY is set.', adminError);
    return { error: "Could not verify this account right now. Please try again." };
  }

  // Initialize the application account only after verification succeeds.
  try {
    const authUserId = signupLease.data.userId;

    if (authUserId) {
      // Check for referral cookie
      const cookieStore = await cookies();
      const referralCodeCookie = cookieStore.get("exismic_referral")?.value;
      let referrerUser = null;
      let isSuspicious = false;

      if (referralCodeCookie) {
        referrerUser = await prisma.user.findFirst({
          where: {
            referralCode: { equals: referralCodeCookie.trim(), mode: "insensitive" },
          },
        });
      }

      if (referrerUser) {
        // Anti-Fraud check: Email similarity (plus addressing)
        const getNormalizedEmail = (emailStr: string) => {
          const parts = emailStr.toLowerCase().split("@");
          if (parts.length !== 2) return emailStr;
          const name = parts[0].split("+")[0];
          return `${name}@${parts[1]}`;
        };
        const referrerNormalized = getNormalizedEmail(referrerUser.email || "");
        const signupNormalized = getNormalizedEmail(emailLower);

        // Anti-Fraud check: IP Address matching
        const headerList = await headers();
        const reqIp = headerList.get("x-forwarded-for")?.split(",")[0].trim() ||
                      headerList.get("x-real-ip")?.trim() ||
                      null;

        const referrerDevice = await prisma.trustedLoginDevice.findFirst({
          where: { userId: referrerUser.id },
          select: { lastIp: true },
        });
        const referrerIp = referrerDevice?.lastIp;

        const isSelfReferralEmail = referrerNormalized === signupNormalized;
        const isSelfReferralIp = Boolean(referrerIp && reqIp && referrerIp === reqIp);

        if (isSelfReferralEmail || isSelfReferralIp) {
          isSuspicious = true;
        }
      }

      // Generate unique referral code for this user
      const prefix = emailLower.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6) || "EXISM";
      const rand = randomInt(1000, 10000);
      const myReferralCode = `${prefix.padEnd(6, "X")}${rand}`;
      const hasReferralPayout = referrerUser && !isSuspicious;

      await runSerializable(() => prisma.$transaction(async tx => {
        const existing = await tx.user.findFirst({ where: { OR: [{ id: authUserId }, { email: emailLower }] } });
        if (existing) {
          if (existing.status !== "active") throw new Error("This account cannot sign in right now.");
          if (existing.id !== authUserId && existing.email === emailLower) {
            await tx.user.update({
              where: { id: existing.id },
              data: { id: authUserId },
            });
          }
          return;
        }
        const account = await tx.user.upsert({
          where: { email: emailLower },
          update: {},
          create: {
            id: authUserId,
            email: emailLower,
            dailyCredits: 50,
            bonusCredits: hasReferralPayout ? 50 : 0,
            lifetimeCredits: hasReferralPayout ? 50 : 0,
            plan: 'free',
            referralCode: myReferralCode,
            hasSeenWelcome: false,
          }
        });
        await queueWelcomeEmail(tx, account);

        if (referrerUser) {
          // 1. Create the referral relation mapping
          await tx.referral.upsert({
            where: { referredId: authUserId },
            create: {
              referrerId: referrerUser.id,
              referredId: authUserId,
              status: isSuspicious ? "flagged_self_referral" : "registered",
              rewardClaimed: !isSuspicious,
            },
            update: {},
          });

          if (!isSuspicious) {
            // 2. Award credits to the referrer
            await tx.user.update({
              where: { id: referrerUser.id },
              data: {
                bonusCredits: { increment: 50 },
                lifetimeCredits: { increment: 50 },
              },
            });

            // 3. Record transaction logs for both parties
            await tx.creditTransaction.create({
              data: {
                userId: referrerUser.id,
                amount: 50,
                balanceType: "bonus",
                transactionType: "referral_reward",
                description: `Earned 50 bonus credits for inviting a friend (${emailLower})`,
                metadata: { referredUserId: authUserId, referredEmail: emailLower },
              },
            });

            await tx.creditTransaction.create({
              data: {
                userId: authUserId,
                amount: 50,
                balanceType: "bonus",
                transactionType: "referral_welcome_bonus",
                description: `Earned 50 bonus credits for joining via a referral invite!`,
                metadata: { referrerUserId: referrerUser.id },
              },
            });
          }

        }
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));
      if (referrerUser) {
        try { cookieStore.delete("exismic_referral"); } catch {}
      }
    }



    const welcomeResult = await sendWelcomeEmailOnce(emailLower);
    if (welcomeResult === "failed") {
      console.error("[Auth] Welcome email failed:", emailLower);
    }
  } catch (err) {
    console.error('[Auth] Failed to initialize user credits:', err);
    return { error: "Your email is verified. Please try this code again to finish account setup." };
  }

  const signedIn = await (await createClient()).auth.signInWithPassword({ email: emailLower, password });
  if (signedIn.error || !signedIn.data.session) return { error: 'Email verified. Please sign in with your password.' };
  const requestHeaders = await headers();
  const registered = await registerTrustedDevice(signedIn.data.user.id, emailLower, requestHeaders.get('user-agent') || '', extractClientIp(requestHeaders));
  (await cookies()).set(DEVICE_TOKEN_COOKIE_NAME, registered.rawDeviceToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: registered.expiresAt });
  if (!await finishSignupVerification(signupLease)) return { error: 'Verification expired before it could finish. Please sign in to continue.' };
  (await cookies()).delete(SIGNUP_CHALLENGE_COOKIE);
  await issueSessionProof(signedIn.data.session);
  return { success: true };

  } catch (error) {
    console.error('[Auth] verifyOtpAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  } finally {
    if (signupLease) await releaseSignupVerification(signupLease).catch(() => undefined);
  }
}

export async function signInAction(formData: FormData) {
  try {

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address.", field: "email" as const };
  }

  if (password.length > 128) return { error: 'Email or password is incorrect.', field: 'credentials' as const };
  if (!await authRequestLimit(email, 'signin')) return { error: 'Too many sign-in attempts. Please try again later.', field: 'credentials' as const };

  // --- LOCALHOST DEVELOPER TESTING ACCOUNT BYPASS ---
  if (isDevAccountEmail(email)) {
    const reqHeaders = await headers();
    if (!isLocalhostDevRequest(reqHeaders)) {
      return {
        error: "Email or password is incorrect. Check both fields and try again.",
        field: "credentials" as const,
      };
    }

    if (password !== DEV_ACCOUNT_PASSWORD) {
      return {
        error: "Email or password is incorrect. Check both fields and try again.",
        field: "credentials" as const,
      };
    }

    // Guarantee account provisioned in Supabase & Prisma with infinite credits, sparks & Pro
    await ensureDevAccountProvisioned();

    const { data: devAuthData, error: devAuthErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (devAuthErr || !devAuthData.user) {
      console.error("[Auth] Dev sign in error:", devAuthErr);
      return {
        error: "We couldn’t sign you in right now. Please try again shortly.",
        field: "credentials" as const,
      };
    }

    // Auto-trust the device so multi-device OTP is completely bypassed
    const clientIp = extractClientIp(reqHeaders);
    const userAgent = reqHeaders.get("user-agent") || "";
    if (devAuthData.user?.id) {
      try {
        await registerTrustedDevice(devAuthData.user.id, email, userAgent, clientIp);
      } catch (err) {
        console.warn("[Auth] Could not register dev device:", err);
      }
    }

    if (!devAuthData.session) return { error: 'We couldn’t sign you in right now.', field: 'credentials' as const };
    await issueSessionProof(devAuthData.session);
    return { success: true };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!password) {
    return { error: "Enter your password.", field: "password" as const };
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword({
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

  if (dbUser?.status === "suspended") {
    await supabase.auth.signOut({ scope: "local" });
    await clearSessionProof();
    return { error: "This account cannot sign in right now.", field: "credentials" as const };
  }

  // Check if user account is scheduled for deletion
  let targetUser = dbUser;
  if (!targetUser && authData.user?.id) {
    targetUser = await prisma.user.findUnique({
      where: { id: authData.user.id }
    });
  }

  if (targetUser?.status === "suspended") {
    await supabase.auth.signOut({ scope: "local" });
    await clearSessionProof();
    return { error: "This account cannot sign in right now.", field: "credentials" as const };
  }

  if (targetUser?.status === 'deleting') {
    await supabase.auth.signOut({ scope: 'local' });
    await clearSessionProof();
    return { error: 'Account deletion has already started. Please contact support.' };
  }
  if (targetUser?.status === "pending_deletion") {
    if (authData.user?.id === targetUser.id) await issueDeletionRecoveryProof(targetUser.id, targetUser.scheduledDeletionAt);
    // Terminate the transient session until the account is restored.
    await supabase.auth.signOut({ scope: "local" });
    await clearSessionProof();
    return {
      isPendingDeletion: true,
      email: targetUser.email,
      scheduledDeletionAt: targetUser.scheduledDeletionAt?.toISOString() || null,
      deletionRecoveryRequested: Boolean(targetUser.deletionRecoveryRequested),
    };
  }

  if (authData.user?.id && await hasPendingResetCleanup(authData.user.id)) {
    try { await finishResetCleanup(authData.user.id, email); }
    catch { await supabase.auth.signOut({ scope: 'local' }); await clearSessionProof(); return { error: 'We are finishing a security update. Please try signing in again shortly.' }; }
  }
  // Device Security & Multi-Device OTP Check
  const reqHeaders = await headers();
  const reqCookies = await cookies();
  const clientIp = extractClientIp(reqHeaders);
  const userAgent = reqHeaders.get("user-agent") || "";
  const rawDeviceToken = reqCookies.get(DEVICE_TOKEN_COOKIE_NAME)?.value;
  const userId = authData.user?.id || dbUser?.id;

  if (userId) {
    const { isTrusted, device } = await checkIsDeviceTrusted(userId, email, rawDeviceToken, clientIp, authData.user?.app_metadata?.exismic_auth_version || 'initial');

    if (!isTrusted) {
      // Sign out transient session until device is verified via 6-digit OTP
      await supabase.auth.signOut({ scope: "local" });
      await clearSessionProof();

      const limit = await checkRateLimit(email, 'otp_verification');
      if (!limit.allowed) return { error: limit.error || AUTH_EMAIL_RATE_LIMIT_MESSAGE };
      const otpResult = await createDeviceVerificationOtp(email, userId, clientIp, userAgent);
      await setChallengeCookie(DEVICE_CHALLENGE_COOKIE, otpResult.challengeId);
      const timeStr = new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const sent = await sendDeviceVerificationOtpEmail(email, otpResult.otp, {
        deviceName: otpResult.deviceName,
        ip: clientIp,
        time: timeStr,
      });

      if (!sent) {
        return { error: "Could not send device verification code right now. Please try again." };
      }

      return {
        requireDeviceOtp: true,
        challengeId: otpResult.challengeId,
        email,
        deviceName: otpResult.deviceName,
      };
    } else {
      // Device is trusted — trigger security alert email in background
      const timeStr = new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      const deviceName = device?.deviceName || parseUserAgent(userAgent).deviceName;
      after(async () => { await sendLoginSecurityAlertEmail(email, {
        deviceName,
        ip: clientIp,
        time: timeStr,
      }); });
    }
  }

  if (!authData.session || !userId) return { error: 'We couldn’t sign you in right now.' };
  await ensureVerifiedCredentialAccount(authData.user);
  await issueSessionProof(authData.session);
  return { success: true };

  } catch (error) {
    console.error('[Auth] signInAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  }
}

export async function verifyDeviceOtpAction(
  email: string,
  challengeId: string,
  otpCode: string,
  password: string,
) {
  try {

  const emailLower = email.trim().toLowerCase();
  const cleanOtp = otpCode.trim();

  if (!isValidEmail(emailLower) || !/^\d{6}$/.test(cleanOtp)) {
    return { error: "Enter the complete 6-digit verification code." };
  }

  if (!await authRequestLimit(emailLower, 'verify-device', 10)) return { error: 'Too many attempts. Please request a new code later.' };
  if ((await cookies()).get(DEVICE_CHALLENGE_COOKIE)?.value !== challengeId) return { error: 'This verification request expired. Please sign in again.' };
  const dbUser = await prisma.user.findUnique({ where: { email: emailLower } });
  if (dbUser && dbUser.status !== 'active') return { error: 'This account cannot sign in right now.' };
  const result = await verifyDeviceOtpCode(emailLower, challengeId, cleanOtp);
  if (!result.valid || !result.userId) {
    return { error: result.error || "Invalid or expired verification code." };
  }

  const supabase = await createClient();
  const { data: verifiedAuth, error: signInError } = await supabase.auth.signInWithPassword({
    email: emailLower,
    password,
  });

  if (signInError || verifiedAuth.user?.id !== result.userId) {
    await supabase.auth.signOut({ scope: 'local' });
    return { error: 'Verification could not finish. Please sign in again.' };
  }
  await ensureVerifiedCredentialAccount(verifiedAuth.user);
  if (await hasPendingResetCleanup(result.userId)) await finishResetCleanup(result.userId, emailLower);
  (await cookies()).delete(DEVICE_CHALLENGE_COOKIE);

  try {
    const reqHeaders = await headers();
    const clientIp = extractClientIp(reqHeaders);
    const userAgent = reqHeaders.get("user-agent") || "";

    // Register device as trusted
    const deviceReg = await registerTrustedDevice(
      result.userId,
      emailLower,
      userAgent,
      clientIp,
      verifiedAuth.user.app_metadata?.exismic_auth_version || 'initial',
    );

    // Set HTTP-only device token cookie
    const cookieStore = await cookies();
    cookieStore.set(DEVICE_TOKEN_COOKIE_NAME, deviceReg.rawDeviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: deviceReg.expiresAt,
    });

    // Send security login alert email
    const timeStr = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    after(async () => { await sendLoginSecurityAlertEmail(emailLower, {
      deviceName: deviceReg.deviceName,
      ip: clientIp,
      time: timeStr,
    }); });
  } catch (deviceError) {
    console.error("[Auth] Non-blocking trusted device registration error:", deviceError);
  }

  if (!verifiedAuth.session) return { error: 'Verification could not finish. Please sign in again.' };
  await issueSessionProof(verifiedAuth.session);
  return { success: true };

  } catch (error) {
    console.error('[Auth] verifyDeviceOtpAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  }
}

export async function resendDeviceOtpAction(
  email: string,
  challengeId: string,
) {
  try {

  const emailLower = email.trim().toLowerCase();
  if (!isValidEmail(emailLower)) {
    return { error: "Enter a valid email address." };
  }

  const pendingChallenge = await getOtpChallenge('device', emailLower, challengeId);
  if ((await cookies()).get(DEVICE_CHALLENGE_COOKIE)?.value !== challengeId || !pendingChallenge) return { error: 'This verification request expired. Please sign in again.' };
  const limit = await checkRateLimit(emailLower, "otp_verification");
  if (!limit.allowed) {
    return { error: limit.error || AUTH_EMAIL_RATE_LIMIT_MESSAGE };
  }

  const reqHeaders = await headers();
  const clientIp = extractClientIp(reqHeaders);
  const userAgent = reqHeaders.get("user-agent") || "";

  const dbUser = await prisma.user.findUnique({ where: { email: emailLower } });
  const identity = await createAdminClient().auth.admin.getUserById(pendingChallenge.data.userId);
  if (identity.error || !identity.data.user?.email_confirmed_at || identity.data.user.email?.toLowerCase() !== emailLower || (dbUser && dbUser.id !== identity.data.user.id)) return { error: "This verification request expired. Please sign in again." };
  if (dbUser && dbUser.status !== 'active') return { error: 'This account cannot sign in right now.' };
  const otpResult = await createDeviceVerificationOtp(emailLower, pendingChallenge.data.userId, clientIp, userAgent);
  await setChallengeCookie(DEVICE_CHALLENGE_COOKIE, otpResult.challengeId);
  const timeStr = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const sent = await sendDeviceVerificationOtpEmail(emailLower, otpResult.otp, {
    deviceName: otpResult.deviceName,
    ip: clientIp,
    time: timeStr,
  });

  if (!sent) {
    return { error: "Could not send verification code. Please try again." };
  }

  await recordRateLimit(emailLower, "otp_verification");

  return { success: true, challengeId: otpResult.challengeId };

  } catch (error) {
    console.error('[Auth] resendDeviceOtpAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  }
}

export async function forgotPasswordAction(email: string) {
  try {

  const emailLower = email.toLowerCase().trim();
  if (!isValidEmail(emailLower)) return { error: 'Enter a valid email address.' };
  const limit = await checkRateLimit(emailLower, 'password_reset');
  if (!limit.allowed) return { error: limit.error || AUTH_EMAIL_RATE_LIMIT_MESSAGE };
  const authUserId = await getAuthUserIdForEmail(emailLower);
  if (authUserId) {
    const admin = createAdminClient();
    const user = await admin.auth.admin.getUserById(authUserId);
    if (!user.error && user.data.user?.email_confirmed_at) {
      const token = generateResetToken();
      const hashed = resetTokenHash(emailLower, token)!;
      await prisma.verificationToken.deleteMany({ where: { identifier: emailLower, token: { startsWith: PASSWORD_RESET_TOKEN_PREFIX } } });
      await prisma.verificationToken.create({ data: { identifier: emailLower, token: hashed, expires: new Date(Date.now() + RESET_TTL_MS) } });
      if (!await sendResetPasswordEmail(emailLower, token)) console.error('[Auth] Password reset email could not be sent.');
    }
  }
  await recordRateLimit(emailLower, 'password_reset');
  return { success: true };

  } catch (error) {
    console.error('[Auth] forgotPasswordAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  }
}

export async function validateResetPasswordTokenAction(email: string, token: string): Promise<{ valid: boolean; error?: string }> {
  try {

  const emailLower = email.toLowerCase().trim();
  const invalid = { valid: false, error: 'This reset link is invalid, expired or already used. Please request a new one.' };
  if (!isValidEmail(emailLower)) return invalid;
  const hashed = resetTokenHash(emailLower, token);
  if (!hashed || !await authRequestLimit(emailLower, 'reset-validation', 20)) return invalid;
  const found = await prisma.verificationToken.findFirst({ where: { identifier: emailLower, token: hashed, expires: { gt: new Date() } }, select: { token: true } });
  return found ? { valid: true } : invalid;

  } catch (error) {
    console.error('[Auth] validateResetPasswordTokenAction could not complete:', error);
    return { valid: false, error: 'We couldn’t check this link right now. Please try again shortly.' };
  }
}

export async function updatePasswordAction(email: string, token: string, password: string): Promise<{ success?: boolean; error?: string }> {
  try {

  const emailLower = email.toLowerCase().trim();
  const invalid = { error: 'This reset link is invalid, expired or already used. Please request a new one.' };
  if (!isValidEmail(emailLower) || !resetTokenHash(emailLower, token)) return invalid;
  const passwordError = validatePasswordStrength(password);
  if (passwordError) return { error: passwordError };
  if (!await authRequestLimit(emailLower, 'reset-password', 5)) return { error: 'Too many attempts. Please try again later.' };
  const authUserId = await getAuthUserIdForEmail(emailLower);
  if (!authUserId) return invalid;
  const admin = createAdminClient();
  const current = await admin.auth.admin.getUserById(authUserId);
  if (current.error || !current.data.user?.email_confirmed_at) return invalid;
  // Token validation still precedes every mutation, including pending cleanup.
  const valid = await prisma.verificationToken.findFirst({ where: { identifier: emailLower, token: resetTokenHash(emailLower, token)!, expires: { gt: new Date() } } });
  if (!valid) return invalid;
  if (await hasPendingResetCleanup(authUserId)) await finishResetCleanup(authUserId, emailLower);
  const nextVersion = randomBytes(24).toString('hex');
  const reserved = await prisma.$transaction(async tx => {
    const consumed = await tx.verificationToken.deleteMany({ where: { identifier: emailLower, token: resetTokenHash(emailLower, token)!, expires: { gt: new Date() } } });
    if (consumed.count !== 1) return false;
    await tx.verificationToken.create({ data: { identifier: `${resetCleanupIdentifier(authUserId)}${nextVersion}:${Buffer.from(emailLower).toString('base64url')}`, token: `auth_cleanup:v1:${authUserId}`, expires: new Date(Date.now() + 10 * 60 * 1000) } });
    return true;
  });
  if (!reserved) return invalid;
  let providerError: { code?: string } | null = null;
  try {
    const updated = await admin.auth.admin.updateUserById(authUserId, { password, app_metadata: { ...current.data.user.app_metadata, exismic_auth_version: nextVersion } });
    providerError = updated.error;
  } catch (error) {
    console.error('[Auth] Password update response was interrupted:', error);
    const reconciled = await admin.auth.admin.getUserById(authUserId).catch(() => null);
    if (reconciled?.data.user?.app_metadata?.exismic_auth_version !== nextVersion) {
      return { error: 'We couldn’t confirm the password update. Try signing in with your new password before requesting another reset link.' };
    }
  }
  if (providerError) {
    console.error('[Auth] Password reset could not finish:', providerError.code);
    await prisma.verificationToken.deleteMany({ where: { identifier: `${resetCleanupIdentifier(authUserId)}${nextVersion}:${Buffer.from(emailLower).toString('base64url')}`, token: `auth_cleanup:v1:${authUserId}` } }).catch(() => undefined);
    return { error: 'Could not update your password. Please request a new reset link.' };
  }
  // Password update committed: cleanup failures cannot turn this into a false
  // failure. The saved fence blocks old phone approvals until revocation finishes.
  await finishResetCleanup(authUserId, emailLower, nextVersion).catch(error => console.error('[Auth] Security cleanup queued:', error));
  await clearDeletionRecoveryProof().catch(() => undefined);
  await clearSessionProof().catch(() => undefined);
  for (const name of [DEVICE_TOKEN_COOKIE_NAME, DEVICE_CHALLENGE_COOKIE, SIGNUP_CHALLENGE_COOKIE]) {
    try { (await cookies()).delete(name); } catch { /* The new auth version invalidates old sessions. */ }
  }
  try { await (await createClient()).auth.signOut({ scope: 'local' }); } catch { /* Sign in with the updated password. */ }
  after(async () => { await sendPasswordChangedEmail(emailLower); });
  return { success: true };

  } catch (error) {
    console.error('[Auth] updatePasswordAction could not complete:', error);
    return { error: 'We couldn’t complete this request. Please try again shortly.' };
  }
}
