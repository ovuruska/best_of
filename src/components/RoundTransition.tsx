import { useEffect, useRef } from 'react';
import { motion, useAnimate } from 'framer-motion';
import type { AnimationPlaybackControls } from 'framer-motion';
import confetti from 'canvas-confetti';

export type TransitionType = 'quarterfinal' | 'semifinal' | 'final';

interface Props {
  type: TransitionType;
  accentColor: string;
  onComplete: () => void;
}

// ── Static particle data ──────────────────────────────────────────────────

const QF_SPARKS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: (i / 22) * 110 - 5,
  delay: (i * 0.19) % 2.0,
  duration: 1.8 + (i % 5) * 0.3,
  size: 4 + (i % 4),
  drift: ((i % 7) - 3) * 30,
  opacity: 0.6 + (i % 4) * 0.1,
}));

const SF_SPARKS = Array.from({ length: 38 }, (_, i) => ({
  id: i,
  x: (i / 38) * 108 - 4,
  delay: (i * 0.13) % 2.5,
  duration: 1.4 + (i % 6) * 0.28,
  size: 4 + (i % 5),
  drift: ((i % 9) - 4) * 36,
  opacity: 0.65 + (i % 4) * 0.09,
}));

const FINAL_SPARKS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  x: (i / 55) * 112 - 6,
  delay: (i * 0.09) % 3.0,
  duration: 1.1 + (i % 7) * 0.22,
  size: 4 + (i % 6),
  drift: ((i % 11) - 5) * 40,
  opacity: 0.7 + (i % 4) * 0.075,
}));

const FINAL_CRACKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * 360;
  const rad = (angle * Math.PI) / 180;
  const dist = 280 + (i % 3) * 60;
  return {
    id: i,
    x2: 500 + Math.cos(rad) * dist,
    y2: 350 + Math.sin(rad) * dist,
    len: dist,
    delay: i * 0.03,
    opacity: 0.2 + (i % 3) * 0.15,
  };
});

// ── Config per type ───────────────────────────────────────────────────────

const CONFIG = {
  quarterfinal: {
    icon: '⚔️',
    title: 'QUARTERFINALS',
    subtitle: 'The elite 8 remain',
    sparkColor: '#f59e0b',
    bgGlow: '#f59e0b33',
    duration: 2800,
    sparks: QF_SPARKS,
    textDelay: 0.4,
    shake: { x: [0, -8, 8, -5, 5, 0], y: [0, 6, -6, 3, -3, 0], dur: 0.5 },
  },
  semifinal: {
    icon: '🔥',
    title: 'SEMIFINALS',
    subtitle: 'Only the final 4 remain',
    sparkColor: '#f97316',
    bgGlow: '#f9731633',
    duration: 3800,
    sparks: SF_SPARKS,
    textDelay: 0.5,
    shake: { x: [0, -16, 16, -11, 11, -6, 6, 0], y: [0, 12, -12, 8, -8, 4, -4, 0], dur: 0.7 },
  },
  final: {
    icon: '💥',
    title: 'THE GRAND FINAL',
    subtitle: 'One champion. One throne.',
    sparkColor: '#dc2626',
    bgGlow: '#dc262633',
    duration: 5000,
    sparks: FINAL_SPARKS,
    textDelay: 1.2,
    shake: { x: [0, -28, 28, -20, 20, -13, 13, -7, 7, -3, 3, 0], y: [0, 22, -22, 16, -16, 10, -10, 5, -5, 2, -2, 0], dur: 0.85 },
  },
} as const;

// ── Component ─────────────────────────────────────────────────────────────

export function RoundTransition({ type, accentColor, onComplete }: Props) {
  const cfg = CONFIG[type];
  const [scope, animateScope] = useAnimate();
  const tremorRef = useRef<AnimationPlaybackControls | null>(null);
  const hasFired = useRef(false);

  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(onComplete, cfg.duration);
    return () => clearTimeout(t);
  }, [cfg.duration, onComplete]);

  // Screen shake
  useEffect(() => {
    if (!scope.current) return;
    const t = setTimeout(() => {
      void animateScope(scope.current, { x: cfg.shake.x, y: cfg.shake.y }, { duration: cfg.shake.dur });
    }, type === 'final' ? 300 : 100);
    return () => clearTimeout(t);
  }, [animateScope, cfg, scope, type]);

  // Subtle tremor after shake (final only)
  useEffect(() => {
    if (type !== 'final' || !scope.current) return;
    const t = setTimeout(() => {
      tremorRef.current = animateScope(
        scope.current,
        { x: [0, -2, 2, -1, 1, 0], y: [0, 1, -1, 0.5, -0.5, 0] },
        { duration: 1.8, repeat: Infinity, repeatDelay: 1.0 },
      );
    }, 1200);
    return () => {
      clearTimeout(t);
      tremorRef.current?.stop();
    };
  }, [animateScope, scope, type]);

  // Confetti for SF and Final
  useEffect(() => {
    if (type === 'quarterfinal') return;
    if (hasFired.current) return;
    hasFired.current = true;

    const count = type === 'final' ? 180 : 90;
    const delay = type === 'final' ? 900 : 400;

    setTimeout(() => {
      confetti({
        particleCount: count,
        spread: type === 'final' ? 140 : 100,
        origin: { y: 0.5 },
        colors: [accentColor, cfg.sparkColor, '#ffffff', '#ffd700'],
        startVelocity: type === 'final' ? 60 : 40,
      });
    }, delay);

    if (type === 'final') {
      // Second burst
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 } });
        confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 } });
      }, 1400);
    }
  }, [type, accentColor, cfg.sparkColor]);

  const isFinal = type === 'final';
  const titleSize = isFinal ? 'text-5xl md:text-7xl' : type === 'semifinal' ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl';

  return (
    <motion.div
      ref={scope}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ background: 'rgba(0,0,0,0.96)', willChange: 'transform' }}
    >
      {/* Lightning flashes for SF + Final */}
      {(type === 'semifinal' || type === 'final') && (
        <motion.div
          className="absolute inset-0 bg-white pointer-events-none"
          animate={{ opacity: type === 'final' ? [0, 0.9, 0, 0.7, 0, 0.4, 0] : [0, 0.6, 0, 0.4, 0] }}
          transition={{ duration: type === 'final' ? 0.55 : 0.4, delay: 0.05 }}
        />
      )}

      {/* Accent flash on shake */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: cfg.sparkColor }}
        initial={{ opacity: isFinal ? 0.45 : 0.25 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.55, delay: type === 'final' ? 0.32 : 0.12 }}
      />

      {/* Background radial glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${cfg.bgGlow} 0%, transparent 70%)` }}
        animate={{ opacity: [0, 1, 0.7, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
      />

      {/* SVG cracks — Final only */}
      {isFinal && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
          {FINAL_CRACKS.map(c => (
            <motion.line
              key={c.id}
              x1={500} y1={350} x2={c.x2} y2={c.y2}
              stroke="white" strokeWidth={1.5} strokeLinecap="round"
              strokeDasharray={`${c.len}`}
              initial={{ strokeDashoffset: c.len, opacity: 0 }}
              animate={{ strokeDashoffset: [c.len, 0, 0, 0], opacity: [0, c.opacity, c.opacity * 0.6, 0] }}
              transition={{ duration: 2.5, delay: 0.4 + c.delay, times: [0, 0.2, 0.55, 1] }}
            />
          ))}
        </svg>
      )}

      {/* Spark particles — rising from bottom */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {cfg.sparks.map(s => (
          <motion.div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              bottom: `${5 + (s.id % 8) * 3}%`,
              width: s.size,
              height: s.size,
              background: cfg.sparkColor,
              boxShadow: `0 0 ${s.size * 2}px ${cfg.sparkColor}`,
              filter: 'blur(0.5px)',
            }}
            animate={{
              y: [0, -(500 + s.id * 5)],
              x: [0, s.drift],
              opacity: [0, s.opacity, s.opacity * 0.7, 0],
              scale: [0.4, 1.2, 0.5, 0],
            }}
            transition={{ repeat: Infinity, duration: s.duration, delay: s.delay, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6">
        {/* Icon */}
        <motion.div
          className="text-7xl select-none"
          initial={{ scale: 0, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 15, delay: isFinal ? 0.9 : 0.2 }}
          style={{ filter: `drop-shadow(0 0 20px ${cfg.sparkColor})` }}
        >
          {cfg.icon}
        </motion.div>

        {/* "Now entering" label */}
        <motion.p
          className="text-xs font-black uppercase tracking-[0.4em] text-white/40"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: cfg.textDelay + 0.05 }}
        >
          Now Entering
        </motion.p>

        {/* Main title */}
        <motion.h1
          className={`font-black leading-none tracking-tighter text-white ${titleSize}`}
          initial={{ scale: isFinal ? 5 : 3, opacity: 0, filter: 'blur(20px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: cfg.textDelay }}
          style={{
            textShadow: `0 0 40px ${cfg.sparkColor}cc, 0 0 100px ${cfg.sparkColor}55`,
          }}
        >
          {cfg.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-white/55 text-lg font-medium"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: cfg.textDelay + 0.25 }}
        >
          {cfg.subtitle}
        </motion.p>

        {/* Pulsing accent line */}
        <motion.div
          className="h-1 rounded-full mt-2"
          style={{ background: `linear-gradient(90deg, transparent, ${cfg.sparkColor}, transparent)` }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: isFinal ? 320 : 240, opacity: 1 }}
          transition={{ delay: cfg.textDelay + 0.4, duration: 0.5 }}
        />

        {/* Countdown dots */}
        <motion.div
          className="flex gap-2 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: cfg.textDelay + 0.5 }}
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: cfg.sparkColor }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.25 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Corner accent flares */}
      {[
        'top-0 left-0 origin-top-left',
        'top-0 right-0 origin-top-right rotate-90',
        'bottom-0 left-0 origin-bottom-left -rotate-90',
        'bottom-0 right-0 origin-bottom-right rotate-180',
      ].map((cls, i) => (
        <motion.div
          key={i}
          className={`absolute w-32 h-32 pointer-events-none ${cls}`}
          style={{
            background: `linear-gradient(135deg, ${cfg.sparkColor}55, transparent)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.8, 0.5, 0.8], scale: 1 }}
          transition={{ delay: cfg.textDelay + 0.1 + i * 0.08, duration: 0.4 }}
        />
      ))}
    </motion.div>
  );
}
