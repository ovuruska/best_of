import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TOURNAMENTS } from '../data/tournaments';
import { TournamentCard } from '../components/TournamentCard';
import { useTournament } from '../context/TournamentContext';
import type { Tournament } from '../types';

const SIZE_OPTIONS = [
  { size: 32, label: 'Sprint', desc: 'Quick round' },
  { size: 64, label: 'Classic', desc: 'Standard bracket' },
  { size: 128, label: 'Marathon', desc: 'Full lineup' },
] as const;

export function HomePage() {
  const navigate = useNavigate();
  const { startTournament } = useTournament();
  const [selected, setSelected] = useState<Tournament | null>(null);

  function handleStart(size: number) {
    if (!selected) return;
    startTournament(selected, size);
    setSelected(null);
    navigate('/game');
  }

  // Available sizes for the selected tournament
  const availableSizes = selected
    ? SIZE_OPTIONS.filter(o => o.size <= selected.items.length)
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="pt-10 sm:pt-16 pb-6 sm:pb-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-4">
            The Ultimate Bracket
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight">
            <span className="text-white">Best</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              {' '}Of
            </span>
          </h1>
          <p className="mt-4 text-white/50 text-lg max-w-md mx-auto">
            Pick your favorites in head-to-head matchups until one champion remains.
          </p>
        </motion.div>
      </header>

      {/* Cards */}
      <main className="flex-1 px-4 pb-16 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOURNAMENTS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <TournamentCard tournament={t} onClick={() => setSelected(t)} />
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-white/20 text-xs pb-8">
        Choose a tournament above to begin
      </footer>

      {/* Size selector modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />

            {/* Modal */}
            <motion.div
              className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${selected.gradientFrom}, ${selected.gradientTo})`,
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
                  {selected.name}
                </h2>
                <p className="text-white/50 text-sm mb-6">
                  {selected.items.length} contenders available
                </p>

                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-4">
                  Choose bracket size
                </p>

                <div className="flex flex-col gap-3">
                  {availableSizes.map(({ size, label, desc }) => (
                    <motion.button
                      key={size}
                      onClick={() => handleStart(size)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/10 hover:border-white/25 transition-colors min-h-[56px]"
                      style={{ background: `${selected.accentColor}15` }}
                    >
                      <div className="text-left">
                        <span className="text-white font-bold text-lg">{size}</span>
                        <span className="text-white/40 text-sm ml-2">{label}</span>
                      </div>
                      <span className="text-white/30 text-xs">{desc}</span>
                    </motion.button>
                  ))}
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="mt-5 w-full text-center text-white/40 hover:text-white/60 text-sm transition-colors py-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
