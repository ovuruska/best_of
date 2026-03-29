import { motion } from 'framer-motion';
import type { TournamentItem } from '../types';

interface Props {
  item: TournamentItem;
  side: 'left' | 'right';
  onPick: () => void;
  accentColor: string;
  picked?: boolean;
  rejected?: boolean;
}

export function MatchupCard({ item, side, onPick, accentColor, picked, rejected }: Props) {
  const getAnimateState = () => {
    if (picked) {
      return {
        x: side === 'left' ? '-120%' : '120%',
        rotate: side === 'left' ? -12 : 12,
        opacity: 0,
      };
    }
    if (rejected) {
      return { opacity: 0, scale: 0.85, filter: 'blur(4px)' };
    }
    return { opacity: 1, x: 0, rotate: 0, scale: 1, filter: 'blur(0px)' };
  };

  return (
    <motion.div
      onClick={picked || rejected ? undefined : onPick}
      initial={{ opacity: 0, x: side === 'left' ? -80 : 80 }}
      animate={getAnimateState()}
      transition={
        picked || rejected
          ? { type: 'spring', stiffness: 300, damping: 25 }
          : { type: 'spring', stiffness: 260, damping: 22 }
      }
      whileHover={!picked && !rejected ? { scale: 1.03 } : undefined}
      whileTap={!picked && !rejected ? { scale: 0.96 } : undefined}
      className="relative flex-1 cursor-pointer rounded-2xl overflow-hidden border border-white/10 shadow-2xl group max-w-md w-full bg-[#111]"
    >
      {/* Square image */}
      <div className="aspect-square overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Hover glow border */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 3px ${accentColor}, 0 0 40px ${accentColor}66` }}
      />

      {/* Content */}
      <div className="p-3 sm:p-4">
        <p className="text-white/60 text-xs sm:text-sm mb-0.5">{item.subtitle}</p>
        <h3 className="text-white text-base sm:text-lg md:text-xl font-black leading-tight">{item.name}</h3>

        <motion.div
          className="mt-2 sm:mt-3 flex items-center justify-center gap-2 text-sm font-bold py-2 px-4 rounded-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: `${accentColor}cc`, color: '#fff' }}
        >
          Pick This One
        </motion.div>
      </div>
    </motion.div>
  );
}
