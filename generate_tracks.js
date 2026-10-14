const fs = require('fs');
const path = require('path');

function writeWav(filePath, durationSec, sampleFn) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2 * 2; // 16-bit stereo (4 bytes per sample frame)
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(2, 22); // Stereo
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 4, 28); // Byte rate
  buffer.writeUInt16LE(4, 32); // Block align
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const [left, right] = sampleFn(t);
    const lClamped = Math.max(-1, Math.min(1, left));
    const rClamped = Math.max(-1, Math.min(1, right));
    buffer.writeInt16LE(Math.floor(lClamped * 32767), 44 + i * 4);
    buffer.writeInt16LE(Math.floor(rClamped * 32767), 44 + i * 4 + 2);
  }

  fs.writeFileSync(filePath, buffer);
  console.log('Saved:', path.basename(filePath), (buffer.length / 1024 / 1024).toFixed(2), 'MB');
}

const tracksDir = path.join(__dirname, 'tracks');
if (!fs.existsSync(tracksDir)) fs.mkdirSync(tracksDir, { recursive: true });

// 1. WARZONE PHONK DRIFT (136 BPM)
// Heavy 808s, metallic cowbell melody, trap drums
writeWav(path.join(tracksDir, 'phonk_drift.wav'), 60, (t) => {
  const bpm = 136;
  const beat = 60 / bpm;
  const bar = beat * 4;

  // Kick: beats 0, 1.5, 2, 3
  const beatInBar = (t % bar) / beat;
  let kick = 0;
  const kTrigs = [0, 1.5, 2.0, 3.0];
  for (const trig of kTrigs) {
    const dt = (t % bar) - trig * beat;
    if (dt >= 0 && dt < 0.25) {
      const f = 45 + 110 * Math.exp(-dt * 30);
      kick += Math.sin(2 * Math.PI * f * dt) * Math.exp(-dt * 8) * 1.3;
    }
  }

  // Snare: beats 1 and 3
  let snare = 0;
  for (const trig of [1, 3]) {
    const dt = (t % bar) - trig * beat;
    if (dt >= 0 && dt < 0.22) {
      const noise = (Math.random() * 2 - 1) * Math.exp(-dt * 26);
      const tone = Math.sin(2 * Math.PI * 210 * dt) * Math.exp(-dt * 32);
      snare += (noise * 0.7 + tone * 0.4);
    }
  }

  // Phonk Cowbell: iconic minor pentatonic hook
  const notes = [440, 523.25, 659.25, 783.99, 659.25, 523.25, 440, 392];
  const bellIdx = Math.floor((t % (beat * 4)) / (beat / 2)) % notes.length;
  const bFreq = notes[bellIdx];
  const bTime = t % (beat / 2);
  const bell = (Math.sin(2 * Math.PI * bFreq * bTime) + 0.35 * Math.sin(2 * Math.PI * bFreq * 2.76 * bTime)) * Math.exp(-bTime * 14) * 0.42;

  // Hi-hats 16th notes
  const hTime = t % (beat / 4);
  const hatL = (Math.random() * 2 - 1) * Math.exp(-hTime * 90) * 0.12;
  const hatR = (Math.random() * 2 - 1) * Math.exp(-hTime * 90) * 0.12;

  // 808 Sub Bass
  const bassNotes = [55, 55, 65.4, 49];
  const subFreq = bassNotes[Math.floor((t % bar) / beat) % bassNotes.length];
  let sub = Math.sin(2 * Math.PI * subFreq * t);
  sub = Math.tanh(sub * 2.8) * 0.4;

  const monoMix = kick * 0.8 + snare * 0.6 + bell * 0.7 + sub;
  return [monoMix + hatL, monoMix + hatR];
});

// 2. DARK 808 DRILL (140 BPM)
// Sliding 808 bass, dark detuned bells, rapid drill hats
writeWav(path.join(tracksDir, 'dark_808_drill.wav'), 60, (t) => {
  const bpm = 140;
  const beat = 60 / bpm;
  const bar = beat * 4;

  // Punchy Drill Kick
  const kTrigs = [0, 1.75, 2.5];
  let kick = 0;
  for (const trig of kTrigs) {
    const dt = (t % bar) - trig * beat;
    if (dt >= 0 && dt < 0.22) {
      const f = 40 + 90 * Math.exp(-dt * 35);
      kick += Math.sin(2 * Math.PI * f * dt) * Math.exp(-dt * 10) * 1.3;
    }
  }

  // Snare on beat 2
  let snare = 0;
  const sdt = (t % bar) - 2 * beat;
  if (sdt >= 0 && sdt < 0.2) {
    snare = (Math.random() * 2 - 1) * Math.exp(-sdt * 24) * 0.8;
  }

  // Sliding 808 sub with pitch drop
  const subMod = (t % (beat * 2));
  const slideFreq = 50 - 15 * (subMod / (beat * 2));
  let sub = Math.sin(2 * Math.PI * slideFreq * t);
  sub = Math.tanh(sub * 3.2) * 0.45;

  // Dark minor bell
  const darkNotes = [330, 392, 330, 494];
  const nFreq = darkNotes[Math.floor((t % bar) / beat) % darkNotes.length];
  const bTime = t % beat;
  const bell = Math.sin(2 * Math.PI * nFreq * bTime) * Math.exp(-bTime * 6) * 0.28;

  // Rapid drill hihat rolls
  const hdt = t % (beat / 6);
  const hat = (Math.random() * 2 - 1) * Math.exp(-hdt * 100) * 0.14;

  const m = kick * 0.9 + snare * 0.7 + sub + bell;
  return [m + hat * 0.8, m + hat * 1.2];
});

// 3. CYBER COMBAT RUSH (148 BPM)
// Fast electronic synth, driving bass, high energy
writeWav(path.join(tracksDir, 'cyber_rush.wav'), 60, (t) => {
  const bpm = 148;
  const beat = 60 / bpm;
  const bar = beat * 4;

  // Four on the floor kick
  const kTime = t % beat;
  let kick = 0;
  if (kTime < 0.2) {
    const f = 50 + 130 * Math.exp(-kTime * 35);
    kick = Math.sin(2 * Math.PI * f * kTime) * Math.exp(-kTime * 12) * 1.2;
  }

  // Driving 16th note synth bass (saw wave approximation)
  const synthTime = t % (beat / 4);
  const sFreq = 65.4;
  let saw = 0;
  for (let h = 1; h <= 6; h++) {
    saw += (1 / h) * Math.sin(2 * Math.PI * sFreq * h * t);
  }
  saw = Math.tanh(saw * 1.8) * Math.exp(-synthTime * 10) * 0.35;

  // Clap on 1 and 3
  let clap = 0;
  for (const trig of [1, 3]) {
    const dt = (t % bar) - trig * beat;
    if (dt >= 0 && dt < 0.18) {
      clap += (Math.random() * 2 - 1) * Math.exp(-dt * 30) * 0.6;
    }
  }

  const mix = kick * 0.85 + saw + clap * 0.7;
  return [mix, mix];
});

// 4. SUSPENSE COUNTDOWN & DROP (130 BPM)
// Ticking clock riser with heartbeats and heavy drop
writeWav(path.join(tracksDir, 'suspense_drop.wav'), 60, (t) => {
  const bpm = 130;
  const beat = 60 / bpm;
  const cycle = 12; // 12-second tension cycle
  const phase = t % cycle;

  let out = 0;
  if (phase < 6) {
    // Ticking clock + low heartbeat
    const tickTime = t % (beat / 2);
    const tick = Math.sin(2 * Math.PI * 1800 * tickTime) * Math.exp(-tickTime * 120) * 0.3;
    const hbTime = t % beat;
    const hb = Math.sin(2 * Math.PI * 45 * hbTime) * Math.exp(-hbTime * 15) * 0.5;
    // Riser sweep
    const riserFreq = 100 + 400 * (phase / 6);
    const riser = Math.sin(2 * Math.PI * riserFreq * t) * (phase / 6) * 0.25;
    out = tick + hb + riser;
  } else {
    // DROP! Heavy 808 and phonk beat
    const dTime = phase - 6;
    const kTime = dTime % beat;
    const kick = Math.sin(2 * Math.PI * (45 + 100 * Math.exp(-kTime * 30)) * kTime) * Math.exp(-kTime * 8) * 1.2;
    const sub = Math.sin(2 * Math.PI * 55 * t) * 0.45;
    const snareTime = (dTime - beat) % (beat * 2);
    let snare = 0;
    if (snareTime >= 0 && snareTime < 0.2) snare = (Math.random() * 2 - 1) * Math.exp(-snareTime * 25) * 0.7;
    out = kick * 0.9 + sub + snare;
  }

  return [out, out];
});

console.log('All 4 Warzone viral tracks generated successfully!');
