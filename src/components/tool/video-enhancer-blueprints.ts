export interface EnhancerBlueprint {
  id: string;
  name: string;
  category: string;
  tagline: string;
  enhancementFocus: string;
  duration: number; // in seconds
  accentColor: string;
  secondaryColor: string;
  previewSvg: string;
}

export interface EnhancementProfile {
  id: "light" | "medium" | "strong";
  name: string;
  tag: string;
  desc: string;
}

export const ENHANCEMENT_PROFILES: EnhancementProfile[] = [
  {
    id: "light",
    name: "Subtle Polish",
    tag: "Natural",
    desc: "Gentle sharpening and minor grain removal while keeping 100% of the raw, authentic camera look.",
  },
  {
    id: "medium",
    name: "Balanced Enhance",
    tag: "Recommended",
    desc: "The creator sweet spot. Cleans up visual noise, sharpens edges, and brings out vibrant natural lighting.",
  },
  {
    id: "strong",
    name: "Maximum Clarity",
    tag: "Ultra HD",
    desc: "Aggressive edge sharpening, full noise smoothing, and deep contrast enhancement for dark or blurry footage.",
  },
];

function createEnhancerPosterSvg({
  title,
  subtitle,
  beforeLabel,
  afterLabel,
  primaryColor,
  secondaryColor,
  pattern,
}: {
  title: string;
  subtitle: string;
  beforeLabel: string;
  afterLabel: string;
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
}): string {
  const encPri = encodeURIComponent(primaryColor);
  const encSec = encodeURIComponent(secondaryColor);
  const encTitle = encodeURIComponent(title);
  const encSub = encodeURIComponent(subtitle);
  const encBefore = encodeURIComponent(beforeLabel);
  const encAfter = encodeURIComponent(afterLabel);

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%"><defs><linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23070914"/><stop offset="50%" stop-color="%230d1224"/><stop offset="100%" stop-color="%23070914"/></linearGradient><linearGradient id="accentG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encPri}"/><stop offset="100%" stop-color="${encSec}"/></linearGradient><radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${encPri}" stop-opacity="0.35"/><stop offset="100%" stop-color="${encPri}" stop-opacity="0"/></radialGradient></defs><rect width="640" height="360" fill="url(%23bgG)"/><circle cx="320" cy="180" r="220" fill="url(%23halo)"/>${pattern}<line x1="320" y1="0" x2="320" y2="360" stroke="white" stroke-width="2" stroke-dasharray="6 4" opacity="0.6"/><rect x="24" y="24" width="100" height="26" rx="6" fill="%23000000" fill-opacity="0.75" stroke="url(%23accentG)" stroke-width="1.2"/><text x="36" y="41" fill="%23ffffff" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">SAMPLE CLIP</text><g transform="translate(420,24)"><rect width="196" height="26" rx="6" fill="%23000000" fill-opacity="0.75" stroke="white" stroke-opacity="0.15" stroke-width="1"/><text x="14" y="17" fill="%23a1a1aa" font-family="monospace" font-size="11">${encBefore} ➔</text><text x="110" y="17" fill="${encPri}" font-family="monospace" font-size="11" font-weight="bold">${encAfter}</text></g><g transform="translate(32,290)"><text x="0" y="0" fill="%23ffffff" font-family="system-ui,sans-serif" font-size="20" font-weight="800">${encTitle}</text><text x="0" y="24" fill="%23a1a1aa" font-family="system-ui,sans-serif" font-size="12" font-weight="500">${encSub}</text></g><circle cx="320" cy="180" r="24" fill="%23ffffff" fill-opacity="0.9" stroke="url(%23accentG)" stroke-width="2"/><polygon points="316,170 330,180 316,190" fill="%23070914"/></svg>`;
}

export const ENHANCER_BLUEPRINTS: EnhancerBlueprint[] = [
  {
    id: "low-light-night-city",
    name: "Low-Light Night Cityscape",
    category: "Lighting & Noise",
    tagline: "Dark streetlamps and shadowy skyscrapers lifted with clean shadow illumination",
    enhancementFocus: "Shadow Boost & Denoise",
    duration: 3,
    accentColor: "#8b5cf6",
    secondaryColor: "#38bdf8",
    previewSvg: createEnhancerPosterSvg({
      title: "Low-Light Night Cityscape",
      subtitle: "3s • Dark Shadows • Grainy Noise",
      beforeLabel: "Dark & Noisy",
      afterLabel: "Bright & Crisp",
      primaryColor: "#8b5cf6",
      secondaryColor: "#38bdf8",
      pattern: `<!-- City silhouettes --><rect x="40" y="160" width="60" height="200" fill="%23111827" opacity="0.6"/><rect x="120" y="120" width="80" height="240" fill="%231f2937" opacity="0.7"/><rect x="420" y="140" width="90" height="220" fill="%23111827" opacity="0.6"/><circle cx="280" cy="110" r="30" fill="%23f59e0b" fill-opacity="0.3"/>`,
    }),
  },
  {
    id: "blurry-action-sprint",
    name: "Fast-Motion Sports Sprint",
    category: "Edge Sharpness",
    tagline: "High-speed athletic movement with restored edge outlines and texture clarity",
    enhancementFocus: "Motion Deblur & Sharpen",
    duration: 3,
    accentColor: "#ec4899",
    secondaryColor: "#8b5cf6",
    previewSvg: createEnhancerPosterSvg({
      title: "Fast-Motion Sports Sprint",
      subtitle: "3s • Soft Edges • Motion Blur",
      beforeLabel: "Soft Blur",
      afterLabel: "Razor Sharp",
      primaryColor: "#ec4899",
      secondaryColor: "#8b5cf6",
      pattern: `<!-- Speed lines --><g stroke="%23ec4899" stroke-width="2" opacity="0.4"><line x1="20" y1="140" x2="300" y2="140" stroke-dasharray="25 15"/><line x1="80" y1="180" x2="420" y2="180" stroke-dasharray="35 20"/><line x1="50" y1="220" x2="520" y2="220" stroke-dasharray="40 25"/></g>`,
    }),
  },
  {
    id: "faded-sunset-drone",
    name: "Coastal Sunset Aerial",
    category: "Color & Vibrance",
    tagline: "Washed-out drone ocean horizon revitalized with warm golden-hour tones",
    enhancementFocus: "Vibrance & Contrast",
    duration: 3,
    accentColor: "#f59e0b",
    secondaryColor: "#ec4899",
    previewSvg: createEnhancerPosterSvg({
      title: "Coastal Sunset Aerial",
      subtitle: "3s • Washed Out • Flat Colors",
      beforeLabel: "Flat & Muted",
      afterLabel: "Vibrant Gold",
      primaryColor: "#f59e0b",
      secondaryColor: "#ec4899",
      pattern: `<!-- Sun and waves --><circle cx="480" cy="140" r="45" fill="%23f59e0b" fill-opacity="0.4"/><path d="M0 220 Q 160 190, 320 220 T 640 220 L 640 360 L 0 360 Z" fill="%2306b6d4" fill-opacity="0.25"/>`,
    }),
  },
  {
    id: "indoor-creator-vlog",
    name: "Desk Setup Indoor Vlog",
    category: "Studio Balance",
    tagline: "Grainy webcam footage refined with natural skin tones and edge contrast",
    enhancementFocus: "Skin Tone & Contrast",
    duration: 3,
    accentColor: "#10b981",
    secondaryColor: "#8b5cf6",
    previewSvg: createEnhancerPosterSvg({
      title: "Desk Setup Indoor Vlog",
      subtitle: "3s • Web Camera • Low Lighting",
      beforeLabel: "Grainy Cam",
      afterLabel: "Studio Glow",
      primaryColor: "#10b981",
      secondaryColor: "#8b5cf6",
      pattern: `<!-- Monitor and lamp --><rect x="180" y="110" width="280" height="160" rx="12" fill="%231e293b" opacity="0.6" stroke="%2310b981" stroke-width="1.5"/><circle cx="210" cy="90" r="16" fill="%23f59e0b" fill-opacity="0.3"/>`,
    }),
  },
];

const sampleBlobCache = new Map<string, { original: File; enhanced: File }>();

/**
 * Fast client-side synthetic video generator for Video Enhancer testing.
 * Generates both an un-enhanced (slightly soft/grainy) file and an enhanced (crisp/vibrant) file in <100ms.
 */
export async function generateEnhancerSampleVideos(
  blueprint: EnhancerBlueprint
): Promise<{ originalFile: File; enhancedFile: File }> {
  if (sampleBlobCache.has(blueprint.id)) {
    const cached = sampleBlobCache.get(blueprint.id)!;
    return { originalFile: cached.original, enhancedFile: cached.enhanced };
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Video generation is supported in the browser.");
  }

  const width = 640;
  const height = 360;

  // Helper to record a synthetic canvas stream
  const recordCanvas = async (isEnhanced: boolean): Promise<File> => {
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
      videoBitsPerSecond: isEnhanced ? 4000000 : 1500000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    return new Promise<File>((resolve, reject) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const ext = mimeType.includes("mp4") ? "mp4" : "webm";
        const file = new File(
          [blob],
          `${blueprint.id}-${isEnhanced ? "enhanced" : "original"}.${ext}`,
          { type: mimeType }
        );
        resolve(file);
      };

      recorder.onerror = () => reject(new Error("Video synthesis failed"));
      recorder.start(100);

      const fps = 30;
      const totalFrames = fps * blueprint.duration;
      let frame = 0;

      const interval = setInterval(() => {
        frame += 2;
        const time = frame / fps;

        // Base dark background
        ctx.fillStyle = isEnhanced ? "#060913" : "#0d111c";
        ctx.fillRect(0, 0, width, height);

        // Radial glow
        const glow = ctx.createRadialGradient(
          width / 2 + Math.sin(time * 2) * 50,
          height / 2 + Math.cos(time * 2) * 30,
          10,
          width / 2,
          height / 2,
          width / 1.5
        );
        glow.addColorStop(0, `${blueprint.accentColor}${isEnhanced ? "55" : "22"}`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        // Geometric orbits
        ctx.strokeStyle = isEnhanced ? blueprint.accentColor : "#4b5563";
        ctx.lineWidth = isEnhanced ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc(
          width / 2,
          height / 2,
          60 + Math.sin(time * 3) * 20,
          0,
          Math.PI * 2
        );
        ctx.stroke();

        // Secondary orbit
        ctx.strokeStyle = isEnhanced ? blueprint.secondaryColor : "#374151";
        ctx.lineWidth = isEnhanced ? 2 : 1;
        ctx.beginPath();
        ctx.arc(
          width / 2,
          height / 2,
          100 + Math.cos(time * 2) * 25,
          0,
          Math.PI * 2
        );
        ctx.stroke();

        // Watermark badge
        ctx.fillStyle = "#ffffff";
        ctx.font = isEnhanced ? "bold 20px system-ui, sans-serif" : "18px system-ui, sans-serif";
        ctx.fillText(
          `${blueprint.name} [${isEnhanced ? "AI ENHANCED" : "RAW FOOTAGE"}]`,
          28,
          height - 48
        );
        ctx.fillStyle = isEnhanced ? "#c4b5fd" : "#6b7280";
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillText(
          `${blueprint.category} • ${blueprint.enhancementFocus}`,
          28,
          height - 26
        );

        // If not enhanced, add subtle simulated grain/softness
        if (!isEnhanced) {
          ctx.fillStyle = "rgba(255,255,255,0.03)";
          for (let i = 0; i < 60; i++) {
            const rx = Math.random() * width;
            const ry = Math.random() * height;
            ctx.fillRect(rx, ry, 2, 2);
          }
        }

        if (frame >= totalFrames) {
          clearInterval(interval);
          setTimeout(() => {
            if (recorder.state === "recording") recorder.stop();
          }, 80);
        }
      }, 10);
    });
  };

  const [originalFile, enhancedFile] = await Promise.all([
    recordCanvas(false),
    recordCanvas(true),
  ]);

  sampleBlobCache.set(blueprint.id, {
    original: originalFile,
    enhanced: enhancedFile,
  });

  return { originalFile, enhancedFile };
}
