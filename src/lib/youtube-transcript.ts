import { YoutubeTranscript } from "youtube-transcript";

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
 * Fetch and parse YouTube video caption tracks using standard library
 */
export async function getYouTubeTranscript(url: string): Promise<YouTubeTranscriptResult> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a valid video link.");
  }

  // 1. Fetch the watch page HTML to extract the Video Title
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let title = "YouTube Video";
  try {
    const watchResponse = await fetch(watchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (watchResponse.ok) {
      const html = await watchResponse.text();
      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(" - YouTube", "").trim();
      }
    }
  } catch (titleError) {
    console.error("Failed to parse video title, using default:", titleError);
  }

  // 2. Fetch the transcript using youtube-transcript package
  let rawSegments: any[] = [];
  try {
    // Attempt to retrieve English transcript first
    rawSegments = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
  } catch (enError) {
    console.warn("English transcript not found, fetching default available track:", enError);
    try {
      // Fallback to whatever track is default/available
      rawSegments = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (anyError: any) {
      throw new Error(`Failed to fetch video subtitles: ${anyError.message || "No captions available for this video."}`);
    }
  }

  if (!rawSegments || rawSegments.length === 0) {
    throw new Error("Transcript returned empty lines.");
  }

  // 3. Format and clean segments
  const segments: TranscriptSegment[] = [];
  const textBlocks: string[] = [];

  for (const seg of rawSegments) {
    const startSeconds = seg.offset / 1000;
    const durSeconds = seg.duration / 1000;
    const cleanText = decodeHtmlEntities(seg.text.replace(/<[^>]*>/g, "").trim());

    if (cleanText) {
      segments.push({
        start: startSeconds,
        duration: durSeconds,
        timeLabel: formatTimeLabel(startSeconds),
        text: cleanText,
      });
      textBlocks.push(cleanText);
    }
  }

  return {
    title,
    videoId,
    segments,
    rawText: textBlocks.join(" "),
  };
}
