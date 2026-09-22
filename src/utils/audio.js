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

// Police Radio Dispatch Beep
export function playDispatchSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    [880, 1174].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (i + 1) * 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + (i + 1) * 0.07);
    });
  } catch {}
}

// 80s Vice Synthwave Ambient Loop Generator
export function toggleSynthwaveMusic(callback) {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (isSynthPlaying) {
    if (synthTimer) clearInterval(synthTimer);
    synthTimer = null;
    isSynthPlaying = false;
    if (callback) callback(false);
    return false;
  }

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
