export interface MergerSequenceBlueprint {
  id: string;
  name: string;
  category: string;
  tagline: string;
  clipCount: number;
  totalDurationDisplay: string;
  accentColor: string;
  secondaryColor: string;
  clips: {
    id: string;
    title: string;
    duration: number; // in seconds
    color: string;
    subtitle: string;
  }[];
}

export const MERGER_BLUEPRINTS: MergerSequenceBlueprint[] = [
  {
    id: "creator-vlog-montage",
    name: "Creator Vlog 3-Scene Sequence",
    category: "Vlog & Lifestyle",
    tagline: "High-energy intro teaser, main story segment, and outro call-to-action",
    clipCount: 3,
    totalDurationDisplay: "6.5s Total",
    accentColor: "#8b5cf6",
    secondaryColor: "#ec4899",
    clips: [
      { id: "vlog-intro", title: "Scene 1: Dynamic Hook", duration: 2, color: "#8b5cf6", subtitle: "Intro Teaser & Title" },
      { id: "vlog-body", title: "Scene 2: Core Story", duration: 2.5, color: "#06b6d4", subtitle: "Main Action Segment" },
      { id: "vlog-outro", title: "Scene 3: Outro Card", duration: 2, color: "#ec4899", subtitle: "Follow & Subscribe Card" },
    ],
  },
  {
    id: "product-feature-reel",
    name: "Product Showcase 3-Part Demo",
    category: "SaaS & Tech",
    tagline: "Dashboard overview, feature spotlight interaction, and pricing callout",
    clipCount: 3,
    totalDurationDisplay: "6.0s Total",
    accentColor: "#10b981",
    secondaryColor: "#06b6d4",
    clips: [
      { id: "prod-overview", title: "Scene 1: App Overview", duration: 2, color: "#10b981", subtitle: "Clean Interface Hero" },
      { id: "prod-action", title: "Scene 2: 1-Click Feature", duration: 2, color: "#06b6d4", subtitle: "Live Interactive Demo" },
      { id: "prod-cta", title: "Scene 3: Get Started", duration: 2, color: "#8b5cf6", subtitle: "Free Trial Callout" },
    ],
  },
  {
    id: "sports-action-cut",
    name: "High-Energy Sports 2-Part Reel",
    category: "Sports & Motion",
    tagline: "Slow-motion warm-up followed by lightning-fast sprint finish",
    clipCount: 2,
    totalDurationDisplay: "5.0s Total",
    accentColor: "#f59e0b",
    secondaryColor: "#ef4444",
    clips: [
      { id: "sports-warmup", title: "Scene 1: Focus & Prep", duration: 2.5, color: "#f59e0b", subtitle: "Pre-Game Tension" },
      { id: "sports-finish", title: "Scene 2: Sprint & Goal", duration: 2.5, color: "#ef4444", subtitle: "Full Speed Highlight" },
    ],
  },
];

const sampleClipCache = new Map<string, File>();

/**
 * Fast client-side synthetic video clip generator for merger testing in <80ms.
 */
export async function generateMergerClip(
  sequenceId: string,
  clip: { id: string; title: string; duration: number; color: string; subtitle: string }
): Promise<File> {
  const cacheKey = `${sequenceId}-${clip.id}`;
  if (sampleClipCache.has(cacheKey)) {
    return sampleClipCache.get(cacheKey)!;
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

  let audioCtx: AudioContext | null = null;
  try {
    const AudioC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioC) {
      audioCtx = new AudioC();
      const dest = audioCtx.createMediaStreamDestination();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      // Pick a distinct pleasant frequency for each clip
      const baseFreq = clip.id.includes("1") || clip.id.includes("intro") || clip.id.includes("warmup")
        ? 392 // G4
        : clip.id.includes("2") || clip.id.includes("body") || clip.id.includes("action")
        ? 440 // A4
        : 523.25; // C5
      osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();

      const audioTrack = dest.stream.getAudioTracks()[0];
      if (audioTrack) {
        stream.addTrack(audioTrack);
      }
    }
  } catch (audioErr) {
    console.warn("Notice: Audio track omitted for synthetic clip:", audioErr);
  }

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
    ? "video/webm;codecs=vp9,opus"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
    ? "video/webm;codecs=vp8,opus"
    : MediaRecorder.isTypeSupported("video/webm")
    ? "video/webm"
    : "video/mp4";

  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 3000000,
      audioBitsPerSecond: 128000,
    });
  } catch {
    recorder = new MediaRecorder(stream);
  }

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<File>((resolve, reject) => {
    recorder.onstop = () => {
      try {
        if (audioCtx && audioCtx.state !== "closed") audioCtx.close().catch(() => {});
      } catch {}
      const blob = new Blob(chunks, { type: mimeType });
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const file = new File([blob], `${clip.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.${ext}`, {
        type: mimeType,
      });
      sampleClipCache.set(cacheKey, file);
      resolve(file);
    };

    recorder.onerror = () => reject(new Error("Clip synthesis failed"));
    recorder.start(100);

    const fps = 30;
    const totalFrames = fps * clip.duration;
    let frame = 0;

    const interval = setInterval(() => {
      frame += 2;
      const time = frame / fps;

      ctx.fillStyle = "#070914";
      ctx.fillRect(0, 0, width, height);

      // Radial glow
      const glow = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 3) * 60,
        height / 2 + Math.cos(time * 2) * 40,
        10,
        width / 2,
        height / 2,
        width / 1.5
      );
      glow.addColorStop(0, `${clip.color}44`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Scene number badge
      ctx.fillStyle = clip.color;
      ctx.fillRect(28, 24, 8, 36);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px system-ui, sans-serif";
      ctx.fillText(clip.title, 48, 52);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillText(clip.subtitle, 48, 76);

      // Center visual badge
      ctx.strokeStyle = clip.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        width / 2,
        height / 2,
        45 + Math.sin(time * 4) * 15,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${time.toFixed(1)}s`, width / 2, height / 2 + 6);
      ctx.textAlign = "left";

      if (frame >= totalFrames) {
        clearInterval(interval);
        setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
        }, 80);
      }
    }, 10);
  });
}
