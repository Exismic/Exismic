/**
 * Procedural Web Audio Sound Effects Synthesizer Engine
 * Synthesizes studio-grade sound effects in-browser at $0 compute cost
 * for instant demonstration and fail-safe fallback generation.
 */

import { audioBufferToWavBlob } from "@/lib/vocal-demo-generator";

export interface SfxBlueprint {
  id: string;
  title: string;
  prompt: string;
  category: "Gaming" | "Sci-Fi" | "Cinematic" | "Ambient";
  duration: number;
  environment: "studio" | "outdoor" | "hall";
  description: string;
}

export const SFX_BLUEPRINTS: SfxBlueprint[] = [
  {
    id: "8bit-coin-jump",
    title: "8-Bit Coin & Jump",
    prompt: "Retro 8-bit game jump with shiny coin collect chime",
    category: "Gaming",
    duration: 1.5,
    environment: "studio",
    description: "Classic arcade jump pulse with glittering reward chime",
  },
  {
    id: "laser-blast",
    title: "Sci-Fi Laser Blast",
    prompt: "Futuristic plasma laser blaster with trailing energy echo",
    category: "Sci-Fi",
    duration: 2.2,
    environment: "hall",
    description: "High-energy plasma blaster shot with cosmic dissipation",
  },
  {
    id: "sword-clash",
    title: "Heavy Sword Clash",
    prompt: "Heavy metal steel sword parry with ringing metallic resonance",
    category: "Cinematic",
    duration: 2.5,
    environment: "outdoor",
    description: "Sharpened steel blades colliding with ringing resonance",
  },
  {
    id: "thunder-rumble",
    title: "Thunder & Rain",
    prompt: "Deep cinematic thunder rumble with gentle distant rain",
    category: "Ambient",
    duration: 4.0,
    environment: "outdoor",
    description: "Low sub-bass rolling storm rumble and gentle raindrops",
  },
];

export const SFX_INSPIRATIONS = [
  {
    group: "Gaming & Sci-Fi",
    tags: [
      "Retro 8-bit game jump",
      "Laser beam blast",
      "Futuristic hovercar zoom",
      "Level up victory chime",
      "Mecha footstep stomp",
    ],
  },
  {
    group: "Cinematic & Action",
    tags: [
      "Heavy metal sword clash",
      "Cinematic sub-bass drop",
      "Explosion shockwave",
      "Glass shatter crash",
      "Car engine rev accelerating",
    ],
  },
  {
    group: "Nature & Ambient",
    tags: [
      "Deep thunder storm rumble",
      "Campfire wood crackle",
      "Ocean waves breaking on shore",
      "Footsteps crunching on snow",
      "Wind whistling through trees",
    ],
  },
  {
    group: "UI & Transitions",
    tags: [
      "Smooth modern menu click",
      "Camera shutter snap",
      "Cartoon slip and fall whoosh",
      "Clean notification chime",
      "Pneumatic sci-fi door slide",
    ],
  },
];

/**
 * Procedurally generates realistic audio for a given sound effect prompt in the browser
 */
export async function generateProceduralSfx(
  prompt: string,
  targetDuration = 3.0,
  environment: "studio" | "outdoor" | "hall" = "studio"
): Promise<{ blob: Blob; url: string; duration: number }> {
  const p = prompt.toLowerCase();
  const sampleRate = 44100;
  const duration = Math.max(0.5, Math.min(12.0, targetDuration));
  const totalSamples = Math.floor(sampleRate * duration);

  const ctx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const master = ctx.createGain();
  master.gain.value = 0.8;

  // Environment Reverb / Delay Network
  if (environment === "hall" || environment === "outdoor") {
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = environment === "hall" ? 0.22 : 0.12;

    const feedback = ctx.createGain();
    feedback.gain.value = environment === "hall" ? 0.45 : 0.25;

    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = "lowpass";
    delayFilter.frequency.value = environment === "hall" ? 3000 : 4500;

    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);

    master.connect(delay);
    delay.connect(ctx.destination);
  }

  master.connect(ctx.destination);

  // 1. LASER / PLASMA / BLASTER
  if (p.includes("laser") || p.includes("blast") || p.includes("plasma") || p.includes("pew")) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1800, 0);
    osc.frequency.exponentialRampToValueAtTime(75, Math.min(0.45, duration * 0.4));

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3500, 0);
    filter.frequency.exponentialRampToValueAtTime(200, Math.min(0.5, duration * 0.4));

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.85, 0);
    env.gain.exponentialRampToValueAtTime(0.001, Math.min(0.65, duration * 0.5));

    osc.connect(filter);
    filter.connect(env);
    env.connect(master);

    osc.start(0);
    osc.stop(duration);
  }

  // 2. 8-BIT / RETRO / GAME / COIN / JUMP
  else if (p.includes("8-bit") || p.includes("coin") || p.includes("jump") || p.includes("arcade") || p.includes("retro")) {
    // Jump Sweep
    const jumpOsc = ctx.createOscillator();
    jumpOsc.type = "square";
    jumpOsc.frequency.setValueAtTime(140, 0);
    jumpOsc.frequency.exponentialRampToValueAtTime(620, 0.22);

    const jumpEnv = ctx.createGain();
    jumpEnv.gain.setValueAtTime(0.6, 0);
    jumpEnv.gain.exponentialRampToValueAtTime(0.001, 0.25);

    jumpOsc.connect(jumpEnv);
    jumpEnv.connect(master);
    jumpOsc.start(0);
    jumpOsc.stop(0.26);

    // Coin Chimes
    const coinNotes = [987.77, 1318.51]; // B5 to E6
    coinNotes.forEach((freq, idx) => {
      const cOsc = ctx.createOscillator();
      cOsc.type = "sine";
      cOsc.frequency.setValueAtTime(freq, 0.28 + idx * 0.1);

      const cEnv = ctx.createGain();
      cEnv.gain.setValueAtTime(0.0001, 0.28 + idx * 0.1);
      cEnv.gain.exponentialRampToValueAtTime(0.7, 0.29 + idx * 0.1);
      cEnv.gain.exponentialRampToValueAtTime(0.0001, 0.65 + idx * 0.15);

      cOsc.connect(cEnv);
      cEnv.connect(master);
      cOsc.start(0.28 + idx * 0.1);
      cOsc.stop(0.9);
    });
  }

  // 3. SWORD / METAL / CLASH / PARRY / BLADE
  else if (p.includes("sword") || p.includes("metal") || p.includes("clash") || p.includes("steel") || p.includes("blade")) {
    // High-frequency transient noise burst
    const noiseBuffer = ctx.createBuffer(1, Math.floor(sampleRate * 0.1), sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.02));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 4500;
    noiseFilter.Q.value = 2.0;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(master);
    noiseSource.start(0);

    // Tuned resonant metal ring harmonics
    const metalTones = [2200, 3600, 5200];
    metalTones.forEach((tone) => {
      const mOsc = ctx.createOscillator();
      mOsc.type = "sine";
      mOsc.frequency.value = tone;

      const mEnv = ctx.createGain();
      mEnv.gain.setValueAtTime(0.45, 0);
      mEnv.gain.exponentialRampToValueAtTime(0.0001, Math.min(2.0, duration));

      mOsc.connect(mEnv);
      mEnv.connect(master);
      mOsc.start(0);
      mOsc.stop(duration);
    });
  }

  // 4. THUNDER / EXPLOSION / BOOM / RUMBLE
  else if (p.includes("thunder") || p.includes("explosion") || p.includes("boom") || p.includes("crash") || p.includes("blast")) {
    // Deep Sub-Bass Impact
    const subOsc = ctx.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(95, 0);
    subOsc.frequency.exponentialRampToValueAtTime(32, Math.min(2.0, duration * 0.7));

    const subEnv = ctx.createGain();
    subEnv.gain.setValueAtTime(0.9, 0);
    subEnv.gain.exponentialRampToValueAtTime(0.001, Math.min(2.5, duration));

    subOsc.connect(subEnv);
    subEnv.connect(master);
    subOsc.start(0);
    subOsc.stop(duration);

    // Filtered Rolling Noise Rumble
    const noiseLen = Math.floor(sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, noiseLen, sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < noiseLen; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.1;
      b2 = 0.85 * b2 + white * 0.2;
      data[i] = (b0 + b1 + b2) * 0.3 * Math.exp(-i / (sampleRate * (duration * 0.6)));
    }

    const nSource = ctx.createBufferSource();
    nSource.buffer = noiseBuffer;

    const nFilter = ctx.createBiquadFilter();
    nFilter.type = "lowpass";
    nFilter.frequency.value = 160;

    nSource.connect(nFilter);
    nFilter.connect(master);
    nSource.start(0);
  }

  // 5. DEFAULT / AMBIENT / CHIME / GENERAL FOLEY
  else {
    // Harmonious shimmering chord
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C Major
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, idx * 0.08);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, idx * 0.08);
      env.gain.exponentialRampToValueAtTime(0.5, idx * 0.08 + 0.05);
      env.gain.exponentialRampToValueAtTime(0.0001, duration);

      osc.connect(env);
      env.connect(master);
      osc.start(idx * 0.08);
      osc.stop(duration);
    });
  }

  const rendered = await ctx.startRendering();
  const blob = audioBufferToWavBlob(rendered);
  const url = URL.createObjectURL(blob);

  return { blob, url, duration: rendered.duration };
}
