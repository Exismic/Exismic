/**
 * Voice Changer Audio Engine
 * Provides instant in-browser Web Audio API DSP voice transformations
 * and $0 compute instant demonstration voice synthesis.
 */

import { audioBufferToWavBlob } from "@/lib/vocal-demo-generator";

export interface VoicePersona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  pitchSemitones: number;
  modulation: number; // 0 to 1
  bassBoost: number; // 0 to 1
  echo: number; // 0 to 1
  badge: string;
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: "deep-announcer",
    name: "Deep Announcer",
    tagline: "Resonant Movie Voice",
    description: "Deep chest resonance with cinematic low-end presence, perfect for movie trailers and narration.",
    iconName: "Mic2",
    pitchSemitones: -5,
    modulation: 0.1,
    bassBoost: 0.85,
    echo: 0.15,
    badge: "Most Popular",
  },
  {
    id: "cyber-robot",
    name: "Cyber Robot",
    tagline: "Futuristic Synthesizer",
    description: "Sci-fi metallic ring modulation and electronic carrier frequencies for robotic AI voices.",
    iconName: "Cpu",
    pitchSemitones: 0,
    modulation: 0.85,
    bassBoost: 0.3,
    echo: 0.2,
    badge: "Sci-Fi",
  },
  {
    id: "studio-radio",
    name: "Studio Radio Host",
    tagline: "Warm Broadcast Warmth",
    description: "Crisp highs and warm analog broadcast EQ, giving any voice clear radio fidelity.",
    iconName: "Radio",
    pitchSemitones: -1,
    modulation: 0.05,
    bassBoost: 0.65,
    echo: 0.05,
    badge: "Podcast",
  },
  {
    id: "helium-high",
    name: "Helium High",
    tagline: "High-Octave Animation",
    description: "Fast cartoon-style pitch shift raising the pitch up into an energetic high octave.",
    iconName: "Smile",
    pitchSemitones: 7,
    modulation: 0.15,
    bassBoost: 0.0,
    echo: 0.1,
    badge: "Fun",
  },
  {
    id: "space-alien",
    name: "Space Alien",
    tagline: "Cosmic Phaser Effect",
    description: "Ethereal sweeping phaser and spatial chorus modulation from another galaxy.",
    iconName: "Compass",
    pitchSemitones: 2,
    modulation: 0.7,
    bassBoost: 0.2,
    echo: 0.6,
    badge: "Ethereal",
  },
  {
    id: "walkie-talkie",
    name: "Walkie-Talkie",
    tagline: "Analog Radio Comm",
    description: "Band-limited analog telephone filter with vintage speaker crunch and lo-fi grit.",
    iconName: "Headphones",
    pitchSemitones: 1,
    modulation: 0.45,
    bassBoost: 0.0,
    echo: 0.0,
    badge: "Lo-Fi",
  },
  {
    id: "cave-echo",
    name: "Cave Echo",
    tagline: "Canyon Spatial Reverb",
    description: "Expansive atmospheric reflections mimicking speaking inside a cathedral or stone canyon.",
    iconName: "Waves",
    pitchSemitones: -2,
    modulation: 0.05,
    bassBoost: 0.4,
    echo: 0.8,
    badge: "Spatial",
  },
  {
    id: "dark-entity",
    name: "Dark Entity",
    tagline: "Menacing Villain",
    description: "Low sub-harmonic rumble and dark cinematic distortion for evil characters.",
    iconName: "Skull",
    pitchSemitones: -8,
    modulation: 0.5,
    bassBoost: 0.95,
    echo: 0.35,
    badge: "Cinematic",
  },
];

export interface VoiceDemoData {
  originalBlob: Blob;
  originalUrl: string;
  changedBlob: Blob;
  changedUrl: string;
  duration: number;
}

/**
 * Applies professional Web Audio DSP effects to an AudioBuffer or File in the browser
 */
export async function transformAudioWithDSP(
  input: AudioBuffer | File | Blob,
  persona: VoicePersona,
  customSettings?: {
    pitchSemitones?: number;
    modulation?: number;
    bassBoost?: number;
    echo?: number;
  }
): Promise<{ blob: Blob; url: string; duration: number }> {
  let sourceBuffer: AudioBuffer;

  if (input instanceof AudioBuffer) {
    sourceBuffer = input;
  } else {
    const arrayBuffer = await (input as Blob).arrayBuffer();
    const tempCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    sourceBuffer = await tempCtx.decodeAudioData(arrayBuffer);
    await tempCtx.close();
  }

  const pitch = customSettings?.pitchSemitones ?? persona.pitchSemitones;
  const modIntensity = customSettings?.modulation ?? persona.modulation;
  const bass = customSettings?.bassBoost ?? persona.bassBoost;
  const echoIntensity = customSettings?.echo ?? persona.echo;

  // Calculate speed / pitch factor (2^(semitones / 12))
  const pitchRatio = Math.pow(2, pitch / 12);
  const sampleRate = sourceBuffer.sampleRate;
  const originalDuration = sourceBuffer.duration;
  
  // Output duration accounts for pitch shift and echo decay tail
  const echoTail = echoIntensity > 0.2 ? 1.5 : 0.3;
  const effectiveDuration = Math.max(1, (originalDuration / pitchRatio) + echoTail);
  const totalSamples = Math.ceil(sampleRate * effectiveDuration);

  const ctx = new OfflineAudioContext(2, totalSamples, sampleRate);

  // 1. Audio Source Node
  const source = ctx.createBufferSource();
  source.buffer = sourceBuffer;
  source.playbackRate.value = pitchRatio;

  // 2. Bass / Low Shelf EQ
  const bassFilter = ctx.createBiquadFilter();
  bassFilter.type = "lowshelf";
  bassFilter.frequency.value = 220;
  bassFilter.gain.value = bass * 12; // up to +12dB boost

  // 3. Robotic Ring Modulator (if modulation > 0.25)
  let lastNode: AudioNode = source;

  if (modIntensity > 0.25) {
    const modOsc = ctx.createOscillator();
    modOsc.type = "sine";
    modOsc.frequency.value = persona.id === "cyber-robot" ? 50 : 35;

    const modGain = ctx.createGain();
    modGain.gain.value = modIntensity * 0.75;

    const carrierGain = ctx.createGain();
    carrierGain.gain.value = 1.0 - modIntensity * 0.35;

    modOsc.connect(modGain);
    
    // Connect source to bass filter then to carrier gain
    source.connect(bassFilter);
    bassFilter.connect(carrierGain);
    modOsc.start(0);
    lastNode = carrierGain;
  } else {
    source.connect(bassFilter);
    lastNode = bassFilter;
  }

  // 4. Bandpass / Telephone EQ (for lo-fi walkie-talkie)
  if (persona.id === "walkie-talkie") {
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 450;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2800;

    lastNode.connect(highpass);
    highpass.connect(lowpass);
    lastNode = lowpass;
  }

  // 5. Echo / Delay Network (if echoIntensity > 0.1)
  if (echoIntensity > 0.1) {
    const delay = ctx.createDelay(2.0);
    delay.delayTime.value = persona.id === "space-alien" ? 0.18 : 0.28;

    const feedback = ctx.createGain();
    feedback.gain.value = Math.min(0.65, echoIntensity * 0.7);

    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = "lowpass";
    delayFilter.frequency.value = 2400; // warm realistic decay

    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);

    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.85;

    const wetGain = ctx.createGain();
    wetGain.gain.value = echoIntensity * 0.55;

    lastNode.connect(dryGain);
    lastNode.connect(delay);
    delay.connect(wetGain);

    dryGain.connect(ctx.destination);
    wetGain.connect(ctx.destination);
  } else {
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.85;
    lastNode.connect(masterGain);
    masterGain.connect(ctx.destination);
  }

  source.start(0);

  const renderedBuffer = await ctx.startRendering();
  const blob = audioBufferToWavBlob(renderedBuffer);
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    duration: renderedBuffer.duration,
  };
}

/**
 * Synthesizes a natural, high-fidelity 10s voice recording demo at $0 compute cost
 * and transforms it using the selected persona for immediate A/B preview on mount.
 */
export async function generateVoiceChangerDemo(
  personaId = "deep-announcer"
): Promise<VoiceDemoData> {
  const sampleRate = 44100;
  const duration = 10;
  const totalSamples = Math.floor(sampleRate * duration);

  const ctx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const master = ctx.createGain();
  master.gain.value = 0.75;
  master.connect(ctx.destination);

  // Formant vocal filters for natural human speech
  const f1 = ctx.createBiquadFilter();
  f1.type = "bandpass";
  f1.frequency.value = 720;
  f1.Q.value = 3.2;

  const f2 = ctx.createBiquadFilter();
  f2.type = "bandpass";
  f2.frequency.value = 1750;
  f2.Q.value = 3.6;

  f1.connect(master);
  f2.connect(master);

  // Spoken voice phonemes across 10 seconds:
  // "Welcome to Exismic Studio. Hear how your voice transforms instantly with zero lag."
  const speechPhonemes = [
    { pitch: 175, start: 0.3, dur: 0.35 },
    { pitch: 200, start: 0.75, dur: 0.3 },
    { pitch: 190, start: 1.15, dur: 0.4 },
    { pitch: 165, start: 1.65, dur: 0.55 },
    { pitch: 210, start: 2.6, dur: 0.35 },
    { pitch: 225, start: 3.05, dur: 0.4 },
    { pitch: 185, start: 3.55, dur: 0.6 },
    { pitch: 195, start: 4.8, dur: 0.4 },
    { pitch: 220, start: 5.3, dur: 0.4 },
    { pitch: 190, start: 5.8, dur: 0.5 },
    { pitch: 170, start: 6.4, dur: 0.7 },
    { pitch: 205, start: 7.6, dur: 0.45 },
    { pitch: 180, start: 8.15, dur: 0.65 },
  ];

  speechPhonemes.forEach(({ pitch, start, dur }) => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, start);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(0.75, start + 0.04);
    env.gain.exponentialRampToValueAtTime(0.4, start + dur * 0.7);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(env);
    env.connect(f1);
    env.connect(f2);
    osc.start(start);
    osc.stop(start + dur);
  });

  const originalBuffer = await ctx.startRendering();
  const originalBlob = audioBufferToWavBlob(originalBuffer);
  const originalUrl = URL.createObjectURL(originalBlob);

  // Apply chosen persona DSP to create changed voice
  const activePersona =
    VOICE_PERSONAS.find((p) => p.id === personaId) || VOICE_PERSONAS[0];

  const { blob: changedBlob, url: changedUrl, duration: changedDuration } =
    await transformAudioWithDSP(originalBuffer, activePersona);

  return {
    originalBlob,
    originalUrl,
    changedBlob,
    changedUrl,
    duration: changedDuration,
  };
}
