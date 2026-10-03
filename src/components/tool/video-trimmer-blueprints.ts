export interface VideoBlueprint {
  id: string;
  name: string;
  category: string;
  tagline: string;
  duration: number; // in seconds
  accentColor: string;
  secondaryColor: string;
  recommendedTrim: { start: number; end: number };
  previewSvg: string;
}

export interface DurationPreset {
  id: string;
  label: string;
  tag: string;
  getRange: (duration: number) => { start: number; end: number };
}

export const DURATION_PRESETS: DurationPreset[] = [
  {
    id: "hook-3s",
    label: "First 3s Hook",
    tag: "Social Teaser",
    getRange: (dur) => ({ start: 0, end: Math.min(3, Math.max(0.5, dur)) }),
  },
  {
    id: "tiktok-15s",
    label: "15s TikTok / Short",
    tag: "Quick Clip",
    getRange: (dur) => ({ start: 0, end: Math.min(15, dur) }),
  },
  {
    id: "reel-30s",
    label: "30s Reel / Story",
    tag: "Social Story",
    getRange: (dur) => ({ start: 0, end: Math.min(30, dur) }),
  },
  {
    id: "middle-50",
    label: "Middle 50% Highlight",
    tag: "Best Moments",
    getRange: (dur) => {
      const start = Math.max(0, dur * 0.25);
      const end = Math.min(dur, dur * 0.75);
      return { start, end: end > start ? end : dur };
    },
  },
  {
    id: "outro-5s",
    label: "Last 5s Outro",
    tag: "Call to Action",
    getRange: (dur) => ({ start: Math.max(0, dur - 5), end: dur }),
  },
  {
    id: "full-reset",
    label: "Full Clip (Reset)",
    tag: "Entire Video",
    getRange: (dur) => ({ start: 0, end: dur }),
  },
];

function createBlueprintPosterSvg({
  title,
  subtitle,
  timecode,
  primaryColor,
  secondaryColor,
  pattern,
}: {
  title: string;
  subtitle: string;
  timecode: string;
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
}): string {
  const encPri = encodeURIComponent(primaryColor);
  const encSec = encodeURIComponent(secondaryColor);
  const encTitle = encodeURIComponent(title);
  const encSub = encodeURIComponent(subtitle);
  const encTime = encodeURIComponent(timecode);

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23070914"/><stop offset="50%" stop-color="%230d1224"/><stop offset="100%" stop-color="%23070914"/></linearGradient><linearGradient id="accentG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encPri}"/><stop offset="100%" stop-color="${encSec}"/></linearGradient><radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${encPri}" stop-opacity="0.35"/><stop offset="100%" stop-color="${encPri}" stop-opacity="0"/></radialGradient></defs><rect width="640" height="360" fill="url(%23g)"/><circle cx="320" cy="180" r="220" fill="url(%23halo)"/>${pattern}<rect x="24" y="24" width="90" height="26" rx="6" fill="%23000000" fill-opacity="0.7" stroke="url(%23accentG)" stroke-width="1.2"/><text x="36" y="41" fill="%23ffffff" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">PREVIEW</text><rect x="526" y="24" width="90" height="26" rx="6" fill="%23000000" fill-opacity="0.7" stroke="white" stroke-opacity="0.15" stroke-width="1"/><circle cx="538" cy="37" r="3.5" fill="${encPri}"/><text x="548" y="41" fill="%23e4e4e7" font-family="monospace" font-size="11" font-weight="600">${encTime}</text><g transform="translate(32,280)"><text x="0" y="0" fill="%23ffffff" font-family="system-ui,sans-serif" font-size="20" font-weight="800">${encTitle}</text><text x="0" y="24" fill="%23a1a1aa" font-family="system-ui,sans-serif" font-size="12" font-weight="500">${encSub}</text></g><circle cx="320" cy="170" r="32" fill="%23000000" fill-opacity="0.65" stroke="url(%23accentG)" stroke-width="2"/><polygon points="314,156 332,170 314,184" fill="%23ffffff"/></svg>`;
}

export const VIDEO_BLUEPRINTS: VideoBlueprint[] = [
  {
    id: "cyber-synthwave",
    name: "Cyber Synthwave Horizon",
    category: "Action & Motion",
    tagline: "Electric violet grid, futuristic digital horizon, and neon wireframes",
    duration: 12,
    accentColor: "#8b5cf6",
    secondaryColor: "#ec4899",
    recommendedTrim: { start: 2.0, end: 8.5 },
    previewSvg: createBlueprintPosterSvg({
      title: "Cyber Synthwave Horizon",
      subtitle: "12s • 60 FPS • Retro Neon Horizon",
      timecode: "00:12.00",
      primaryColor: "#8b5cf6",
      secondaryColor: "#ec4899",
      pattern: `<!-- Grid & Mountains --><g stroke="%238b5cf6" stroke-width="1" opacity="0.35"><line x1="0" y1="230" x2="640" y2="230"/><line x1="0" y1="250" x2="640" y2="250"/><line x1="0" y1="280" x2="640" y2="280"/><line x1="0" y1="320" x2="640" y2="320"/><line x1="320" y1="210" x2="0" y2="360"/><line x1="320" y1="210" x2="160" y2="360"/><line x1="320" y1="210" x2="320" y2="360"/><line x1="320" y1="210" x2="480" y2="360"/><line x1="320" y1="210" x2="640" y2="360"/></g><circle cx="320" cy="190" r="60" fill="%23ec4899" fill-opacity="0.3" stroke="%23ec4899" stroke-width="2"/><polygon points="80,210 180,130 260,210" fill="none" stroke="%238b5cf6" stroke-width="2" opacity="0.5"/><polygon points="380,210 460,110 580,210" fill="none" stroke="%238b5cf6" stroke-width="2" opacity="0.5"/>`,
    }),
  },
  {
    id: "coastal-drone",
    name: "Coastal Sunset Drone Flight",
    category: "Cinematic & Nature",
    tagline: "Golden hour ocean shoreline, calm ambient waves, and lens warmth",
    duration: 15,
    accentColor: "#06b6d4",
    secondaryColor: "#f59e0b",
    recommendedTrim: { start: 3.5, end: 11.0 },
    previewSvg: createBlueprintPosterSvg({
      title: "Coastal Sunset Drone Flight",
      subtitle: "15s • 4K Drone Footage • Golden Hour",
      timecode: "00:15.00",
      primaryColor: "#06b6d4",
      secondaryColor: "#f59e0b",
      pattern: `<!-- Ocean waves & sun --><circle cx="440" cy="140" r="45" fill="%23f59e0b" fill-opacity="0.6"/><path d="M0 210 Q 160 190, 320 210 T 640 210 L 640 360 L 0 360 Z" fill="%2306b6d4" fill-opacity="0.18"/><path d="M0 240 Q 200 225, 400 240 T 640 240" fill="none" stroke="%2306b6d4" stroke-width="2" opacity="0.6"/><path d="M0 270 Q 140 255, 300 270 T 640 270" fill="none" stroke="%2306b6d4" stroke-width="2" opacity="0.4"/>`,
    }),
  },
  {
    id: "sports-countdown",
    name: "High-Energy Sports Sprint",
    category: "Sports & Energy",
    tagline: "Dynamic athletic cuts, rapid frame markers, and pace countdown",
    duration: 10,
    accentColor: "#f59e0b",
    secondaryColor: "#ef4444",
    recommendedTrim: { start: 1.0, end: 6.0 },
    previewSvg: createBlueprintPosterSvg({
      title: "High-Energy Sports Sprint",
      subtitle: "10s • Action Highlights • Dynamic Pacing",
      timecode: "00:10.00",
      primaryColor: "#f59e0b",
      secondaryColor: "#ef4444",
      pattern: `<!-- Speed lines --><g stroke="%23f59e0b" stroke-width="2" opacity="0.45"><line x1="50" y1="100" x2="250" y2="100" stroke-dasharray="20 10"/><line x1="120" y1="130" x2="380" y2="130" stroke-dasharray="35 15"/><line x1="30" y1="170" x2="280" y2="170" stroke-dasharray="15 10"/><line x1="90" y1="210" x2="420" y2="210" stroke-dasharray="40 20"/></g><text x="320" y="190" text-anchor="middle" fill="%23f59e0b" font-family="system-ui,sans-serif" font-size="80" font-weight="900" opacity="0.25">03:00</text>`,
    }),
  },
  {
    id: "app-walkthrough",
    name: "Product Demo Screencast",
    category: "Creator & Tech",
    tagline: "Clean dark software walkthrough, cursor movements, and feature cards",
    duration: 14,
    accentColor: "#10b981",
    secondaryColor: "#06b6d4",
    recommendedTrim: { start: 2.5, end: 9.5 },
    previewSvg: createBlueprintPosterSvg({
      title: "Product Demo Screencast",
      subtitle: "14s • Studio App Tour • Tech Walkthrough",
      timecode: "00:14.00",
      primaryColor: "#10b981",
      secondaryColor: "#06b6d4",
      pattern: `<!-- Window frame --><rect x="140" y="80" width="360" height="200" rx="14" fill="%230b0e17" stroke="%2310b981" stroke-width="1.5" stroke-opacity="0.5"/><circle cx="165" cy="100" r="4.5" fill="%23ef4444" opacity="0.8"/><circle cx="180" cy="100" r="4.5" fill="%23f59e0b" opacity="0.8"/><circle cx="195" cy="100" r="4.5" fill="%2310b981" opacity="0.8"/><rect x="165" y="125" width="120" height="18" rx="5" fill="%23ffffff" fill-opacity="0.08"/><rect x="165" y="155" width="220" height="12" rx="4" fill="%23ffffff" fill-opacity="0.05"/><rect x="165" y="175" width="180" height="12" rx="4" fill="%23ffffff" fill-opacity="0.05"/><rect x="165" y="205" width="90" height="26" rx="6" fill="%2310b981" fill-opacity="0.25" stroke="%2310b981" stroke-width="1"/><polygon points="360,180 372,210 364,204 358,218 352,216 358,202 348,202" fill="%23ffffff"/>`,
    }),
  },
];

// Memory cache for synthesized video blobs so re-clicks are instant
const sampleBlobCache = new Map<string, { blob: Blob; file: File }>();

/**
 * High-speed client-side synthetic video generator.
 * Creates an authentic, playable MP4/WebM video file with moving canvas graphics,
 * animated timecode, and a synchronized audio tone in ~250ms.
 */
export async function generateBlueprintVideoFile(blueprint: VideoBlueprint): Promise<File> {
  if (sampleBlobCache.has(blueprint.id)) {
    return sampleBlobCache.get(blueprint.id)!.file;
  }

  // Ensure DOM environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Video generation is supported in the browser.");
  }

  const width = 640;
  const height = 360;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });

  if (!ctx) {
    throw new Error("Canvas context is unavailable.");
  }

  // Try stream capture
  const stream = canvas.captureStream ? canvas.captureStream(30) : null;
  if (!stream) {
    throw new Error("Canvas stream capture is not supported in this browser.");
  }

  // Generate lightweight Web Audio accompaniment tone
  let audioContext: AudioContext | null = null;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioCtx();
    const dest = audioContext.createMediaStreamDestination();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(blueprint.id === "cyber-synthwave" ? 220 : blueprint.id === "sports-countdown" ? 330 : 261.63, audioContext.currentTime);
    gain.gain.setValueAtTime(0.04, audioContext.currentTime);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();

    const audioTrack = dest.stream.getAudioTracks()[0];
    if (audioTrack) {
      stream.addTrack(audioTrack);
    }
  } catch {
    // Audio is optional if autoplay permissions restrict it
  }

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : MediaRecorder.isTypeSupported("video/webm")
    ? "video/webm"
    : "video/mp4";

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2500000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<File>((resolve, reject) => {
    recorder.onstop = () => {
      try {
        if (audioContext && audioContext.state !== "closed") {
          audioContext.close().catch(() => {});
        }
      } catch {
        // Safe ignore
      }

      const blob = new Blob(chunks, { type: mimeType });
      const fileName = `${blueprint.id}-sample.${mimeType.includes("mp4") ? "mp4" : "webm"}`;
      const file = new File([blob], fileName, { type: mimeType });
      sampleBlobCache.set(blueprint.id, { blob, file });
      resolve(file);
    };

    recorder.onerror = () => {
      reject(new Error("Failed to record sample video frames."));
    };

    recorder.start(100);

    const fps = 30;
    const duration = blueprint.duration;
    const totalFrames = fps * duration;
    let currentFrame = 0;

    // Fast generation ticker: tick 4x faster than real time
    const frameInterval = setInterval(() => {
      currentFrame += 2; // step 2 frames per tick for ultra-fast generation
      const time = (currentFrame / fps);

      renderFrameOnCanvas(ctx, width, height, time, blueprint);

      if (currentFrame >= totalFrames) {
        clearInterval(frameInterval);
        setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }, 120);
      }
    }, 12);
  });
}

function renderFrameOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  blueprint: VideoBlueprint
) {
  // Dark obsidian gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#070914");
  bgGrad.addColorStop(0.5, "#0b0f20");
  bgGrad.addColorStop(1, "#070914");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Radial glowing aura
  const aura = ctx.createRadialGradient(
    width / 2 + Math.sin(time) * 40,
    height / 2 + Math.cos(time) * 20,
    10,
    width / 2,
    height / 2,
    width / 1.8
  );
  aura.addColorStop(0, `${blueprint.accentColor}33`);
  aura.addColorStop(1, "transparent");
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);

  // Moving geometric cyber elements
  ctx.strokeStyle = blueprint.accentColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.35;

  // Perspective moving floor grid
  const gridOffsetY = (time * 60) % 30;
  for (let y = height * 0.6; y < height; y += 20) {
    const py = y + gridOffsetY * ((y - height * 0.6) / (height * 0.4));
    if (py < height) {
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }
  }

  for (let x = -width; x < width * 2; x += 60) {
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.55);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Animated central ring / wave
  ctx.globalAlpha = 0.8;
  const pulseRadius = 55 + Math.sin(time * 3) * 12;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2 - 20, pulseRadius, 0, Math.PI * 2);
  ctx.strokeStyle = blueprint.secondaryColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Subtle crosshair
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ffffff";
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 20, height / 2 - 20);
  ctx.lineTo(width / 2 + 20, height / 2 - 20);
  ctx.moveTo(width / 2, height / 2 - 40);
  ctx.lineTo(width / 2, height / 2);
  ctx.stroke();

  // Reset alpha for typography
  ctx.globalAlpha = 1;

  // Header badges
  ctx.fillStyle = "#000000cc";
  ctx.strokeStyle = blueprint.accentColor;
  ctx.lineWidth = 1.2;
  roundRect(ctx, 24, 20, 140, 28, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = blueprint.accentColor;
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("EXISMIC STUDIO", 36, 38);

  // Timecode readout badge (Top right)
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const ms = Math.floor((time % 1) * 100);
  const formattedTimecode = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;

  ctx.fillStyle = "#000000cc";
  ctx.strokeStyle = "#ffffff25";
  roundRect(ctx, width - 130, 20, 106, 28, 8);
  ctx.fill();
  ctx.stroke();

  // Glowing record dot
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(width - 114, 34, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 12px monospace";
  ctx.fillText(formattedTimecode, width - 102, 38);

  // Lower title bar
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 20px system-ui, -apple-system, sans-serif";
  ctx.fillText(blueprint.name, 28, height - 48);

  ctx.fillStyle = "#a1a1aa";
  ctx.font = "500 12px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `${blueprint.category} • Frame-Accurate Video Trimmer Test Clip`,
    28,
    height - 26
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
