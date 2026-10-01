/**
 * Text to Speech Audio Engine & In-Browser Fallback Synthesizer
 * Provides instant voice sample previews, connects to ElevenLabs studio synthesis,
 * and includes a zero-latency Web Audio speech synthesizer fallback.
 */

export interface VoicePersona {
  id: string;
  name: string;
  title: string;
  tagline: string;
  gender: "male" | "female";
  styleTag: string;
  bestFor: string;
  sampleLine: string;
  webSpeechPitch: number;
  webSpeechRate: number;
  baseFreq: number;
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: "JBFqnCBsd6RMkjVDRZzb",
    name: "Exismic Narrator",
    title: "Deep Narrator",
    tagline: "Warm, grounded, and authoritative tone",
    gender: "male",
    styleTag: "Warm & Deep",
    bestFor: "Documentaries, Video Essays & Explainers",
    sampleLine: "Welcome to Exismic Studio. Clear, warm, and natural voiceovers crafted for your stories.",
    webSpeechPitch: 0.9,
    webSpeechRate: 0.95,
    baseFreq: 110,
  },
  {
    id: "XrExE9yKIg1WjnnlVkGX",
    name: "Matilda",
    title: "Warm Storyteller",
    tagline: "Gentle, soothing, and expressive pacing",
    gender: "female",
    styleTag: "Calm & Natural",
    bestFor: "Audiobooks, Bedtime Stories & Meditation",
    sampleLine: "Take a deep breath, sit comfortably, and let every word carry you away.",
    webSpeechPitch: 1.1,
    webSpeechRate: 0.9,
    baseFreq: 210,
  },
  {
    id: "onwK4e9ZLuTAKqWW03F9",
    name: "Daniel",
    title: "Cinematic Deep",
    tagline: "Resonant, powerful, and captivating voice",
    gender: "male",
    styleTag: "Cinematic Deep",
    bestFor: "Movie Trailers, Teasers & Epic Intros",
    sampleLine: "In a world driven by speed and noise, only the bold command the horizon.",
    webSpeechPitch: 0.75,
    webSpeechRate: 0.92,
    baseFreq: 95,
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Sarah",
    title: "Vivid Creator",
    tagline: "Lively, upbeat, and modern creator delivery",
    gender: "female",
    styleTag: "Energetic & Upbeat",
    bestFor: "YouTube Shorts, TikTok & Social Reels",
    sampleLine: "Hey everyone! Super excited to share this with you today. Let's jump right in!",
    webSpeechPitch: 1.25,
    webSpeechRate: 1.1,
    baseFreq: 240,
  },
  {
    id: "ErXwobaYiN019PkySvjV",
    name: "Antoni",
    title: "Crisp Educator",
    tagline: "Articulated, confident, and professional clarity",
    gender: "male",
    styleTag: "Clear & Crisp",
    bestFor: "Tutorials, Software Demos & Walkthroughs",
    sampleLine: "Let's examine the essential steps carefully to ensure a smooth, reliable workflow.",
    webSpeechPitch: 0.98,
    webSpeechRate: 1.0,
    baseFreq: 130,
  },
  {
    id: "TX3LPaxmHKxFdv7VOQHJ",
    name: "Liam",
    title: "Energetic Host",
    tagline: "Punchy, dynamic, and engaging broadcast personality",
    gender: "male",
    styleTag: "Bold & Dynamic",
    bestFor: "Podcasts, Radio Shows & Commercial Promos",
    sampleLine: "Live on the airwaves! Bringing you big vibes, great sound, and the freshest stories.",
    webSpeechPitch: 1.08,
    webSpeechRate: 1.15,
    baseFreq: 195,
  },
];

/**
 * Preview voice sample in browser using native Web Speech API
 */
export function playVoiceSample(
  persona: VoicePersona,
  onStart?: () => void,
  onEnd?: () => void
): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return () => {};
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(persona.sampleLine);
  utterance.pitch = persona.webSpeechPitch;
  utterance.rate = persona.webSpeechRate;

  // Try to find matching voice gender/language if available
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => {
    const nameLower = v.name.toLowerCase();
    if (persona.gender === "female") {
      return nameLower.includes("female") || nameLower.includes("zira") || nameLower.includes("samantha") || nameLower.includes("matilda");
    } else {
      return nameLower.includes("male") || nameLower.includes("david") || nameLower.includes("daniel") || nameLower.includes("george");
    }
  });

  if (match) {
    utterance.voice = match;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
    onEnd?.();
  };
}
