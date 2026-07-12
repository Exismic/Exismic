"use client";
/* eslint-disable @next/next/no-img-element */

import {
  Activity,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Monitor,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  type CSSProperties,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import styles from "./DiscordCardGenerator.module.css";

type DiscordNameStyle = {
  colors?: number[];
  effect_id?: number;
  font_id?: number;
};

type DiscordUser = {
  id?: string;
  username?: string;
  global_name?: string | null;
  display_name?: string | null;
  avatar?: string | null;
  banner?: string | null;
  banner_color?: string | null;
  avatar_decoration_data?: {
    asset?: string;
  } | null;
  display_name_styles?: DiscordNameStyle | null;
};

type ActivityAsset = {
  large_image?: string;
  large_text?: string;
  small_image?: string;
  small_text?: string;
};

type DiscordActivity = {
  id?: string;
  name?: string;
  type?: number;
  details?: string;
  state?: string;
  application_id?: string;
  url?: string;
  assets?: ActivityAsset;
  emoji?: {
    id?: string;
    name?: string;
  };
  timestamps?: {
    start?: number;
    end?: number;
  };
};

type PresenceData = {
  discord_status?: "online" | "idle" | "dnd" | "offline";
  discord_user?: DiscordUser;
  activities?: DiscordActivity[];
  spotify?: {
    song?: string;
    artist?: string;
    album?: string;
    album_art_url?: string;
    track_id?: string;
    timestamps?: {
      start?: number;
      end?: number;
    };
  };
};

type ProfileBadge = {
  id?: string;
  icon?: string;
  description?: string;
  link?: string;
};

type ConnectedAccount = {
  type?: string;
  id?: string;
  name?: string;
};

type ExtendedProfile = {
  user?: DiscordUser;
  user_profile?: {
    bio?: string;
    theme_colors?: number[];
  };
  badges?: ProfileBadge[];
  connected_accounts?: ConnectedAccount[];
};

type EffectLayer = {
  src: string;
  duration: number;
  start: number;
  loop: boolean;
  loopDelay: number;
  zIndex: number;
};

type DiscordCardPayload = {
  userId: string;
  user: DiscordUser;
  presence: PresenceData | null;
  profile: ExtendedProfile | null;
  effect: {
    skuId: string;
    effects: EffectLayer[];
  } | null;
  sources: {
    presence: boolean;
    presenceProvider?: "official" | "lanyard" | null;
    officialPresenceConfigured?: boolean;
    workerReady?: boolean;
    inviteUrl?: string | null;
    extendedProfile: boolean;
  };
  fetchedAt: string;
};

type PreviewWidth = "desktop" | "mobile";
type CustomStyle = CSSProperties &
  Record<`--${string}`, string | number | undefined>;

const DISCORD_ID_PATTERN = /^\d{17,20}$/;
const ROLE_COLORS = [
  "243, 210, 204",
  "244, 174, 204",
  "35, 165, 90",
  "242, 63, 67",
  "88, 101, 242",
  "240, 178, 50",
];

const FONT_MAP: Record<number, string> = {
  3: '"Discord Sakura", serif',
  4: '"Discord Jellybean", cursive',
  6: '"Discord Modern", sans-serif',
  7: '"Discord Medieval", serif',
  8: '"Discord 8Bit", monospace',
  10: '"Discord Vampyre", serif',
  12: '"Discord Tempo", serif',
};

const LETTER_SPACING_MAP: Record<number, string> = {
  3: "0.04em",
  6: "0.01em",
  7: "0.02em",
  8: "0.02em",
  10: "0.01em",
  12: "0.03em",
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
  skype: "Skype",
  spotify: "Spotify",
  steam: "Steam",
  tiktok: "TikTok",
  twitch: "Twitch",
  twitter: "X",
  xbox: "Xbox",
  youtube: "YouTube",
};

const DEMO_USER: DiscordUser = {
  id: "0",
  username: "your_username",
  global_name: "Your Display Name",
  banner_color: "#5865f2",
};

function discordColorToHex(color: number) {
  return `#${Math.max(0, color).toString(16).padStart(6, "0").slice(-6)}`;
}

function hexToRgbString(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized,
    16,
  );

  if (!Number.isFinite(value)) return "88, 101, 242";
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
}

function ensureReadableNameColor(hex: string) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  if (!Number.isFinite(value)) return "#f2f3f5";

  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  if (luminance >= 135) return hex;

  const mix = Math.min(0.82, Math.max(0.48, (150 - luminance) / 190));
  const brighten = (channel: number) =>
    Math.round(channel + (255 - channel) * mix);

  return `#${[brighten(red), brighten(green), brighten(blue)]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function discordImageUrl(path: string, hash: string, size = 1024) {
  const extension = hash.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/${path}/${hash}.${extension}?size=${size}`;
}

function avatarUrl(user: DiscordUser) {
  if (user.id && user.avatar) {
    return discordImageUrl(`avatars/${user.id}`, user.avatar);
  }

  const discriminator = Number(user.id ?? "0") % 6;
  return `https://cdn.discordapp.com/embed/avatars/${discriminator}.png`;
}

function bannerUrl(user: DiscordUser) {
  if (!user.id || !user.banner) return null;
  return discordImageUrl(`banners/${user.id}`, user.banner);
}

function decorationUrl(user: DiscordUser) {
  const asset = user.avatar_decoration_data?.asset;
  if (!asset) return null;
  return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=1024&passthrough=true`;
}

function activityAssetUrl(activity: DiscordActivity, asset?: string) {
  if (!asset) return null;
  if (/^https?:\/\//i.test(asset)) return asset;
  if (asset.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${asset.replace("spotify:", "")}`;
  }
  if (asset.startsWith("mp:")) {
    return `https://media.discordapp.net/${asset.slice(3)}`;
  }
  if (asset.startsWith("external/")) {
    return `https://media.discordapp.net/${asset}`;
  }
  if (!activity.application_id) return null;
  return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${asset}.png?size=512`;
}

function connectionUrl(account: ConnectedAccount) {
  const name = account.name ?? "";
  const encodedName = encodeURIComponent(name);
  const rawName = name.replace(/^https?:\/\//, "");

  switch (account.type) {
    case "domain":
      return `https://${rawName}`;
    case "facebook":
      return `https://facebook.com/${encodedName}`;
    case "github":
      return `https://github.com/${encodedName}`;
    case "reddit":
      return `https://reddit.com/user/${encodedName}`;
    case "spotify":
      return account.id ? `https://open.spotify.com/user/${account.id}` : null;
    case "steam":
      return account.id
        ? `https://steamcommunity.com/profiles/${account.id}`
        : null;
    case "tiktok":
      return `https://tiktok.com/@${encodedName}`;
    case "twitch":
      return `https://twitch.tv/${encodedName}`;
    case "twitter":
      return `https://x.com/${encodedName}`;
    case "youtube":
      return account.id
        ? `https://youtube.com/channel/${account.id}`
        : null;
    default:
      return null;
  }
}

function selectActivity(presence: PresenceData | null) {
  const activities = presence?.activities ?? [];
  return (
    activities.find((activity) => activity.type === 1) ??
    activities.find((activity) => activity.type === 0) ??
    activities.find((activity) => activity.id === "spotify:1") ??
    null
  );
}

function formatElapsed(start?: number) {
  if (!start) return "";
  const elapsed = Math.max(0, Date.now() - start);
  const seconds = Math.floor((elapsed / 1000) % 60);
  const minutes = Math.floor((elapsed / 60_000) % 60);
  const hours = Math.floor(elapsed / 3_600_000);
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function badgeTitle(badge: ProfileBadge) {
  if (badge.description) return badge.description;
  return (badge.id ?? "Discord badge")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-3 text-left transition hover:border-white/15"
    >
      <span className="text-xs font-bold text-zinc-300">{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full transition",
          checked ? "bg-[#5865f2]" : "bg-zinc-700",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function DiscordCardGenerator() {
  const [discordId, setDiscordId] = useState("");
  const [activeUserId, setActiveUserId] = useState("");
  const [payload, setPayload] = useState<DiscordCardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewWidth, setPreviewWidth] =
    useState<PreviewWidth>("desktop");
  const [accent, setAccent] = useState("#5865f2");
  const [opacity, setOpacity] = useState(92);
  const [radius, setRadius] = useState(24);
  const [rolesText, setRolesText] = useState(
    "Creator, Web Developer, Designer",
  );
  const [showActivity, setShowActivity] = useState(true);
  const [showAbout, setShowAbout] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [, setClock] = useState(0);
  const bootstrapped = useRef(false);

  const loadProfile = useCallback(async (requestedId: string) => {
    const cleanId = requestedId.trim();
    if (!DISCORD_ID_PATTERN.test(cleanId)) {
      setError("Enter a valid 17 to 20 digit Discord user ID.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/tools/discord-card/profile?userId=${encodeURIComponent(cleanId)}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as
        | DiscordCardPayload
        | { error?: string };

      if (!response.ok || !("user" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Could not load this Discord profile.",
        );
      }

      setPayload(data);
      setDiscordId(cleanId);
      setActiveUserId(cleanId);

      const themeColors = data.profile?.user_profile?.theme_colors ?? [];
      const profileAccent = themeColors.find(
        (color) => color > 0x101010 && color < 0xf0f0f0,
      );
      if (profileAccent !== undefined) {
        setAccent(discordColorToHex(profileAccent));
      } else if (
        data.user.banner_color &&
        !["#000000", "#ffffff"].includes(data.user.banner_color.toLowerCase())
      ) {
        setAccent(data.user.banner_color);
      }

      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("userId", cleanId);
      window.history.replaceState(null, "", nextUrl);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load this Discord profile.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const queryId = new URLSearchParams(window.location.search).get("userId");
    if (queryId && DISCORD_ID_PATTERN.test(queryId)) {
      void loadProfile(queryId);
      return;
    }

    void fetch("/api/user/profile", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{
          user?: { discord_user_id?: string | null };
        }>;
      })
      .then((profileResponse) => {
        const connectedId = profileResponse?.user?.discord_user_id;
        if (connectedId && DISCORD_ID_PATTERN.test(connectedId)) {
          void loadProfile(connectedId);
        }
      })
      .catch(() => {
        // The tool remains available to signed-out users through manual ID entry.
      });
  }, [loadProfile]);

  useEffect(() => {
    if (!activeUserId) return;

    let socket: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let reconnect: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    if (payload?.sources.presenceProvider === "official") return;

    const connect = () => {
      socket = new WebSocket("wss://api.lanyard.rest/socket");

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as {
            op?: number;
            t?: string;
            d?: PresenceData | { heartbeat_interval?: number };
          };

          if (message.op === 1) {
            const hello = message.d as { heartbeat_interval?: number };
            socket?.send(
              JSON.stringify({
                op: 2,
                d: { subscribe_to_id: activeUserId },
              }),
            );
            heartbeat = setInterval(() => {
              if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ op: 3 }));
              }
            }, hello.heartbeat_interval ?? 30_000);
            return;
          }

          if (
            (message.t === "INIT_STATE" ||
              message.t === "PRESENCE_UPDATE") &&
            message.d
          ) {
            const nextPresence = message.d as PresenceData;
            setPayload((current) =>
              current
                ? {
                    ...current,
                    presence: nextPresence,
                    user: {
                      ...current.user,
                      ...(nextPresence.discord_user ?? {}),
                    },
                    sources: {
                      ...current.sources,
                      presence: true,
                      presenceProvider: "lanyard",
                    },
                  }
                : current,
            );
          }
        } catch {
          // Ignore malformed socket messages and wait for the next update.
        }
      };

      socket.onclose = () => {
        if (heartbeat) clearInterval(heartbeat);
        if (!closed) reconnect = setTimeout(connect, 2_000);
      };
    };

    connect();

    return () => {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
      if (reconnect) clearTimeout(reconnect);
      socket?.close();
    };
  }, [activeUserId, payload?.sources.presenceProvider]);

  useEffect(() => {
    if (!activeUserId) return;

    let stopped = false;
    const refreshOfficialPresence = async () => {
      try {
        const response = await fetch(
          `/api/tools/discord-card/presence?userId=${encodeURIComponent(activeUserId)}`,
          { cache: "no-store" },
        );
        if (!response.ok || stopped) return;

        const result = (await response.json()) as {
          presence?: PresenceData | null;
          officialPresenceConfigured?: boolean;
          workerReady?: boolean;
          inviteUrl?: string | null;
        };

        setPayload((current) => {
          if (!current) return current;
          const nextSources = {
            ...current.sources,
            officialPresenceConfigured:
              result.officialPresenceConfigured ?? false,
            workerReady: result.workerReady ?? false,
            inviteUrl: result.inviteUrl ?? null,
          };

          if (!result.presence) {
            return { ...current, sources: nextSources };
          }

          return {
            ...current,
            presence: result.presence,
            user: {
              ...current.user,
              ...(result.presence.discord_user ?? {}),
            },
            sources: {
              ...nextSources,
              presence: true,
              presenceProvider: "official",
            },
          };
        });
      } catch {
        // Keep the last known presence or the Lanyard fallback.
      }
    };

    void refreshOfficialPresence();
    const timer = setInterval(refreshOfficialPresence, 12_000);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [activeUserId]);

  const activity = useMemo(
    () => selectActivity(payload?.presence ?? null),
    [payload?.presence],
  );

  useEffect(() => {
    if (!activity?.timestamps?.start) return;
    const timer = setInterval(() => setClock((value) => value + 1), 1_000);
    return () => clearInterval(timer);
  }, [activity?.timestamps?.start]);

  const user = payload?.user ?? DEMO_USER;
  const profile = payload?.profile;
  const presence = payload?.presence;
  const badges = profile?.badges ?? [];
  const connections = profile?.connected_accounts ?? [];
  const bio =
    profile?.user_profile?.bio?.trim() ||
    "Your Discord bio will appear here when the profile is loaded.";
  const roles = rolesText
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean)
    .slice(0, 8);
  const customStatus = presence?.activities?.find(
    (item) => item.type === 4,
  );
  const status = presence?.activities?.some((item) => item.type === 1)
    ? "streaming"
    : presence?.discord_status ?? "offline";
  const isSpotify = activity?.id === "spotify:1";
  const activityImage = isSpotify
    ? presence?.spotify?.album_art_url
    : activityAssetUrl(activity ?? {}, activity?.assets?.large_image);
  const activitySmallImage = activityAssetUrl(
    activity ?? {},
    activity?.assets?.small_image,
  );
  const displayName =
    user.global_name ||
    user.display_name ||
    user.username ||
    "Your Display Name";
  const nameStyle = user.display_name_styles;
  const nameColors =
    nameStyle?.colors
      ?.map(discordColorToHex)
      .map(ensureReadableNameColor) ?? [];
  const nameFontId = Number(nameStyle?.font_id);
  const accentRgb = hexToRgbString(accent);

  const cardStyle: CustomStyle = {
    "--card-accent": accentRgb,
    "--card-opacity": opacity / 100,
    borderRadius: radius,
  };
  const displayNameStyle: CustomStyle = {
    "--name-start": nameColors[0] ?? "#f2f3f5",
    "--name-end": nameColors[1] ?? nameColors[0] ?? "#f2f3f5",
    "--name-font": FONT_MAP[nameFontId] ?? '"gg sans", sans-serif',
    "--name-spacing": LETTER_SPACING_MAP[nameFontId] ?? "-0.035em",
  };

  const submitProfile = (event: FormEvent) => {
    event.preventDefault();
    void loadProfile(discordId);
  };

  const resetAppearance = () => {
    setAccent("#5865f2");
    setOpacity(92);
    setRadius(24);
    setRolesText("Creator, Web Developer, Designer");
    setShowActivity(true);
    setShowAbout(true);
    setShowBadges(true);
    setShowConnections(true);
  };

  const copyShareLink = async () => {
    if (!activeUserId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("userId", activeUserId);
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1_800);
  };

  const exportWebsite = async () => {
    if (!payload || !activeUserId) return;
    setExporting(true);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const safeDisplayName = escapeHtml(displayName);
      const safeUsername = escapeHtml(user.username ?? "discord-user");
      const safeBio = escapeHtml(bio);
      const safeRoles = roles
        .map(
          (role, index) =>
            `<span class="role" style="--role:${ROLE_COLORS[index % ROLE_COLORS.length]}"><i></i>${escapeHtml(role)}</span>`,
        )
        .join("");
      const safeConnections = connections
        .slice(0, 8)
        .map((connection) => {
          const label =
            CONNECTION_LABELS[connection.type ?? ""] ??
            connection.type ??
            "Account";
          const url = connectionUrl(connection);
          const content = `<span><small>${escapeHtml(label)}</small><strong>${escapeHtml(connection.name ?? "Connected account")}</strong></span>`;
          return url
            ? `<a class="connection" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${content}<b>↗</b></a>`
            : `<div class="connection">${content}</div>`;
        })
        .join("");
      const safeBadges = badges
        .filter((badge) => badge.icon)
        .slice(0, 12)
        .map(
          (badge) =>
            `<img src="https://cdn.discordapp.com/badge-icons/${encodeURIComponent(badge.icon ?? "")}.png" alt="${escapeHtml(badgeTitle(badge))}" title="${escapeHtml(badgeTitle(badge))}">`,
        )
        .join("");
      const exportedAvatar = avatarUrl(user);
      const exportedBanner = bannerUrl(user);
      const exportedDecoration = decorationUrl(user);
      const officialPresenceUrl = `${window.location.origin}/api/tools/discord-card/presence?userId=${encodeURIComponent(activeUserId)}`;

      const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="${safeDisplayName}'s live Discord profile card">
  <title>${safeDisplayName} | Discord Profile</title>
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:28px;background:radial-gradient(circle at 50% 35%,rgba(${accentRgb},.15),transparent 35%),#08080a;color:#f2f3f5;font-family:Inter,system-ui,sans-serif}
    .card{width:min(610px,100%);overflow:hidden;border:1px solid rgba(255,255,255,.14);border-radius:${radius}px;background:linear-gradient(180deg,rgba(18,18,21,${opacity / 100}),rgba(42,42,47,${opacity / 100}));box-shadow:0 35px 100px #000a}
    .banner{width:100%;height:210px;object-fit:cover;background:linear-gradient(135deg,${accent},#0b0b0e)}.body{padding:0 40px 40px}.identity{display:flex;align-items:end;justify-content:space-between;min-height:76px;margin-top:-62px}
    .avatar-wrap{position:relative;width:132px;height:132px}.avatar{width:100%;height:100%;border-radius:50%;object-fit:cover;border:7px solid #17171a}.decoration{position:absolute;inset:-17%;width:134%;height:134%;object-fit:contain}
    .status{position:absolute;right:2px;bottom:7px;width:31px;height:31px;border:7px solid #17171a;border-radius:50%;background:#80848e}.status.online{background:#23a55a}.status.idle{background:#f0b232}.status.dnd{background:#f23f43}
    .badges{display:flex;gap:7px;min-height:42px;max-width:calc(100% - 150px);padding:8px 11px;margin-bottom:7px;border:1px solid #ffffff18;border-radius:14px;background:#0a0a0cc8}.badges img{width:23px;height:23px;object-fit:contain}
    .name{padding:24px 0 18px;border-bottom:1px solid #ffffff17}.name h1{margin:0;font-size:42px;line-height:1}.name p{margin:8px 0 0;font-weight:700;color:#dbdee1}.bio{line-height:1.55;white-space:pre-wrap}.section{margin-top:21px}.section h2{font-size:13px;letter-spacing:.04em}.roles{display:flex;flex-wrap:wrap;gap:7px}.role{display:flex;align-items:center;gap:7px;padding:6px 9px;border:1px solid rgba(var(--role),.42);border-radius:7px;background:rgba(var(--role),.09);font-size:12px;font-weight:700}.role i{width:10px;height:10px;border-radius:50%;background:rgb(var(--role))}
    .connections{display:grid;grid-template-columns:1fr 1fr;gap:10px}.connection{display:flex;justify-content:space-between;align-items:center;padding:12px 13px;border:1px solid #ffffff17;border-radius:10px;color:inherit;text-decoration:none;background:#ffffff09}.connection small,.connection strong{display:block}.connection small{font-size:9px;color:#949ba4;text-transform:uppercase}.connection strong{font-size:13px}.activity{display:flex;gap:15px;margin-top:20px;padding:17px;border:1px solid #ffffff1f;border-radius:16px;background:#0d0d10c9}.activity img{width:82px;height:82px;border-radius:12px;object-fit:cover}.activity small{color:#b5bac1;font-weight:800}.activity h3{margin:7px 0 3px}.activity p{margin:0;color:#43f28b;font-size:12px}
    @media(max-width:600px){body{padding:16px}.banner{height:168px}.body{padding:0 22px 28px}.avatar-wrap{width:108px;height:108px}.identity{margin-top:-52px}.badges{max-width:calc(100% - 118px)}.name h1{font-size:31px}.connections{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main class="card">
    ${exportedBanner ? `<img id="banner" class="banner" src="${exportedBanner}" alt="">` : `<div id="banner" class="banner"></div>`}
    <div class="body">
      <div class="identity">
        <div class="avatar-wrap">
          <img id="avatar" class="avatar" src="${exportedAvatar}" alt="${safeDisplayName}">
          ${exportedDecoration ? `<img id="decoration" class="decoration" src="${exportedDecoration}" alt="">` : ""}
          <i id="status" class="status ${status}"></i>
        </div>
        ${showBadges && safeBadges ? `<div class="badges">${safeBadges}</div>` : ""}
      </div>
      <div class="name"><h1 id="display-name">${safeDisplayName}</h1><p id="username">${safeUsername}</p></div>
      ${showActivity && activity ? `<section id="activity" class="activity">${activityImage ? `<img src="${activityImage}" alt="">` : ""}<div><small>${isSpotify ? "LISTENING TO SPOTIFY" : activity.type === 1 ? "STREAMING" : "PLAYING A GAME"}</small><h3>${escapeHtml(isSpotify ? presence?.spotify?.song ?? activity.name ?? "" : activity.name ?? "")}</h3><p>${escapeHtml(isSpotify ? presence?.spotify?.artist ?? "" : activity.details ?? activity.state ?? "")}</p></div></section>` : ""}
      ${showAbout ? `<section class="section"><h2>ABOUT ME</h2><div class="bio">${safeBio}</div></section>` : ""}
      ${safeRoles ? `<section class="section"><h2>ROLES</h2><div class="roles">${safeRoles}</div></section>` : ""}
      ${showConnections && safeConnections ? `<section class="section"><h2>CONNECTIONS</h2><div class="connections">${safeConnections}</div></section>` : ""}
    </div>
  </main>
  <script>
    const USER_ID=${JSON.stringify(activeUserId)};
    const OFFICIAL_PRESENCE_URL=${JSON.stringify(officialPresenceUrl)};
    const status=document.getElementById("status");
    function applyPresence(data){
      if(!data)return;
      status.className="status "+(data.discord_status||"offline");
      const user=data.discord_user||{};
      if(user.username)document.getElementById("username").textContent=user.username;
      if(user.display_name)document.getElementById("display-name").textContent=user.display_name;
      if(user.avatar)document.getElementById("avatar").src="https://cdn.discordapp.com/avatars/"+USER_ID+"/"+user.avatar+"."+(user.avatar.startsWith("a_")?"gif":"webp")+"?size=1024";
    }
    async function refreshOfficialPresence(){
      try{
        const response=await fetch(OFFICIAL_PRESENCE_URL,{cache:"no-store"});
        const result=await response.json();
        if(result.presence){applyPresence(result.presence);return true}
      }catch{}
      return false;
    }
    refreshOfficialPresence().then(found=>{
      if(!found)fetch("https://api.lanyard.rest/v1/users/"+USER_ID).then(r=>r.json()).then(r=>r.success&&applyPresence(r.data)).catch(()=>{});
    });
    setInterval(refreshOfficialPresence,15000);
    let heartbeat;
    function connect(){
      const ws=new WebSocket("wss://api.lanyard.rest/socket");
      ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.op===1){ws.send(JSON.stringify({op:2,d:{subscribe_to_id:USER_ID}}));heartbeat=setInterval(()=>ws.readyState===1&&ws.send(JSON.stringify({op:3})),m.d.heartbeat_interval||30000)}if(m.t==="INIT_STATE"||m.t==="PRESENCE_UPDATE")applyPresence(m.d)};
      ws.onclose=()=>{clearInterval(heartbeat);setTimeout(connect,2000)};
    }
    connect();
  </script>
</body>
</html>`;

      zip.file("index.html", html);
      zip.file(
        "README.txt",
        `Exismic Discord Profile Card

Discord User ID: ${activeUserId}

Open index.html locally to preview it, or upload the files to GitHub Pages, Netlify, or any static host.
Live status uses the Exismic Discord presence service when the user shares a server with the Exismic bot.
Lanyard remains available as a fallback.
`,
      );
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `discord-card-${user.username ?? activeUserId}.zip`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] px-4 pb-20 pt-28 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute left-[12%] top-[16%] h-[420px] w-[420px] rounded-full blur-[150px]"
          style={{ backgroundColor: `rgba(${accentRgb}, 0.12)` }}
        />
        <div className="absolute bottom-[5%] right-[8%] h-[380px] w-[380px] rounded-full bg-indigo-600/8 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      </div>

      <div className="relative mx-auto max-w-[1500px]">
        <header className="mb-9 flex flex-col gap-6 border-b border-white/8 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#5865f2]/30 bg-[#5865f2]/12 text-[#8993f8]">
                <UserRound size={22} />
              </span>
              <span className="rounded-full border border-[#5865f2]/25 bg-[#5865f2]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#aeb4ff]">
                Live Discord Tool
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Discord Profile Card Generator
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-zinc-400 sm:text-base">
              Enter a Discord user ID, customize the layout, and export a live
              profile website with presence, activities, cosmetics, badges, and
              connections.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyShareLink}
              disabled={!activeUserId}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-wider text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Share"}
            </button>
            <button
              type="button"
              onClick={exportWebsite}
              disabled={!payload || exporting}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {exporting ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <Download size={15} />
              )}
              Export Website
            </button>
          </div>
        </header>

        <div className="grid items-start gap-8 xl:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="space-y-5 xl:sticky xl:top-24">
            <section className="rounded-[26px] border border-white/9 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8993f8]">
                    Profile Source
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold">
                    Load Discord profile
                  </h2>
                </div>
                {payload && (
                  <button
                    type="button"
                    onClick={() => void loadProfile(activeUserId)}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/20 text-zinc-400 transition hover:text-white"
                    title="Refresh profile"
                  >
                    <RefreshCw
                      size={16}
                      className={loading ? "animate-spin" : ""}
                    />
                  </button>
                )}
              </div>

              <form onSubmit={submitProfile} className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Discord User ID
                </label>
                <div className="flex gap-2">
                  <input
                    value={discordId}
                    onChange={(event) =>
                      setDiscordId(event.target.value.replace(/\D/g, ""))
                    }
                    inputMode="numeric"
                    maxLength={20}
                    placeholder="887557388700368896"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold outline-none transition placeholder:text-zinc-700 focus:border-[#5865f2]/60"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="grid w-12 place-items-center rounded-xl bg-[#5865f2] text-white transition hover:bg-[#6875f5] disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Sparkles size={18} />
                    )}
                  </button>
                </div>
              </form>

              {error && (
                <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs font-medium leading-5 text-red-300">
                  {error}
                </p>
              )}

              {payload && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/7 bg-black/20 px-3 py-2">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-zinc-600">
                      Presence
                    </span>
                    <span
                      className={cn(
                        "mt-1 flex items-center gap-1.5 text-[11px] font-bold",
                        payload.sources.presence
                          ? "text-emerald-400"
                          : "text-amber-400",
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {payload.sources.presenceProvider === "official"
                        ? "Exismic"
                        : payload.sources.presenceProvider === "lanyard"
                          ? "Fallback"
                          : "Unavailable"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/7 bg-black/20 px-3 py-2">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-zinc-600">
                      Profile
                    </span>
                    <span
                      className={cn(
                        "mt-1 flex items-center gap-1.5 text-[11px] font-bold",
                        payload.sources.extendedProfile
                          ? "text-emerald-400"
                          : "text-amber-400",
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {payload.sources.extendedProfile
                        ? "Synced"
                        : "Basic only"}
                    </span>
                  </div>
                </div>
              )}

              {payload && (
                <div
                  className={cn(
                    "mt-3 rounded-xl border px-3 py-3",
                    payload.sources.presenceProvider === "official"
                      ? "border-emerald-500/20 bg-emerald-500/7"
                      : "border-[#5865f2]/20 bg-[#5865f2]/7",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                        payload.sources.presenceProvider === "official"
                          ? "bg-emerald-500/12 text-emerald-400"
                          : "bg-[#5865f2]/12 text-[#8993f8]",
                      )}
                    >
                      {payload.sources.presenceProvider === "official" ? (
                        <ShieldCheck size={16} />
                      ) : (
                        <Radio size={16} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-white">
                        {payload.sources.presenceProvider === "official"
                          ? "Official live presence enabled"
                          : payload.sources.officialPresenceConfigured
                            ? "Enable official live presence"
                            : "Using compatible fallback"}
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                        {payload.sources.presenceProvider === "official"
                          ? "Status and activities are coming directly from Exismic's Discord bot."
                          : payload.sources.officialPresenceConfigured
                            ? "Share the Exismic server with the bot. The card will switch automatically."
                            : "Exismic's Discord worker can be configured without changing this card."}
                      </p>
                      {payload.sources.presenceProvider !== "official" &&
                        payload.sources.inviteUrl && (
                          <a
                            href={payload.sources.inviteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#aeb4ff] hover:text-white"
                          >
                            Join presence server
                            <ExternalLink size={11} />
                          </a>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-[26px] border border-white/9 bg-white/[0.035] p-5 backdrop-blur-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
                    Appearance
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold">Card styling</h2>
                </div>
                <button
                  type="button"
                  onClick={resetAppearance}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/9 bg-black/20 text-zinc-500 transition hover:text-white"
                  title="Reset appearance"
                >
                  <RotateCcw size={15} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      Accent
                    </label>
                    <span className="font-mono text-[10px] uppercase text-zinc-500">
                      {accent}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 p-3">
                    <input
                      type="color"
                      value={accent}
                      onChange={(event) => setAccent(event.target.value)}
                      className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                    />
                    <div
                      className="h-2 flex-1 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${accent}, transparent)`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    <label>Card opacity</label>
                    <span>{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={65}
                    max={100}
                    value={opacity}
                    onChange={(event) => setOpacity(Number(event.target.value))}
                    className="h-1 w-full cursor-pointer accent-[#5865f2]"
                  />
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    <label>Corner radius</label>
                    <span>{radius}px</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={38}
                    value={radius}
                    onChange={(event) => setRadius(Number(event.target.value))}
                    className="h-1 w-full cursor-pointer accent-[#5865f2]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Custom roles
                  </label>
                  <textarea
                    value={rolesText}
                    onChange={(event) => setRolesText(event.target.value)}
                    rows={3}
                    placeholder="Developer, Designer, Creator"
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-xs font-medium leading-5 outline-none transition focus:border-[#5865f2]/60"
                  />
                  <p className="mt-2 text-[10px] text-zinc-600">
                    Separate roles with commas. Up to eight are shown.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[26px] border border-white/9 bg-white/[0.035] p-5 backdrop-blur-2xl">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
                Visible sections
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Toggle
                  checked={showActivity}
                  label="Activity"
                  onChange={setShowActivity}
                />
                <Toggle
                  checked={showAbout}
                  label="About me"
                  onChange={setShowAbout}
                />
                <Toggle
                  checked={showBadges}
                  label="Badges"
                  onChange={setShowBadges}
                />
                <Toggle
                  checked={showConnections}
                  label="Connections"
                  onChange={setShowConnections}
                />
              </div>
            </section>
          </aside>

          <section className="min-w-0 rounded-[32px] border border-white/8 bg-white/[0.025] p-3 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-xl sm:p-6 lg:p-9">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  <Activity size={12} />
                  Live preview
                </span>
                {activeUserId && (
                  <span className="hidden text-[10px] font-bold text-zinc-600 sm:inline">
                    {activeUserId}
                  </span>
                )}
              </div>
              <div className="flex rounded-xl border border-white/8 bg-black/25 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewWidth("desktop")}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider transition",
                    previewWidth === "desktop"
                      ? "bg-white/10 text-white"
                      : "text-zinc-600 hover:text-zinc-300",
                  )}
                >
                  <Monitor size={13} /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewWidth("mobile")}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider transition",
                    previewWidth === "mobile"
                      ? "bg-white/10 text-white"
                      : "text-zinc-600 hover:text-zinc-300",
                  )}
                >
                  <Smartphone size={13} /> Mobile
                </button>
              </div>
            </div>

            <div
              className={cn(
                "relative mx-auto transition-all duration-500",
                previewWidth === "mobile" ? "max-w-[390px]" : "max-w-[760px]",
              )}
            >
              <div
                className={styles.previewShell}
                style={{ "--card-accent": accentRgb } as CustomStyle}
              >
                <article className={styles.profileCard} style={cardStyle}>
                  {bannerUrl(user) ? (
                    <img
                      className={styles.banner}
                      src={bannerUrl(user) ?? ""}
                      alt=""
                    />
                  ) : (
                    <div
                      className={styles.banner}
                      style={{
                        background: `radial-gradient(circle at 30% 35%, rgba(${accentRgb}, .62), transparent 36%), linear-gradient(135deg, #141419, #070709)`,
                      }}
                    />
                  )}
                  <div className={styles.bannerShade} />

                  {payload?.effect?.effects.map((layer, index) => (
                    <img
                      key={`${layer.src}-${index}`}
                      className={styles.effectLayer}
                      src={layer.src}
                      alt=""
                      style={{ zIndex: Math.max(4, layer.zIndex) }}
                    />
                  ))}

                  <div className={styles.profileBody}>
                    <div className={styles.identityRow}>
                      <div className={styles.avatarWrap}>
                        <img
                          className={styles.avatar}
                          src={avatarUrl(user)}
                          alt={`${displayName}'s avatar`}
                        />
                        {decorationUrl(user) && (
                          <img
                            className={styles.avatarDecoration}
                            src={decorationUrl(user) ?? ""}
                            alt=""
                          />
                        )}
                        <span
                          className={styles.status}
                          data-status={status}
                          title={status}
                        />
                      </div>

                      {showBadges && badges.length > 0 && (
                        <div className={styles.badgeTray}>
                          {badges.slice(0, 14).map((badge, index) =>
                            badge.icon ? (
                              <img
                                key={`${badge.id}-${index}`}
                                className={styles.badge}
                                src={`https://cdn.discordapp.com/badge-icons/${badge.icon}.png`}
                                alt={badgeTitle(badge)}
                                title={badgeTitle(badge)}
                              />
                            ) : null,
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.nameBlock}>
                      <h2
                        className={cn(
                          styles.displayName,
                          nameColors.length > 0 && styles.styledName,
                        )}
                        style={displayNameStyle}
                      >
                        {displayName}
                      </h2>
                      <div className={styles.username}>
                        {user.username ?? "your_username"}
                      </div>
                      {customStatus?.state && (
                        <div className={styles.customStatus}>
                          {customStatus.emoji?.id ? (
                            <img
                              className="h-5 w-5 object-contain"
                              src={`https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.webp?size=40&quality=lossless`}
                              alt=""
                            />
                          ) : (
                            customStatus.emoji?.name && (
                              <span>{customStatus.emoji.name}</span>
                            )
                          )}
                          <span>{customStatus.state}</span>
                        </div>
                      )}
                    </div>

                    {showActivity && activity && (
                      <section className={styles.activityCard}>
                        <div className={styles.activityImageWrap}>
                          {activityImage ? (
                            <img
                              className={styles.activityImage}
                              src={activityImage}
                              alt=""
                            />
                          ) : (
                            <div className={cn(styles.activityImage, "grid place-items-center text-3xl font-black text-zinc-600")}>
                              ?
                            </div>
                          )}
                          {activitySmallImage && (
                            <img
                              className={styles.activitySmallImage}
                              src={activitySmallImage}
                              alt=""
                            />
                          )}
                        </div>
                        <div className={styles.activityCopy}>
                          <span className={styles.eyebrow}>
                            {isSpotify
                              ? "Listening to Spotify"
                              : activity.type === 1
                                ? "Streaming"
                                : "Playing a game"}
                          </span>
                          <span className={styles.activityName}>
                            {isSpotify
                              ? presence?.spotify?.song
                              : activity.name}
                          </span>
                          {(isSpotify
                            ? presence?.spotify?.artist
                            : activity.details) && (
                            <span className={styles.activityLine}>
                              {isSpotify
                                ? `by ${presence?.spotify?.artist}`
                                : activity.details}
                            </span>
                          )}
                          {!isSpotify && activity.state && (
                            <span className={styles.activityLine}>
                              {activity.state}
                            </span>
                          )}
                          {activity.timestamps?.start && (
                            <span className={styles.activityTime}>
                              {formatElapsed(activity.timestamps.start)} elapsed
                            </span>
                          )}
                        </div>
                      </section>
                    )}

                    {showAbout && bio && (
                      <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>About Me</h3>
                        <div className={styles.about}>{bio}</div>
                      </section>
                    )}

                    {roles.length > 0 && (
                      <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Roles</h3>
                        <div className={styles.roles}>
                          {roles.map((role, index) => (
                            <span
                              key={`${role}-${index}`}
                              className={styles.role}
                              style={
                                {
                                  "--role-color":
                                    ROLE_COLORS[index % ROLE_COLORS.length],
                                } as CustomStyle
                              }
                            >
                              <span className={styles.roleDot} />
                              {role}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}

                    {showConnections && connections.length > 0 && (
                      <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Connections</h3>
                        <div className={styles.connections}>
                          {connections.slice(0, 8).map((connection, index) => {
                            const type = connection.type ?? "account";
                            const label =
                              CONNECTION_LABELS[type] ?? type;
                            const url = connectionUrl(connection);
                            const content = (
                              <>
                                <span className={styles.connectionMark}>
                                  {label.slice(0, 2)}
                                </span>
                                <span className={styles.connectionCopy}>
                                  <span className={styles.connectionType}>
                                    {label}
                                  </span>
                                  <span className={styles.connectionName}>
                                    {connection.name ?? "Connected account"}
                                  </span>
                                </span>
                                {url && (
                                  <ExternalLink
                                    className="ml-auto shrink-0 text-zinc-500"
                                    size={15}
                                  />
                                )}
                              </>
                            );

                            return url ? (
                              <a
                                key={`${type}-${connection.id}-${index}`}
                                className={styles.connection}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {content}
                              </a>
                            ) : (
                              <div
                                key={`${type}-${connection.id}-${index}`}
                                className={styles.connection}
                              >
                                {content}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}
                  </div>

                  {loading && (
                    <div className="absolute inset-0 z-50 grid place-items-center bg-black/45 backdrop-blur-sm">
                      <Loader2 className="animate-spin text-white" size={30} />
                    </div>
                  )}
                </article>
              </div>
            </div>

            <div className="mx-auto mt-6 flex max-w-[610px] items-center justify-between rounded-2xl border border-white/7 bg-black/20 px-4 py-3 text-[10px] font-bold text-zinc-500">
              <span className="flex items-center gap-2">
                {payload ? <Eye size={13} /> : <EyeOff size={13} />}
                {payload
                  ? "Profile changes update automatically"
                  : "Enter a Discord user ID to start"}
              </span>
              <span>{previewWidth === "mobile" ? "390px" : "610px"}</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
