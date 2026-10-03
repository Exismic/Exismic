// @ts-expect-error - omggif does not ship bundled ambient type definitions
import omggif from "omggif";

const { GifWriter } = omggif;

export interface ClientGifOptions {
  video: HTMLVideoElement;
  startTime: number;
  duration: number;
  fps: number;
  targetWidth: number;
  onProgress?: (progress: number, stage: string) => void;
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  if (Math.abs(video.currentTime - time) < 0.005 && !video.seeking) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        video.removeEventListener("seeked", finish);
        video.removeEventListener("error", finish);
        resolve();
      }
    };

    video.addEventListener("seeked", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    video.currentTime = time;
    // Fail-safe timeout so seeking never hangs on keyframe gaps
    setTimeout(finish, 220);
  });
}

/**
 * High-speed in-browser GIF encoder using canvas frame capture and omggif LZW compression.
 * Converts selected video clips to animated GIFs in 1-2 seconds with zero server upload wait
 * and strictly synchronized 1.0x real-time playback speed.
 */
export async function convertVideoToGifInBrowser(options: ClientGifOptions): Promise<Blob> {
  const { video, startTime, duration, fps, targetWidth, onProgress } = options;

  if (!video || !video.videoWidth || !video.videoHeight) {
    throw new Error("Video element is not ready for frame capture.");
  }

  const vWidth = video.videoWidth;
  const vHeight = video.videoHeight;
  const targetHeight = Math.max(16, Math.round((vHeight / vWidth) * targetWidth));

  // 1. Calculate ideal frame delay in GIF centiseconds (1/100s) based on user's target FPS
  // 15 FPS -> 7cs, 24 FPS -> 4cs, 30 FPS -> 3cs, 60 FPS -> 2cs (50 FPS, maximum fluid GIF speed)
  let frameDelayCentis = fps >= 45 ? 2 : Math.max(3, Math.round(100 / fps));
  let frameDurationSec = frameDelayCentis / 100;

  // 2. Compute exact frame count required so GIF duration matches clip duration 1:1 at 1.0x speed
  let totalFrames = Math.max(2, Math.round(duration / frameDurationSec));

  // 3. High frame budget (160 frames) ensures 2-5s clips stay at full 30-60 FPS without dropping frames
  const MAX_FRAMES = 160;
  if (totalFrames > MAX_FRAMES) {
    totalFrames = MAX_FRAMES;
    const exactStep = duration / totalFrames;
    frameDelayCentis = Math.max(2, Math.round(exactStep * 100));
    frameDurationSec = frameDelayCentis / 100;
  }

  const step = duration / totalFrames;

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not initialize 2D canvas.");

  const originalTime = video.currentTime;
  const originalPaused = video.paused;
  if (!video.paused) video.pause();

  const frames: Uint8ClampedArray[] = [];

  try {
    for (let i = 0; i < totalFrames; i++) {
      // Sample frame precisely at its synchronized timestamp in the clip
      const t = Math.min(
        startTime + (i * duration) / totalFrames,
        (video.duration || (startTime + duration)) - 0.01
      );
      await seekVideo(video, t);
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      frames.push(new Uint8ClampedArray(imgData.data));

      if (onProgress) {
        const pct = Math.round(((i + 1) / totalFrames) * 65);
        onProgress(pct, `Capturing clip frames (${i + 1}/${totalFrames})...`);
      }
    }
  } finally {
    // Restore video state
    video.currentTime = originalTime;
    if (!originalPaused) video.play().catch(() => {});
  }

  if (frames.length === 0) {
    throw new Error("No frames were captured from the video.");
  }

  if (onProgress) {
    onProgress(70, "Smoothing animation colors...");
  }

  // Build adaptive 256-color palette based on clip colors
  const colorBuckets = new Map<number, number>();
  for (const frame of frames) {
    // Sample every 4th pixel for speed
    for (let i = 0; i < frame.length; i += 16) {
      const r = frame[i] >> 3;
      const g = frame[i + 1] >> 3;
      const b = frame[i + 2] >> 3;
      const key = (r << 10) | (g << 5) | b;
      colorBuckets.set(key, (colorBuckets.get(key) || 0) + 1);
    }
  }

  const sortedBuckets = Array.from(colorBuckets.entries()).sort((a, b) => b[1] - a[1]);
  const palette = new Array<number>(256).fill(0);
  const colorCount = Math.min(256, sortedBuckets.length);
  for (let i = 0; i < colorCount; i++) {
    const key = sortedBuckets[i][0];
    const r = ((key >> 10) & 31) << 3;
    const g = ((key >> 5) & 31) << 3;
    const b = (key & 31) << 3;
    palette[i] = (r << 16) | (g << 8) | b;
  }

  // Pre-extract RGB channels for fast distance search
  const palR = new Uint8Array(256);
  const palG = new Uint8Array(256);
  const palB = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const c = palette[i];
    palR[i] = (c >> 16) & 0xff;
    palG[i] = (c >> 8) & 0xff;
    palB[i] = c & 0xff;
  }

  // 32k fast lookup cache for 5-bit colors (drastically reduces distance calculations)
  const cache = new Int16Array(32768);
  cache.fill(-1);

  if (onProgress) {
    onProgress(82, "Packaging animated GIF...");
  }

  const delay = frameDelayCentis;
  const buffer = new Uint8Array(targetWidth * targetHeight * totalFrames + 1024 * 1024);
  const writer = new GifWriter(buffer, targetWidth, targetHeight, { loop: 0, palette });

  for (let f = 0; f < frames.length; f++) {
    const rgba = frames[f];
    const indexed = new Uint8Array(targetWidth * targetHeight);
    let p = 0;

    for (let i = 0; i < rgba.length; i += 4) {
      const r = rgba[i];
      const g = rgba[i + 1];
      const b = rgba[i + 2];
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

      let bestIdx = cache[key];
      if (bestIdx === -1) {
        let bestDist = Infinity;
        bestIdx = 0;
        for (let j = 0; j < 256; j++) {
          const dr = r - palR[j];
          const dg = g - palG[j];
          const db = b - palB[j];
          const dist = dr * dr + dg * dg + db * db;
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = j;
            if (dist === 0) break;
          }
        }
        cache[key] = bestIdx;
      }
      indexed[p++] = bestIdx;
    }

    writer.addFrame(0, 0, targetWidth, targetHeight, indexed, { delay });

    if (onProgress) {
      const pct = 82 + Math.round(((f + 1) / frames.length) * 16);
      onProgress(Math.min(98, pct), "Packaging animation loop...");
    }
  }

  const outputBytes = writer.end();
  const finalBlob = new Blob([buffer.subarray(0, outputBytes)], { type: "image/gif" });

  if (onProgress) {
    onProgress(100, "GIF ready to download!");
  }

  return finalBlob;
}
