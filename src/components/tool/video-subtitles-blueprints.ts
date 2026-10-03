export interface SubtitleBlueprint {
  id: string;
  name: string;
  category: string;
  tagline: string;
  duration: number; // in seconds
  language: string;
  accentColor: string;
  secondaryColor: string;
  sampleSrt: string;
  previewSvg: string;
}

function createSubtitlePosterSvg({
  title,
  subtitle,
  captionLine,
  primaryColor,
  secondaryColor,
  pattern,
}: {
  title: string;
  subtitle: string;
  captionLine: string;
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
}): string {
  const encPri = encodeURIComponent(primaryColor);
  const encSec = encodeURIComponent(secondaryColor);
  const encTitle = encodeURIComponent(title);
  const encSub = encodeURIComponent(subtitle);
  const encCap = encodeURIComponent(captionLine);

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%"><defs><linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23070914"/><stop offset="50%" stop-color="%230d1224"/><stop offset="100%" stop-color="%23070914"/></linearGradient><linearGradient id="accentG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encPri}"/><stop offset="100%" stop-color="${encSec}"/></linearGradient><radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${encPri}" stop-opacity="0.35"/><stop offset="100%" stop-color="${encPri}" stop-opacity="0"/></radialGradient></defs><rect width="640" height="360" fill="url(%23bgG)"/><circle cx="320" cy="180" r="220" fill="url(%23halo)"/>${pattern}<rect x="24" y="24" width="115" height="26" rx="6" fill="%23000000" fill-opacity="0.75" stroke="url(%23accentG)" stroke-width="1.2"/><text x="36" y="41" fill="%23ffffff" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">SPEECH DEMO</text><!-- Burned Subtitle Box --><rect x="60" y="260" width="520" height="34" rx="8" fill="%23000000" fill-opacity="0.85" stroke="white" stroke-opacity="0.15" stroke-width="1"/><text x="320" y="282" text-anchor="middle" fill="%23ffffff" font-family="system-ui,sans-serif" font-size="13" font-weight="bold">${encCap}</text><g transform="translate(32,100)"><text x="0" y="0" fill="%23ffffff" font-family="system-ui,sans-serif" font-size="20" font-weight="800">${encTitle}</text><text x="0" y="24" fill="%23a1a1aa" font-family="system-ui,sans-serif" font-size="12" font-weight="500">${encSub}</text></g><circle cx="320" cy="180" r="32" fill="%23000000" fill-opacity="0.65" stroke="url(%23accentG)" stroke-width="2"/><polygon points="314,166 332,180 314,194" fill="%23ffffff"/></svg>`;
}

export const SUBTITLE_BLUEPRINTS: SubtitleBlueprint[] = [
  {
    id: "founder-pitch",
    name: "Startup Founder Keynote",
    category: "Speech & Presentation",
    tagline: "Clear vocal delivery with clean technical milestones and mission statement",
    duration: 10,
    language: "en",
    accentColor: "#8b5cf6",
    secondaryColor: "#c084fc",
    sampleSrt: `1
00:00:00,500 --> 00:00:03,200
Welcome to our platform launch presentation.

2
00:00:03,400 --> 00:00:06,800
Today we are introducing tools built for the next generation of creators.

3
00:00:07,100 --> 00:00:09,800
Fast, intuitive, and accessible directly in your browser.`,
    previewSvg: createSubtitlePosterSvg({
      title: "Startup Founder Keynote",
      subtitle: "10s • English Dialogue • Studio Audio",
      captionLine: "Today we are introducing tools built for the next generation.",
      primaryColor: "#8b5cf6",
      secondaryColor: "#c084fc",
      pattern: `<!-- Waveform bars --><g fill="%238b5cf6" opacity="0.35"><rect x="180" y="160" width="4" height="40" rx="2"/><rect x="195" y="145" width="4" height="70" rx="2"/><rect x="210" y="130" width="4" height="100" rx="2"/><rect x="225" y="150" width="4" height="60" rx="2"/><rect x="410" y="150" width="4" height="60" rx="2"/><rect x="425" y="130" width="4" height="100" rx="2"/><rect x="440" y="145" width="4" height="70" rx="2"/><rect x="455" y="160" width="4" height="40" rx="2"/></g>`,
    }),
  },
  {
    id: "nature-narrative",
    name: "Coastal Nature Documentary",
    category: "Narrative & Voiceover",
    tagline: "Atmospheric documentary commentary describing ocean tide ecology",
    duration: 12,
    language: "en",
    accentColor: "#06b6d4",
    secondaryColor: "#38bdf8",
    sampleSrt: `1
00:00:00,800 --> 00:00:03,600
High above the cliffs, the morning sun breaks through the mist.

2
00:00:03,900 --> 00:00:07,800
These coastal sanctuaries have remained undisturbed for centuries.

3
00:00:08,200 --> 00:00:11,500
A breathtaking reminder of the power of the natural world.`,
    previewSvg: createSubtitlePosterSvg({
      title: "Coastal Nature Documentary",
      subtitle: "12s • Scenic Narration • Ambient Waves",
      captionLine: "High above the cliffs, the morning sun breaks through the mist.",
      primaryColor: "#06b6d4",
      secondaryColor: "#38bdf8",
      pattern: `<!-- Waves --><circle cx="440" cy="130" r="40" fill="%23f59e0b" fill-opacity="0.5"/><path d="M0 210 Q 160 190, 320 210 T 640 210 L 640 360 L 0 360 Z" fill="%2306b6d4" fill-opacity="0.2"/>`,
    }),
  },
  {
    id: "tech-review",
    name: "Hardware Specs Breakdown",
    category: "Tech & Review",
    tagline: "Rapid benchmark analysis with frame numbers and hardware specs",
    duration: 11,
    language: "en",
    accentColor: "#ec4899",
    secondaryColor: "#8b5cf6",
    sampleSrt: `1
00:00:00,400 --> 00:00:03,200
Let's look at real-world benchmark performance.

2
00:00:03,500 --> 00:00:07,100
With hardware acceleration active, processing speeds are up to three times faster.

3
00:00:07,400 --> 00:00:10,200
The responsiveness sets a new bar for modern creative apps.`,
    previewSvg: createSubtitlePosterSvg({
      title: "Hardware Specs Breakdown",
      subtitle: "11s • Tech Commentary • Rapid Pacing",
      captionLine: "With hardware acceleration active, speeds are three times faster.",
      primaryColor: "#ec4899",
      secondaryColor: "#8b5cf6",
      pattern: `<!-- Specs grid --><g stroke="%23ec4899" stroke-width="1.5" opacity="0.3"><line x1="100" y1="140" x2="250" y2="140"/><line x1="100" y1="165" x2="250" y2="165"/><line x1="390" y1="140" x2="540" y2="140"/><line x1="390" y1="165" x2="540" y2="165"/></g>`,
    }),
  },
  {
    id: "storytelling-intro",
    name: "Creative Studio Walkthrough",
    category: "Tutorial & Guide",
    tagline: "Step-by-step tutorial speech with clear instructional phrasing",
    duration: 13,
    language: "en",
    accentColor: "#10b981",
    secondaryColor: "#06b6d4",
    sampleSrt: `1
00:00:00,500 --> 00:00:03,400
To get started, simply drag your footage into the workspace.

2
00:00:03,800 --> 00:00:07,400
Our automated speech engine will transcribe each word with millisecond precision.

3
00:00:07,800 --> 00:00:11,200
You can edit any line directly or download the timed subtitles immediately.`,
    previewSvg: createSubtitlePosterSvg({
      title: "Creative Studio Walkthrough",
      subtitle: "13s • Step-by-Step Guide • Clean Speech",
      captionLine: "Our automated speech engine will transcribe each word precisely.",
      primaryColor: "#10b981",
      secondaryColor: "#06b6d4",
      pattern: `<!-- Code UI --><rect x="180" y="110" width="280" height="100" rx="10" fill="%230b0e17" stroke="%2310b981" stroke-width="1.5" stroke-opacity="0.4"/>`,
    }),
  },
];

const sampleBlobCache = new Map<string, { blob: Blob; file: File }>();

/**
 * Fast client-side synthetic video generator with speech tones and burned subtitle mock.
 */
export async function generateSubtitleSampleVideo(blueprint: SubtitleBlueprint): Promise<File> {
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

  // Web Audio vocal speech cadence simulation
  let audioContext: AudioContext | null = null;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioCtx();
    const dest = audioContext.createMediaStreamDestination();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, audioContext.currentTime);
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
    videoBitsPerSecond: 2800000,
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

      ctx.fillStyle = "#070914";
      ctx.fillRect(0, 0, width, height);

      // Subtle vocal soundwave visualizer
      ctx.fillStyle = blueprint.accentColor;
      ctx.globalAlpha = 0.35;
      for (let i = 0; i < 30; i++) {
        const barH = 15 + Math.sin(time * 6 + i * 0.4) * 25;
        ctx.fillRect(80 + i * 16, height / 2 - barH / 2 - 20, 6, barH);
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px system-ui, sans-serif";
      ctx.fillText(blueprint.name, 28, height - 70);

      // Live mock burned subtitle line
      ctx.fillStyle = "#000000d0";
      ctx.fillRect(20, height - 50, width - 40, 36);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.fillText(
        time < 4
          ? "Welcome to our speech-to-text video preview."
          : time < 8
          ? "Subtitles are aligned with frame-accurate timestamps."
          : "Download your SRT or export with permanent captions.",
        34,
        height - 27
      );

      if (currentFrame >= totalFrames) {
        clearInterval(frameInterval);
        setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
        }, 120);
      }
    }, 12);
  });
}
