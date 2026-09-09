import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DISCORD_ID_PATTERN = /^\d{17,20}$/;
const REQUEST_TIMEOUT_MS = 6_000;

type ThemeConfig = {
  bgStart: string;
  bgEnd: string;
  borderColor: string;
  borderGlow: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
};

const THEMES: Record<string, ThemeConfig> = {
  obsidian: {
    bgStart: "#090a12",
    bgEnd: "#0f111c",
    borderColor: "rgba(99, 102, 241, 0.4)",
    borderGlow: "#4f46e5",
    textPrimary: "#ffffff",
    textSecondary: "#94a3b8",
    accent: "#6366f1",
  },
  synthwave: {
    bgStart: "#1a0b2e",
    bgEnd: "#110722",
    borderColor: "rgba(236, 72, 153, 0.5)",
    borderGlow: "#d946ef",
    textPrimary: "#fdf4ff",
    textSecondary: "#e879f9",
    accent: "#ec4899",
  },
  gold: {
    bgStart: "#181206",
    bgEnd: "#0d0903",
    borderColor: "rgba(245, 158, 11, 0.45)",
    borderGlow: "#fbbf24",
    textPrimary: "#fef3c7",
    textSecondary: "#fde68a",
    accent: "#f59e0b",
  },
  emerald: {
    bgStart: "#061810",
    bgEnd: "#040e0a",
    borderColor: "rgba(16, 185, 129, 0.4)",
    borderGlow: "#34d399",
    textPrimary: "#ecfdf5",
    textSecondary: "#6ee7b7",
    accent: "#10b981",
  },
  discord: {
    bgStart: "#2b2d31",
    bgEnd: "#1e1f22",
    borderColor: "rgba(88, 101, 242, 0.5)",
    borderGlow: "#5865f2",
    textPrimary: "#f2f3f5",
    textSecondary: "#949ba4",
    accent: "#5865f2",
  },
};

const STATUS_COLORS: Record<string, string> = {
  online: "#23a55a",
  idle: "#f0b232",
  dnd: "#f23f43",
  streaming: "#593695",
  offline: "#80848e",
};

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { "User-Agent": "Exismic-Badge/1.0" },
    });
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("userId")?.trim() || "demo";
  const themeKey = (searchParams.get("theme") || "obsidian").toLowerCase();
  const theme = THEMES[themeKey] || THEMES.obsidian;

  let displayName = "Exismic Creator";
  let username = "exismic_user";
  let avatarBase64: string | null = null;
  let status = "online";
  let activityText = "Building next-gen web apps";
  let activityType = "Playing";

  if (userId === "demo") {
    displayName = "Alex Rivers";
    username = "alexrivers";
    status = "online";
    activityText = "Listening to Synthwave Chill - Exismic Radio";
    activityType = "Spotify";
  } else if (DISCORD_ID_PATTERN.test(userId)) {
    try {
      const profilePromise = fetch(
        `https://dcdn.dstn.to/profile/${userId}`,
        {
          headers: { "User-Agent": "Exismic-Badge/1.0" },
          next: { revalidate: 60 },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        },
      ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

      const lanyardPromise = fetch(
        `https://api.lanyard.rest/v1/users/${userId}`,
        {
          headers: { "User-Agent": "Exismic-Badge/1.0" },
          cache: "no-store",
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        },
      ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

      const [profileData, lanyardData] = await Promise.all([
        profilePromise,
        lanyardPromise,
      ]);

      const userObj = profileData?.user || lanyardData?.data?.discord_user;
      if (userObj) {
        displayName =
          userObj.global_name ||
          userObj.display_name ||
          userObj.username ||
          displayName;
        username = userObj.username || username;

        let avatarUrl = "";
        if (userObj.avatar) {
          avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${userObj.avatar}.png?size=128`;
        } else {
          const disc = Number(userId) % 5;
          avatarUrl = `https://cdn.discordapp.com/embed/avatars/${disc}.png`;
        }
        avatarBase64 = await fetchImageAsBase64(avatarUrl);
      }

      if (lanyardData?.data) {
        const lanyard = lanyardData.data;
        status = lanyard.discord_status || "offline";

        if (lanyard.listening_to_spotify && lanyard.spotify) {
          activityType = "Spotify";
          activityText = `${lanyard.spotify.song} - ${lanyard.spotify.artist}`;
        } else if (lanyard.activities && lanyard.activities.length > 0) {
          const act =
            lanyard.activities.find((a: { type: number }) => a.type === 0 || a.type === 1) ||
            lanyard.activities[0];
          if (act.type === 1) {
            status = "streaming";
            activityType = "Streaming";
          } else {
            activityType = "Playing";
          }
          activityText = act.name + (act.details ? `: ${act.details}` : "");
        } else if (profileData?.user_profile?.bio) {
          activityType = "Bio";
          activityText = profileData.user_profile.bio.replace(/\n+/g, " ").slice(0, 48);
        }
      }
    } catch {
      // Fallback gracefully to default details
    }
  }

  const safeDisplayName = escapeXml(displayName.slice(0, 24));
  const safeUsername = escapeXml(username.slice(0, 20));
  const safeActivity = escapeXml(activityText.slice(0, 42));
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.offline;

  const width = 420;
  const height = 114;

  const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardBg" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.bgStart}"/>
      <stop offset="100%" stop-color="${theme.bgEnd}"/>
    </linearGradient>
    <linearGradient id="borderGlow" x1="0" y1="0" x2="${width}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.borderColor}"/>
      <stop offset="50%" stop-color="${theme.borderGlow}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${theme.borderColor}"/>
    </linearGradient>
    <clipPath id="avatarClip">
      <circle cx="58" cy="57" r="28"/>
    </clipPath>
    <filter id="shadow" x="-5" y="-5" width="${width + 10}" height="${height + 10}" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background with Glow -->
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="20" fill="url(#cardBg)" stroke="url(#borderGlow)" stroke-width="1.5" filter="url(#shadow)"/>

  <!-- Avatar Section -->
  <circle cx="58" cy="57" r="30" fill="${theme.borderColor}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  ${
    avatarBase64
      ? `<image href="${avatarBase64}" x="30" y="29" width="56" height="56" clip-path="url(#avatarClip)"/>`
      : `<circle cx="58" cy="57" r="28" fill="#5865F2"/><text x="58" y="64" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">${escapeXml(displayName.charAt(0).toUpperCase())}</text>`
  }

  <!-- Status Indicator Dot -->
  <circle cx="78" cy="77" r="7" fill="${statusColor}" stroke="${theme.bgStart}" stroke-width="2.5"/>

  <!-- Name & Handle -->
  <g transform="translate(102, 38)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="${theme.textPrimary}" letter-spacing="-0.02em">
      ${safeDisplayName}
    </text>
    <text x="0" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="${theme.textSecondary}">
      @${safeUsername}
    </text>
  </g>

  <!-- Activity Pill / Text -->
  <g transform="translate(102, 84)">
    <rect x="0" y="-12" width="${Math.min(290, safeActivity.length * 6.5 + 45)}" height="22" rx="6" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
    <circle cx="10" cy="-1" r="3.5" fill="${theme.accent}"/>
    <text x="20" y="2.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="600" fill="${theme.textSecondary}">
      ${safeActivity}
    </text>
  </g>

  <!-- Exismic Brand Stamp -->
  <g transform="translate(${width - 48}, 22)">
    <circle cx="0" cy="0" r="10" fill="rgba(255,255,255,0.05)"/>
    <text x="0" y="3.5" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="900" fill="${theme.accent}" text-anchor="middle">⚡</text>
  </g>
</svg>
`.trim();

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
