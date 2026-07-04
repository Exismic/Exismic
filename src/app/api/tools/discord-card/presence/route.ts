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

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")?.trim() ?? "";
  if (!DISCORD_ID_PATTERN.test(userId)) {
    return NextResponse.json(
      { error: "Enter a valid Discord user ID." },
      { status: 400 },
    );
  }

  await trackDiscordPresenceUser(userId);
  const [presence, worker] = await Promise.all([
    getOfficialDiscordPresence(userId),
    getDiscordPresenceWorkerStatus(),
  ]);

  return NextResponse.json(
    {
      userId,
      presence,
      source: presence ? "official" : null,
      officialPresenceConfigured: isOfficialDiscordPresenceConfigured(),
      workerReady: Boolean(worker?.ready),
      inviteUrl: getDiscordPresenceInviteUrl(),
      updatedAt: presence?.updated_at ?? worker?.updatedAt ?? null,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
