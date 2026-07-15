import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { prisma } from "@/lib/prisma";
import { getServerSiteUrl } from "@/lib/site-url";
import { sendWelcomeEmailOnce } from "@/lib/welcome-email";
import { createNotification } from "@/lib/notifications";
import {
  createOAuthLinkRequestAction,
  isOAuthProviderApproved,
  recordOAuthProviderApproval,
  type OAuthLinkProvider,
} from "@/app/actions/auth";

const NEW_ACCOUNT_WINDOW_MS = 15 * 60 * 1000;
const OAUTH_PROVIDERS = new Set<OAuthLinkProvider>([
  "google",
  "github",
  "discord",
]);

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

function redirectToLogin(request: Request, reason: string) {
  const url = new URL("/auth/login", getServerSiteUrl(request));
  url.searchParams.set("authError", reason);
  return NextResponse.redirect(url);
}

function getOAuthProvider(value: unknown): OAuthLinkProvider | null {
  return typeof value === "string" && OAUTH_PROVIDERS.has(value as OAuthLinkProvider)
    ? (value as OAuthLinkProvider)
    : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteUrl = getServerSiteUrl(request);
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const verificationType = searchParams.get("type");
    const next = safeNextPath(searchParams.get("next"));

    if (!code && (!tokenHash || verificationType !== "magiclink")) {
      return redirectToLogin(request, "invalid_callback");
    }

    const supabase = await createClient();
    const { data, error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: "magiclink",
        });

    if (error) {
      console.error("[Auth] Session exchange failed:", error.message);
      return redirectToLogin(request, "session_exchange_failed");
    }

    const authUser = data.session?.user;
    const userId = authUser?.id;
    const email = authUser?.email?.trim().toLowerCase();

    if (!authUser || !userId || !email) {
      return redirectToLogin(request, "missing_identity");
    }

    const provider = getOAuthProvider(authUser.app_metadata?.provider);
    const identities = authUser.identities || [];
    const currentProviderIdentity = provider
      ? identities.find((identity) => identity.provider === provider)
      : null;
    const providerApproved = provider
      ? await isOAuthProviderApproved(email, provider)
      : false;
    const userName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      email.split("@")[0] ||
      "User";
    const providerAvatar =
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      authUser.user_metadata?.user_avatar ||
      null;
    const discordIdentity = identities.find(
      (identity) => identity.provider === "discord",
    );
    const discordUserId =
      discordIdentity?.identity_data?.sub || discordIdentity?.id || null;
    const discordUsername =
      discordIdentity?.identity_data?.preferred_username ||
      discordIdentity?.identity_data?.name ||
      authUser.user_metadata?.preferred_username ||
      null;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: { equals: email, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        customAvatarUrl: true,
      },
    });

    const idConflict = Boolean(existingUser && existingUser.id !== userId);
    const hasAnotherIdentity = provider
      ? identities.some((identity) => identity.provider !== provider)
      : false;
    const providerNeedsConsent = Boolean(
      existingUser &&
        provider &&
        !providerApproved &&
        (idConflict || hasAnotherIdentity),
    );

    if (providerNeedsConsent && provider) {
      if (idConflict) {
        await supabase.auth.signOut();
        const supabaseAdmin = createAdminClient();
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (deleteError) {
          console.error("[Auth] Could not remove transient OAuth identity:", deleteError.message);
          return redirectToLogin(request, "provider_link_failed");
        }
      } else {
        if (!currentProviderIdentity) {
          return redirectToLogin(request, "provider_link_failed");
        }
        const { error: unlinkError } = await supabase.auth.unlinkIdentity(
          currentProviderIdentity,
        );
        if (unlinkError) {
          console.error("[Auth] Could not pause unapproved OAuth identity:", unlinkError.message);
          return redirectToLogin(request, "provider_link_failed");
        }
        await supabase.auth.signOut();
      }

      const linkRequest = await createOAuthLinkRequestAction(email, provider);
      const linkUrl = new URL("/auth/login", siteUrl);
      linkUrl.searchParams.set("link", linkRequest.nonce);
      linkUrl.searchParams.set("returnUrl", next);
      return NextResponse.redirect(linkUrl);
    }

    let appUserCreated = false;

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: userId,
          email,
          name: userName,
          image: providerAvatar,
          discordUserId: discordUserId ? String(discordUserId) : null,
          discordUsername: discordUsername ? String(discordUsername) : null,
          dailyCredits: 50,
          bonusCredits: 0,
          lifetimeCredits: 0,
          plan: "free",
          creditsLastReset: new Date(),
          aiMessagesToday: 0,
          aiMessagesReset: new Date(),
        },
      });
      appUserCreated = true;
    } else {
      // Existing profile identity is authoritative. OAuth must never silently
      // replace the user's chosen name, profile picture, frame, or theme.
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...(discordUserId
            ? { discordUserId: String(discordUserId) }
            : {}),
          ...(discordUsername
            ? { discordUsername: String(discordUsername) }
            : {}),
        },
      });

      if (existingUser.customAvatarUrl) {
        const { error: avatarError } = await supabase.auth.updateUser({
          data: {
            avatar_url: existingUser.customAvatarUrl,
            picture: existingUser.customAvatarUrl,
            custom_avatar_url: existingUser.customAvatarUrl,
          },
        });
        if (avatarError) {
          console.warn("[Auth] Could not synchronize custom avatar:", avatarError.message);
        }
      }
    }

    if (provider && !providerApproved) {
      await recordOAuthProviderApproval(email, provider);
      const { error: approvalError } = await supabase.auth.updateUser({
        data: {
          approved_oauth_providers: Array.from(new Set([
            ...(Array.isArray(authUser.user_metadata?.approved_oauth_providers)
              ? authUser.user_metadata.approved_oauth_providers.filter(
                  (value: unknown): value is string => typeof value === "string",
                )
              : []),
            provider,
          ])),
        },
      });
      if (approvalError) {
        console.warn("[Auth] Could not record approved provider:", approvalError.message);
      }
    }

    const authCreatedAt = Date.parse(authUser.created_at);
    const authIdentityIsNew =
      Number.isFinite(authCreatedAt) &&
      Date.now() - authCreatedAt <= NEW_ACCOUNT_WINDOW_MS;

    if (appUserCreated || authIdentityIsNew) {
      await createNotification(
        userId,
        "Welcome to Exismic!",
        "Thank you for signing up! You have been granted 50 free credits. Let's start building!",
        "success"
      );
      const welcomeResult = await sendWelcomeEmailOnce(email);
      if (welcomeResult === "failed") {
        console.error("[Auth] Welcome email could not be delivered:", email);
      }
    }

    return NextResponse.redirect(new URL(next, siteUrl));
  } catch (error) {
    console.error("[Auth] Callback failed:", error);
    return redirectToLogin(request, "callback_failed");
  }
}
