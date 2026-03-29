import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TOURNAMENTS } from '../data/tournaments';
import { TournamentCard } from '../components/TournamentCard';
import { useTournament } from '../context/TournamentContext';

export function HomePage() {
  const navigate = useNavigate();
  const { startTournament } = useTournament();

  function handleStart(id: string) {
    const tournament = TOURNAMENTS.find(t => t.id === id);
    if (!tournament) return;
    startTournament(tournament);
    navigate('/game');
  }

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
              <TournamentCard tournament={t} onClick={() => handleStart(t.id)} />
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-white/20 text-xs pb-8">
        Choose a tournament above to begin
      </footer>
    </div>
  );
}
