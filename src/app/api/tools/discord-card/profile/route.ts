import { NextRequest, NextResponse } from "next/server";
import {
  getDiscordPresenceInviteUrl,
  getDiscordPresenceWorkerStatus,
  getOfficialDiscordPresence,
  isOfficialDiscordPresenceConfigured,
  trackDiscordPresenceUser,
} from "@/lib/discord-presence";

export const dynamic = "force-dynamic";

const DISCORD_ID_PATTERN = /^\d{17,20}$/;
const REQUEST_TIMEOUT_MS = 8_000;

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

async function fetchJson(url: string, cacheSeconds = 0) {
  const response = await fetch(url, {
    cache: cacheSeconds ? undefined : "no-store",
    next: cacheSeconds ? { revalidate: cacheSeconds } : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      Accept: "application/json",
      "User-Agent": "Exismic-Discord-Card/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Upstream request failed with ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

async function fetchOfficialDiscordUser(userId: string) {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) return null;

  try {
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Accept: "application/json",
        Authorization: `Bot ${token}`,
        "User-Agent": "Exismic-Discord-Card/1.0",
      },
    });
    if (!response.ok) return null;
    return asRecord(await response.json());
  } catch {
    return null;
  }
}

function findProfileEffectSku(profile: UnknownRecord) {
  const userProfile = asRecord(profile.user_profile);
  const directEffect = asRecord(userProfile.profile_effect);
  const directSku = directEffect.sku_id;

  if (typeof directSku === "string" || typeof directSku === "number") {
    return String(directSku);
  }

  const collectibles = Array.isArray(userProfile.collectibles)
    ? userProfile.collectibles
    : [];

  for (const collectible of collectibles) {
    const item = asRecord(collectible);
    if (Number(item.type) !== 1) continue;

    const sku = item.sku_id;
    if (typeof sku === "string" || typeof sku === "number") {
      return String(sku);
    }
  }

  return null;
}

async function fetchProfileEffect(skuId: string | null) {
  if (!skuId || !DISCORD_ID_PATTERN.test(skuId)) return null;

  try {
    const rawProduct = asRecord(
      await fetchJson(
        `https://discord.com/api/v10/collectibles-products/${skuId}`,
        60 * 60,
      ),
    );
    const items = Array.isArray(rawProduct.items) ? rawProduct.items : [];
    const effectItem = items
      .map(asRecord)
      .find((item) => Number(item.type) === 1);
    const effects = Array.isArray(effectItem?.effects) ? effectItem.effects : [];

    return {
      skuId,
      effects: effects.map((effect) => {
        const layer = asRecord(effect);
        return {
          src: typeof layer.src === "string" ? layer.src : "",
          duration: Number(layer.duration) || 1_000,
          start: Number(layer.start) || 0,
          loop: Boolean(layer.loop),
          loopDelay: Number(layer.loop_delay ?? layer.loopDelay) || 0,
          zIndex: Number(layer.z_index ?? layer.zIndex) || 0,
        };
      }).filter((effect) => effect.src),
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")?.trim() ?? "";

  if (!DISCORD_ID_PATTERN.test(userId)) {
    return NextResponse.json(
      { error: "Enter a valid Discord user ID." },
      { status: 400 },
    );
  }

  await trackDiscordPresenceUser(userId);

  const [
    officialPresence,
    officialUser,
    worker,
    presenceResult,
    profileResult,
  ] = await Promise.all([
    getOfficialDiscordPresence(userId),
    fetchOfficialDiscordUser(userId),
    getDiscordPresenceWorkerStatus(),
    fetchJson(`https://api.lanyard.rest/v1/users/${userId}`),
    fetchJson(`https://dcdn.dstn.to/profile/${userId}`, 60),
  ].map(async (task) => {
    try {
      return await task;
    } catch {
      return null;
    }
  }));

  const presenceEnvelope =
    presenceResult ? asRecord(presenceResult) : {};
  const lanyardPresence =
    presenceEnvelope.success === true
      ? asRecord(presenceEnvelope.data)
      : null;
  const presence = officialPresence ?? lanyardPresence;
  const profile = profileResult ? asRecord(profileResult) : null;
  const profileUser = profile ? asRecord(profile.user) : {};
  const presenceUser = presence ? asRecord(presence.discord_user) : {};
  const user =
    Object.keys(profileUser).length > 0
      ? profileUser
      : officialUser && Object.keys(asRecord(officialUser)).length > 0
        ? asRecord(officialUser)
        : presenceUser;

  if (Object.keys(user).length === 0) {
    return NextResponse.json(
      {
        error:
          "Discord profile data is unavailable. Check the user ID and try again.",
      },
      { status: 404 },
    );
  }

  const effectSku = profile ? findProfileEffectSku(profile) : null;
  const effect = await fetchProfileEffect(effectSku);

  return NextResponse.json(
    {
      userId,
      user,
      presence,
      profile,
      effect,
      sources: {
        presence: Boolean(presence),
        presenceProvider: officialPresence
          ? "official"
          : lanyardPresence
            ? "lanyard"
            : null,
        officialPresenceConfigured: isOfficialDiscordPresenceConfigured(),
        workerReady: Boolean(asRecord(worker).ready),
        inviteUrl: getDiscordPresenceInviteUrl(),
        extendedProfile: Boolean(profile),
      },
      fetchedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
