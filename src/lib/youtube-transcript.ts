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

const INNERTUBE_API_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";
const INNERTUBE_CLIENT_VERSION = "20.10.38";
const INNERTUBE_USER_AGENT = `com.google.android.youtube/${INNERTUBE_CLIENT_VERSION} (Linux; U; Android 14)`;

const SCRAPE_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)";

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
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

/**
 * Robust brace matching parser to extract JSON structures from HTML script blocks
 */
function parseInlineJson(html: string, globalName: string): any {
  const index = html.indexOf(globalName);
  if (index === -1) return null;

  // Locate the first opening brace '{' after the variable declaration
  const startBraceIndex = html.indexOf("{", index);
  if (startBraceIndex === -1) return null;

  let depth = 0;
  for (let i = startBraceIndex; i < html.length; i++) {
    if (html[i] === "{") {
      depth++;
    } else if (html[i] === "}") {
      depth--;
      if (depth === 0) {
        try {
          const rawJson = html.slice(startBraceIndex, i + 1);
          return JSON.parse(rawJson);
        } catch (e) {
          console.error(`[parseInlineJson] JSON parse exception for ${globalName}:`, e);
          return null;
        }
      }
    }
  }
  return null;
}

/**
 * Parse transcript from youtube-transcript.ai mirror response format
 */
function parseMirrorTranscript(text: string): { title: string; segments: TranscriptSegment[]; rawText: string } {
  const lines = text.split("\n");
  const segments: TranscriptSegment[] = [];
  const textBlocks: string[] = [];
  let title = "YouTube Video";

  // Parse Title from '# Transcript: Video Name'
  const titleLine = lines.find(l => l.startsWith("# Transcript:"));
  if (titleLine) {
    title = titleLine.replace("# Transcript:", "").trim();
  }

  for (const line of lines) {
    const trimmed = line.trim();
    // Matches [0:00], [12:34], or [1:02:03]
    const match = trimmed.match(/^\[(?:(\d+):)?(\d+):(\d+)\]\s*(.*)$/);
    if (match) {
      const h = match[1] ? parseInt(match[1], 10) : 0;
      const m = parseInt(match[2], 10);
      const s = parseInt(match[3], 10);
      const startSeconds = h * 3600 + m * 60 + s;
      const content = match[4].trim();

      if (content) {
        const decoded = decodeHtmlEntities(content);
        segments.push({
          start: startSeconds,
          duration: 5, // placeholder, updated next
          timeLabel: formatTimeLabel(startSeconds),
          text: decoded,
        });
        textBlocks.push(decoded);
      }
    }
  }

  // Calculate durations dynamically
  for (let i = 0; i < segments.length - 1; i++) {
    segments[i].duration = segments[i + 1].start - segments[i].start;
  }

  return {
    title,
    segments,
    rawText: textBlocks.join(" "),
  };
}

/**
 * Fetch and parse YouTube video caption tracks (3-tier fallback engine)
 */
export async function getYouTubeTranscript(url: string): Promise<YouTubeTranscriptResult> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a valid video link.");
  }

  let captionTracks: any[] = [];
  let title = "YouTube Video";

  // TIER 1: Query InnerTube API directly (mimicking Android client)
  try {
    const response = await fetch(INNERTUBE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": INNERTUBE_USER_AGENT,
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: INNERTUBE_CLIENT_VERSION,
            hl: "en",
            gl: "US",
          },
        },
        videoId: videoId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      captionTracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      const videoDetails = data?.videoDetails;
      if (videoDetails?.title) {
        title = videoDetails.title;
      }
      
      if (captionTracks.length > 0) {
        console.log(`[Tier 1 InnerTube] Successfully retrieved transcript tracks for video: ${videoId}`);
      }
    }
  } catch (err: any) {
    console.warn("[Tier 1 InnerTube] Failed, trying Tier 2 Mirror:", err?.message || err);
  }

  // TIER 2: Query youtube-transcript.ai mirror (100% immune to Vercel/AWS IP blocks)
  if (captionTracks.length === 0) {
    try {
      const mirrorUrl = `https://youtube-transcript.ai/transcript/${videoId}.txt`;
      const mirrorRes = await fetch(mirrorUrl);
      if (mirrorRes.ok) {
        const mirrorText = await mirrorRes.text();
        const parsed = parseMirrorTranscript(mirrorText);
        if (parsed.segments.length > 0) {
          console.log(`[Tier 2 Mirror] Successfully retrieved transcript for video: ${videoId}`);
          return {
            title: parsed.title,
            videoId,
            segments: parsed.segments,
            rawText: parsed.rawText,
          };
        }
      }
    } catch (mirrorErr: any) {
      console.warn("[Tier 2 Mirror] Failed, trying Tier 3 Scraper fallback:", mirrorErr?.message || mirrorErr);
    }
  }

  // TIER 3: Scraper fallback (HTML Watch Page + Brace Matching)
  if (captionTracks.length === 0) {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const watchRes = await fetch(watchUrl, {
      headers: {
        "User-Agent": SCRAPE_USER_AGENT,
      },
    });

    if (!watchRes.ok) {
      throw new Error(`YouTube watch page fetch failed with status ${watchRes.status}`);
    }

    const html = await watchRes.text();

    // Parse title
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].replace(" - YouTube", "").trim();
    }

    const playerResponse = parseInlineJson(html, "ytInitialPlayerResponse");
    captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    console.log(`[Tier 3 Scraper] Retrieved tracks list length: ${captionTracks.length}`);
  }

  if (!captionTracks || captionTracks.length === 0) {
    throw new Error("Transcripts are disabled or unavailable for this video.");
  }

  // Find preferred English track or fallback to first available
  const preferredTrack = captionTracks.find((t: any) => t.languageCode === "en") || captionTracks[0];
  const captionsUrl = preferredTrack.baseUrl;

  if (!captionsUrl) {
    throw new Error("Could not retrieve transcript download link.");
  }

  // Download the XML timed transcript
  const captionsResponse = await fetch(captionsUrl, {
    headers: {
      "User-Agent": SCRAPE_USER_AGENT,
    },
  });

  if (!captionsResponse.ok) {
    throw new Error("Failed to download caption tracks from YouTube servers.");
  }

  const xmlText = await captionsResponse.text();
  if (!xmlText) {
    throw new Error("Subtitles download returned empty response.");
  }

  const segments: TranscriptSegment[] = [];
  const textBlocks: string[] = [];

  // Parse XML (supports both srv3 format <p t="..."> and classic format <text start="...">)
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  while ((match = pRegex.exec(xmlText)) !== null) {
    const startMs = parseInt(match[1], 10);
    const durMs = parseInt(match[2], 10);
    const inner = match[3];
    
    let text = "";
    const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
    let sMatch;
    while ((sMatch = sRegex.exec(inner)) !== null) {
      text += sMatch[1];
    }
    if (!text) {
      text = inner.replace(/<[^>]+>/g, "");
    }
    
    const cleanText = decodeHtmlEntities(text.trim());
    if (cleanText) {
      const startSec = startMs / 1000;
      segments.push({
        start: startSec,
        duration: durMs / 1000,
        timeLabel: formatTimeLabel(startSec),
        text: cleanText,
      });
      textBlocks.push(cleanText);
    }
  }

  if (segments.length === 0) {
    const textNodeRegex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
    for (const m of xmlText.matchAll(textNodeRegex)) {
      const startSec = parseFloat(m[1]);
      const durSec = parseFloat(m[2]);
      const cleanText = decodeHtmlEntities(m[3].replace(/<[^>]*>/g, "").trim());

      if (cleanText) {
        segments.push({
          start: startSec,
          duration: durSec,
          timeLabel: formatTimeLabel(startSec),
          text: cleanText,
        });
        textBlocks.push(cleanText);
      }
    }
  }

  if (segments.length === 0) {
    throw new Error("Transcript tracks were fetched but contained no readable text data.");
  }

  return {
    title,
    videoId,
    segments,
    rawText: textBlocks.join(" "),
  };
}
