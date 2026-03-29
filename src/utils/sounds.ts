// Web Audio API — synthesised sound effects

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!_ctx || _ctx.state === 'closed') _ctx = new Ctor();
  void _ctx.resume();
  return _ctx;
}

function osc(ctx: AudioContext, freq: number, type: OscillatorType = 'sine'): OscillatorNode {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  return o;
}

function gn(ctx: AudioContext, value = 0): GainNode {
  const g = ctx.createGain();
  g.gain.value = value;
  return g;
}

function noise(ctx: AudioContext, duration: number): AudioBufferSourceNode {
  const sr = ctx.sampleRate;
  const len = Math.ceil(sr * duration);
  const buf = ctx.createBuffer(1, len, sr);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

// ── Short punchy click on each pick ──────────────────────────────────────
export function playPickSound(roundIndex: number): void {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const freq = Math.max(130, 500 - roundIndex * 55);
    const vol  = 0.20 + roundIndex * 0.04;

    const o = osc(ctx, freq);
    const g = gn(ctx);
    o.connect(g); g.connect(ctx.destination);

    o.frequency.setValueAtTime(freq * 1.5, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.45, t + 0.16);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    o.start(t); o.stop(t + 0.27);
  } catch { /* silent fail */ }
}

// ── Quarterfinal — metallic reveal ──────────────────────────────────────
export function playQuarterFinalSound(): void {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const D = ctx.destination;

    // Low boom
    const boom = osc(ctx, 80);
    const boomG = gn(ctx);
    boom.connect(boomG); boomG.connect(D);
    boomG.gain.linearRampToValueAtTime(0.50, t + 0.01);
    boomG.gain.exponentialRampToValueAtTime(0.001, t + 0.90);
    boom.start(t); boom.stop(t + 1.0);

    // Brass stab with filter sweep
    const brass = osc(ctx, 220, 'sawtooth');
    const bF = ctx.createBiquadFilter();
    bF.type = 'lowpass'; bF.frequency.value = 600;
    bF.frequency.exponentialRampToValueAtTime(3500, t + 1.0);
    const bG = gn(ctx);
    brass.connect(bF); bF.connect(bG); bG.connect(D);
    bG.gain.linearRampToValueAtTime(0.18, t + 0.06);
    bG.gain.setValueAtTime(0.18, t + 0.80);
    bG.gain.exponentialRampToValueAtTime(0.001, t + 1.60);
    brass.start(t + 0.05); brass.stop(t + 1.7);

    // High bell shimmer
    const bell = osc(ctx, 1760);
    const bellG = gn(ctx);
    bell.connect(bellG); bellG.connect(D);
    bellG.gain.linearRampToValueAtTime(0.10, t + 0.85);
    bellG.gain.exponentialRampToValueAtTime(0.001, t + 2.30);
    bell.start(t + 0.83); bell.stop(t + 2.4);
  } catch { /* silent fail */ }
}

// ── Semifinal — orchestral hit + cymbal ─────────────────────────────────
export function playSemiFinalSound(): void {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const D = ctx.destination;

    // Sub bass
    const sub = osc(ctx, 55);
    const subG = gn(ctx);
    sub.connect(subG); subG.connect(D);
    subG.gain.linearRampToValueAtTime(0.60, t + 0.02);
    subG.gain.exponentialRampToValueAtTime(0.001, t + 1.20);
    sub.start(t); sub.stop(t + 1.3);

    // Octave sub
    const sub2 = osc(ctx, 110);
    const sub2G = gn(ctx);
    sub2.connect(sub2G); sub2G.connect(D);
    sub2G.gain.linearRampToValueAtTime(0.28, t + 0.02);
    sub2G.gain.exponentialRampToValueAtTime(0.001, t + 1.40);
    sub2.start(t); sub2.stop(t + 1.5);

    // Am chord (staggered): 220, 261, 330, 440
    const chordNotes: [number, number][] = [[220, 0.15], [261, 0.13], [330, 0.11], [440, 0.08]];
    chordNotes.forEach(([freq, vol], i) => {
      const o = osc(ctx, freq, 'sawtooth');
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 600;
      f.frequency.exponentialRampToValueAtTime(4000, t + 1.5);
      const g = gn(ctx);
      o.connect(f); f.connect(g); g.connect(D);
      g.gain.linearRampToValueAtTime(vol, t + 0.06 + i * 0.04);
      g.gain.setValueAtTime(vol, t + 1.20);
      g.gain.exponentialRampToValueAtTime(0.001, t + 2.80);
      o.start(t + 0.05 + i * 0.04); o.stop(t + 2.9);
    });

    // Cinematic sweep
    const sw = osc(ctx, 110);
    const swG = gn(ctx);
    sw.connect(swG); swG.connect(D);
    sw.frequency.exponentialRampToValueAtTime(1400, t + 2.2);
    swG.gain.linearRampToValueAtTime(0.09, t + 0.15);
    swG.gain.setValueAtTime(0.09, t + 1.80);
    swG.gain.exponentialRampToValueAtTime(0.001, t + 3.00);
    sw.start(t + 0.1); sw.stop(t + 3.1);

    // Crash cymbal
    const crash = noise(ctx, 1.5);
    const cF = ctx.createBiquadFilter();
    cF.type = 'highpass'; cF.frequency.value = 4000;
    const cG = gn(ctx);
    crash.connect(cF); cF.connect(cG); cG.connect(D);
    cG.gain.linearRampToValueAtTime(0.14, t + 0.01);
    cG.gain.exponentialRampToValueAtTime(0.001, t + 1.50);
    crash.start(t); crash.stop(t + 1.6);
  } catch { /* silent fail */ }
}

// ── Grand Final — cinematic epic fanfare ────────────────────────────────
export function playFinalSound(): void {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const D = ctx.destination;

    // Reverb via delay feedback loop
    const rev = ctx.createDelay(0.6);
    rev.delayTime.value = 0.18;
    const fb = gn(ctx, 0.38);
    rev.connect(fb); fb.connect(rev); rev.connect(D);

    // Double sub
    const subPairs: [number, number][] = [[40, 0.50], [80, 0.38]];
    subPairs.forEach(([freq, vol]) => {
      const o = osc(ctx, freq);
      const g = gn(ctx);
      o.connect(g); g.connect(D);
      g.gain.linearRampToValueAtTime(vol, t + 0.03);
      g.gain.setValueAtTime(vol, t + 0.90);
      g.gain.exponentialRampToValueAtTime(0.001, t + 2.20);
      o.start(t); o.stop(t + 2.3);
    });

    // Thunder crack
    const thunder = noise(ctx, 0.5);
    const thF = ctx.createBiquadFilter();
    thF.type = 'lowpass'; thF.frequency.value = 280;
    const thG = gn(ctx);
    thunder.connect(thF); thF.connect(thG); thG.connect(rev);
    thG.gain.linearRampToValueAtTime(0.85, t + 0.005);
    thG.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    thunder.start(t); thunder.stop(t + 0.5);

    // Dm orchestral chord: 147 175 220 294 440 587
    const orcNotes: [number, number][] = [
      [147, 0.19], [175, 0.17], [220, 0.15], [294, 0.13], [440, 0.10], [587, 0.07],
    ];
    orcNotes.forEach(([freq, vol], i) => {
      const o = osc(ctx, freq, 'sawtooth');
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 500;
      f.frequency.exponentialRampToValueAtTime(5000, t + 1.8);
      const g = gn(ctx);
      o.connect(f); f.connect(g); g.connect(rev); g.connect(D);
      g.gain.linearRampToValueAtTime(vol, t + 0.28 + i * 0.035);
      g.gain.setValueAtTime(vol, t + 2.80);
      g.gain.exponentialRampToValueAtTime(0.001, t + 5.00);
      o.start(t + 0.25 + i * 0.035); o.stop(t + 5.1);
    });

    // Cinematic swell
    const swell = osc(ctx, 80);
    const swellG = gn(ctx);
    swell.connect(swellG); swellG.connect(rev); swellG.connect(D);
    swell.frequency.exponentialRampToValueAtTime(900, t + 4.0);
    swellG.gain.linearRampToValueAtTime(0.11, t + 0.5);
    swellG.gain.setValueAtTime(0.11, t + 3.5);
    swellG.gain.exponentialRampToValueAtTime(0.001, t + 5.0);
    swell.start(t + 0.2); swell.stop(t + 5.1);

    // High metallic shimmer
    const shim = osc(ctx, 3520);
    const shimG = gn(ctx);
    shim.connect(shimG); shimG.connect(D);
    shimG.gain.linearRampToValueAtTime(0.04, t + 2.8);
    shimG.gain.setValueAtTime(0.04, t + 3.5);
    shimG.gain.exponentialRampToValueAtTime(0.001, t + 5.5);
    shim.start(t + 2.7); shim.stop(t + 5.6);

    // Crash cymbal
    const crash = noise(ctx, 2.5);
    const crF = ctx.createBiquadFilter();
    crF.type = 'highpass'; crF.frequency.value = 3500;
    const crG = gn(ctx);
    crash.connect(crF); crF.connect(crG); crG.connect(D);
    crG.gain.linearRampToValueAtTime(0.18, t + 0.01);
    crG.gain.exponentialRampToValueAtTime(0.001, t + 2.50);
    crash.start(t); crash.stop(t + 2.6);
  } catch { /* silent fail */ }
}
