// Web Audio API Sound Generator for GTA VI: Vice City Mugshot Lab
// 100% synthesized - zero external audio dependencies or CORS issues

let audioCtx = null;
let synthTimer = null;
let isSynthPlaying = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// UI Click / Keystroke sound
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(640, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // AudioContext blocked or not supported
  }
}

// Wanted Star Level Sound (Chimes higher pitch with more stars)
export function playStarSound(starIndex = 1) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const baseFreqs = [220, 277, 330, 440, 554];
    const freq = baseFreqs[Math.min(starIndex - 1, 4)] || 440;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(freq, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.15);

    osc2.frequency.setValueAtTime(freq * 0.5, ctx.currentTime);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio failures
  }
}

// Camera Shutter Flash Sound
export function playShutterSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // White noise burst + click
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();

    // Secondary mechanical click
    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
        g.gain.setValueAtTime(0.1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch {}
    }, 80);
  } catch {
    // Ignore
  }
}

// Police Radio Dispatch Beep (Authentic VCPD Walkie-Talkie Squelch + 10-99 Dual Chime)
export async function playDispatchSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const startTime = ctx.currentTime;

    // 1. Initial Radio Mic Click / Squelch burst
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 2400;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(startTime);

    // 2. High-Priority Dual Police Tone Chime (10-99 Alert: 920Hz -> 1250Hz)
    const tones = [920, 1250];
    tones.forEach((freq, i) => {
      const toneStart = startTime + 0.05 + i * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, toneStart);

      gain.gain.setValueAtTime(0.22, toneStart);
      gain.gain.exponentialRampToValueAtTime(0.001, toneStart + 0.10);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(toneStart);
      osc.stop(toneStart + 0.10);
    });

    // 3. Ending Radio Release Chirp
    const endSquelchTime = startTime + 0.28;
    const endNoise = ctx.createBufferSource();
    endNoise.buffer = noiseBuffer;
    const endGain = ctx.createGain();
    endGain.gain.setValueAtTime(0.08, endSquelchTime);
    endGain.gain.exponentialRampToValueAtTime(0.001, endSquelchTime + 0.04);
    endNoise.connect(noiseFilter);
    noiseFilter.connect(endGain);
    endGain.connect(ctx.destination);
    endNoise.start(endSquelchTime);
  } catch (err) {
    console.warn("[VCPD Audio] playDispatchSound error:", err);
  }
}

// Check if music is actively playing
export function isSynthwaveMusicPlaying() {
  return isSynthPlaying;
}

// Explicitly start Synthwave Music (idempotent: will NOT toggle off if already running)
export function startSynthwaveMusic(callback) {
  if (isSynthPlaying) {
    if (callback) callback(true);
    return true;
  }

  const ctx = getAudioContext();
  if (!ctx) return false;

  isSynthPlaying = true;
  if (callback) callback(true);

  // Synthwave minor arpeggio sequence (Am - F - C - G vibes)
  const notes = [
    220.0, 261.63, 329.63, 440.0,
    174.61, 220.0, 261.63, 349.23,
    130.81, 164.81, 196.0, 261.63,
    196.0, 246.94, 293.66, 392.0,
  ];

  let step = 0;
  if (synthTimer) clearInterval(synthTimer);
  synthTimer = setInterval(() => {
    if (!isSynthPlaying) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);

      osc.type = 'sawtooth';
      const freq = notes[step % notes.length];
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);

      // Bass note on downbeats
      if (step % 4 === 0) {
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.type = 'triangle';
        bass.frequency.setValueAtTime(freq / 2, now);
        bassGain.gain.setValueAtTime(0.05, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        bass.connect(bassGain);
        bassGain.connect(ctx.destination);
        bass.start(now);
        bass.stop(now + 0.35);
      }

      step = (step + 1) % notes.length;
    } catch {
      // Audio step failure
    }
  }, 190);

  return true;
}

// Explicitly stop Synthwave Music
export function stopSynthwaveMusic(callback) {
  if (synthTimer) clearInterval(synthTimer);
  synthTimer = null;
  isSynthPlaying = false;
  if (callback) callback(false);
  return false;
}

// 80s Vice Synthwave Ambient Loop Generator - Toggle
export function toggleSynthwaveMusic(callback) {
  if (isSynthPlaying) {
    return stopSynthwaveMusic(callback);
  } else {
    return startSynthwaveMusic(callback);
  }
}

// Terminal Key blip sound
export function playTerminalKeySound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  } catch {
    // Ignore audio errors
  }
}

// Terminal Authorization & Access Sound (Tri-tone cyber chime + bass confirmation punch)
export async function playTerminalAccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const t = ctx.currentTime;

    // Ascending electronic cyber chord (520Hz -> 780Hz -> 1040Hz)
    [520, 780, 1040].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = t + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, st + 0.14);

      gain.gain.setValueAtTime(0.18, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(st);
      osc.stop(st + 0.16);
    });

    // Sub-bass confirmation punch (90Hz -> 30Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(90, t + 0.1);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.45);
    subGain.gain.setValueAtTime(0.22, t + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(t + 0.1);
    subOsc.stop(t + 0.45);
  } catch {
    // Ignore audio errors
  }
}

