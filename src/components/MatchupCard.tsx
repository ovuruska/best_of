import { useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import type { TournamentItem } from '../types';

interface Props {
  item: TournamentItem;
  side: 'left' | 'right';
  onPick: () => void;
  accentColor: string;
  picked?: boolean;
  rejected?: boolean;
}

const DRAG_THRESHOLD = 80;

export function MatchupCard({ item, side, onPick, accentColor, picked, rejected }: Props) {
  const [dragging, setDragging] = useState(false);

  function handleDragEnd(_: unknown, info: PanInfo) {
    setDragging(false);
    const swipedLeft = info.offset.x < -DRAG_THRESHOLD;
    const swipedRight = info.offset.x > DRAG_THRESHOLD;
    if (swipedLeft || swipedRight) {
      onPick();
    }
  }

  return (
    <motion.div
      onClick={picked || rejected ? undefined : onPick}
      drag={!picked && !rejected ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      animate={
        picked
          ? { x: side === 'left' ? -600 : 600, rotate: side === 'left' ? -15 : 15, opacity: 0 }
          : rejected
            ? { opacity: 0, scale: 0.85 }
            : { opacity: 1, x: 0, rotate: 0, scale: 1 }
      }
      transition={
        picked
          ? { type: 'tween', duration: 0.4, ease: 'easeIn' }
          : rejected
            ? { type: 'tween', duration: 0.3 }
            : { type: 'spring', stiffness: 260, damping: 22 }
      }
      whileHover={!picked && !rejected && !dragging ? { scale: 1.03 } : undefined}
      whileTap={!picked && !rejected && !dragging ? { scale: 0.96 } : undefined}
      className="relative flex-1 cursor-pointer rounded-2xl overflow-hidden border border-white/10 shadow-2xl group max-w-md w-full bg-[#111] touch-pan-y"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Square image */}
      <div className="aspect-square overflow-hidden pointer-events-none">
        <img
          src={item.imageUrl}
          alt={item.name}
          draggable={false}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Hover glow border */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 3px ${accentColor}, 0 0 40px ${accentColor}66` }}
      />

      {/* Content */}
      <div className="p-3 sm:p-4 pointer-events-none">
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
