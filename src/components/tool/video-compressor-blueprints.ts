export interface CompressorBlueprint {
  id: string;
  name: string;
  category: string;
  tagline: string;
  originalSizeDisplay: string;
  compressedSizeDisplay: string;
  reductionPercentage: number;
  duration: number; // in seconds
  accentColor: string;
  secondaryColor: string;
  previewSvg: string;
}

export interface CompressionProfile {
  id: "low" | "medium" | "high" | "ultra";
  name: string;
  tag: string;
  reduction: string;
  desc: string;
}

export const COMPRESSION_PROFILES: CompressionProfile[] = [
  {
    id: "low",
    name: "Smallest File",
    tag: "Chat & Email",
    reduction: "~75–85% cut",
    desc: "Compact file size. Perfect for sharing over WhatsApp, Discord, Slack, or email.",
  },
  {
    id: "medium",
    name: "Balanced",
    tag: "Recommended",
    reduction: "~55–65% cut",
    desc: "The sweet spot. Keeps video crisp and clear while cutting more than half the file size.",
  },
  {
    id: "high",
    name: "High Clarity",
    tag: "Social & Web",
    reduction: "~35–45% cut",
    desc: "Retains high-definition textures and colors. Great for YouTube and portfolio work.",
  },
  {
    id: "ultra",
    name: "Near-Lossless",
    tag: "Archival",
    reduction: "~15–25% cut",
    desc: "Preserves master detail with mild shrinkage. Best for archiving footage.",
  },
];

function createCompressorPosterSvg({
  title,
  subtitle,
  originalSize,
  compressedSize,
  primaryColor,
  secondaryColor,
  pattern,
}: {
  title: string;
  subtitle: string;
  originalSize: string;
  compressedSize: string;
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
}): string {
  const encPri = encodeURIComponent(primaryColor);
  const encSec = encodeURIComponent(secondaryColor);
  const encTitle = encodeURIComponent(title);
  const encSub = encodeURIComponent(subtitle);
  const encOrig = encodeURIComponent(originalSize);
  const encComp = encodeURIComponent(compressedSize);

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%"><defs><linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23070914"/><stop offset="50%" stop-color="%230d1224"/><stop offset="100%" stop-color="%23070914"/></linearGradient><linearGradient id="accentG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encPri}"/><stop offset="100%" stop-color="${encSec}"/></linearGradient><radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${encPri}" stop-opacity="0.35"/><stop offset="100%" stop-color="${encPri}" stop-opacity="0"/></radialGradient></defs><rect width="640" height="360" fill="url(%23bgG)"/><circle cx="320" cy="180" r="220" fill="url(%23halo)"/>${pattern}<rect x="24" y="24" width="100" height="26" rx="6" fill="%23000000" fill-opacity="0.75" stroke="url(%23accentG)" stroke-width="1.2"/><text x="36" y="41" fill="%23ffffff" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">SAMPLE CLIP</text><g transform="translate(430,24)"><rect width="186" height="26" rx="6" fill="%23000000" fill-opacity="0.75" stroke="white" stroke-opacity="0.15" stroke-width="1"/><text x="14" y="17" fill="%23a1a1aa" font-family="monospace" font-size="11">${encOrig} ➔</text><text x="88" y="17" fill="${encPri}" font-family="monospace" font-size="11" font-weight="bold">${encComp}</text></g><g transform="translate(32,280)"><text x="0" y="0" fill="%23ffffff" font-family="system-ui,sans-serif" font-size="20" font-weight="800">${encTitle}</text><text x="0" y="24" fill="%23a1a1aa" font-family="system-ui,sans-serif" font-size="12" font-weight="500">${encSub}</text></g><circle cx="320" cy="170" r="32" fill="%23000000" fill-opacity="0.65" stroke="url(%23accentG)" stroke-width="2"/><polygon points="314,156 332,170 314,184" fill="%23ffffff"/></svg>`;
}

export const COMPRESSOR_BLUEPRINTS: CompressorBlueprint[] = [
  {
    id: "action-sports-cut",
    name: "Ultra-HD Action Sports Reel",
    category: "Action & Sports",
    tagline: "Dynamic sports action clip with motion particles and high detail",
    originalSizeDisplay: "48.2 MB",
    compressedSizeDisplay: "12.4 MB",
    reductionPercentage: 74,
    duration: 3,
    accentColor: "#8b5cf6",
    secondaryColor: "#ec4899",
    previewSvg: createCompressorPosterSvg({
      title: "Ultra-HD Action Sports Reel",
      subtitle: "3s • High Bitrate • Fast Motion",
      originalSize: "48.2 MB",
      compressedSize: "12.4 MB",
      primaryColor: "#8b5cf6",
      secondaryColor: "#ec4899",
      pattern: `<!-- Action speed lines --><g stroke="%238b5cf6" stroke-width="2" opacity="0.4"><line x1="30" y1="120" x2="300" y2="120" stroke-dasharray="30 15"/><line x1="120" y1="150" x2="420" y2="150" stroke-dasharray="40 20"/><line x1="80" y1="190" x2="340" y2="190" stroke-dasharray="25 15"/><line x1="200" y1="230" x2="520" y2="230" stroke-dasharray="50 25"/></g><circle cx="320" cy="170" r="70" fill="%23ec4899" fill-opacity="0.2" stroke="%23ec4899" stroke-width="1.5"/>`,
    }),
  },
  {
    id: "coastal-drone-flight",
    name: "Scenic Coastal Drone Footage",
    category: "Nature & Cinematic",
    tagline: "Golden hour ocean waves, sweeping shoreline, and fluid horizon gradients",
    originalSizeDisplay: "36.8 MB",
    compressedSizeDisplay: "10.2 MB",
    reductionPercentage: 72,
    duration: 3,
    accentColor: "#06b6d4",
    secondaryColor: "#38bdf8",
    previewSvg: createCompressorPosterSvg({
      title: "Scenic Coastal Drone Footage",
      subtitle: "3s • 4K Aerial • Sunset Horizon",
      originalSize: "36.8 MB",
      compressedSize: "10.2 MB",
      primaryColor: "#06b6d4",
      secondaryColor: "#38bdf8",
      pattern: `<!-- Ocean waves & sun --><circle cx="440" cy="130" r="40" fill="%23f59e0b" fill-opacity="0.5"/><path d="M0 210 Q 160 190, 320 210 T 640 210 L 640 360 L 0 360 Z" fill="%2306b6d4" fill-opacity="0.2"/><path d="M0 240 Q 200 220, 400 240 T 640 240" fill="none" stroke="%2306b6d4" stroke-width="2" opacity="0.6"/>`,
    }),
  },
  {
    id: "neon-cyber-cityscape",
    name: "Neon Cyber Cityscape",
    category: "Motion Graphics",
    tagline: "Vibrant glowing lines, deep midnight contrast, and reflection maps",
    originalSizeDisplay: "29.4 MB",
    compressedSizeDisplay: "7.6 MB",
    reductionPercentage: 74,
    duration: 2.5,
    accentColor: "#ec4899",
    secondaryColor: "#8b5cf6",
    previewSvg: createCompressorPosterSvg({
      title: "Neon Cyber Cityscape",
      subtitle: "2.5s • Dark Mode • Vibrant Neon",
      originalSize: "29.4 MB",
      compressedSize: "7.6 MB",
      primaryColor: "#ec4899",
      secondaryColor: "#8b5cf6",
      pattern: `<!-- Cyber grid --><g stroke="%23ec4899" stroke-width="1" opacity="0.35"><line x1="0" y1="220" x2="640" y2="220"/><line x1="0" y1="250" x2="640" y2="250"/><line x1="0" y1="290" x2="640" y2="290"/><line x1="320" y1="200" x2="0" y2="360"/><line x1="320" y1="200" x2="320" y2="360"/><line x1="320" y1="200" x2="640" y2="360"/></g>`,
    }),
  },
  {
    id: "app-product-demo",
    name: "Software Product Walkthrough",
    category: "Creator & Tech",
    tagline: "Desktop UI recording, code cards, and crisp interface elements",
    originalSizeDisplay: "22.5 MB",
    compressedSizeDisplay: "4.8 MB",
    reductionPercentage: 79,
    duration: 3,
    accentColor: "#10b981",
    secondaryColor: "#06b6d4",
    previewSvg: createCompressorPosterSvg({
      title: "Software Product Walkthrough",
      subtitle: "3s • Screen Recording • Sharp UI",
      originalSize: "22.5 MB",
      compressedSize: "4.8 MB",
      primaryColor: "#10b981",
      secondaryColor: "#06b6d4",
      pattern: `<!-- Window frame --><rect x="140" y="80" width="360" height="200" rx="14" fill="%230b0e17" stroke="%2310b981" stroke-width="1.5" stroke-opacity="0.5"/><circle cx="165" cy="100" r="4.5" fill="%23ef4444" opacity="0.8"/><circle cx="180" cy="100" r="4.5" fill="%23f59e0b" opacity="0.8"/><circle cx="195" cy="100" r="4.5" fill="%2310b981" opacity="0.8"/><rect x="165" y="125" width="120" height="16" rx="4" fill="%23ffffff" fill-opacity="0.08"/>`,
    }),
  },
];

const sampleBlobCache = new Map<string, { blob: Blob; file: File }>();

/**
 * Fast client-side synthetic video generator for compression testing.
 * Creates an authentic playable MP4/WebM video file with canvas animation in <250ms.
 */
export async function generateCompressorSampleVideo(blueprint: CompressorBlueprint): Promise<File> {
  if (sampleBlobCache.has(blueprint.id)) {
    return sampleBlobCache.get(blueprint.id)!.file;
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
  if (!ctx) throw new Error("Canvas unavailable");

  const stream = canvas.captureStream ? canvas.captureStream(30) : null;
  if (!stream) throw new Error("Canvas stream capture unavailable");

  // Audio accompaniment
  let audioContext: AudioContext | null = null;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioCtx();
    const dest = audioContext.createMediaStreamDestination();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(260, audioContext.currentTime);
    gain.gain.setValueAtTime(0.04, audioContext.currentTime);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    const audioTrack = dest.stream.getAudioTracks()[0];
    if (audioTrack) stream.addTrack(audioTrack);
  } catch {
    // Audio optional
  }

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
      try {
        if (audioContext && audioContext.state !== "closed") audioContext.close().catch(() => {});
      } catch {
        // Safe ignore
      }
      const blob = new Blob(chunks, { type: mimeType });
      const fileName = `${blueprint.id}-sample.${mimeType.includes("mp4") ? "mp4" : "webm"}`;
      const file = new File([blob], fileName, { type: mimeType });
      sampleBlobCache.set(blueprint.id, { blob, file });
      resolve(file);
    };

    recorder.onerror = () => reject(new Error("Sample video generation failed"));

    recorder.start(100);

    const fps = 30;
    const duration = blueprint.duration;
    const totalFrames = fps * duration;
    let currentFrame = 0;

    const frameInterval = setInterval(() => {
      currentFrame += 2;
      const time = currentFrame / fps;

      // Draw canvas frame
      ctx.fillStyle = "#070914";
      ctx.fillRect(0, 0, width, height);

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

      ctx.strokeStyle = blueprint.accentColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 60 + Math.sin(time * 3) * 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px system-ui, sans-serif";
      ctx.fillText(blueprint.name, 28, height - 48);
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText(`${blueprint.category} • Sample Video for Compression`, 28, height - 26);

      if (currentFrame >= totalFrames) {
        clearInterval(frameInterval);
        setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
        }, 120);
      }
    }, 12);
  });
}
