import { motion } from 'framer-motion';
import type { TournamentItem } from '../types';

interface Props {
  item: TournamentItem;
  side: 'left' | 'right';
  onPick: () => void;
  accentColor: string;
}

export function MatchupCard({ item, side, onPick, accentColor }: Props) {
  return (
    <motion.div
      onClick={onPick}
      initial={{ opacity: 0, x: side === 'left' ? -80 : 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className="relative flex-1 cursor-pointer rounded-2xl overflow-hidden border border-white/10 shadow-2xl group min-h-[180px] sm:min-h-[280px] md:min-h-[420px] max-w-md w-full"
    >
      {/* Image */}
      <img
        src={item.imageUrl}
        alt={item.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Hover glow border */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 3px ${accentColor}, 0 0 40px ${accentColor}66` }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-white/60 text-xs sm:text-sm mb-1">{item.subtitle}</p>
          <h3 className="text-white text-lg sm:text-xl md:text-2xl font-black leading-tight">{item.name}</h3>
        </motion.div>

        <motion.div
          className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-sm font-bold py-2 px-4 rounded-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: `${accentColor}cc`, color: '#fff' }}
        >
          Pick This One ✓
        </motion.div>
      </div>
    </motion.div>
  );
}
