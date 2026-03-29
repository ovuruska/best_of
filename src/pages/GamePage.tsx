import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useTournament } from '../context/TournamentContext';
import { MatchupCard } from '../components/MatchupCard';
import { RoundTransition } from '../components/RoundTransition';
import type { TransitionType } from '../components/RoundTransition';
import { playPickSound, playQuarterFinalSound, playSemiFinalSound, playFinalSound } from '../utils/sounds';

export function GamePage() {
  const navigate = useNavigate();
  const { state, currentMatch, pickWinner } = useTournament();
  const [matchKey, setMatchKey] = useState(0);
  const [activeTransition, setActiveTransition] = useState<TransitionType | null>(null);
  const [pickedSide, setPickedSide] = useState<'left' | 'right' | null>(null);
  const pendingPick = useRef<{ winnerId: string; isLeft: boolean } | null>(null);

  // Navigate to winner screen
  useEffect(() => {
    if (state.status === 'finished') navigate('/winner');
  }, [state.status, navigate]);

  if (state.status === 'idle' || !state.tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-white/50 mb-4">No tournament selected.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const round = state.rounds[state.currentRoundIndex]!;
  const totalMatches = round.matches.length;
  const currentIndex = state.currentMatchIndex;
  const progress = (currentIndex / totalMatches) * 100;
  const accentColor = state.tournament.accentColor;

  function spawnPickConfetti(isLeft: boolean) {
    const rIdx = state.currentRoundIndex;
    const isMobile = window.innerWidth < 768;
    const origin = isMobile
      ? { x: 0.5, y: isLeft ? 0.3 : 0.7 }
      : { x: isLeft ? 0.25 : 0.75, y: 0.62 };

    confetti({
      particleCount: 10 + rIdx * 8,
      spread: 40 + rIdx * 12,
      origin,
      colors: [accentColor, '#ffffff', '#ffd700', '#ff6b6b'],
      startVelocity: 18 + rIdx * 6,
      gravity: 0.8,
      scalar: 0.8,
    });

    if (rIdx >= 1) {
      const secondOrigin = isMobile
        ? { x: 0.5, y: isLeft ? 0.35 : 0.72 }
        : { x: isLeft ? 0.25 : 0.75, y: 0.65 };
      confetti({
        particleCount: 6 + rIdx * 5,
        spread: 60,
        angle: 90,
        origin: secondOrigin,
        colors: [accentColor, '#ffd700'],
        startVelocity: 25 + rIdx * 8,
        gravity: 0.6,
        scalar: 0.7,
      });
    }
  }

  function handlePick(winnerId: string) {
    if (pickedSide) return; // prevent double-click during swipe

    const isLeft = winnerId === currentMatch?.item1.id;
    setPickedSide(isLeft ? 'left' : 'right');
    spawnPickConfetti(isLeft);
    playPickSound(state.currentRoundIndex);

    // Store pick data for delayed dispatch
    pendingPick.current = { winnerId, isLeft };

    // Let the swipe animation play, then advance state
    setTimeout(() => {
      if (!pendingPick.current) return;

      const isLastMatchInRound = currentIndex === totalMatches - 1;
      if (isLastMatchInRound) {
        const nextMatchCount = Math.floor(totalMatches / 2);
        if (nextMatchCount === 4) {
          setActiveTransition('quarterfinal');
          playQuarterFinalSound();
        } else if (nextMatchCount === 2) {
          setActiveTransition('semifinal');
          playSemiFinalSound();
        } else if (nextMatchCount === 1) {
          setActiveTransition('final');
          playFinalSound();
        }
      }

      pickWinner(pendingPick.current.winnerId);
      setMatchKey(k => k + 1);
      setPickedSide(null);
      pendingPick.current = null;
    }, 450);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Epic round transition overlay */}
      <AnimatePresence>
        {activeTransition && (
          <RoundTransition
            key={activeTransition + state.currentRoundIndex}
            type={activeTransition}
            accentColor={accentColor}
            onComplete={() => setActiveTransition(null)}
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <header className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/5 gap-2">
        <button
          onClick={() => navigate('/')}
          className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-1 sm:gap-2 min-w-[44px] min-h-[44px] justify-center shrink-0"
        >
          ← <span className="hidden sm:inline">Back</span>
        </button>
        <div className="text-center min-w-0 flex-1">
          <p className="text-white font-bold text-xs sm:text-sm truncate">{state.tournament.name}</p>
          <motion.p
            key={round.roundName}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] sm:text-xs font-bold uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            {round.roundName}
          </motion.p>
        </div>
        <div className="text-white/40 text-xs sm:text-sm tabular-nums shrink-0">
          {currentIndex + 1}/{totalMatches}
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1.5 sm:h-1 bg-white/5 w-full">
        <motion.div
          className="h-full"
          style={{ background: accentColor }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      {/* VS area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-8 gap-4 sm:gap-6 overflow-hidden">
        <motion.p
          className="text-white/30 text-sm uppercase tracking-widest"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Pick your favorite
        </motion.p>

        <AnimatePresence mode="wait">
          {currentMatch && (
            <motion.div
              key={matchKey}
              className="flex flex-col md:flex-row gap-4 sm:gap-6 w-full max-w-4xl items-center justify-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
            >
              <MatchupCard
                item={currentMatch.item1}
                side="left"
                onPick={() => handlePick(currentMatch.item1.id)}
                accentColor={accentColor}
                picked={pickedSide === 'left'}
                rejected={pickedSide === 'right'}
              />

              <div className="flex items-center justify-center shrink-0">
                <motion.div
                  className="text-2xl sm:text-3xl font-black text-white/20 select-none"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                >
                  VS
                </motion.div>
              </div>

              <MatchupCard
                item={currentMatch.item2}
                side="right"
                onPick={() => handlePick(currentMatch.item2.id)}
                accentColor={accentColor}
                picked={pickedSide === 'right'}
                rejected={pickedSide === 'left'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
