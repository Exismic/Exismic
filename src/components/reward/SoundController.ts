// Procedural Web Audio API Sound Controller
// Generates 100% code-based audio effects without any external assets.

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private chargeOsc: OscillatorNode | null = null;
  private chargeSubOsc: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;

  private initCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public playHover() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.06); // D6

      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Ignore audio restrictions
    }
  }

  public playClick() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Mechanical snap triangle + low punch
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.09);

      sub.type = "sine";
      sub.frequency.setValueAtTime(140, now);
      sub.frequency.exponentialRampToValueAtTime(30, now + 0.09);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      sub.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 0.09);
      sub.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  public startCharge(pitchOffset: number = 0) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    this.stopCharge();

    try {
      const now = ctx.currentTime;
      this.chargeOsc = ctx.createOscillator();
      this.chargeSubOsc = ctx.createOscillator();
      this.chargeGain = ctx.createGain();

      const baseFreq = 70 + pitchOffset * 18;
      
      // Main Sawtooth Riser
      this.chargeOsc.type = "sawtooth";
      this.chargeOsc.frequency.setValueAtTime(baseFreq, now);
      this.chargeOsc.frequency.exponentialRampToValueAtTime(baseFreq * 4.5, now + 1.8);

      // Sub-Bass Riser
      this.chargeSubOsc.type = "sine";
      this.chargeSubOsc.frequency.setValueAtTime(40, now);
      this.chargeSubOsc.frequency.exponentialRampToValueAtTime(160, now + 1.8);

      // Low pass filter with sweeping resonance
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 1.8);
      filter.Q.setValueAtTime(3, now);

      this.chargeGain.gain.setValueAtTime(0.01, now);
      this.chargeGain.gain.linearRampToValueAtTime(0.25, now + 1.6);

      this.chargeOsc.connect(filter);
      this.chargeSubOsc.connect(filter);
      filter.connect(this.chargeGain);
      this.chargeGain.connect(ctx.destination);

      this.chargeOsc.start(now);
      this.chargeSubOsc.start(now);
    } catch {
      // Ignore
    }
  }

  public stopCharge() {
    if (this.chargeGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.chargeGain.gain.linearRampToValueAtTime(0.001, now + 0.05);
        setTimeout(() => {
          if (this.chargeOsc) {
            this.chargeOsc.stop();
            this.chargeOsc.disconnect();
            this.chargeOsc = null;
          }
          if (this.chargeSubOsc) {
            this.chargeSubOsc.stop();
            this.chargeSubOsc.disconnect();
            this.chargeSubOsc = null;
          }
          this.chargeGain = null;
        }, 60);
      } catch {
        this.chargeOsc = null;
        this.chargeSubOsc = null;
        this.chargeGain = null;
      }
    }
  }

  public playExplosion(rarity: string = "common") {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    this.stopCharge();

    try {
      const now = ctx.currentTime;

      // 1. Heavy Punch Sub-Bass Impact Drop
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();

      subOsc.type = "sine";
      const isLegendary = rarity.toLowerCase() === "legendary";
      const isEpic = rarity.toLowerCase() === "epic";

      const startSub = isLegendary ? 180 : isEpic ? 140 : 110;
      subOsc.frequency.setValueAtTime(startSub, now);
      subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.55);

      subGain.gain.setValueAtTime(isLegendary ? 0.55 : isEpic ? 0.4 : 0.28, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.6);

      // 2. White Noise Detonation Burst
      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(isLegendary ? 1200 : 900, now);
      noiseFilter.Q.setValueAtTime(1.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(isLegendary ? 0.35 : 0.22, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.35);

      // 3. Victory Harmonic Chime Sequence
      const notes = isLegendary
        ? [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98] // C5, E5, G5, C6, E6, G6
        : isEpic
        ? [440, 554.37, 659.25, 880, 1108.73] // A4, C#5, E5, A5, C#6
        : rarity.toLowerCase() === "rare"
        ? [392, 493.88, 587.33, 783.99] // G4, B4, D5, G5
        : [329.63, 415.3, 493.88, 659.25]; // E4, G#4, B4, E5

      notes.forEach((freq, index) => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        chimeOsc.type = "sine";
        chimeOsc.frequency.setValueAtTime(freq, now + 0.08 + index * 0.045);

        chimeGain.gain.setValueAtTime(0, now);
        chimeGain.gain.setValueAtTime(0.14, now + 0.08 + index * 0.045);
        chimeGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.7 + index * 0.045);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);

        chimeOsc.start(now + 0.08 + index * 0.045);
        chimeOsc.stop(now + 0.8 + index * 0.045);
      });
    } catch {
      // Ignore
    }
  }

  public playShine() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1318.51, now); // E6
      osc.frequency.exponentialRampToValueAtTime(2637.02, now + 0.18); // E7

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Ignore
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stopCharge();
    return this.isMuted;
  }
}

export const soundController = new SoundController();
