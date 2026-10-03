export interface GifBlueprint {
  id: string;
  name: string;
  category: string;
  tagline: string;
  duration: number; // in seconds
  accentColor: string;
  secondaryColor: string;
  previewSvg: string;
}

export interface GifResolutionProfile {
  width: number;
  label: string;
  tag: string;
  desc: string;
}

export const GIF_RESOLUTIONS: GifResolutionProfile[] = [
  {
    width: 320,
    label: "320px",
    tag: "Social & Chat",
    desc: "Smallest file size. Perfect for WhatsApp, Slack, Discord, and message threads.",
  },
  {
    width: 480,
    label: "480px",
    tag: "Standard Web",
    desc: "Balanced size and sharpness. Great for blog posts, documentation, and portfolio sites.",
  },
  {
    width: 640,
    label: "640px",
    tag: "High Definition",
    desc: "Crisp textures and fine details. Best for high-res presentations and social media feeds.",
  },
];

export interface GifFpsProfile {
  fps: number;
  label: string;
  desc: string;
}

export const GIF_FPS_PROFILES: GifFpsProfile[] = [
  { fps: 15, label: "15 FPS", desc: "Lightweight file, compact sharing" },
  { fps: 24, label: "24 FPS", desc: "Standard cinema motion" },
  { fps: 30, label: "30 FPS", desc: "Smooth & fluid motion, recommended" },
  { fps: 60, label: "60 FPS", desc: "Ultra-smooth high frame rate" },
];

function createGifPosterSvg({
  title,
  subtitle,
  fpsBadge,
  primaryColor,
  secondaryColor,
  pattern,
}: {
  title: string;
  subtitle: string;
  fpsBadge: string;
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
}): string {
  const encPri = encodeURIComponent(primaryColor);
  const encSec = encodeURIComponent(secondaryColor);
  const encTitle = encodeURIComponent(title);
  const encSub = encodeURIComponent(subtitle);
  const encFps = encodeURIComponent(fpsBadge);

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%"><defs><linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23070914"/><stop offset="50%" stop-color="%230d1224"/><stop offset="100%" stop-color="%23070914"/></linearGradient><linearGradient id="accentG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encPri}"/><stop offset="100%" stop-color="${encSec}"/></linearGradient><radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${encPri}" stop-opacity="0.35"/><stop offset="100%" stop-color="${encPri}" stop-opacity="0"/></radialGradient></defs><rect width="640" height="360" fill="url(%23bgG)"/><circle cx="320" cy="180" r="220" fill="url(%23halo)"/>${pattern}<rect x="24" y="24" width="100" height="26" rx="6" fill="%23000000" fill-opacity="0.75" stroke="url(%23accentG)" stroke-width="1.2"/><text x="36" y="41" fill="%23ffffff" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">SAMPLE CLIP</text><g transform="translate(480,24)"><rect width="136" height="26" rx="6" fill="%23000000" fill-opacity="0.75" stroke="white" stroke-opacity="0.15" stroke-width="1"/><text x="14" y="17" fill="${encPri}" font-family="monospace" font-size="11" font-weight="bold">${encFps}</text></g><g transform="translate(32,290)"><text x="0" y="0" fill="%23ffffff" font-family="system-ui,sans-serif" font-size="20" font-weight="800">${encTitle}</text><text x="0" y="24" fill="%23a1a1aa" font-family="system-ui,sans-serif" font-size="12" font-weight="500">${encSub}</text></g><circle cx="320" cy="180" r="24" fill="%23ffffff" fill-opacity="0.9" stroke="url(%23accentG)" stroke-width="2"/><polygon points="316,170 330,180 316,190" fill="%23070914"/></svg>`;
}

export const GIF_BLUEPRINTS: GifBlueprint[] = [
  {
    id: "victory-celebration",
    name: "Victory Pulse Reaction",
    category: "Reactions & Memes",
    tagline: "High-energy pulsing badges and kinetic celebration animation for chats",
    duration: 3,
    accentColor: "#8b5cf6",
    secondaryColor: "#ec4899",
    previewSvg: createGifPosterSvg({
      title: "Victory Pulse Reaction",
      subtitle: "3s • Looping Badge • Chat Ready",
      fpsBadge: "LOOPING GIF",
      primaryColor: "#8b5cf6",
      secondaryColor: "#ec4899",
      pattern: `<!-- Celebration particles --><circle cx="240" cy="130" r="14" fill="%23ec4899" fill-opacity="0.6"/><circle cx="400" cy="130" r="18" fill="%238b5cf6" fill-opacity="0.5"/><polygon points="320,110 330,135 360,135 335,150 345,175 320,160 295,175 305,150 280,135 310,135" fill="%23f59e0b" fill-opacity="0.7"/>`,
    }),
  },
  {
    id: "cyber-synth-loop",
    name: "Cyber Neon Grid Wave",
    category: "Motion Graphics",
    tagline: "Endless retro-wave horizon grid with fluid chromatic neon glow",
    duration: 3,
    accentColor: "#06b6d4",
    secondaryColor: "#8b5cf6",
    previewSvg: createGifPosterSvg({
      title: "Cyber Neon Grid Wave",
      subtitle: "3s • Seamless Loop • Dark Mode",
      fpsBadge: "SEAMLESS LOOP",
      primaryColor: "#06b6d4",
      secondaryColor: "#8b5cf6",
      pattern: `<!-- Grid lines --><g stroke="%2306b6d4" stroke-width="1.5" opacity="0.4"><line x1="0" y1="210" x2="640" y2="210"/><line x1="0" y1="240" x2="640" y2="240"/><line x1="0" y1="280" x2="640" y2="280"/><line x1="320" y1="190" x2="60" y2="360"/><line x1="320" y1="190" x2="320" y2="360"/><line x1="320" y1="190" x2="580" y2="360"/></g>`,
    }),
  },
  {
    id: "software-ui-click",
    name: "Product Feature Demo",
    category: "Product & Tech",
    tagline: "Smooth cursor click and button state transition for changelogs and docs",
    duration: 3,
    accentColor: "#10b981",
    secondaryColor: "#06b6d4",
    previewSvg: createGifPosterSvg({
      title: "Product Feature Demo",
      subtitle: "3s • UI Click • Docs & Changelogs",
      fpsBadge: "UI DEMO",
      primaryColor: "#10b981",
      secondaryColor: "#06b6d4",
      pattern: `<!-- Window Card --><rect x="180" y="100" width="280" height="150" rx="12" fill="%23111827" stroke="%2310b981" stroke-width="1.5" opacity="0.8"/><rect x="220" y="140" width="200" height="30" rx="8" fill="%238b5cf6" fill-opacity="0.7"/><circle cx="340" cy="180" r="8" fill="%23ffffff" fill-opacity="0.8"/>`,
    }),
  },
  {
    id: "floating-particles-glow",
    name: "Golden Sparkle Atmosphere",
    category: "Cinematic Atmosphere",
    tagline: "Gentle floating light orbs and ambient gradients for web backgrounds",
    duration: 3,
    accentColor: "#f59e0b",
    secondaryColor: "#ec4899",
    previewSvg: createGifPosterSvg({
      title: "Golden Sparkle Atmosphere",
      subtitle: "3s • Ambient Glow • Background",
      fpsBadge: "AMBIENT GIF",
      primaryColor: "#f59e0b",
      secondaryColor: "#ec4899",
      pattern: `<!-- Light orbs --><circle cx="200" cy="160" r="28" fill="%23f59e0b" fill-opacity="0.3"/><circle cx="440" cy="150" r="36" fill="%23ec4899" fill-opacity="0.25"/><circle cx="320" cy="200" r="22" fill="%23f59e0b" fill-opacity="0.4"/>`,
    }),
  },
];

const sampleBlobCache = new Map<string, File>();

/**
 * Fast client-side synthetic video generator for Video to GIF testing in <100ms.
 */
export async function generateGifSampleVideo(blueprint: GifBlueprint): Promise<File> {
  if (sampleBlobCache.has(blueprint.id)) {
    return sampleBlobCache.get(blueprint.id)!;
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Video generation is supported in the browser.");
  }

  const width = 640;
  const height = 360;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas context unavailable");

  const stream = canvas.captureStream ? canvas.captureStream(30) : null;
  if (!stream) throw new Error("Canvas stream unavailable");

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : MediaRecorder.isTypeSupported("video/webm")
    ? "video/webm"
    : "video/mp4";

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 3000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<File>((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const file = new File([blob], `${blueprint.id}-sample.${ext}`, {
        type: mimeType,
      });
      sampleBlobCache.set(blueprint.id, file);
      resolve(file);
    };

    recorder.onerror = () => reject(new Error("Sample video generation failed"));
    recorder.start(100);

    const fps = 30;
    const totalFrames = fps * blueprint.duration;
    let frame = 0;

    const interval = setInterval(() => {
      frame += 2;
      const time = frame / fps;

      ctx.fillStyle = "#070914";
      ctx.fillRect(0, 0, width, height);

      // Radial glow
      const glow = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 2) * 50,
        height / 2 + Math.cos(time * 2) * 30,
        10,
        width / 2,
        height / 2,
        width / 1.6
      );
      glow.addColorStop(0, `${blueprint.accentColor}44`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Dynamic animated shape
      ctx.strokeStyle = blueprint.accentColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(
        width / 2,
        height / 2,
        50 + Math.sin(time * 4) * 20,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // Floating particle
      ctx.fillStyle = blueprint.secondaryColor;
      ctx.beginPath();
      ctx.arc(
        width / 2 + Math.cos(time * 3) * 90,
        height / 2 + Math.sin(time * 3) * 60,
        12,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Card Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px system-ui, sans-serif";
      ctx.fillText(blueprint.name, 28, height - 48);
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText(`${blueprint.category} • Ready for GIF conversion`, 28, height - 26);

      if (frame >= totalFrames) {
        clearInterval(interval);
        setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
        }, 80);
      }
    }, 10);
  });
}
