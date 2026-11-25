// Warung Kilat — sound effects, synthesized with WebAudio.
// One job: every sizzle, chop, ding and coin sound, made from oscillators and
// filtered noise. No audio files, nothing fetched, nothing copied.

let ctx = null;
let muted = false;

function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setMuted(value) {
  muted = !!value;
}

export function isMuted() {
  return muted;
}

function tone(freq, dur, type, gain, when = 0, slideTo = null) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch (e) { /* sound is decoration; never break the game */ }
}

function noiseBurst(dur, gain, filterFreq, when = 0) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + when;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.8;
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(ac.destination);
    src.start(t0);
  } catch (e) { /* sound is decoration; never break the game */ }
}

// Named effects. Each one is a tiny recipe of tones and noise bursts.
export function sfx(name) {
  if (muted) return;
  switch (name) {
    case 'click':
      tone(660, 0.06, 'sine', 0.08);
      break;
    case 'pick':
      tone(520, 0.07, 'triangle', 0.1, 0, 760);
      break;
    case 'place':
      tone(330, 0.08, 'triangle', 0.12, 0, 240);
      break;
    case 'chop':
      noiseBurst(0.09, 0.25, 1800);
      tone(180, 0.05, 'square', 0.05);
      break;
    case 'sizzle':
      noiseBurst(0.35, 0.1, 5200);
      break;
    case 'ready':
      tone(880, 0.12, 'sine', 0.12);
      tone(1174, 0.16, 'sine', 0.1, 0.09);
      break;
    case 'serve':
      tone(523, 0.1, 'sine', 0.12);
      tone(659, 0.1, 'sine', 0.12, 0.08);
      tone(784, 0.18, 'sine', 0.14, 0.16);
      break;
    case 'coin':
      tone(988, 0.08, 'square', 0.06);
      tone(1319, 0.14, 'square', 0.06, 0.07);
      break;
    case 'error':
      tone(160, 0.16, 'sawtooth', 0.1, 0, 110);
      break;
    case 'lost':
      tone(392, 0.14, 'sine', 0.1, 0, 300);
      tone(311, 0.2, 'sine', 0.1, 0.12, 233);
      break;
    case 'levelup':
      tone(523, 0.1, 'sine', 0.12);
      tone(659, 0.1, 'sine', 0.12, 0.09);
      tone(784, 0.1, 'sine', 0.12, 0.18);
      tone(1047, 0.22, 'sine', 0.14, 0.27);
      break;
    case 'tick':
      tone(1200, 0.04, 'sine', 0.06);
      break;
    default:
      break;
  }
}
