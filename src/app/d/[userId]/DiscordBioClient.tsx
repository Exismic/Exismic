"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Share2,
  Disc,
} from "lucide-react";
import styles from "@/app/tools/discord-card/DiscordCardGenerator.module.css";
import { cn } from "@/lib/utils";

interface DiscordBioClientProps {
  initialUserId: string;
}

type DiscordUser = {
  id?: string;
  username?: string;
  global_name?: string | null;
  display_name?: string | null;
  avatar?: string | null;
  banner?: string | null;
  banner_color?: string | null;
  avatar_decoration_data?: { asset?: string } | null;
  display_name_styles?: {
    colors?: number[];
    font_id?: number;
  } | null;
};

type DiscordActivity = {
  id?: string;
  name?: string;
  type?: number;
  details?: string;
  state?: string;
  application_id?: string;
  assets?: {
    large_image?: string;
    small_image?: string;
  };
  timestamps?: { start?: number };
};

type PresenceData = {
  discord_status?: "online" | "idle" | "dnd" | "offline";
  discord_user?: DiscordUser;
  activities?: DiscordActivity[];
  spotify?: {
    song?: string;
    artist?: string;
    album_art_url?: string;
  };
};

type ProfileBadge = {
  id?: string;
  icon?: string;
  description?: string;
};

type ConnectedAccount = {
  type?: string;
  id?: string;
  name?: string;
};

type ProfilePayload = {
  userId: string;
  user: DiscordUser;
  presence: PresenceData | null;
  profile: {
    user_profile?: { bio?: string; theme_colors?: number[] };
    badges?: ProfileBadge[];
    connected_accounts?: ConnectedAccount[];
  } | null;
  effect?: {
    effects: Array<{ src: string; zIndex: number }>;
  } | null;
};

const CONNECTION_LABELS: Record<string, string> = {
  battlenet: "Battle.net",
  domain: "Website",
  epicgames: "Epic Games",
  facebook: "Facebook",
  github: "GitHub",
  playstation: "PlayStation",
  reddit: "Reddit",
  riotgames: "Riot Games",
  spotify: "Spotify",
  steam: "Steam",
  tiktok: "TikTok",
  twitch: "Twitch",
  twitter: "X",
  xbox: "Xbox",
  youtube: "YouTube",
};

const FONT_MAP: Record<number, string> = {
  3: '"Discord Sakura", serif',
  4: '"Discord Jellybean", cursive',
  6: '"Discord Modern", sans-serif',
  7: '"Discord Medieval", serif',
  8: '"Discord 8Bit", monospace',
  10: '"Discord Vampyre", serif',
  12: '"Discord Tempo", serif',
};

function discordColorToHex(color: number) {
  return `#${Math.max(0, color).toString(16).padStart(6, "0").slice(-6)}`;
}

function hexToRgb(hex: string) {
  const norm = hex.replace("#", "");
  const num = parseInt(norm.length === 3 ? norm.split("").map((c) => c + c).join("") : norm, 16);
  if (isNaN(num)) return "88, 101, 242";
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export function DiscordBioClient({ initialUserId }: DiscordBioClientProps) {
  const [payload, setPayload] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [, setClock] = useState(0);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tools/discord-card/profile?userId=${encodeURIComponent(initialUserId)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Could not load Discord profile");
      const data = (await res.json()) as ProfilePayload;
      setPayload(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [initialUserId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // Lanyard WebSocket presence
  useEffect(() => {
    if (!initialUserId) return;
    let socket: WebSocket | null = null;
    let heartbeat: NodeJS.Timeout | null = null;

    try {
      socket = new WebSocket("wss://api.lanyard.rest/socket");
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.op === 1) {
            socket?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: initialUserId } }));
            heartbeat = setInterval(() => {
              if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ op: 3 }));
              }
            }, msg.d?.heartbeat_interval || 30000);
          }
          if ((msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE") && msg.d) {
            const nextPresence = msg.d as PresenceData;
            setPayload((curr) =>
              curr
                ? {
                    ...curr,
                    presence: nextPresence,
                    user: { ...curr.user, ...(nextPresence.discord_user || {}) },
                  }
                : curr
            );
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (heartbeat) clearInterval(heartbeat);
      socket?.close();
    };
  }, [initialUserId]);

  const user = payload?.user || {};
  const presence = payload?.presence;
  const profile = payload?.profile;
  const badges = profile?.badges || [];
  const connections = profile?.connected_accounts || [];

  const activity = useMemo(() => {
    const acts = presence?.activities || [];
    return acts.find((a) => a.type === 1) || acts.find((a) => a.type === 0) || acts.find((a) => a.id === "spotify:1") || null;
  }, [presence?.activities]);

  useEffect(() => {
    if (!activity?.timestamps?.start) return;
    const t = setInterval(() => setClock((c) => c + 1), 1000);
    return () => clearInterval(t);
  }, [activity?.timestamps?.start]);

  const isSpotify = activity?.id === "spotify:1";
  const displayName = user.global_name || user.display_name || user.username || "Discord Creator";
  const status = presence?.activities?.some((a) => a.type === 1) ? "streaming" : presence?.discord_status || "offline";

  const bannerImg = user.id && user.banner ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith("a_") ? "gif" : "webp"}?size=1024` : null;
  const avatarImg = user.id && user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "webp"}?size=512` : `https://cdn.discordapp.com/embed/avatars/${Number(initialUserId || "0") % 5}.png`;
  const decorImg = user.avatar_decoration_data?.asset ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=512&passthrough=true` : null;

  const accentHex = user.banner_color || "#5865f2";
  const accentRgb = hexToRgb(accentHex);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#06070a] text-white flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[450px] w-[450px] rounded-full blur-[180px]"
          style={{ backgroundColor: `rgba(${accentRgb}, 0.16)` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
      </div>

      <div className="w-full max-w-[620px] mx-auto z-10 my-auto py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 rounded-3xl border border-white/10 bg-[#0d0e15] shadow-2xl">
            <Loader2 size={36} className="animate-spin text-[#5865f2]" />
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Loading Discord Profile...
            </p>
          </div>
        ) : error ? (
          <div className="text-center p-12 space-y-4 rounded-3xl border border-red-500/20 bg-red-500/5">
            <p className="text-sm font-semibold text-red-300">{error}</p>
            <Link
              href="/tools/discord-card"
              className="inline-block rounded-xl bg-white px-5 py-2.5 text-xs font-black uppercase text-black"
            >
              Generate a Card
            </Link>
          </div>
        ) : (
          <div className={styles.previewShell} style={{ "--card-accent": accentRgb } as React.CSSProperties}>
            <article className={styles.profileCard} style={{ borderRadius: 24 }}>
              {/* Banner */}
              {bannerImg ? (
                <img className={styles.banner} src={bannerImg} alt="" />
              ) : (
                <div
                  className={styles.banner}
                  style={{
                    background: `radial-gradient(circle at 30% 35%, rgba(${accentRgb}, .62), transparent 36%), linear-gradient(135deg, #141419, #070709)`,
                  }}
                />
              )}
              <div className={styles.bannerShade} />

              {/* Profile Effect Layers */}
              {payload?.effect?.effects?.map((layer, idx) => (
                <img
                  key={idx}
                  className={styles.effectLayer}
                  src={layer.src}
                  alt=""
                  style={{ zIndex: Math.max(4, layer.zIndex) }}
                />
              ))}

              <div className={styles.profileBody}>
                {/* Identity Row */}
                <div className={styles.identityRow}>
                  <div className={styles.avatarWrap}>
                    <img className={styles.avatar} src={avatarImg} alt={displayName} />
                    {decorImg && <img className={styles.avatarDecoration} src={decorImg} alt="" />}
                    <span className={styles.status} data-status={status} title={status} />
                  </div>

                  {badges.length > 0 && (
                    <div className={styles.badgeTray}>
                      {badges.slice(0, 12).map((b, i) =>
                        b.icon ? (
                          <img
                            key={i}
                            className={styles.badge}
                            src={`https://cdn.discordapp.com/badge-icons/${b.icon}.png`}
                            alt={b.description || "badge"}
                            title={b.description || "badge"}
                          />
                        ) : null
                      )}
                    </div>
                  )}
                </div>

                {/* Name & Username */}
                <div className={styles.nameBlock}>
                  <h1 className={styles.displayName}>{displayName}</h1>
                  <div className={styles.username}>@{user.username || "discord"}</div>
                </div>

                {/* Live Activity / Spotify */}
                {activity && (
                  <section className={styles.activityCard}>
                    <div className="relative">
                      {isSpotify && presence?.spotify?.album_art_url ? (
                        <div className="relative flex items-center">
                          <img
                            className={styles.activityImage}
                            src={presence.spotify.album_art_url}
                            alt=""
                          />
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-black/40 bg-black/80 flex items-center justify-center animate-spin duration-[4000ms]">
                            <Disc size={18} className="text-emerald-400" />
                          </div>
                        </div>
                      ) : (
                        <div className={cn(styles.activityImage, "grid place-items-center text-2xl font-black text-zinc-600")}>
                          🎮
                        </div>
                      )}
                    </div>
                    <div className={styles.activityCopy}>
                      <span className={styles.eyebrow}>
                        {isSpotify ? "Listening to Spotify" : activity.type === 1 ? "Streaming" : "Playing a game"}
                      </span>
                      <span className={styles.activityName}>
                        {isSpotify ? presence?.spotify?.song : activity.name}
                      </span>
                      <span className={styles.activityLine}>
                        {isSpotify ? presence?.spotify?.artist : activity.details || activity.state}
                      </span>
                    </div>
                  </section>
                )}

                {/* Bio */}
                {profile?.user_profile?.bio && (
                  <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>About Me</h3>
                    <div className={styles.about}>{profile.user_profile.bio}</div>
                  </section>
                )}

                {/* Connections */}
                {connections.length > 0 && (
                  <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Connections</h3>
                    <div className={styles.connections}>
                      {connections.slice(0, 8).map((c, i) => {
                        const label = CONNECTION_LABELS[c.type || ""] || c.type || "Account";
                        return (
                          <div key={i} className={styles.connection}>
                            <span className={styles.connectionMark}>{label.slice(0, 2)}</span>
                            <span className={styles.connectionCopy}>
                              <span className={styles.connectionType}>{label}</span>
                              <span className={styles.connectionName}>{c.name || "Connected"}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            </article>
          </div>
        )}
      </div>

      {/* Floating Bottom Exismic Bar */}
      <footer className="z-10 w-full max-w-[620px] mx-auto flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0c0d15]/80 backdrop-blur-xl p-3 shadow-2xl">
        <Link
          href="/tools/discord-card"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white transition"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#5865f2] text-white">
            <Sparkles size={14} />
          </span>
          <span>Create your live Discord card</span>
        </Link>

        <button
          type="button"
          onClick={copyUrl}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/10 transition"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {copied ? "Copied Link!" : "Share Profile"}
        </button>
      </footer>
    </main>
  );
}
