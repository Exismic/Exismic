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
  HelpCircle,
  Loader2,
  Monitor,
  Palette,
  Radio,
  RefreshCw,
  RotateCcw,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Disc,
  Layers,
  Code,
  Globe,
  Camera,
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
import { DiscordIdGuideModal } from "@/components/modals/DiscordIdGuideModal";
import { DiscordExportModal } from "@/components/modals/DiscordExportModal";
import { PRO_FRAMES } from "@/components/ui/AvatarWithFrame";

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

type ThemePresetKey = "custom" | "obsidian" | "synthwave" | "gold" | "emerald" | "frosted";

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

const THEME_PRESETS: Array<{
  id: ThemePresetKey;
  name: string;
  accent: string;
  class?: string;
  dotColor: string;
}> = [
  { id: "custom", name: "Discord Classic", accent: "#5865f2", dotColor: "#5865f2" },
  { id: "obsidian", name: "Obsidian Cyber", accent: "#6366f1", class: styles.themeObsidian, dotColor: "#6366f1" },
  { id: "synthwave", name: "Synthwave 80s", accent: "#ec4899", class: styles.themeSynthwave, dotColor: "#ec4899" },
  { id: "gold", name: "Holographic Gold", accent: "#f59e0b", class: styles.themeGold, dotColor: "#f59e0b" },
  { id: "emerald", name: "Emerald Matrix", accent: "#10b981", class: styles.themeEmerald, dotColor: "#10b981" },
  { id: "frosted", name: "Frosted Glass", accent: "#94a3b8", class: styles.themeFrosted, dotColor: "#e2e8f0" },
];

const DEMO_PROFILES: Record<string, DiscordCardPayload> = {
  gamer: {
    userId: "887557388700368896",
    user: {
      id: "887557388700368896",
      username: "alex_apex",
      global_name: "Alex Rivers",
      display_name: "Alex Rivers",
      banner_color: "#6366f1",
      avatar_decoration_data: { asset: "a_04c5521b4421b8c2c544d6da21ea41e0" },
    },
    presence: {
      discord_status: "online",
      activities: [
        {
          name: "VALORANT",
          type: 0,
          details: "Competitive (Ascendant II)",
          state: "In a Match - Haven (11 - 9)",
          application_id: "700136079562375258",
          timestamps: { start: Date.now() - 1450000 },
        },
      ],
    },
    profile: {
      user_profile: {
        bio: "Full-stack engineer by day, radiant duelist by night. Streaming scrims on weekends!",
        theme_colors: [0x6366f1, 0xec4899],
      },
      badges: [
        { id: "hypesquad_bravery", description: "HypeSquad Bravery", icon: "8a88d63823d835a760419352d0057f5c" },
        { id: "early_supporter", description: "Early Supporter", icon: "70d35610f607dd802f0b73730761f05f" },
        { id: "nitro", description: "Nitro Subscriber", icon: "2ba85e8026a8614b640c2837bcd2177b" },
      ],
      connected_accounts: [
        { type: "twitch", name: "alexrivers_live" },
        { type: "github", name: "alexrivers" },
        { type: "steam", name: "AlexRivers" },
        { type: "twitter", name: "alexrivers_dev" },
      ],
    },
    effect: null,
    sources: { presence: true, presenceProvider: "official", extendedProfile: true },
    fetchedAt: new Date().toISOString(),
  },
  dev: {
    userId: "1059526712355938365",
    user: {
      id: "1059526712355938365",
      username: "maya_codes",
      global_name: "Maya Chen",
      display_name: "Maya Chen",
      banner_color: "#10b981",
    },
    presence: {
      discord_status: "dnd",
      activities: [
        {
          name: "Visual Studio Code",
          type: 0,
          details: "Editing DiscordCardGenerator.tsx",
          state: "Workspace: exismic-project",
          timestamps: { start: Date.now() - 3600000 },
        },
      ],
    },
    profile: {
      user_profile: {
        bio: "Designing interfaces that feel like pure magic ✨ React, Next.js & Rust enthusiast. Open-source contributor.",
        theme_colors: [0x10b981, 0x06b6d4],
      },
      badges: [
        { id: "active_developer", description: "Active Developer", icon: "6bdc42827a38498929a5920da9a695da" },
        { id: "hypesquad_brilliance", description: "HypeSquad Brilliance", icon: "48acdfdbd03c3b53a061486be0095a4f" },
      ],
      connected_accounts: [
        { type: "github", name: "mayachen-ui" },
        { type: "twitter", name: "mayacodes" },
        { type: "domain", name: "mayachen.dev" },
      ],
    },
    effect: null,
    sources: { presence: true, presenceProvider: "official", extendedProfile: true },
    fetchedAt: new Date().toISOString(),
  },
  audiophile: {
    userId: "983419201509376041",
    user: {
      id: "983419201509376041",
      username: "kael_beats",
      global_name: "Kael Morrison",
      display_name: "Kael Morrison",
      banner_color: "#ec4899",
    },
    presence: {
      discord_status: "idle",
      activities: [
        {
          id: "spotify:1",
          name: "Spotify",
          type: 2,
          details: "Midnight City",
          state: "M83",
          timestamps: { start: Date.now() - 120000 },
        },
      ],
      spotify: {
        song: "Midnight City",
        artist: "M83",
        album: "Hurry Up, We're Dreaming",
        album_art_url: "https://i.scdn.co/image/ab67616d0000b273418579486c99451965bb1b2e",
        track_id: "1eyzqe2QqGZUmfcPZtrIyt",
      },
    },
    profile: {
      user_profile: {
        bio: "Electronic & synthwave producer. Constantly spinning vintage vinyls and experimenting with analog synthesizers 🎹",
        theme_colors: [0xec4899, 0x8b5cf6],
      },
      badges: [
        { id: "nitro", description: "Nitro Subscriber", icon: "2ba85e8026a8614b640c2837bcd2177b" },
        { id: "hypesquad_balance", description: "HypeSquad Balance", icon: "9f3a7441e7e727621aa90a071c63b4f6" },
      ],
      connected_accounts: [
        { type: "spotify", name: "kaelmorrison" },
        { type: "youtube", name: "KaelBeatsOfficial" },
        { type: "twitter", name: "kael_synth" },
      ],
    },
    effect: null,
    sources: { presence: true, presenceProvider: "official", extendedProfile: true },
    fetchedAt: new Date().toISOString(),
  },
};

const DEFAULT_USER: DiscordUser = DEMO_PROFILES.gamer.user;

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

  const discriminator = Number(user.id ?? "0") % 5;
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
  const cardRef = useRef<HTMLElement | null>(null);

  const [discordId, setDiscordId] = useState("");
  const [activeUserId, setActiveUserId] = useState("887557388700368896");
  const [payload, setPayload] = useState<DiscordCardPayload | null>(DEMO_PROFILES.gamer);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<PreviewWidth>("desktop");
  const [accent, setAccent] = useState("#5865f2");
  const [opacity, setOpacity] = useState(92);
  const [radius, setRadius] = useState(24);
  const [selectedTheme, setSelectedTheme] = useState<ThemePresetKey>("custom");
  const [selectedExismicFrame, setSelectedExismicFrame] = useState<string>("none");
  const [rolesText, setRolesText] = useState("Pro Gamer, Scrim Leader, Creator");
  const [showActivity, setShowActivity] = useState(true);
  const [showAbout, setShowAbout] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [connectedUserDiscordId, setConnectedUserDiscordId] = useState<string | null>(null);
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

  const loadDemoProfile = (key: keyof typeof DEMO_PROFILES) => {
    const demo = DEMO_PROFILES[key];
    if (!demo) return;
    setPayload(demo);
    setActiveUserId(demo.userId);
    setDiscordId(demo.userId);
    setError("");
    if (key === "gamer") {
      setRolesText("Pro Gamer, Scrim Leader, Creator");
      setAccent("#6366f1");
    } else if (key === "dev") {
      setRolesText("Frontend Engineer, UI Designer, OSS");
      setAccent("#10b981");
    } else if (key === "audiophile") {
      setRolesText("Music Producer, Synthwave Artist, DJ");
      setAccent("#ec4899");
    }
  };

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
          setConnectedUserDiscordId(connectedId);
          void loadProfile(connectedId);
        }
      })
      .catch(() => {});
  }, [loadProfile]);

  useEffect(() => {
    if (!activeUserId || payload?.sources.presenceProvider === "official") return;

    let socket: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let reconnect: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const connect = () => {
      try {
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
          } catch {}
        };

        socket.onclose = () => {
          if (heartbeat) clearInterval(heartbeat);
          if (!closed) reconnect = setTimeout(connect, 2_000);
        };
      } catch {}
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
    if (!activeUserId || !DISCORD_ID_PATTERN.test(activeUserId)) return;

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
      } catch {}
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

  const user = payload?.user ?? DEFAULT_USER;
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
    "Alex Rivers";
  const nameStyle = user.display_name_styles;
  const nameColors =
    nameStyle?.colors
      ?.map(discordColorToHex)
      .map(ensureReadableNameColor) ?? [];
  const nameFontId = Number(nameStyle?.font_id);
  const accentRgb = hexToRgbString(accent);

  const activeThemePreset = THEME_PRESETS.find((t) => t.id === selectedTheme);
  const activeExismicFrame = PRO_FRAMES.find((f) => f.id === selectedExismicFrame);

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
    setSelectedTheme("custom");
    setSelectedExismicFrame("none");
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

  // 1-Click High-Res PNG Capture
  const captureCardPng = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      quality: 0.95,
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `discord-card-${user.username ?? activeUserId}.png`;
    link.click();
    return dataUrl;
  }, [user.username, activeUserId]);

  const exportWebsiteZip = async () => {
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
</body>
</html>`;

      zip.file("index.html", html);
      zip.file("README.txt", `Exismic Discord Profile Card for ${activeUserId}`);
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
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute left-[12%] top-[16%] h-[420px] w-[420px] rounded-full blur-[150px] transition-all duration-700"
          style={{ backgroundColor: `rgba(${accentRgb}, 0.14)` }}
        />
        <div className="absolute bottom-[5%] right-[8%] h-[380px] w-[380px] rounded-full bg-indigo-600/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      </div>

      <div className="relative mx-auto max-w-[1500px]">
        {/* Top Header */}
        <header className="mb-8 flex flex-col gap-6 border-b border-white/8 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#5865f2]/40 bg-[#5865f2]/15 text-[#8993f8]">
                <UserRound size={22} />
              </span>
              <span className="rounded-full border border-[#5865f2]/30 bg-[#5865f2]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#aeb4ff]">
                Live Studio · S-Tier
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Discord Profile Card Studio
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-zinc-400 sm:text-base">
              Create a live obsidian Discord profile website with real-time status, Spotify sync, custom frames, and multi-format exports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={copyShareLink}
              disabled={!activeUserId}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-wider text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
              {copied ? "Link Copied" : "Quick Share"}
            </button>

            <button
              type="button"
              onClick={() => void captureCardPng()}
              disabled={!payload}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-xs font-black uppercase tracking-wider text-indigo-300 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Camera size={15} />
              Capture PNG
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              disabled={!payload}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-[#5865f2] to-purple-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_30px_rgba(88,101,242,0.4)] transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles size={15} />
              Export & Share Hub
            </button>
          </div>
        </header>

        {/* Studio Workspace Layout */}
        <div className="grid items-start gap-8 xl:grid-cols-[410px_minmax(0,1fr)]">
          {/* Controls Sidebar */}
          <aside className="space-y-5 xl:sticky xl:top-24">
            {/* Profile Input & Demos */}
            <section className="rounded-[26px] border border-white/9 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8993f8]">
                    Profile Source
                  </p>
                  <h2 className="mt-0.5 text-lg font-extrabold">
                    Load Discord profile
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowGuideModal(true)}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/20 text-zinc-400 hover:text-white transition"
                    title="How to find your User ID"
                  >
                    <HelpCircle size={16} />
                  </button>
                  {payload && (
                    <button
                      type="button"
                      onClick={() => void loadProfile(activeUserId)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/20 text-zinc-400 hover:text-white transition"
                      title="Refresh profile"
                    >
                      <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    </button>
                  )}
                </div>
              </div>

              {/* Demo Profile Selector Chips */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Instant Demo Profiles
                  </span>
                  <span className="text-[9px] font-bold text-[#8993f8]">
                    1-Click Preview
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => loadDemoProfile("gamer")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-bold transition",
                      activeUserId === "887557388700368896"
                        ? "border-[#5865f2] bg-[#5865f2]/15 text-white"
                        : "border-white/8 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-white"
                    )}
                  >
                    <span>🎮 Gamer</span>
                    <span className="text-[9px] opacity-70">Apex/Valorant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadDemoProfile("dev")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-bold transition",
                      activeUserId === "1059526712355938365"
                        ? "border-emerald-500 bg-emerald-500/15 text-white"
                        : "border-white/8 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-white"
                    )}
                  >
                    <span>💻 Indie Dev</span>
                    <span className="text-[9px] opacity-70">VS Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadDemoProfile("audiophile")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-bold transition",
                      activeUserId === "983419201509376041"
                        ? "border-pink-500 bg-pink-500/15 text-white"
                        : "border-white/8 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-white"
                    )}
                  >
                    <span>🎧 Spotify</span>
                    <span className="text-[9px] opacity-70">Audiophile</span>
                  </button>
                </div>
              </div>

              {/* Connected Account Auto-fill Banner */}
              {connectedUserDiscordId && connectedUserDiscordId !== activeUserId && (
                <button
                  type="button"
                  onClick={() => void loadProfile(connectedUserDiscordId)}
                  className="mb-3 w-full flex items-center justify-between gap-2 rounded-xl border border-[#5865f2]/30 bg-[#5865f2]/10 p-2.5 text-left text-xs text-[#aeb4ff] transition hover:bg-[#5865f2]/20"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <Sparkles size={14} className="text-[#aeb4ff]" />
                    Load my connected Discord ID
                  </span>
                  <span className="text-[10px] font-black uppercase text-white">&rarr;</span>
                </button>
              )}

              {/* ID Input Form */}
              <form onSubmit={submitProfile} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Discord User ID
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowGuideModal(true)}
                    className="text-[10px] font-bold text-[#8993f8] hover:underline"
                  >
                    Where do I find this?
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    value={discordId}
                    onChange={(event) =>
                      setDiscordId(event.target.value.replace(/\D/g, ""))
                    }
                    inputMode="numeric"
                    maxLength={20}
                    placeholder="Enter 18-digit Discord ID..."
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold outline-none transition placeholder:text-zinc-600 focus:border-[#5865f2]/70"
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

              {/* Status Chips */}
              {payload && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/7 bg-black/20 px-3 py-2">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-zinc-500">
                      Presence Provider
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {payload.sources.presenceProvider === "official" ? "Exismic Gateway" : "Lanyard Live"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/7 bg-black/20 px-3 py-2">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-zinc-500">
                      Profile Sync
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {payload.sources.extendedProfile ? "Badges & Bio" : "Basic Sync"}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Themes & Visual Aesthetics */}
            <section className="rounded-[26px] border border-white/9 bg-white/[0.035] p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
                    Aesthetics
                  </p>
                  <h2 className="mt-0.5 text-lg font-extrabold">Theme & Styling</h2>
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

              {/* Preset Theme Buttons */}
              <div className="mb-5 space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Theme Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {THEME_PRESETS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTheme(t.id);
                        setAccent(t.accent);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-bold transition",
                        selectedTheme === t.id
                          ? "border-[#5865f2] bg-[#5865f2]/15 text-white"
                          : "border-white/8 bg-black/25 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                      )}
                    >
                      <span
                        className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: t.dotColor }}
                      />
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exismic Custom Avatar Frame Overlay */}
              <div className="mb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Exismic Custom Avatar Frame
                  </label>
                  <span className="text-[9px] font-bold text-amber-400">
                    Cosmetics Synergy
                  </span>
                </div>
                <select
                  value={selectedExismicFrame}
                  onChange={(e) => setSelectedExismicFrame(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-xs font-bold text-zinc-200 outline-none focus:border-[#5865f2]"
                >
                  <option value="none">None (Default Discord Avatar)</option>
                  {PRO_FRAMES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                {/* Accent Picker */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      Accent Color
                    </label>
                    <span className="font-mono text-[10px] uppercase text-zinc-500">
                      {accent}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 p-3">
                    <input
                      type="color"
                      value={accent}
                      onChange={(event) => {
                        setAccent(event.target.value);
                        setSelectedTheme("custom");
                      }}
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

                {/* Corner Radius */}
                <div>
                  <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    <label>Corner radius</label>
                    <span>{radius}px</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={36}
                    value={radius}
                    onChange={(event) => setRadius(Number(event.target.value))}
                    className="h-1 w-full cursor-pointer accent-[#5865f2]"
                  />
                </div>

                {/* Custom Roles */}
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Custom roles
                  </label>
                  <textarea
                    value={rolesText}
                    onChange={(event) => setRolesText(event.target.value)}
                    rows={2}
                    placeholder="Gamer, Developer, Creator"
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs font-medium leading-5 outline-none transition focus:border-[#5865f2]/60"
                  />
                </div>
              </div>
            </section>

            {/* Section Visibility Toggles */}
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

          {/* Interactive Card Canvas Preview */}
          <section className="min-w-0 rounded-[32px] border border-white/8 bg-white/[0.025] p-3 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-xl sm:p-6 lg:p-9">
            {/* Viewport bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  <Activity size={12} className="animate-pulse" />
                  Live Preview
                </span>
                {activeUserId && (
                  <span className="hidden text-[10px] font-bold text-zinc-500 sm:inline">
                    ID: {activeUserId}
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
                      : "text-zinc-500 hover:text-zinc-300",
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
                      : "text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  <Smartphone size={13} /> Mobile
                </button>
              </div>
            </div>

            {/* The Actual Rendered Card */}
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
                <article
                  ref={cardRef}
                  className={cn(styles.profileCard, activeThemePreset?.class)}
                  style={cardStyle}
                >
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

                        {/* Native Discord Avatar Decoration */}
                        {decorationUrl(user) && (
                          <img
                            className={styles.avatarDecoration}
                            src={decorationUrl(user) ?? ""}
                            alt=""
                          />
                        )}

                        {/* Exismic Custom Animated Frame Overlay */}
                        {activeExismicFrame && selectedExismicFrame !== "none" && (
                          <div
                            className={cn(
                              "absolute -inset-2.5 rounded-full pointer-events-none z-20",
                              activeExismicFrame.borderStyles
                            )}
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
                        @{user.username ?? "your_username"}
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

                    {/* Rich Presence / Animated Spotify Vinyl Section */}
                    {showActivity && activity && (
                      <section className={styles.activityCard}>
                        <div className={styles.activityImageWrap}>
                          {isSpotify && presence?.spotify?.album_art_url ? (
                            <div className="relative flex items-center">
                              <img
                                className={styles.activityImage}
                                src={presence.spotify.album_art_url}
                                alt="Spotify Album Art"
                              />
                              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-black/40 bg-black/80 flex items-center justify-center animate-spin duration-[4000ms]">
                                <Disc size={18} className="text-emerald-400" />
                              </div>
                            </div>
                          ) : activityImage ? (
                            <img
                              className={styles.activityImage}
                              src={activityImage}
                              alt=""
                            />
                          ) : (
                            <div className={cn(styles.activityImage, "grid place-items-center text-3xl font-black text-zinc-600")}>
                              🎮
                            </div>
                          )}
                          {!isSpotify && activitySmallImage && (
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
                    <div className="absolute inset-0 z-50 grid place-items-center bg-black/55 backdrop-blur-sm">
                      <Loader2 className="animate-spin text-white" size={34} />
                    </div>
                  )}
                </article>
              </div>
            </div>

            {/* Bottom Quick Bar */}
            <div className="mx-auto mt-6 flex max-w-[610px] items-center justify-between rounded-2xl border border-white/7 bg-black/20 px-4 py-3 text-[10px] font-bold text-zinc-500">
              <span className="flex items-center gap-2">
                <Eye size={13} />
                <span>Live updates via WebSockets</span>
              </span>
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="text-xs font-bold text-indigo-400 hover:text-white transition"
              >
                Open Export Hub &rarr;
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Guide Modal */}
      <DiscordIdGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onSelectSampleId={(id) => void loadProfile(id)}
      />

      {/* Export Hub Modal */}
      <DiscordExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        userId={activeUserId}
        displayName={displayName}
        theme={selectedTheme}
        onExportPng={captureCardPng}
        onExportZip={exportWebsiteZip}
        cardElementRef={cardRef}
      />
    </main>
  );
}
