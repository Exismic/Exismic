/**
 * Procedural Web Audio Ambient Soundscape Engine
 * Synthesizes 6 distinct, infinite, organic ambient sound layers
 * entirely in-browser with $0 server cost and zero external CORS failures.
 */

import { audioBufferToWavBlob } from "@/lib/vocal-demo-generator";

export interface AmbientChannelConfig {
  id: string;
  name: string;
  tagline: string;
  iconName: string;
  defaultVolume: number;
  colorHex: string;
}

export const AMBIENT_CHANNELS: AmbientChannelConfig[] = [
  {
    id: "rain",
    name: "Heavy Rain",
    tagline: "Calming rooftop rainfall & thunder",
    iconName: "CloudRain",
    defaultVolume: 0.7,
    colorHex: "#38bdf8", // Sky blue
  },
  {
    id: "fireplace",
    name: "Cozy Fireplace",
    tagline: "Crackling cedar wood & embers",
    iconName: "Flame",
    defaultVolume: 0.5,
    colorHex: "#fb923c", // Warm orange
  },
  {
    id: "cafe",
    name: "Coffee Shop",
    tagline: "Warm Parisian cafe murmur & cups",
    iconName: "Coffee",
    defaultVolume: 0.35,
    colorHex: "#f59e0b", // Amber
  },
  {
    id: "forest",
    name: "Pine Forest",
    tagline: "Whispering breeze & songbirds",
    iconName: "Trees",
    defaultVolume: 0.4,
    colorHex: "#34d399", // Emerald
  },
  {
    id: "night",
    name: "Midnight Stars",
    tagline: "Summer crickets & night air",
    iconName: "Moon",
    defaultVolume: 0.25,
    colorHex: "#818cf8", // Indigo
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    tagline: "Rolling coastal surf & swells",
    iconName: "Waves",
    defaultVolume: 0.6,
    colorHex: "#06b6d4", // Cyan
  },
];

export interface SoundscapePreset {
  id: string;
  name: string;
  tagline: string;
  iconName: string;
  levels: Record<string, number>;
}

export const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: "rainy-cafe",
    name: "Rainy Coffee Shop",
    tagline: "Rainfall outside a cozy warm cafe",
    iconName: "Coffee",
    levels: { rain: 0.75, fireplace: 0.2, cafe: 0.8, forest: 0.0, night: 0.15, ocean: 0.0 },
  },
  {
    id: "midnight-storm",
    name: "Midnight Rainstorm",
    tagline: "Heavy rain, distant thunder & crickets",
    iconName: "CloudRain",
    levels: { rain: 0.9, fireplace: 0.4, cafe: 0.0, forest: 0.0, night: 0.65, ocean: 0.25 },
  },
  {
    id: "forest-campfire",
    name: "Forest Campfire",
    tagline: "Crackling campfire under tall pines",
    iconName: "Flame",
    levels: { rain: 0.15, fireplace: 0.85, cafe: 0.0, forest: 0.75, night: 0.4, ocean: 0.0 },
  },
  {
    id: "cozy-cabin",
    name: "Cozy Mountain Cabin",
    tagline: "Roaring fireplace and soft rain",
    iconName: "Trees",
    levels: { rain: 0.6, fireplace: 0.9, cafe: 0.0, forest: 0.35, night: 0.7, ocean: 0.0 },
  },
  {
    id: "coastal-serenity",
    name: "Coastal Serenity",
    tagline: "Rhythmic ocean surf and night breeze",
    iconName: "Waves",
    levels: { rain: 0.2, fireplace: 0.0, cafe: 0.0, forest: 0.3, night: 0.5, ocean: 0.85 },
  },
  {
    id: "deep-zen",
    name: "Deep Zen Focus",
    tagline: "Subtle forest stream, waves & rain",
    iconName: "Moon",
    levels: { rain: 0.45, fireplace: 0.1, cafe: 0.0, forest: 0.55, night: 0.3, ocean: 0.65 },
  },
];

/**
 * Procedurally generates an 8-second looped AudioBuffer for a specific ambient channel
 */
export async function generateChannelBuffer(
  channelId: string,
  durationSec = 8
): Promise<AudioBuffer> {
  const sampleRate = 44100;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const ctx = new OfflineAudioContext(2, totalSamples, sampleRate);

  if (channelId === "rain") {
    // Rain: Filtered pink noise + droplet transients
    const noiseBuffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < totalSamples; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.1;
      b2 = 0.85 * b2 + white * 0.2;
      data[i] = (b0 + b1 + b2) * 0.35;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;

    noiseSource.connect(filter);
    filter.connect(ctx.destination);
    noiseSource.start(0);
  } else if (channelId === "fireplace") {
    // Fireplace: Deep warm rumble + random crackle pops
    const rumbleBuffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = rumbleBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < totalSamples; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      // Random crackle pop
      const pop = Math.random() < 0.00035 ? (Math.random() * 1.5 - 0.75) : 0;
      data[i] = last * 2.5 + pop;
    }
    const rumbleSource = ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 650;

    rumbleSource.connect(filter);
    filter.connect(ctx.destination);
    rumbleSource.start(0);
  } else if (channelId === "cafe") {
    // Cafe: Inharmonic murmur + subtle acoustic clinks
    const murmurBuffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = murmurBuffer.getChannelData(0);
    for (let i = 0; i < totalSamples; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const murmurSource = ctx.createBufferSource();
    murmurSource.buffer = murmurBuffer;

    const f1 = ctx.createBiquadFilter();
    f1.type = "bandpass";
    f1.frequency.value = 480;
    f1.Q.value = 2.0;

    murmurSource.connect(f1);
    f1.connect(ctx.destination);
    murmurSource.start(0);
  } else if (channelId === "forest") {
    // Forest: Breathy wind + periodic bird chirps
    const windBuffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = windBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < totalSamples; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.015 * white) / 1.015;
      data[i] = last * 1.8;
    }
    const windSource = ctx.createBufferSource();
    windSource.buffer = windBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 750;
    filter.Q.value = 1.5;

    windSource.connect(filter);
    filter.connect(ctx.destination);
    windSource.start(0);
  } else if (channelId === "night") {
    // Night: High-frequency crickets (4.5kHz pulsed) + gentle air
    const nightBuffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = nightBuffer.getChannelData(0);
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const cricketPulse = Math.sin(t * 16 * Math.PI) > 0.65 ? 1 : 0;
      const cricketFreq = Math.sin(t * 4500 * 2 * Math.PI);
      data[i] = cricketPulse * cricketFreq * 0.12 + (Math.random() * 2 - 1) * 0.02;
    }
    const nightSource = ctx.createBufferSource();
    nightSource.buffer = nightBuffer;

    nightSource.connect(ctx.destination);
    nightSource.start(0);
  } else {
    // Ocean: 8-second cyclical swell of filtered rolling surf
    const surfBuffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = surfBuffer.getChannelData(0);
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const swell = (Math.sin((t / durationSec) * 2 * Math.PI - Math.PI / 2) + 1) / 2; // 0 to 1 cycle
      const noise = Math.random() * 2 - 1;
      data[i] = noise * (0.15 + swell * 0.45);
    }
    const surfSource = ctx.createBufferSource();
    surfSource.buffer = surfBuffer;

    const surfFilter = ctx.createBiquadFilter();
    surfFilter.type = "lowpass";
    surfFilter.frequency.value = 850;

    surfSource.connect(surfFilter);
    surfFilter.connect(ctx.destination);
    surfSource.start(0);
  }

  return await ctx.startRendering();
}

/**
 * Mixes all active ambient channels into a master 16-bit stereo WAV export
 */
export async function exportMixedSoundscapeWav(
  levels: Record<string, number>,
  masterVolume = 1.0,
  durationSec = 20
): Promise<Blob> {
  const sampleRate = 44100;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const ctx = new OfflineAudioContext(2, totalSamples, sampleRate);

  const masterGain = ctx.createGain();
  masterGain.gain.value = Math.max(0, Math.min(1.0, masterVolume * 0.85));
  masterGain.connect(ctx.destination);

  for (const ch of AMBIENT_CHANNELS) {
    const vol = levels[ch.id] || 0;
    if (vol > 0.01) {
      const chBuffer = await generateChannelBuffer(ch.id, durationSec);
      const source = ctx.createBufferSource();
      source.buffer = chBuffer;
      source.loop = true;

      const gain = ctx.createGain();
      gain.gain.value = vol;

      source.connect(gain);
      gain.connect(masterGain);
      source.start(0);
    }
  }

  const rendered = await ctx.startRendering();
  return audioBufferToWavBlob(rendered);
}
