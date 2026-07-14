export interface TranscriptSegment {
  start: number;
  duration: number;
  timeLabel: string;
  text: string;
}

export interface YouTubeTranscriptResult {
  title: string;
  videoId: string;
  segments: TranscriptSegment[];
  rawText: string;
}

/**
 * Extract YouTube Video ID from any standard link
 */
export function extractVideoId(url: string): string | null {
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * Format raw seconds to MM:SS or HH:MM:SS
 */
export function formatTimeLabel(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Decodes standard HTML entities
 */
function decodeHtmlEntities(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ");
}

/**
 * Fetch and parse YouTube video caption tracks
 */
export async function getYouTubeTranscript(url: string): Promise<YouTubeTranscriptResult> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a valid video link.");
  }

  // 1. Fetch video watch page with desktop user-agent to load ytInitialPlayerResponse
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(watchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load YouTube watch page (Status ${response.status})`);
  }

  const html = await response.text();

  // 2. Parse Video Title
  let title = "YouTube Video";
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(" - YouTube", "").trim();
  }

  // 3. Extract player response JSON containing captions config
  const playerResponseRegex = /ytInitialPlayerResponse\s*=\s*({.+?});/;
  let match = html.match(playerResponseRegex);
  
  if (!match) {
    const altRegex = /var\s+ytInitialPlayerResponse\s*=\s*({.+?});/;
    match = html.match(altRegex);
  }

  if (!match) {
    throw new Error("Failed to extract video details. The video might be private, deleted, or age-restricted.");
  }

  let playerResponse: any;
  try {
    playerResponse = JSON.parse(match[1]);
  } catch (err) {
    throw new Error("Failed to parse YouTube player data structure.");
  }

  const captions = playerResponse?.captions?.playerCaptionsTracklistRenderer;
  if (!captions || !captions.captionTracks || captions.captionTracks.length === 0) {
    throw new Error("No caption or subtitle tracks found for this video. Make sure the video has CC/subtitles enabled.");
  }

  // Find preferred track: English first, or fallback to the first available track
  const tracks = captions.captionTracks;
  const preferredTrack = tracks.find((t: any) => t.languageCode === "en") || tracks[0];
  const captionsUrl = preferredTrack.baseUrl;

  if (!captionsUrl) {
    throw new Error("Unable to retrieve captions download URL.");
  }

  // 4. Download and parse XML caption details
  const captionsResponse = await fetch(captionsUrl);
  if (!captionsResponse.ok) {
    throw new Error("Failed to download caption tracks from YouTube servers.");
  }

  const xmlText = await captionsResponse.text();

  // Parse XML using regex matches
  const textNodeRegex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  const segments: TranscriptSegment[] = [];
  const textBlocks: string[] = [];

  for (const m of xmlText.matchAll(textNodeRegex)) {
    const start = parseFloat(m[1]);
    const duration = parseFloat(m[2]);
    const cleanText = decodeHtmlEntities(m[3].replace(/<[^>]*>/g, "").trim()); // Strip internal tags if any

    if (cleanText) {
      segments.push({
        start,
        duration,
        timeLabel: formatTimeLabel(start),
        text: cleanText,
      });
      textBlocks.push(cleanText);
    }
  }

  if (segments.length === 0) {
    throw new Error("Successfully fetched subtitle tracks, but they contained no readable text lines.");
  }

  return {
    title,
    videoId,
    segments,
    rawText: textBlocks.join(" "),
  };
}
