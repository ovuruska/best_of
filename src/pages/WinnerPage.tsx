import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useTournament } from '../context/TournamentContext';
import type { AnimationPlaybackControls } from 'framer-motion';

// ─── Static scene data (deterministic, computed once) ────────────────────

const CRACK_COUNT = 20;
const CRACKS = Array.from({ length: CRACK_COUNT }, (_, i) => {
  const angle = (i / CRACK_COUNT) * 360 + (i % 3) * 9;
  const rad = (angle * Math.PI) / 180;
  const dist = 370 + (i % 4) * 65;
  const dx = Math.cos(rad) * dist;
  const dy = Math.sin(rad) * dist;
  return {
    id: i,
    x2: 500 + dx,
    y2: 350 + dy,
    lineLen: Math.sqrt(dx * dx + dy * dy),
    delay: i * 0.02,
    opacity: 0.2 + (i % 3) * 0.25,
    width: 1 + (i % 3) * 0.8,
  };
});

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

const SHARD_COUNT = IS_MOBILE ? 8 : 20;
const SHARDS = Array.from({ length: SHARD_COUNT }, (_, i) => {
  const angle = (i / SHARD_COUNT) * 360 + 8;
  const rad = (angle * Math.PI) / 180;
  const dist = 520 + (i % 5) * 90;
  return {
    id: i,
    tx: Math.cos(rad) * dist,
    ty: Math.sin(rad) * dist,
    rotate: angle + 90,
    size: 50 + (i % 6) * 20,
    delay: 0.03 + (i % 5) * 0.022,
    opacity: 0.7 + (i % 3) * 0.15,
  };
});

const FLAME_COUNT = IS_MOBILE ? 6 : 16;
const FLAME_COLORS = ['#ffee00', '#ff9900', '#ff5500', '#ff2200'];
const FLAMES = Array.from({ length: FLAME_COUNT }, (_, i) => ({
  id: i,
  x: (i / (FLAME_COUNT - 1)) * 100,
  width: 50 + (i % 5) * 30,
  height: 150 + (i % 4) * 100,
  entryDelay: (i % 6) * 0.09,
  loopDuration: 0.6 + (i % 5) * 0.14,
  loopDelay: (i % 7) * 0.08,
  opacity: 0.5 + (i % 4) * 0.12,
  colorIdx: i % 4,
  blur: 5 + (i % 4) * 4,
}));

const EMBER_COUNT = IS_MOBILE ? 12 : 30;
const EMBERS = Array.from({ length: EMBER_COUNT }, (_, i) => ({
  id: i,
  x: (i / EMBER_COUNT) * 106 - 3,
  delay: (i * 0.27) % 3.8,
  duration: 2.0 + (i % 7) * 0.5,
  size: 3 + (i % 4),
  xDrift: ((i % 9) - 4) * 24,
  opacity: 0.55 + (i % 4) * 0.15,
}));

// ─── Sub-components ──────────────────────────────────────────────────────

function CrackOverlay({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid slice"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.5, delay: 0.5 } }}
        >
          {CRACKS.map(c => (
            <motion.line
              key={c.id}
              x1={500} y1={350}
              x2={c.x2} y2={c.y2}
              stroke="white"
              strokeWidth={c.width}
              strokeLinecap="round"
              strokeDasharray={`${c.lineLen}`}
              initial={{ strokeDashoffset: c.lineLen, opacity: 0 }}
              animate={{
                strokeDashoffset: [c.lineLen, 0, 0, 0],
                opacity: [0, c.opacity, c.opacity * 0.7, 0],
              }}
              transition={{
                duration: 2.0,
                delay: c.delay,
                times: [0, 0.2, 0.5, 1],
              }}
            />
          ))}
          {/* Secondary sub-cracks for depth */}
          {CRACKS.filter((_, i) => i % 3 === 0).map(c => (
            <motion.line
              key={`sub-${c.id}`}
              x1={500 + c.x2 * 0.2} y1={350 + c.y2 * 0.2}
              x2={c.x2 * 0.85} y2={c.y2 * 0.85}
              stroke="white"
              strokeWidth={0.6}
              strokeLinecap="round"
              strokeDasharray={`${c.lineLen * 0.5}`}
              initial={{ strokeDashoffset: c.lineLen * 0.5, opacity: 0 }}
              animate={{
                strokeDashoffset: [c.lineLen * 0.5, 0, 0, 0],
                opacity: [0, c.opacity * 0.5, c.opacity * 0.3, 0],
              }}
              transition={{
                duration: 2.0,
                delay: c.delay + 0.08,
                times: [0, 0.25, 0.55, 1],
              }}
            />
          ))}
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

function ShardOverlay({ active, accentColor }: { active: boolean; accentColor: string }) {
  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
          {SHARDS.map(s => (
            <motion.div
              key={s.id}
              className="absolute"
              style={{
                width: s.size,
                height: s.size,
                background: `linear-gradient(135deg, rgba(255,255,255,0.95), ${accentColor})`,
                clipPath: 'polygon(50% 0%, 15% 100%, 85% 100%)',
                willChange: 'transform, opacity',
              }}
              initial={{ x: 0, y: 0, rotate: 0, scale: 0, opacity: 0 }}
              animate={{
                x: s.tx,
                y: s.ty,
                rotate: s.rotate + 360,
                scale: [0, 1.8, 0.6, 0],
                opacity: [0, s.opacity, s.opacity * 0.6, 0],
              }}
              transition={{
                duration: 1.1,
                delay: s.delay,
                ease: [0.2, 0.6, 0.4, 1],
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

function FlameLayer({ active, accentColor }: { active: boolean; accentColor: string }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
          style={{ height: '50%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {FLAMES.map(f => {
            const baseColor = FLAME_COLORS[f.colorIdx] ?? '#ff4400';
            const glowColor = f.colorIdx < 2 ? accentColor : '#ff2200';
            return (
              <motion.div
                key={f.id}
                className="absolute bottom-0"
                style={{
                  left: `${f.x}%`,
                  width: f.width,
                  height: f.height,
                  opacity: 0,
                  transformOrigin: 'bottom center',
                }}
                animate={{ opacity: f.opacity }}
                transition={{ duration: 0.4, delay: f.entryDelay }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at 50% 90%, ${baseColor}, ${glowColor} 45%, transparent 85%)`,
                    borderRadius: '48% 48% 22% 22% / 58% 58% 35% 35%',
                    filter: `blur(${f.blur}px)`,
                    transformOrigin: 'bottom center',
                  }}
                  animate={{
                    scaleY: [0.85, 1.35, 0.9, 1.25, 0.8, 1.15, 0.85],
                    scaleX: [1, 0.82, 1.12, 0.88, 1.06, 0.94, 1],
                    x: [0, 4, -7, 9, -5, 6, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: f.loopDuration,
                    delay: f.loopDelay,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            );
          })}
          {/* Ground glow */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${accentColor}66, transparent)`,
              filter: 'blur(8px)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmberField({ active, accentColor }: { active: boolean; accentColor: string }) {
  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {EMBERS.map(e => (
            <motion.div
              key={e.id}
              className="absolute rounded-full"
              style={{
                left: `${e.x}%`,
                bottom: `${5 + (e.id % 10) * 3}%`,
                width: e.size,
                height: e.size,
                background: accentColor,
                filter: `blur(1px)`,
                boxShadow: `0 0 ${e.size * 2}px ${accentColor}`,
              }}
              animate={{
                y: [0, -(550 + e.id * 6)],
                x: [0, e.xDrift],
                opacity: [0, e.opacity, e.opacity * 0.7, 0],
                scale: [0.4, 1.1, 0.5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: e.duration,
                delay: e.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

function ImpactRings({ active, accentColor }: { active: boolean; accentColor: string }) {
  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-2xl"
              style={{ border: `${3 - i * 0.5}px solid ${accentColor}` }}
              initial={{ width: IS_MOBILE ? 144 : 224, height: IS_MOBILE ? 144 : 224, opacity: 0.9 }}
              animate={{ width: (IS_MOBILE ? 144 : 224) + 300 + i * 120, height: (IS_MOBILE ? 144 : 224) + 300 + i * 120, opacity: 0 }}
              transition={{ duration: 1.0, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────

// Phase sequence:
// 0 → black screen (waiting)
// 1 → lightning flashes
// 2 → violent screen shake + accent flash
// 3 → cracks + shards explode outward
// 4 → winner image crashes in from top
// 5 → flames erupt, name slams in
// 6 → embers + confetti + settled tremor

export function WinnerPage() {
  const navigate = useNavigate();
  const { state, reset } = useTournament();
  const [phase, setPhase] = useState(0);
  const [scope, animateScope] = useAnimate();
  const hasFired = useRef(false);
  const tremorRef = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    if (state.status !== 'finished' || !state.winner) return;

    const timers = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1000),
      setTimeout(() => setPhase(4), 1350),
      setTimeout(() => setPhase(5), 1950),
      setTimeout(() => setPhase(6), 2800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [state.status, state.winner]);

  // Imperative screen shake
  useEffect(() => {
    if (phase !== 2 || !scope.current) return;
    animateScope(scope.current, {
      x: [0, -28, 28, -20, 20, -13, 13, -7, 7, -3, 3, 0],
      y: [0, 22, -22, 16, -16, 10, -10, 5, -5, 2, -2, 0],
    }, { duration: 0.75 });
  }, [phase, animateScope, scope]);

  // Subtle ongoing tremor once settled
  useEffect(() => {
    if (phase < 6 || !scope.current) return;
    tremorRef.current = animateScope(scope.current, {
      x: [0, -1.5, 1.5, -0.5, 0.5, 0],
      y: [0, 0.8, -0.8, 0.4, -0.4, 0],
    }, { duration: 3, repeat: Infinity, repeatDelay: 2.5 });
  }, [phase, animateScope, scope]);

  useEffect(() => {
    return () => { tremorRef.current?.stop(); };
  }, []);

  // Confetti
  useEffect(() => {
    if (phase < 6) return;
    if (hasFired.current) return;
    hasFired.current = true;

    const accent = state.tournament?.accentColor ?? '#f59e0b';

    setTimeout(() => {
      confetti({
        particleCount: 220,
        spread: 130,
        origin: { y: 0.45 },
        colors: [accent, '#ff4500', '#ffdd00', '#ffffff', '#a78bfa', '#34d399'],
        startVelocity: 55,
        gravity: 0.9,
      });
    }, 100);

    const end = Date.now() + 6000;
    const stream = () => {
      confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 }, colors: [accent, '#ffdd00', '#fff'] });
      confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 }, colors: [accent, '#ff4500', '#fff'] });
      if (Date.now() < end) requestAnimationFrame(stream);
    };
    stream();
  }, [phase, state.tournament?.accentColor]);

  function handlePlayAgain() {
    tremorRef.current?.stop();
    reset();
    navigate('/');
  }

  if (!state.winner) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
          ← Go Home
        </button>
      </div>
    );
  }

  const accentColor = state.tournament?.accentColor ?? '#f59e0b';

  return (
    <div ref={scope} className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16 overflow-hidden relative" style={{ willChange: 'transform' }}>

      {/* ── Dark veil: lifts on phase 1 ── */}
      <AnimatePresence>
        {phase === 0 && (
          <motion.div
            className="absolute inset-0 bg-black z-50 pointer-events-none"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          />
        )}
      </AnimatePresence>

      {/* ── Lightning flashes ── */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            className="absolute inset-0 z-50 pointer-events-none"
            style={{ background: 'white' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 0.8, 0, 0.5, 0, 0.3, 0] }}
            transition={{ duration: 0.55, times: [0, 0.08, 0.2, 0.32, 0.45, 0.58, 0.72, 0.86, 1] }}
          />
        )}
      </AnimatePresence>

      {/* ── Accent color shockwave on shake ── */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div
            className="absolute inset-0 z-30 pointer-events-none"
            style={{ background: accentColor }}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* ── Crack lines ── */}
      <CrackOverlay active={phase >= 3} />

      {/* ── Shard explosion ── */}
      <ShardOverlay active={phase >= 3} accentColor={accentColor} />

      {/* ── Flame layer ── */}
      <FlameLayer active={phase >= 5} accentColor={accentColor} />

      {/* ── Ember field ── */}
      <EmberField active={phase >= 6} accentColor={accentColor} />

      {/* ── Background radial glow (pulses after settle) ── */}
      {phase >= 5 && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.55, 0.35, 0.65, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          style={{ background: `radial-gradient(ellipse at 50% 60%, ${accentColor}44 0%, transparent 65%)` }}
        />
      )}

      {/* ─────────── MAIN CONTENT ─────────── */}
      <div className="relative z-20 flex flex-col items-center gap-6 max-w-lg w-full text-center">

        {/* Crown drops in */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              initial={{ y: -120, opacity: 0, scale: 2.5, rotate: -20 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 16 }}
              className="text-5xl sm:text-6xl md:text-7xl select-none"
              style={{ filter: `drop-shadow(0 0 24px ${accentColor})` }}
            >
              👑
            </motion.div>
          )}
        </AnimatePresence>

        {/* "The Champion" label */}
        <AnimatePresence>
          {phase >= 5 && (
            <motion.p
              initial={{ opacity: 0, y: 10, letterSpacing: '0.8em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
              transition={{ duration: 0.7 }}
              className="text-xs font-black uppercase text-white/40"
            >
              The Champion
            </motion.p>
          )}
        </AnimatePresence>

        {/* Winner image — crashes in from above */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              className="relative"
              initial={{ y: -500, scale: 1.6, rotate: -12 }}
              animate={{ y: 0, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 17, delay: 0.05 }}
            >
              {/* Impact rings burst outward on landing */}
              <ImpactRings active={phase >= 4} accentColor={accentColor} />

              {/* Outer glow halo */}
              <motion.div
                className="absolute -inset-5 rounded-3xl pointer-events-none"
                style={{ background: `${accentColor}44`, filter: 'blur(20px)' }}
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
              />

              {/* Winner image */}
              <motion.img
                src={state.winner.imageUrl}
                alt={state.winner.name}
                className="w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 object-cover rounded-2xl relative z-10"
                animate={{
                  boxShadow: [
                    `0 0 0 3px ${accentColor}, 0 0 50px ${accentColor}99, 0 40px 100px rgba(0,0,0,0.9)`,
                    `0 0 0 5px ${accentColor}, 0 0 120px ${accentColor}ee, 0 40px 100px rgba(0,0,0,0.9)`,
                    `0 0 0 3px ${accentColor}, 0 0 50px ${accentColor}99, 0 40px 100px rgba(0,0,0,0.9)`,
                  ],
                }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Winner name — slams in */}
        <AnimatePresence>
          {phase >= 5 && (
            <motion.div
              initial={{ scale: 4.5, opacity: 0, filter: 'blur(30px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight"
                style={{
                  textShadow: `0 0 30px ${accentColor}cc, 0 0 80px ${accentColor}66, 0 4px 20px rgba(0,0,0,0.8)`,
                }}
              >
                {state.winner.name}
              </h1>
              <motion.p
                className="text-white/55 mt-3 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {state.winner.subtitle}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tournament badge */}
        <AnimatePresence>
          {phase >= 6 && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, delay: 0.1 }}
              className="px-5 py-2 rounded-full border font-bold text-sm"
              style={{ borderColor: `${accentColor}88`, color: accentColor }}
            >
              {state.tournament?.name} · Champion
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play again */}
        <AnimatePresence>
          {phase >= 6 && (
            <motion.button
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.07, boxShadow: `0 0 40px ${accentColor}99` }}
              whileTap={{ scale: 0.93 }}
              onClick={handlePlayAgain}
              className="mt-4 px-8 sm:px-10 py-3 rounded-2xl font-black text-base sm:text-lg text-black transition-all duration-200 min-h-[44px]"
              style={{ background: `linear-gradient(135deg, ${accentColor}, #ff4500)` }}
            >
              Play Again
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
