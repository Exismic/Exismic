/**
 * Vocal Remover Demo Stems Generator
 * Synthesizes a high-quality 2-track (Vocals + Instrumental) demo song in-browser
 * at $0 compute cost, giving users an instant, playable studio experience.
 */

// Helper: Convert AudioBuffer to 16-bit Stereo PCM WAV Blob
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let resultBuffer: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    resultBuffer = new Float32Array(left.length * 2);
    for (let i = 0; i < left.length; i++) {
      resultBuffer[i * 2] = left[i];
      resultBuffer[i * 2 + 1] = right[i];
    }
  } else {
    resultBuffer = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = resultBuffer.length * bytesPerSample;
  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);

  // RIFF identifier
  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");

  // fmt chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // PCM data conversion
  let offset = 44;
  for (let i = 0; i < resultBuffer.length; i++) {
    const s = Math.max(-1, Math.min(1, resultBuffer[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, val, true);
    offset += 2;
  }

  return new Blob([wavBuffer], { type: "audio/wav" });
}

export interface GeneratedDemoStems {
  vocalUrl: string;
  instrumentalUrl: string;
  vocalBlob: Blob;
  instrumentalBlob: Blob;
  duration: number;
}

/**
 * Synthesizes 12 seconds of a catchy pop melody (Am - F - C - G)
 * split cleanly into an isolated vocal melody and an instrumental track.
 */
export async function generateDemoStems(): Promise<GeneratedDemoStems> {
  const sampleRate = 44100;
  const bpm = 100;
  const beatSec = 60 / bpm; // 0.6s
  const duration = beatSec * 20; // 12 seconds
  const totalSamples = Math.floor(sampleRate * duration);

  // =========================================================================
  // 1. RENDER VOCAL STEM (Melodic vocal singing synth)
  // =========================================================================
  const vocalCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

  // Vibrato LFO
  const vibrato = vocalCtx.createOscillator();
  vibrato.frequency.value = 5.2; // 5.2 Hz gentle vocal vibrato
  const vibratoGain = vocalCtx.createGain();
  vibratoGain.gain.value = 4.5; // slight pitch modulation
  vibrato.connect(vibratoGain);
  vibrato.start();

  // Vocal Formant Filter (mimics vocal tract resonance)
  const formant1 = vocalCtx.createBiquadFilter();
  formant1.type = "bandpass";
  formant1.frequency.value = 750; // 'Ah' formant
  formant1.Q.value = 3.5;

  const formant2 = vocalCtx.createBiquadFilter();
  formant2.type = "bandpass";
  formant2.frequency.value = 1800;
  formant2.Q.value = 4.0;

  const vocalMaster = vocalCtx.createGain();
  vocalMaster.gain.value = 0.55;

  formant1.connect(vocalMaster);
  formant2.connect(vocalMaster);
  vocalMaster.connect(vocalCtx.destination);

  // Vocal notes in Hz: A4(440), C5(523), D5(587), E5(659), G5(783), E5(659)
  const vocalNotes: Array<{ pitch: number; start: number; dur: number }> = [
    { pitch: 440, start: 0.0, dur: 1.0 },
    { pitch: 523.25, start: 1.1, dur: 0.9 },
    { pitch: 587.33, start: 2.1, dur: 0.8 },
    { pitch: 659.25, start: 3.0, dur: 1.6 },
    { pitch: 587.33, start: 4.8, dur: 0.9 },
    { pitch: 523.25, start: 5.8, dur: 1.0 },
    { pitch: 440, start: 6.9, dur: 1.8 },
    { pitch: 523.25, start: 8.9, dur: 0.9 },
    { pitch: 659.25, start: 9.9, dur: 1.9 },
  ];

  vocalNotes.forEach(({ pitch, start, dur }) => {
    if (start + dur > duration) return;

    const osc = vocalCtx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(pitch, start);
    vibratoGain.connect(osc.frequency);

    const env = vocalCtx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(0.7, start + 0.08); // attack
    env.gain.exponentialRampToValueAtTime(0.5, start + dur * 0.7); // sustain
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur); // release

    osc.connect(env);
    env.connect(formant1);
    env.connect(formant2);

    osc.start(start);
    osc.stop(start + dur);
  });

  const vocalBuffer = await vocalCtx.startRendering();

  // =========================================================================
  // 2. RENDER INSTRUMENTAL STEM (Chords, Bass, Drums)
  // =========================================================================
  const instCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const instMaster = instCtx.createGain();
  instMaster.gain.value = 0.5;
  instMaster.connect(instCtx.destination);

  // Chord progression: Am (A-C-E), F (F-A-C), C (C-E-G), G (G-B-D)
  const chords: Array<{ notes: number[]; bass: number; start: number; dur: number }> = [
    { notes: [220, 261.63, 329.63], bass: 110, start: 0, dur: 2.8 },
    { notes: [174.61, 220, 261.63], bass: 87.31, start: 3.0, dur: 2.8 },
    { notes: [130.81, 164.81, 196.0], bass: 65.41, start: 6.0, dur: 2.8 },
    { notes: [196.0, 246.94, 293.66], bass: 98.0, start: 9.0, dur: 2.8 },
  ];

  chords.forEach(({ notes, bass, start, dur }) => {
    // Bass note
    const bassOsc = instCtx.createOscillator();
    bassOsc.type = "triangle";
    bassOsc.frequency.setValueAtTime(bass, start);

    const bassEnv = instCtx.createGain();
    bassEnv.gain.setValueAtTime(0.001, start);
    bassEnv.gain.exponentialRampToValueAtTime(0.65, start + 0.04);
    bassEnv.gain.exponentialRampToValueAtTime(0.001, start + dur);

    bassOsc.connect(bassEnv);
    bassEnv.connect(instMaster);
    bassOsc.start(start);
    bassOsc.stop(start + dur);

    // Chords (Electric Piano tone)
    notes.forEach((freq) => {
      const noteOsc = instCtx.createOscillator();
      noteOsc.type = "sine";
      noteOsc.frequency.setValueAtTime(freq, start);

      const noteEnv = instCtx.createGain();
      noteEnv.gain.setValueAtTime(0.001, start);
      noteEnv.gain.exponentialRampToValueAtTime(0.28, start + 0.05);
      noteEnv.gain.exponentialRampToValueAtTime(0.001, start + dur);

      noteOsc.connect(noteEnv);
      noteEnv.connect(instMaster);
      noteOsc.start(start);
      noteOsc.stop(start + dur);
    });
  });

  // Rhythmic percussion (Kick on beats 0, 1, 2, 3...)
  for (let t = 0; t < duration; t += beatSec) {
    // Soft Kick
    const kickOsc = instCtx.createOscillator();
    kickOsc.frequency.setValueAtTime(140, t);
    kickOsc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    const kickGain = instCtx.createGain();
    kickGain.gain.setValueAtTime(0.6, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    kickOsc.connect(kickGain);
    kickGain.connect(instMaster);
    kickOsc.start(t);
    kickOsc.stop(t + 0.15);

    // Soft Shaker / Hi-Hat
    if (t + beatSec / 2 < duration) {
      const hhTime = t + beatSec / 2;
      const hhOsc = instCtx.createOscillator();
      hhOsc.type = "square";
      hhOsc.frequency.setValueAtTime(8000, hhTime);

      const hhFilter = instCtx.createBiquadFilter();
      hhFilter.type = "highpass";
      hhFilter.frequency.value = 6000;

      const hhGain = instCtx.createGain();
      hhGain.gain.setValueAtTime(0.08, hhTime);
      hhGain.gain.exponentialRampToValueAtTime(0.001, hhTime + 0.05);

      hhOsc.connect(hhFilter);
      hhFilter.connect(hhGain);
      hhGain.connect(instMaster);
      hhOsc.start(hhTime);
      hhOsc.stop(hhTime + 0.06);
    }
  }

  const instBuffer = await instCtx.startRendering();

  const vocalBlob = audioBufferToWavBlob(vocalBuffer);
  const instrumentalBlob = audioBufferToWavBlob(instBuffer);

  return {
    vocalUrl: URL.createObjectURL(vocalBlob),
    instrumentalUrl: URL.createObjectURL(instrumentalBlob),
    vocalBlob,
    instrumentalBlob,
    duration,
  };
}

/**
 * Fast Client-Side Vocal Cancellation & Isolation (Mid-Side Processing)
 * Separates any uploaded stereo song in ~1-2 seconds in the browser with 0 API cost.
 */
export async function processAudioInBrowser(file: File): Promise<{
  vocalBlob: Blob;
  instrumentalBlob: Blob;
  vocalUrl: string;
  instrumentalUrl: string;
  duration: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const decoded = await audioContext.decodeAudioData(arrayBuffer);
  await audioContext.close();

  const sampleRate = decoded.sampleRate;
  const numSamples = decoded.length;
  const duration = decoded.duration;

  // Mid-side separation
  // Left and Right channels
  const left = decoded.getChannelData(0);
  const right = decoded.numberOfChannels > 1 ? decoded.getChannelData(1) : left;

  const vocalCtx = new OfflineAudioContext(2, numSamples, sampleRate);
  const vocalOutL = vocalCtx.createBuffer(2, numSamples, sampleRate);
  const vLeft = vocalOutL.getChannelData(0);
  const vRight = vocalOutL.getChannelData(1);

  const instCtx = new OfflineAudioContext(2, numSamples, sampleRate);
  const instOutL = instCtx.createBuffer(2, numSamples, sampleRate);
  const iLeft = instOutL.getChannelData(0);
  const iRight = instOutL.getChannelData(1);

  // Fast Mid-Side separation formula
  for (let i = 0; i < numSamples; i++) {
    const l = left[i];
    const r = right[i];
    const mid = (l + r) * 0.5; // Vocals typically sit in center
    const side = (l - r) * 0.5; // Instruments, panning, reverb sit in sides

    // Instrumental = mostly side signals + attenuated mid
    iLeft[i] = side + l * 0.25;
    iRight[i] = -side + r * 0.25;

    // Vocal = mid signals minus side spill
    const vocalApprox = mid - Math.abs(side) * 0.4;
    vLeft[i] = vocalApprox;
    vRight[i] = vocalApprox;
  }

  const vBuffer = await vocalCtx.startRendering();
  const iBuffer = await instCtx.startRendering();

  const vocalBlob = audioBufferToWavBlob(vBuffer);
  const instrumentalBlob = audioBufferToWavBlob(iBuffer);

  return {
    vocalBlob,
    instrumentalBlob,
    vocalUrl: URL.createObjectURL(vocalBlob),
    instrumentalUrl: URL.createObjectURL(instrumentalBlob),
    duration,
  };
}

export interface GeneratedFourTrackDemoStems {
  vocalsUrl: string;
  drumsUrl: string;
  bassUrl: string;
  otherUrl: string;
  vocalsBlob: Blob;
  drumsBlob: Blob;
  bassBlob: Blob;
  otherBlob: Blob;
  duration: number;
}

/**
 * Synthesizes 4 distinct, synchronized stems (Vocals, Drums, Bass, Instruments)
 * for the Full Stem Splitter studio in-browser at $0 compute cost.
 */
export async function generateFourTrackDemoStems(): Promise<GeneratedFourTrackDemoStems> {
  const sampleRate = 44100;
  const bpm = 100;
  const beatSec = 60 / bpm; // 0.6s
  const duration = beatSec * 20; // 12 seconds
  const totalSamples = Math.floor(sampleRate * duration);

  // 1. VOCALS STEM
  const vocalCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const vibrato = vocalCtx.createOscillator();
  vibrato.frequency.value = 5.2;
  const vibratoGain = vocalCtx.createGain();
  vibratoGain.gain.value = 4.5;
  vibrato.connect(vibratoGain);
  vibrato.start();

  const formant1 = vocalCtx.createBiquadFilter();
  formant1.type = "bandpass";
  formant1.frequency.value = 750;
  formant1.Q.value = 3.5;

  const formant2 = vocalCtx.createBiquadFilter();
  formant2.type = "bandpass";
  formant2.frequency.value = 1800;
  formant2.Q.value = 4.0;

  const vocalMaster = vocalCtx.createGain();
  vocalMaster.gain.value = 0.55;
  formant1.connect(vocalMaster);
  formant2.connect(vocalMaster);
  vocalMaster.connect(vocalCtx.destination);

  const vocalNotes = [
    { pitch: 440, start: 0.0, dur: 1.0 },
    { pitch: 523.25, start: 1.1, dur: 0.9 },
    { pitch: 587.33, start: 2.1, dur: 0.8 },
    { pitch: 659.25, start: 3.0, dur: 1.6 },
    { pitch: 587.33, start: 4.8, dur: 0.9 },
    { pitch: 523.25, start: 5.8, dur: 1.0 },
    { pitch: 440, start: 6.9, dur: 1.8 },
    { pitch: 523.25, start: 8.9, dur: 0.9 },
    { pitch: 659.25, start: 9.9, dur: 1.9 },
  ];

  vocalNotes.forEach(({ pitch, start, dur }) => {
    if (start + dur > duration) return;
    const osc = vocalCtx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(pitch, start);
    vibratoGain.connect(osc.frequency);

    const env = vocalCtx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(0.7, start + 0.08);
    env.gain.exponentialRampToValueAtTime(0.5, start + dur * 0.7);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(env);
    env.connect(formant1);
    env.connect(formant2);
    osc.start(start);
    osc.stop(start + dur);
  });

  // 2. DRUMS STEM (Kick + Hi-hat percussion)
  const drumsCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const drumsMaster = drumsCtx.createGain();
  drumsMaster.gain.value = 0.7;
  drumsMaster.connect(drumsCtx.destination);

  for (let t = 0; t < duration; t += beatSec) {
    // Punchy Kick
    const kickOsc = drumsCtx.createOscillator();
    kickOsc.frequency.setValueAtTime(150, t);
    kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    const kickGain = drumsCtx.createGain();
    kickGain.gain.setValueAtTime(0.8, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    kickOsc.connect(kickGain);
    kickGain.connect(drumsMaster);
    kickOsc.start(t);
    kickOsc.stop(t + 0.16);

    // Crisp Hi-Hat / Shaker
    if (t + beatSec / 2 < duration) {
      const hhTime = t + beatSec / 2;
      const hhOsc = drumsCtx.createOscillator();
      hhOsc.type = "square";
      hhOsc.frequency.setValueAtTime(8500, hhTime);

      const hhFilter = drumsCtx.createBiquadFilter();
      hhFilter.type = "highpass";
      hhFilter.frequency.value = 6500;

      const hhGain = drumsCtx.createGain();
      hhGain.gain.setValueAtTime(0.12, hhTime);
      hhGain.gain.exponentialRampToValueAtTime(0.001, hhTime + 0.05);

      hhOsc.connect(hhFilter);
      hhFilter.connect(hhGain);
      hhGain.connect(drumsMaster);
      hhOsc.start(hhTime);
      hhOsc.stop(hhTime + 0.06);
    }
  }

  // 3. BASS STEM (Deep triangle bass groove)
  const bassCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const bassMaster = bassCtx.createGain();
  bassMaster.gain.value = 0.75;
  bassMaster.connect(bassCtx.destination);

  const bassProgression = [
    { bass: 110, start: 0, dur: 2.8 },
    { bass: 87.31, start: 3.0, dur: 2.8 },
    { bass: 65.41, start: 6.0, dur: 2.8 },
    { bass: 98.0, start: 9.0, dur: 2.8 },
  ];

  bassProgression.forEach(({ bass, start, dur }) => {
    const bassOsc = bassCtx.createOscillator();
    bassOsc.type = "triangle";
    bassOsc.frequency.setValueAtTime(bass, start);

    const bassEnv = bassCtx.createGain();
    bassEnv.gain.setValueAtTime(0.001, start);
    bassEnv.gain.exponentialRampToValueAtTime(0.8, start + 0.04);
    bassEnv.gain.exponentialRampToValueAtTime(0.001, start + dur);

    bassOsc.connect(bassEnv);
    bassEnv.connect(bassMaster);
    bassOsc.start(start);
    bassOsc.stop(start + dur);
  });

  // 4. INSTRUMENTS / CHORDS STEM (Lush electric piano chords)
  const otherCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const otherMaster = otherCtx.createGain();
  otherMaster.gain.value = 0.55;
  otherMaster.connect(otherCtx.destination);

  const chords = [
    { notes: [220, 261.63, 329.63], start: 0, dur: 2.8 },
    { notes: [174.61, 220, 261.63], start: 3.0, dur: 2.8 },
    { notes: [130.81, 164.81, 196.0], start: 6.0, dur: 2.8 },
    { notes: [196.0, 246.94, 293.66], start: 9.0, dur: 2.8 },
  ];

  chords.forEach(({ notes, start, dur }) => {
    notes.forEach((freq) => {
      const noteOsc = otherCtx.createOscillator();
      noteOsc.type = "sine";
      noteOsc.frequency.setValueAtTime(freq, start);

      const noteEnv = otherCtx.createGain();
      noteEnv.gain.setValueAtTime(0.001, start);
      noteEnv.gain.exponentialRampToValueAtTime(0.32, start + 0.05);
      noteEnv.gain.exponentialRampToValueAtTime(0.001, start + dur);

      noteOsc.connect(noteEnv);
      noteEnv.connect(otherMaster);
      noteOsc.start(start);
      noteOsc.stop(start + dur);
    });
  });

  // Parallel render all 4 tracks in hardware
  const [vocalBuffer, drumsBuffer, bassBuffer, otherBuffer] = await Promise.all([
    vocalCtx.startRendering(),
    drumsCtx.startRendering(),
    bassCtx.startRendering(),
    otherCtx.startRendering(),
  ]);

  const vocalsBlob = audioBufferToWavBlob(vocalBuffer);
  const drumsBlob = audioBufferToWavBlob(drumsBuffer);
  const bassBlob = audioBufferToWavBlob(bassBuffer);
  const otherBlob = audioBufferToWavBlob(otherBuffer);

  return {
    vocalsBlob,
    drumsBlob,
    bassBlob,
    otherBlob,
    vocalsUrl: URL.createObjectURL(vocalsBlob),
    drumsUrl: URL.createObjectURL(drumsBlob),
    bassUrl: URL.createObjectURL(bassBlob),
    otherUrl: URL.createObjectURL(otherBlob),
    duration,
  };
}

export interface GeneratedNoiseDemoAudio {
  noisyUrl: string;
  cleanUrl: string;
  noisyBlob: Blob;
  cleanBlob: Blob;
  duration: number;
}

/**
 * Synthesizes a 10s voice recording comparing noisy (AC hum + room hiss)
 * vs studio-cleaned audio for the Noise Remover studio demo.
 */
export async function generateNoiseDemoAudio(): Promise<GeneratedNoiseDemoAudio> {
  const sampleRate = 44100;
  const duration = 10;
  const totalSamples = Math.floor(sampleRate * duration);

  // 1. RENDER CLEAN VOICE (Polished speech tone with natural speech cadence)
  const cleanCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const cleanMaster = cleanCtx.createGain();
  cleanMaster.gain.value = 0.65;
  cleanMaster.connect(cleanCtx.destination);

  // Formant filters for human vocal tract
  const formant1 = cleanCtx.createBiquadFilter();
  formant1.type = "bandpass";
  formant1.frequency.value = 650;
  formant1.Q.value = 3.0;

  const formant2 = cleanCtx.createBiquadFilter();
  formant2.type = "bandpass";
  formant2.frequency.value = 1600;
  formant2.Q.value = 3.5;

  formant1.connect(cleanMaster);
  formant2.connect(cleanMaster);

  // Simulated spoken sentence pitches: "Welcome to Exismic Studio noise removal"
  const speechPhonemes = [
    { pitch: 185, start: 0.5, dur: 0.4 },
    { pitch: 210, start: 1.0, dur: 0.35 },
    { pitch: 195, start: 1.45, dur: 0.5 },
    { pitch: 175, start: 2.1, dur: 0.6 },
    // Pause
    { pitch: 220, start: 3.4, dur: 0.35 },
    { pitch: 205, start: 3.85, dur: 0.4 },
    { pitch: 190, start: 4.35, dur: 0.7 },
    // Pause
    { pitch: 230, start: 5.8, dur: 0.45 },
    { pitch: 215, start: 6.35, dur: 0.4 },
    { pitch: 180, start: 6.85, dur: 0.9 },
  ];

  speechPhonemes.forEach(({ pitch, start, dur }) => {
    const osc = cleanCtx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(pitch, start);

    const env = cleanCtx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(0.7, start + 0.05);
    env.gain.exponentialRampToValueAtTime(0.4, start + dur * 0.7);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(env);
    env.connect(formant1);
    env.connect(formant2);
    osc.start(start);
    osc.stop(start + dur);
  });

  // 2. RENDER NOISY VOICE (Same voice + realistic AC hum & microphone hiss)
  const noisyCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const noisyMaster = noisyCtx.createGain();
  noisyMaster.gain.value = 0.65;
  noisyMaster.connect(noisyCtx.destination);

  const nFormant1 = noisyCtx.createBiquadFilter();
  nFormant1.type = "bandpass";
  nFormant1.frequency.value = 650;
  nFormant1.Q.value = 3.0;

  const nFormant2 = noisyCtx.createBiquadFilter();
  nFormant2.type = "bandpass";
  nFormant2.frequency.value = 1600;
  nFormant2.Q.value = 3.5;

  nFormant1.connect(noisyMaster);
  nFormant2.connect(noisyMaster);

  speechPhonemes.forEach(({ pitch, start, dur }) => {
    const osc = noisyCtx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(pitch, start);

    const env = noisyCtx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(0.7, start + 0.05);
    env.gain.exponentialRampToValueAtTime(0.4, start + dur * 0.7);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(env);
    env.connect(nFormant1);
    env.connect(nFormant2);
    osc.start(start);
    osc.stop(start + dur);
  });

  // 60Hz Air Conditioning Hum & 120Hz Harmonics
  const hum60 = noisyCtx.createOscillator();
  hum60.frequency.value = 60;
  const hum60Gain = noisyCtx.createGain();
  hum60Gain.gain.value = 0.09;
  hum60.connect(hum60Gain);
  hum60Gain.connect(noisyMaster);
  hum60.start(0);
  hum60.stop(duration);

  const hum120 = noisyCtx.createOscillator();
  hum120.frequency.value = 120;
  const hum120Gain = noisyCtx.createGain();
  hum120Gain.gain.value = 0.05;
  hum120.connect(hum120Gain);
  hum120Gain.connect(noisyMaster);
  hum120.start(0);
  hum120.stop(duration);

  // Microphone Room Hiss & Fan White Noise
  const noiseBuffer = noisyCtx.createBuffer(1, totalSamples, sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < totalSamples; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * 0.05;
  }
  const noiseSource = noisyCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const hissFilter = noisyCtx.createBiquadFilter();
  hissFilter.type = "bandpass";
  hissFilter.frequency.value = 3500;
  hissFilter.Q.value = 1.2;

  noiseSource.connect(hissFilter);
  hissFilter.connect(noisyMaster);
  noiseSource.start(0);
  noiseSource.stop(duration);

  const [cleanBuffer, noisyBuffer] = await Promise.all([
    cleanCtx.startRendering(),
    noisyCtx.startRendering(),
  ]);

  const cleanBlob = audioBufferToWavBlob(cleanBuffer);
  const noisyBlob = audioBufferToWavBlob(noisyBuffer);

  return {
    cleanBlob,
    noisyBlob,
    cleanUrl: URL.createObjectURL(cleanBlob),
    noisyUrl: URL.createObjectURL(noisyBlob),
    duration,
  };
}

export interface GeneratedSttDemoAudio {
  blob: Blob;
  url: string;
  duration: number;
}

/**
 * Synthesizes a clean 10s voice recording demo for Speech to Text Studio
 * at $0 compute cost, giving users an immediate playable sample.
 */
export async function generateSttDemoAudio(): Promise<GeneratedSttDemoAudio> {
  const sampleRate = 44100;
  const duration = 10;
  const totalSamples = Math.floor(sampleRate * duration);

  const ctx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const master = ctx.createGain();
  master.gain.value = 0.7;
  master.connect(ctx.destination);

  const formant1 = ctx.createBiquadFilter();
  formant1.type = "bandpass";
  formant1.frequency.value = 680;
  formant1.Q.value = 3.2;

  const formant2 = ctx.createBiquadFilter();
  formant2.type = "bandpass";
  formant2.frequency.value = 1650;
  formant2.Q.value = 3.8;

  formant1.connect(master);
  formant2.connect(master);

  const speechPhonemes = [
    { pitch: 190, start: 0.4, dur: 0.35 },
    { pitch: 215, start: 0.85, dur: 0.3 },
    { pitch: 200, start: 1.25, dur: 0.45 },
    { pitch: 175, start: 1.8, dur: 0.55 },
    { pitch: 225, start: 2.9, dur: 0.35 },
    { pitch: 210, start: 3.35, dur: 0.4 },
    { pitch: 185, start: 3.85, dur: 0.65 },
    { pitch: 235, start: 5.1, dur: 0.4 },
    { pitch: 220, start: 5.6, dur: 0.4 },
    { pitch: 195, start: 6.1, dur: 0.5 },
    { pitch: 175, start: 6.7, dur: 0.8 },
  ];

  speechPhonemes.forEach(({ pitch, start, dur }) => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, start);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(0.75, start + 0.04);
    env.gain.exponentialRampToValueAtTime(0.45, start + dur * 0.7);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(env);
    env.connect(formant1);
    env.connect(formant2);
    osc.start(start);
    osc.stop(start + dur);
  });

  const buffer = await ctx.startRendering();
  const blob = audioBufferToWavBlob(buffer);
  const url = URL.createObjectURL(blob);

  return { blob, url, duration };
}



