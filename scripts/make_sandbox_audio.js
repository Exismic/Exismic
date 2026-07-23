const fs = require('fs');
const path = require('path');

function createWavHeader(dataLength, sampleRate = 44100, numChannels = 2, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

function generateAudioFiles() {
  const sampleRate = 44100;
  const duration = 6; // 6 seconds loop
  const totalSamples = sampleRate * duration;
  
  const vocalPcm = Buffer.alloc(totalSamples * 4); // 2 channels * 2 bytes
  const musicPcm = Buffer.alloc(totalSamples * 4);

  // Musical notes frequencies (Hz)
  // Melody: C5 (523.25), E5 (659.25), G5 (783.99), A5 (880), F5 (698.46)
  const vocalMelody = [
    { freq: 523.25, duration: 0.5 },
    { freq: 659.25, duration: 0.5 },
    { freq: 783.99, duration: 0.75 },
    { freq: 698.46, duration: 0.25 },
    { freq: 659.25, duration: 0.5 },
    { freq: 523.25, duration: 0.5 },
    { freq: 587.33, duration: 1.0 },
    { freq: 659.25, duration: 0.5 },
    { freq: 783.99, duration: 0.5 },
    { freq: 880.00, duration: 0.75 },
    { freq: 783.99, duration: 0.25 },
    { freq: 659.25, duration: 1.0 }
  ];

  // Chords: C maj (261.63, 329.63, 392.00), Am (220, 261.63, 329.63), F (174.61, 220, 261.63), G (196, 246.94, 293.66)
  const chords = [
    [261.63, 329.63, 392.00], // C
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63], // F
    [196.00, 246.94, 293.66]  // G
  ];

  let vocalPhase = 0;
  let musicPhase = [0, 0, 0];
  let bassPhase = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // --- 1. VOCAL STEM (Smooth singing sine wave melody with vibrato) ---
    // Find current note in melody loop
    const loopT = t % 6;
    let noteAcc = 0;
    let currentFreq = 440;
    let noteProgress = 0;

    for (const note of vocalMelody) {
      if (loopT >= noteAcc && loopT < noteAcc + note.duration) {
        currentFreq = note.freq;
        noteProgress = (loopT - noteAcc) / note.duration;
        break;
      }
      noteAcc += note.duration;
    }

    // Vibrato effect (5Hz modulation)
    const vibrato = Math.sin(2 * Math.PI * 5 * t) * 6;
    const effectiveFreq = currentFreq + vibrato;

    vocalPhase += (2 * Math.PI * effectiveFreq) / sampleRate;
    
    // Envelope (Attack & Decay)
    const env = Math.sin(Math.PI * Math.min(1, noteProgress));
    // Soft sine + warm 2nd harmonic
    let vocalSample = (Math.sin(vocalPhase) * 0.7 + Math.sin(vocalPhase * 2) * 0.3) * env * 0.6;

    // --- 2. INSTRUMENTAL STEM (Bassline + Rhythm Pads + Percussion) ---
    const chordIndex = Math.floor((loopT / 6) * 4) % 4;
    const chord = chords[chordIndex];

    // Bass synth (Triangle wave)
    const bassFreq = chord[0] / 2; // 1 octave lower
    bassPhase += (2 * Math.PI * bassFreq) / sampleRate;
    const bassSample = (Math.asin(Math.sin(bassPhase)) / (Math.PI / 2)) * 0.4;

    // Chord pad synth
    let padSample = 0;
    chord.forEach((f, idx) => {
      musicPhase[idx] += (2 * Math.PI * f) / sampleRate;
      padSample += Math.sin(musicPhase[idx]) * 0.15;
    });

    // Percussion beat (Kick on every 0.5s beat)
    const beatPhase = (loopT * 2) % 1;
    const kickFreq = Math.max(40, 150 * (1 - beatPhase));
    const kickSample = Math.sin(2 * Math.PI * kickFreq * t) * Math.exp(-beatPhase * 8) * 0.3;

    let musicSample = (bassSample + padSample + kickSample) * 0.6;

    // Clamp to 16-bit range (-32768 to 32767)
    const vInt = Math.max(-32767, Math.min(32767, Math.floor(vocalSample * 32767)));
    const mInt = Math.max(-32767, Math.min(32767, Math.floor(musicSample * 32767)));

    // Write Stereo Int16
    vocalPcm.writeInt16LE(vInt, i * 4);
    vocalPcm.writeInt16LE(vInt, i * 4 + 2);

    musicPcm.writeInt16LE(mInt, i * 4);
    musicPcm.writeInt16LE(mInt, i * 4 + 2);
  }

  const outDir = path.join(__dirname, '../public/generations');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const vocalHeader = createWavHeader(vocalPcm.length);
  const musicHeader = createWavHeader(musicPcm.length);

  fs.writeFileSync(path.join(outDir, 'sandbox_vocal.wav'), Buffer.concat([vocalHeader, vocalPcm]));
  fs.writeFileSync(path.join(outDir, 'sandbox_instrumental.wav'), Buffer.concat([musicHeader, musicPcm]));

  console.log('Successfully generated sandbox_vocal.wav and sandbox_instrumental.wav');
}

generateAudioFiles();
