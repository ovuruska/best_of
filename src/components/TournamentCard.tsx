import { motion } from 'framer-motion';
import type { Tournament } from '../types';

interface Props {
  tournament: Tournament;
  onClick: () => void;
}

export function TournamentCard({ tournament, onClick }: Props) {
  const itemCount = tournament.items.length;

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative cursor-pointer rounded-2xl overflow-hidden border border-white/10 shadow-2xl group"
      style={{
        background: `linear-gradient(135deg, ${tournament.gradientFrom}, ${tournament.gradientTo})`,
      }}
    >
      {/* Glow on hover/active */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
        style={{ boxShadow: `0 0 60px ${tournament.accentColor}55, inset 0 0 30px ${tournament.accentColor}22` }}
      />

      {/* Background image */}
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
        <img src={tournament.coverImage} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 p-8 flex flex-col gap-4 h-72">
        {/* Badge */}
        <span
          className="self-start text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: `${tournament.accentColor}33`, color: tournament.accentColor }}
        >
          {itemCount} Contenders
        </span>

        <div className="flex-1 flex flex-col justify-end gap-3">
          <h2 className="text-2xl font-black text-white leading-tight">{tournament.name}</h2>
          <p className="text-white/60 text-sm leading-relaxed">{tournament.description}</p>
        </div>

        {/* CTA */}
        <motion.div
          className="flex items-center gap-2 font-bold text-sm"
          style={{ color: tournament.accentColor }}
        >
          <span>Start Tournament</span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            →
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}
